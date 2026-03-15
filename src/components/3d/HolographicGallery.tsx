import { useRef, useState, lazy, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, RoundedBox, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';

const PCBViewer = lazy(() => import('./PCBViewer'));

export interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  tech: string[];
  color: string;
  icon: string;
}

function HoloPanel({ project, index, total, selected, onSelect }: {
  project: Project;
  index: number;
  total: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);

  const angle = (index / total) * Math.PI * 2;
  const radius = 3.5;
  const basePos = new THREE.Vector3(
    Math.sin(angle) * radius,
    Math.cos(index * 0.8) * 0.5,
    Math.cos(angle) * radius
  );

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    const float = Math.sin(t * 0.6 + index) * 0.08;
    // Selected panels push outward 10% and lift; hovered lift slightly
    const pushFactor = selected ? 1.1 : hovered ? 1.03 : 1;
    const targetX = basePos.x * pushFactor;
    const targetZ = basePos.z * pushFactor;
    const targetY = basePos.y + float + (selected ? 0.45 : 0) + (hovered ? 0.12 : 0);
    groupRef.current.position.x += (targetX - groupRef.current.position.x) * 0.06;
    groupRef.current.position.y += (targetY - groupRef.current.position.y) * 0.06;
    groupRef.current.position.z += (targetZ - groupRef.current.position.z) * 0.06;
    // Face OUTWARD from origin — angle (not angle+PI)
    groupRef.current.rotation.y = angle;
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.MeshStandardMaterial;
      const targetEmissive = selected ? 0.65 : hovered ? 0.32 : 0.08;
      mat.emissiveIntensity += (targetEmissive - mat.emissiveIntensity) * 0.1;
    }
  });

  const color = project.color;

  return (
    <group ref={groupRef} position={basePos.toArray()}>
      {/* Main panel */}
      <RoundedBox
        ref={meshRef as any}
        args={[1.6, 2.0, 0.04]}
        radius={0.05}
        smoothness={4}
        onClick={onSelect}
        onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
      >
        <meshStandardMaterial
          color="#080816"
          emissive={color}
          emissiveIntensity={0.08}
          metalness={0.88}
          roughness={0.07}
          transparent
          opacity={0.92}
        />
      </RoundedBox>

      {/* Holographic overlay */}
      <mesh position={[0, 0, 0.022]} onClick={onSelect}>
        <planeGeometry args={[1.55, 1.95]} />
        <meshBasicMaterial color={color} transparent opacity={0.04} />
      </mesh>

      {/* Category color bar */}
      <mesh position={[-0.72, 0, 0.025]}>
        <planeGeometry args={[0.06, 1.9]} />
        <meshBasicMaterial color={color} transparent opacity={0.8} />
      </mesh>

      {/* Icon */}
      <Text position={[-0.35, 0.6, 0.025]} fontSize={0.35} anchorX="center" anchorY="middle">
        {project.icon}
      </Text>

      {/* Title */}
      <Text
        position={[0.1, 0.15, 0.025]}
        fontSize={0.12}
        color="white"
        anchorX="left"
        maxWidth={1.2}
        lineHeight={1.2}
      >
        {project.title}
      </Text>

      {/* Category */}
      <Text
        position={[0.1, -0.12, 0.025]}
        fontSize={0.075}
        color={color}
        anchorX="left"
      >
        {project.category.toUpperCase()}
      </Text>

      {/* Tech tags */}
      {project.tech.slice(0, 3).map((tech, i) => (
        <Text
          key={i}
          position={[0.1, -0.32 - i * 0.14, 0.025]}
          fontSize={0.065}
          color="rgba(255,255,255,0.5)"
          anchorX="left"
        >
          · {tech}
        </Text>
      ))}

      {(hovered || selected) && (
        <mesh position={[0, 0, -0.02]}>
          <planeGeometry args={[2.1, 2.6]} />
          <meshBasicMaterial color={color} transparent opacity={selected ? 0.09 : 0.05} side={THREE.BackSide} />
        </mesh>
      )}

      {/* Floating border glow */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(1.6, 2.0, 0.04)]} />
        <lineBasicMaterial color={color} transparent opacity={selected ? 0.8 : hovered ? 0.5 : 0.2} />
      </lineSegments>
    </group>
  );
}

function CentralCore() {
  const coreRef = useRef<THREE.Group>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (coreRef.current) coreRef.current.rotation.y = t * 0.55;
    if (ring1Ref.current) ring1Ref.current.rotation.z = t * 0.7;
    if (ring2Ref.current) {
      ring2Ref.current.rotation.x = t * 0.5;
      ring2Ref.current.rotation.z = t * 0.25;
    }
    if (ring3Ref.current) ring3Ref.current.rotation.y = t * 0.38;
  });

  return (
    <group>
      {/* Outer ambient glow */}
      <mesh>
        <sphereGeometry args={[0.52, 16, 16]} />
        <meshStandardMaterial color="#6366f1" transparent opacity={0.055} side={THREE.BackSide} />
      </mesh>

      {/* Wireframe icosahedron shell */}
      <group ref={coreRef}>
        <mesh>
          <icosahedronGeometry args={[0.28, 1]} />
          <meshStandardMaterial
            color="#6366f1"
            emissive="#6366f1"
            emissiveIntensity={1.6}
            wireframe
            transparent
            opacity={0.85}
          />
        </mesh>
        {/* Solid inner core */}
        <mesh>
          <icosahedronGeometry args={[0.14, 0]} />
          <meshStandardMaterial
            color="#ff4466"
            emissive="#6366f1"
            emissiveIntensity={2.5}
            metalness={0.6}
            roughness={0.1}
          />
        </mesh>
      </group>

      {/* Ring 1 — blue, equatorial */}
      <mesh ref={ring1Ref} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.72, 0.014, 8, 90]} />
        <meshStandardMaterial color="#4488ff" emissive="#4488ff" emissiveIntensity={1.0} transparent opacity={0.75} />
      </mesh>

      {/* Ring 2 — red, tilted 45° */}
      <mesh ref={ring2Ref} rotation={[Math.PI / 4, 0, Math.PI / 6]}>
        <torusGeometry args={[0.92, 0.009, 8, 90]} />
        <meshStandardMaterial color="#6366f1" emissive="#6366f1" emissiveIntensity={0.8} transparent opacity={0.58} />
      </mesh>

      {/* Ring 3 — cyan, polar */}
      <mesh ref={ring3Ref} rotation={[0, 0, Math.PI / 3]}>
        <torusGeometry args={[1.12, 0.007, 8, 90]} />
        <meshStandardMaterial color="#22ffdd" emissive="#22ffdd" emissiveIntensity={0.65} transparent opacity={0.42} />
      </mesh>
    </group>
  );
}

function HoloScene({ projects, selectedIdx, setSelectedIdx }: {
  projects: Project[];
  selectedIdx: number | null;
  setSelectedIdx: (i: number | null) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current || selectedIdx !== null) return;
    groupRef.current.rotation.y = clock.getElapsedTime() * 0.12;
  });

  return (
    <group ref={groupRef}>
      {projects.map((project, i) => (
        <HoloPanel
          key={project.id}
          project={project}
          index={i}
          total={projects.length}
          selected={selectedIdx === i}
          onSelect={() => setSelectedIdx(selectedIdx === i ? null : i)}
        />
      ))}
      <CentralCore />
    </group>
  );
}

export default function HolographicGallery({ projects }: { projects: Project[] }) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [showPCBViewer, setShowPCBViewer] = useState(false);
  const selectedProject = selectedIdx !== null ? projects[selectedIdx] : null;

  return (
    <div className="relative w-full px-4 sm:px-6 lg:px-10 xl:px-14 pb-8">
      {/* Framed atmospheric stage */}
      <div className="relative overflow-hidden rounded-[28px] border border-white/[0.08]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_45%_at_20%_18%,rgba(68,136,255,0.16),transparent_70%),radial-gradient(45%_38%_at_84%_22%,rgba(99,102,241,0.12),transparent_72%),radial-gradient(60%_55%_at_50%_100%,rgba(129,140,248,0.07),transparent_78%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

        <div className="relative" style={{ height: '72vh', minHeight: 540 }}>
          <Canvas
            camera={{ position: [0, 2, 8], fov: 55 }}
            dpr={[1, 1.5]}
            gl={{ alpha: true }}
            style={{ background: 'transparent' }}
          >
            <ambientLight intensity={0.14} />
            <pointLight position={[0, 5, 0]} intensity={1.1} color="#2255ff" />
            <pointLight position={[0, -5, 0]} intensity={0.55} color="#6366f1" />
            <pointLight position={[5, 0, 5]} intensity={0.35} color="#22ffbb" />
            <HoloScene
              projects={projects}
              selectedIdx={selectedIdx}
              setSelectedIdx={setSelectedIdx}
            />
            <OrbitControls
              enablePan={false}
              minDistance={4}
              maxDistance={12}
              enableDamping
              dampingFactor={0.05}
              autoRotate={selectedIdx === null}
              autoRotateSpeed={0.5}
            />
          </Canvas>

          {/* Detail panel */}
          <AnimatePresence>
            {selectedProject && (
              <motion.div
                key={selectedProject.id}
                className="absolute right-4 top-4 bottom-4 w-[280px] lg:w-[308px] overflow-y-auto rounded-[20px] border p-6"
                style={{
                  borderColor: selectedProject.color + '44',
                  background: 'rgba(5,8,16,0.92)',
                  backdropFilter: 'blur(22px)',
                  WebkitBackdropFilter: 'blur(22px)',
                  boxShadow: `0 24px 60px rgba(0,0,0,0.52), 0 0 0 1px ${selectedProject.color}0f inset`,
                }}
                initial={{ opacity: 0, x: 24, scale: 0.97 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 24, scale: 0.97 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
              >
                <button
                  className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full border border-white/10 bg-white/[0.03] text-white/45 hover:text-white transition-colors flex items-center justify-center text-base leading-none"
                  onClick={() => setSelectedIdx(null)}
                >×</button>

                {/* Header */}
                <div className="mb-5 pr-6">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-4"
                    style={{ background: selectedProject.color + '18' }}
                  >
                    {selectedProject.icon}
                  </div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] mb-1.5" style={{ color: selectedProject.color }}>
                    {selectedProject.category}
                  </p>
                  <h3 className="text-white font-bold text-xl leading-tight tracking-tight">
                    {selectedProject.title}
                  </h3>
                </div>

                <div className="h-px mb-5" style={{ background: `linear-gradient(90deg, ${selectedProject.color}30, transparent)` }} />

                <p className="text-white/65 text-sm leading-relaxed mb-5">
                  {selectedProject.description}
                </p>

                {/* Stack */}
                <div className="mb-5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/30 mb-3">Stack</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProject.tech.map(tech => (
                      <span
                        key={tech}
                        className="px-2 py-0.5 rounded text-[11px] font-mono"
                        style={{
                          background: selectedProject.color + '16',
                          color: selectedProject.color + 'dd',
                          border: `1px solid ${selectedProject.color}2e`,
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* PCB-specific: inspect 3D model */}
                {selectedProject.category === 'PCB Design' && (
                  <button
                    className="w-full py-2.5 rounded-xl text-xs font-mono font-semibold transition-all mb-3 flex items-center justify-center gap-2 border"
                    style={{
                      background: selectedProject.color + '18',
                      color: selectedProject.color,
                      borderColor: selectedProject.color + '44',
                    }}
                    onClick={() => setShowPCBViewer(true)}
                  >
                    ⬡ Inspect 3D Board
                  </button>
                )}

                {/* CTAs */}
                <div className="flex gap-2">
                  <button
                    className="flex-1 py-2 text-xs font-mono font-semibold rounded-lg transition-colors"
                    style={{
                      background: selectedProject.color + '18',
                      color: selectedProject.color,
                      border: `1px solid ${selectedProject.color}44`,
                    }}
                  >
                    View Project ↗
                  </button>
                  <button className="px-3 py-2 text-xs font-mono text-white/40 hover:text-white transition-colors rounded-lg border border-white/[0.08]">
                    GitHub
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Orbit hint */}
          <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-white/[0.07] bg-black/22 px-4 py-1.5 text-white/35 text-[11px] font-mono backdrop-blur-sm whitespace-nowrap">
            Drag to orbit · Scroll to zoom · Click panels to inspect
          </div>
        </div>
      </div>

      {/* Full-screen PCB Viewer Modal */}
      <AnimatePresence>
        {showPCBViewer && selectedProject && (
          <motion.div
            className="fixed inset-0 z-50 flex p-5 md:p-8 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/88 backdrop-blur-md"
              onClick={() => setShowPCBViewer(false)}
            />

            {/* 3D canvas */}
            <div className="relative z-10 flex-1 overflow-hidden rounded-[24px] border border-orange-400/25 bg-[#030810]">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-400/35 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-orange-400/20 to-transparent" />
              <Suspense fallback={
                <div className="flex h-full items-center justify-center font-mono text-sm text-white/40">
                  Loading PCB model...
                </div>
              }>
                <PCBViewer />
              </Suspense>
            </div>

            {/* Info sidebar */}
            <motion.div
              className="relative z-10 flex w-72 lg:w-80 flex-col overflow-y-auto rounded-[24px] border border-white/[0.08] p-6 lg:p-7"
              style={{ background: 'rgba(4,7,14,0.96)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
              initial={{ x: 32, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 32, opacity: 0 }}
              transition={{ duration: 0.25, delay: 0.06 }}
            >
              <button
                className="self-end mb-5 w-8 h-8 rounded-full border border-white/10 bg-white/[0.03] text-white/50 hover:text-white transition-all flex items-center justify-center"
                onClick={() => setShowPCBViewer(false)}
              >×</button>

              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-orange-400 mb-2">PCB Design</p>
              <h3 className="text-white font-bold text-2xl tracking-tight mb-1">{selectedProject.title}</h3>
              <div className="h-px my-5 bg-gradient-to-r from-orange-400/30 to-transparent" />

              <p className="text-white/65 text-sm leading-relaxed mb-6">{selectedProject.description}</p>

              <div className="mb-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/30 mb-3">Technologies</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedProject.tech.map(tech => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 rounded text-[11px] font-mono border border-orange-400/22 text-orange-400/80 bg-orange-400/10"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-[16px] border border-white/[0.07] bg-white/[0.03] p-4 mb-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/30 mb-3">Controls</p>
                <ul className="text-white/50 space-y-2 text-[12px]">
                  <li>🖱 Left drag — Orbit</li>
                  <li>⚲ Scroll — Zoom in / out</li>
                  <li>🖱 Right drag — Pan</li>
                </ul>
              </div>

              <div className="mt-auto border-t border-white/[0.05] pt-4">
                <p className="font-mono text-[11px] text-white/25">bigger pcb more detail.glb</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


