import { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { SKILLS, CATEGORY_COLORS, type SkillNode } from './skillsData';

function SkillNodeMesh({ node, isSelected, isRelated, onSelect, categoryColors }: {
  node: SkillNode;
  isSelected: boolean;
  isRelated: boolean;
  onSelect: (id: string | null) => void;
  categoryColors: Record<string, string>;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const color = categoryColors[node.category] || '#ffffff';

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    const float = Math.sin(t * 0.8 + node.position[0] * 0.5) * 0.05;
    meshRef.current.position.y = node.position[1] + float;
    const targetScale = isSelected ? 1.52 : hovered ? 1.24 : isRelated ? 1.12 : 1;
    const s = meshRef.current.scale.x;
    meshRef.current.scale.setScalar(s + (targetScale - s) * 0.1);
    if (isSelected) {
      meshRef.current.rotation.y = t * 0.7;
      meshRef.current.rotation.x = Math.sin(t * 0.8) * 0.12;
    } else if (!isRelated) {
      meshRef.current.rotation.y = t * 0.3;
      meshRef.current.rotation.x = Math.sin(t * 0.35 + node.position[1]) * 0.04;
    }
  });

  const radius = 0.08 + node.level * 0.12;

  return (
    <group position={node.position}>
      <mesh
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onSelect(isSelected ? null : node.id); }}
        onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
      >
        <icosahedronGeometry args={[radius, 1]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isSelected ? 1.15 : hovered ? 0.7 : isRelated ? 0.38 : 0.18}
          metalness={0.38}
          roughness={0.22}
          wireframe={!isSelected && !hovered}
        />
      </mesh>
      {/* Glow sphere */}
      {(isSelected || hovered) && (
        <mesh>
          <sphereGeometry args={[radius * 1.85, 16, 16]} />
          <meshStandardMaterial
            color={color}
            transparent
            opacity={isSelected ? 0.14 : 0.1}
            side={THREE.BackSide}
          />
        </mesh>
      )}
      {isSelected && (
        <mesh>
          <torusGeometry args={[radius * 1.55, radius * 0.1, 12, 36]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.75} transparent opacity={0.7} />
        </mesh>
      )}
      <Text
        position={[0, radius + 0.1, 0]}
        fontSize={isSelected ? 0.115 : 0.1}
        color={isSelected || hovered || isRelated ? color : '#ffffff88'}
        anchorX="center"
        anchorY="bottom"
      >
        {node.label}
      </Text>
      <Text
        position={[0, radius + 0.02, 0]}
        fontSize={0.055}
        color={`${color}99`}
        anchorX="center"
        anchorY="top"
      >
        {`${Math.round(node.level * 100)}%`}
      </Text>
    </group>
  );
}

function ConnectionLine({ from, to, active }: {
  from: [number,number,number];
  to: [number,number,number];
  active: boolean;
}) {
  const points = useMemo(() => [
    new THREE.Vector3(...from),
    new THREE.Vector3(...to),
  ], [from, to]);

  const lineRef = useRef<THREE.Line>(null);
  useFrame(({ clock }) => {
    if (!lineRef.current) return;
    const mat = lineRef.current.material as THREE.LineBasicMaterial;
    mat.opacity = active ? 0.74 + Math.sin(clock.getElapsedTime() * 3) * 0.14 : 0.09;
  });

  return (
    <line ref={lineRef as any}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[new Float32Array([...from, ...to]), 3]}
        />
      </bufferGeometry>
      <lineBasicMaterial
        color={active ? '#ff6b88' : '#8aa0d9'}
        transparent
        opacity={0.09}
      />
    </line>
  );
}

function AmbientOrbitalParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const values: number[] = [];
    for (let index = 0; index < 180; index += 1) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 3.8 + Math.random() * 4.8;
      const height = (Math.random() - 0.5) * 5.5;
      values.push(Math.cos(angle) * radius, height, Math.sin(angle) * radius);
    }
    return new Float32Array(values);
  }, []);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y = clock.getElapsedTime() * 0.03;
    pointsRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.18) * 0.05;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#8ea7ff" size={0.03} sizeAttenuation transparent opacity={0.5} />
    </points>
  );
}

function EnergyRings() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = clock.getElapsedTime() * 0.08;
  });

  return (
    <group ref={groupRef} rotation={[Math.PI / 2.8, 0, 0]}>
      {[4.6, 6.2].map((radius, index) => (
        <mesh key={radius} rotation={[0, 0, index * 0.45]}>
          <torusGeometry args={[radius, 0.015, 10, 120]} />
          <meshStandardMaterial
            color={index === 0 ? '#818cf8' : '#6366f1'}
            emissive={index === 0 ? '#818cf8' : '#6366f1'}
            emissiveIntensity={0.5}
            transparent
            opacity={0.22}
          />
        </mesh>
      ))}
    </group>
  );
}

function SkillsGraph({ selectedId, setSelectedId, skills, categoryColors }: {
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  skills: SkillNode[];
  categoryColors: Record<string, string>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const selectedNode = skills.find(s => s.id === selectedId);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = clock.getElapsedTime() * 0.05;
  });

  return (
    <group ref={groupRef}>
      <EnergyRings />
      <AmbientOrbitalParticles />
      {/* Connections */}
      {skills.map(node =>
        node.connections.map(connId => {
          const conn = skills.find(s => s.id === connId);
          if (!conn) return null;
          const active = selectedNode
            ? node.id === selectedId || connId === selectedId
            : false;
          return (
            <ConnectionLine
              key={`${node.id}-${connId}`}
              from={node.position}
              to={conn.position}
              active={active}
            />
          );
        })
      )}

      {/* Nodes */}
      {skills.map(node => (
        <SkillNodeMesh
          key={node.id}
          node={node}
          isSelected={node.id === selectedId}
          isRelated={
            selectedNode
              ? selectedNode.connections.includes(node.id) || node.connections.includes(selectedNode.id)
              : false
          }
          onSelect={setSelectedId}
          categoryColors={categoryColors}
        />
      ))}
    </group>
  );
}

export default function SkillsVisualization({ selectedId, setSelectedId, skills = SKILLS, categoryColors = CATEGORY_COLORS }: {
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  skills?: SkillNode[];
  categoryColors?: Record<string, string>;
}) {
  return (
    <Canvas camera={{ position: [0, 2.1, 8.8], fov: 48 }} dpr={[1, 1.5]} gl={{ alpha: true }}>
      <fog attach="fog" args={['#06080d', 8.5, 18]} />
      <ambientLight intensity={0.28} />
      <pointLight position={[5, 5, 5]} intensity={1.05} color="#4488ff" />
      <pointLight position={[-5, -3, -3]} intensity={0.7} color="#ff8822" />
      <pointLight position={[0, 6, -5]} intensity={0.6} color="#44cc88" />
      <pointLight position={[0, -2, 4]} intensity={0.45} color="#6366f1" />
      <Stars radius={40} depth={22} count={1100} factor={2.4} saturation={0} fade speed={0.35} />
      <SkillsGraph
        selectedId={selectedId}
        setSelectedId={setSelectedId}
        skills={skills}
        categoryColors={categoryColors}
      />
      <OrbitControls enablePan={false} minDistance={4.8} maxDistance={13.5} minPolarAngle={0.9} maxPolarAngle={2.1} enableDamping dampingFactor={0.05} />
    </Canvas>
  );
}



