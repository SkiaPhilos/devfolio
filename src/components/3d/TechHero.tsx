import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { Center, Sparkles, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

const mouseState = { x: 0, y: 0 };

const BASE = import.meta.env.BASE_URL;
const MODELS = {
  abdullah: `${BASE}models/Abdullah.glb`,
  circuitBoard: `${BASE}models/circuit+board+3d+model.glb`,
  processor: `${BASE}models/processor_intel_core_i9.glb`,
  reactLogo: `${BASE}models/react_logo.glb`,
  cpp: `${BASE}models/C++.glb`,
  csharp: `${BASE}models/CSharp.glb`,
  python: `${BASE}models/python.glb`,
  threejs: `${BASE}models/3 js.glb`,
} as const;

type AssetPath = (typeof MODELS)[keyof typeof MODELS];

interface RoleTitle {
  key: string;
  label: string;
}

const ROLE_TITLES: RoleTitle[] = [
  { key: 'abdullah', label: 'Abdullah' },
  { key: 'designer', label: 'a designer' },
  { key: 'web', label: 'a web developer' },
  { key: 'engineer', label: 'an engineer' },
  { key: 'creative', label: 'a creative technologist' },
];

function RoleWordmark({ roleKey }: { roleKey: string }) {
  const cls = 'h-6 w-6 sm:h-7 sm:w-7';
  const gId = `${roleKey}-hg`;
  const fId = `${roleKey}-hf`;

  const sharedDefs = (
    <defs>
      <linearGradient id={gId} x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#e0e7ff" />
        <stop offset="52%" stopColor="#a5b4fc" />
        <stop offset="100%" stopColor="#6366f1" />
      </linearGradient>
      <filter id={fId} x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="1.6" result="glow" />
        <feMerge>
          <feMergeNode in="glow" />
          <feMergeNode in="glow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );

  const brackets = (x1: number, y1: number, x2: number, y2: number, s = 2.8) => (
    <>
      <path d={`M${x1 + s} ${y1}H${x1}V${y1 + s}`} fill="none" stroke="#818cf8" strokeWidth="0.85" strokeOpacity="0.75" />
      <path d={`M${x2 - s} ${y1}H${x2}V${y1 + s}`} fill="none" stroke="#818cf8" strokeWidth="0.85" strokeOpacity="0.75" />
      <path d={`M${x1 + s} ${y2}H${x1}V${y2 - s}`} fill="none" stroke="#818cf8" strokeWidth="0.85" strokeOpacity="0.75" />
      <path d={`M${x2 - s} ${y2}H${x2}V${y2 - s}`} fill="none" stroke="#818cf8" strokeWidth="0.85" strokeOpacity="0.75" />
    </>
  );

  const scanLine = (x = 3, w = 18) => (
    <rect x={x} y="4" width={w} height="1.5" rx="0.4" fill="#818cf8" fillOpacity="0">
      <animate attributeName="y" from="4" to="20" dur="2.8s" repeatCount="indefinite" />
      <animate attributeName="fill-opacity" values="0;0.22;0" keyTimes="0;0.5;1" dur="2.8s" repeatCount="indefinite" />
    </rect>
  );

  switch (roleKey) {
    case 'abdullah':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none">
          {sharedDefs}
          <path d="M12 3 18.9 7.2v8.6L12 21 5.1 15.8V7.2Z"
            fill="#050e1c" fillOpacity="0.94" stroke={`url(#${gId})`} strokeWidth="0.85" filter={`url(#${fId})`} />
          <path d="M12 3 18.9 7.2v8.6L12 21 5.1 15.8V7.2Z"
            fill="none" stroke="#818cf8" strokeWidth="1.3" strokeOpacity="0.65" strokeDasharray="5 3">
            <animate attributeName="stroke-dashoffset" from="0" to="-24" dur="2.4s" repeatCount="indefinite" />
          </path>
          <line x1="12" y1="8.5" x2="12" y2="15.5" stroke="#c7d2fe" strokeWidth="0.8" strokeOpacity="0.55" strokeLinecap="round" />
          <line x1="8.5" y1="12" x2="15.5" y2="12" stroke="#c7d2fe" strokeWidth="0.8" strokeOpacity="0.55" strokeLinecap="round" />
          <circle cx="12" cy="12" r="2" fill="none" stroke="#818cf8" strokeWidth="0.9" strokeOpacity="0.8" />
          <circle cx="12" cy="12" r="0.55" fill="#e0e7ff" fillOpacity="0.9" />
          {brackets(4, 2.5, 20, 21.5, 2.5)}
          {scanLine()}
        </svg>
      );
    case 'designer':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none">
          {sharedDefs}
          <path d="M12 3 21 12 12 21 3 12Z"
            fill="#040c18" fillOpacity="0.94" stroke={`url(#${gId})`} strokeWidth="0.85" filter={`url(#${fId})`} />
          <path d="M12 3 21 12 12 21 3 12Z"
            fill="none" stroke="#818cf8" strokeWidth="1.3" strokeOpacity="0.6" strokeDasharray="5 3">
            <animate attributeName="stroke-dashoffset" from="0" to="-32" dur="3s" repeatCount="indefinite" />
          </path>
          <path d="M12 7 17 12 12 17 7 12Z"
            fill="none" stroke="#818cf8" strokeWidth="0.7" strokeOpacity="0.55" strokeDasharray="3 2.5">
            <animate attributeName="stroke-dashoffset" from="0" to="20" dur="2s" repeatCount="indefinite" />
          </path>
          <circle cx="12" cy="12" r="1.5" fill="none" stroke="#818cf8" strokeWidth="0.85" strokeOpacity="0.85" />
          <circle cx="12" cy="12" r="0.5" fill="#e0e7ff" fillOpacity="0.9" />
          <circle cx="12" cy="3" r="0.7" fill="#818cf8" fillOpacity="0.9" />
          <circle cx="21" cy="12" r="0.7" fill="#818cf8" fillOpacity="0.7" />
          <circle cx="12" cy="21" r="0.7" fill="#818cf8" fillOpacity="0.9" />
          <circle cx="3" cy="12" r="0.7" fill="#818cf8" fillOpacity="0.7" />
          {brackets(2.5, 2.5, 21.5, 21.5, 2.5)}
          {scanLine()}
        </svg>
      );
    case 'web':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none">
          {sharedDefs}
          <rect x="2.8" y="3.8" width="18.4" height="13.2" rx="1.8"
            fill="#040e1c" fillOpacity="0.95" stroke={`url(#${gId})`} strokeWidth="0.85" filter={`url(#${fId})`} />
          <rect x="2.8" y="3.8" width="18.4" height="13.2" rx="1.8"
            fill="none" stroke="#818cf8" strokeWidth="1.3" strokeOpacity="0.58" strokeDasharray="6 3">
            <animate attributeName="stroke-dashoffset" from="0" to="-36" dur="2.8s" repeatCount="indefinite" />
          </rect>
          <rect x="2.8" y="3.8" width="18.4" height="2.4" rx="1.8" fill="#818cf8" fillOpacity="0.1" />
          <circle cx="5.6" cy="5" r="0.65" fill="#818cf8" fillOpacity="0.9" />
          <circle cx="7.6" cy="5" r="0.65" fill="#818cf8" fillOpacity="0.85" />
          <circle cx="9.6" cy="5" r="0.65" fill="#6366f1" fillOpacity="0.7" />
          <path d="M6.5 10.2 4.8 11.8l1.7 1.6" stroke="#818cf8" strokeWidth="0.95" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.8" />
          <path d="M17.5 10.2l1.7 1.6-1.7 1.6" stroke="#818cf8" strokeWidth="0.95" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.8" />
          <line x1="12.8" y1="9.4" x2="11.2" y2="14.2" stroke="#a5b4fc" strokeWidth="0.85" strokeLinecap="round" strokeOpacity="0.65" />
          <path d="M12 17v2.2M9.5 19.2h5" stroke="#818cf8" strokeWidth="0.9" strokeLinecap="round" strokeOpacity="0.55" />
          {scanLine(2.8, 18.4)}
        </svg>
      );
    case 'engineer':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none">
          {sharedDefs}
          <rect x="7.8" y="7.8" width="8.4" height="8.4" rx="1.4"
            fill="#030b16" fillOpacity="0.96" stroke={`url(#${gId})`} strokeWidth="0.85" filter={`url(#${fId})`} />
          <rect x="7.8" y="7.8" width="8.4" height="8.4" rx="1.4"
            fill="none" stroke="#818cf8" strokeWidth="1.3" strokeOpacity="0.6" strokeDasharray="4 2.5">
            <animate attributeName="stroke-dashoffset" from="0" to="-26" dur="2.2s" repeatCount="indefinite" />
          </rect>
          <rect x="10.2" y="10.2" width="3.6" height="3.6" rx="0.5"
            fill="#818cf8" fillOpacity="0.13" stroke="#a5b4fc" strokeWidth="0.65" strokeOpacity="0.75" />
          <path d="M11.2 12h1.6M12 11.2v1.6" stroke="#e0e7ff" strokeWidth="0.7" strokeOpacity="0.85" strokeLinecap="round" />
          {([9, 12, 15] as number[]).map((x, i) => (
            <g key={i}>
              <line x1={x} y1="3.6" x2={x} y2="7.8" stroke="#818cf8" strokeWidth="0.8" strokeLinecap="round">
                <animate attributeName="stroke-opacity" values="0.6;1;0.35;0.6" dur={`${1.4 + i * 0.3}s`} repeatCount="indefinite" />
              </line>
              <line x1={x} y1="16.2" x2={x} y2="20.4" stroke="#818cf8" strokeWidth="0.8" strokeLinecap="round">
                <animate attributeName="stroke-opacity" values="0.35;0.9;0.5;0.35" dur={`${1.6 + i * 0.3}s`} repeatCount="indefinite" />
              </line>
            </g>
          ))}
          {([9, 12, 15] as number[]).map((y, i) => (
            <g key={i}>
              <line x1="3.6" y1={y} x2="7.8" y2={y} stroke="#6366f1" strokeWidth="0.8" strokeLinecap="round">
                <animate attributeName="stroke-opacity" values="0.55;0.9;0.3;0.55" dur={`${1.3 + i * 0.28}s`} repeatCount="indefinite" />
              </line>
              <line x1="16.2" y1={y} x2="20.4" y2={y} stroke="#6366f1" strokeWidth="0.8" strokeLinecap="round">
                <animate attributeName="stroke-opacity" values="0.3;0.75;0.55;0.3" dur={`${1.5 + i * 0.28}s`} repeatCount="indefinite" />
              </line>
            </g>
          ))}
          {scanLine(7.8, 8.4)}
        </svg>
      );
    case 'creative':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none">
          {sharedDefs}
          <path d="M19 7.5 12 11.5 12 19.5 19 15.5Z"
            fill="#818cf8" fillOpacity="0.09" stroke="#818cf8" strokeWidth="0.8" strokeOpacity="0.65" />
          <path d="M5 7.5 12 11.5 12 19.5 5 15.5Z"
            fill="#6366f1" fillOpacity="0.1" stroke="#818cf8" strokeWidth="0.8" strokeOpacity="0.65" />
          <path d="M12 3.5 19 7.5 12 11.5 5 7.5Z"
            fill="#818cf8" fillOpacity="0.1" stroke={`url(#${gId})`} strokeWidth="0.9" filter={`url(#${fId})`} />
          <path d="M12 3.5 19 7.5 12 11.5 5 7.5Z"
            fill="none" stroke="#818cf8" strokeWidth="1.3" strokeOpacity="0.62" strokeDasharray="4 3">
            <animate attributeName="stroke-dashoffset" from="0" to="-28" dur="2.6s" repeatCount="indefinite" />
          </path>
          <line x1="12" y1="11.5" x2="12" y2="19.5" stroke="#818cf8" strokeWidth="0.75" strokeOpacity="0.45" />
          <circle cx="12" cy="3.5" r="0.9" fill="#e0e7ff" fillOpacity="0.9">
            <animate attributeName="opacity" values="1;0.4;1" dur="1.8s" repeatCount="indefinite" />
          </circle>
          <circle cx="19" cy="7.5" r="0.7" fill="#818cf8" fillOpacity="0.85">
            <animate attributeName="opacity" values="0.85;0.3;0.85" dur="2.4s" repeatCount="indefinite" />
          </circle>
          <circle cx="5" cy="7.5" r="0.7" fill="#818cf8" fillOpacity="0.85">
            <animate attributeName="opacity" values="0.4;1;0.4" dur="1.6s" repeatCount="indefinite" />
          </circle>
          <circle cx="12" cy="19.5" r="0.7" fill="#818cf8" fillOpacity="0.8">
            <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite" />
          </circle>
          {brackets(4, 3, 20, 21, 2.5)}
          {scanLine()}
        </svg>
      );
    default:
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none">
          {sharedDefs}
          <circle cx="12" cy="12" r="8.5"
            fill="#040e1c" fillOpacity="0.9" stroke={`url(#${gId})`} strokeWidth="0.85" filter={`url(#${fId})`} />
          <circle cx="12" cy="12" r="8.5"
            fill="none" stroke="#818cf8" strokeWidth="1.3" strokeOpacity="0.6" strokeDasharray="5 3">
            <animate attributeName="stroke-dashoffset" from="0" to="-32" dur="3s" repeatCount="indefinite" />
          </circle>
          {scanLine()}
        </svg>
      );
  }
}

interface OrbitSpec {
  radius: number;
  speed: number;
  angleOffset: number;
  yOffset: number;
  zOffset: number;
}

function MouseTracker() {
  const { size, viewport } = useThree();

  useEffect(() => {
    const handleMove = (event: MouseEvent) => {
      mouseState.x = ((event.clientX / size.width) * 2 - 1) * viewport.width * 0.18;
      mouseState.y = -((event.clientY / size.height) * 2 - 1) * viewport.height * 0.14;
    };

    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, [size, viewport]);

  return null;
}

function useSceneClone(path: AssetPath) {
  const gltf = useGLTF(path);

  return useMemo(() => {
    const cloned = gltf.scene.clone(true);
    cloned.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        const material = child.material;
        if (Array.isArray(material)) {
          material.forEach((entry) => {
            entry.depthWrite = true;
          });
        } else if (material) {
          material.depthWrite = true;
        }
      }
    });
    return cloned;
  }, [gltf.scene]);
}

function ActiveHeroModel() {
  const model = useSceneClone(MODELS.abdullah);
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.position.y = -1.2 + Math.sin(t * 0.8) * 0.04;
    groupRef.current.rotation.y = mouseState.x * 0.08;
  });

  return (
    <group ref={groupRef} position={[2.05, -1.2, 0.15]} scale={6}>
      <group rotation={[0, -Math.PI / 2, 0]}>
        <Center>
          <primitive object={model} />
        </Center>
      </group>
    </group>
  );
}

function OrbitingModel({
  path,
  orbit,
  scale,
  baseRotation,
  tiltSpeed,
}: {
  path: AssetPath;
  orbit: OrbitSpec;
  scale: number;
  baseRotation?: [number, number, number];
  tiltSpeed?: number;
}) {
  const model = useSceneClone(path);
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    const angle = orbit.angleOffset + t * orbit.speed;
    groupRef.current.position.x = 2.05 + Math.cos(angle) * orbit.radius + mouseState.x * 0.12;
    groupRef.current.position.y = orbit.yOffset + Math.sin(t * 0.7 + orbit.angleOffset) * 0.08 + mouseState.y * 0.06;
    groupRef.current.position.z = orbit.zOffset + Math.sin(angle) * orbit.radius * 0.35;
    groupRef.current.rotation.y = (baseRotation?.[1] ?? 0) + t * 0.18;
    groupRef.current.rotation.x = (baseRotation?.[0] ?? 0) + Math.sin(t * (tiltSpeed ?? 0.4)) * 0.12;
    groupRef.current.rotation.z = baseRotation?.[2] ?? 0;
  });

  return (
    <group ref={groupRef} scale={scale}>
      <Center>
        <primitive object={model} />
      </Center>
    </group>
  );
}

function HoloPanel({
  position,
  rotation,
  width,
  height,
  color,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  width: number;
  height: number;
  color: string;
}) {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * 0.9 + position[0]) * 0.05;
  });

  return (
    <group ref={ref} position={position} rotation={rotation}>
      <mesh>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial color={color} transparent opacity={0.11} />
      </mesh>
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[width * 0.86, 0.04]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} />
      </mesh>
      {[-0.28, -0.08, 0.12].map((y, index) => (
        <mesh key={index} position={[0, y, 0.01]}>
          <planeGeometry args={[width * (0.72 - index * 0.12), 0.02]} />
          <meshBasicMaterial color={color} transparent opacity={0.22} />
        </mesh>
      ))}
      <lineSegments>
        <edgesGeometry args={[new THREE.PlaneGeometry(width, height)]} />
        <lineBasicMaterial color={color} transparent opacity={0.7} />
      </lineSegments>
    </group>
  );
}

function TechRings() {
  const outerRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (outerRef.current) {
      outerRef.current.rotation.z = t * 0.18;
      outerRef.current.rotation.y = mouseState.x * 0.1;
    }
    if (innerRef.current) {
      innerRef.current.rotation.z = -t * 0.24;
      innerRef.current.rotation.x = Math.PI / 2 + Math.sin(t * 0.4) * 0.08;
    }
  });

  return (
    <group position={[2.05, 0.2, -0.4]}>
      <mesh ref={outerRef} rotation={[0.12, 0, 0.06]}>
        <torusGeometry args={[2.02, 0.028, 16, 120]} />
        <meshStandardMaterial color="#6366f1" emissive="#6366f1" emissiveIntensity={0.28} transparent opacity={0.2} toneMapped={false} />
      </mesh>
      <mesh ref={innerRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.55, 0.015, 12, 90]} />
        <meshStandardMaterial color="#818cf8" emissive="#818cf8" emissiveIntensity={0.26} transparent opacity={0.18} toneMapped={false} />
      </mesh>
    </group>
  );
}

function CodeGlyphs() {
  const leftRef = useRef<THREE.Group>(null);
  const rightRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (leftRef.current) {
      leftRef.current.position.y = -0.42 + Math.sin(t * 0.9) * 0.06;
    }
    if (rightRef.current) {
      rightRef.current.position.y = 1.1 + Math.sin(t * 0.9 + 1.4) * 0.06;
    }
  });

  const glyphMaterial = (
    <meshStandardMaterial color="#7bd2ff" emissive="#7bd2ff" emissiveIntensity={0.26} metalness={0.8} roughness={0.16} toneMapped={false} />
  );

  return (
    <>
      <group ref={leftRef} position={[0.72, -0.42, 0.24]} rotation={[0, 0.38, 0]} scale={0.85}>
        <mesh position={[-0.1, 0, 0]} rotation={[0, 0, 0.72]}>
          <boxGeometry args={[0.05, 0.36, 0.03]} />
          {glyphMaterial}
        </mesh>
        <mesh position={[-0.2, 0, 0]} rotation={[0, 0, -0.72]}>
          <boxGeometry args={[0.05, 0.36, 0.03]} />
          {glyphMaterial}
        </mesh>
        <mesh position={[0.1, 0, 0]} rotation={[0, 0, -0.72]}>
          <boxGeometry args={[0.05, 0.36, 0.03]} />
          {glyphMaterial}
        </mesh>
        <mesh position={[0.2, 0, 0]} rotation={[0, 0, 0.72]}>
          <boxGeometry args={[0.05, 0.36, 0.03]} />
          {glyphMaterial}
        </mesh>
      </group>
      <group ref={rightRef} position={[2.78, 1.1, 0.72]} rotation={[0, -0.24, 0]} scale={0.7}>
        <mesh position={[-0.1, 0, 0]} rotation={[0, 0, 0.72]}>
          <boxGeometry args={[0.05, 0.36, 0.03]} />
          {glyphMaterial}
        </mesh>
        <mesh position={[-0.2, 0, 0]} rotation={[0, 0, -0.72]}>
          <boxGeometry args={[0.05, 0.36, 0.03]} />
          {glyphMaterial}
        </mesh>
        <mesh position={[0.1, 0, 0]} rotation={[0, 0, -0.72]}>
          <boxGeometry args={[0.05, 0.36, 0.03]} />
          {glyphMaterial}
        </mesh>
        <mesh position={[0.2, 0, 0]} rotation={[0, 0, 0.72]}>
          <boxGeometry args={[0.05, 0.36, 0.03]} />
          {glyphMaterial}
        </mesh>
      </group>
    </>
  );
}

function ServerBanks() {
  return (
    <group position={[5.05, -1.2, -1.3]} rotation={[0, -0.24, 0]}>
      {Array.from({ length: 6 }, (_, stack) => (
        <group key={stack} position={[stack * 0.44, 0, -stack * 0.12]}>
          <mesh castShadow>
            <boxGeometry args={[0.28, 1.2 + (stack % 2) * 0.18, 0.22]} />
            <meshStandardMaterial color="#121826" metalness={0.62} roughness={0.36} />
          </mesh>
          {Array.from({ length: 5 }, (_, row) => (
            <mesh key={row} position={[0, -0.34 + row * 0.18, 0.115]}>
              <boxGeometry args={[0.18, 0.07, 0.008]} />
              <meshStandardMaterial color="#4b566f" emissive="#6aaeff" emissiveIntensity={row === 2 ? 0.14 : 0.04} toneMapped={false} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

function FloorGrid() {
  return (
    <group position={[0, -2.55, -1.4]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 8]} />
        <meshBasicMaterial color="#09111d" transparent opacity={0.34} />
      </mesh>
      {Array.from({ length: 20 }, (_, index) => (
        <mesh key={`x-${index}`} position={[-7 + index * 0.74, 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.012, 8]} />
          <meshBasicMaterial color="#1f3e70" transparent opacity={0.34} />
        </mesh>
      ))}
      {Array.from({ length: 12 }, (_, index) => (
        <mesh key={`z-${index}`} position={[0, 0.004, -4 + index * 0.72]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[14, 0.012]} />
          <meshBasicMaterial color="#14345a" transparent opacity={0.26} />
        </mesh>
      ))}
    </group>
  );
}

function HeroScene({ role }: { role: RoleTitle }) {
  const sceneRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!sceneRef.current) return;
    sceneRef.current.rotation.y += (mouseState.x * 0.08 - sceneRef.current.rotation.y) * 0.03;
    sceneRef.current.rotation.x += (mouseState.y * 0.05 - sceneRef.current.rotation.x) * 0.02;
  });

  return (
    <>
      <MouseTracker />
      <color attach="background" args={['#010103']} />
      <ambientLight intensity={0.5} color="#1e1b4b" />
      <directionalLight position={[2, 6, 5]} intensity={1.35} color="#f5f7ff" castShadow />
      <pointLight position={[2.4, 1.8, 2.4]} intensity={2.2} color="#818cf8" distance={14} />
      <pointLight position={[3.2, 0.2, 1.8]} intensity={1.4} color="#6366f1" distance={10} />
      <pointLight position={[0.5, 0.8, 1.4]} intensity={1.1} color="#4338ca" distance={8} />

      <group ref={sceneRef}>
        <FloorGrid />
        <ActiveHeroModel />
        <OrbitingModel
          path={MODELS.circuitBoard}
          orbit={{ radius: 3.6, speed: 0.8, angleOffset: 0, yOffset: 0.1, zOffset: 0.6 }}
          scale={0.6}
          baseRotation={[0.2, 0, -0.15]}
          tiltSpeed={0.4}
        />
        <OrbitingModel
          path={MODELS.processor}
          orbit={{ radius: 3.6, speed: 0.8, angleOffset: (Math.PI * 2) / 7, yOffset: 0.1, zOffset: 0.6 }}
          scale={0.5}
          baseRotation={[0.1, -0.6, 0.06]}
          tiltSpeed={0.4}
        />
        <OrbitingModel
          path={MODELS.reactLogo}
          orbit={{ radius: 3.6, speed: 0.8, angleOffset: (Math.PI * 4) / 7, yOffset: 0.1, zOffset: 0.6 }}
          scale={0.25}
          baseRotation={[0.3, 1.0, -0.2]}
          tiltSpeed={0.4}
        />
        <OrbitingModel
          path={MODELS.cpp}
          orbit={{ radius: 3.6, speed: 0.8, angleOffset: (Math.PI * 6) / 7, yOffset: 0.1, zOffset: 0.6 }}
          scale={0.02}
          baseRotation={[0, 0, 0]}
          tiltSpeed={0.4}
        />
        <OrbitingModel
          path={MODELS.csharp}
          orbit={{ radius: 3.6, speed: 0.8, angleOffset: (Math.PI * 8) / 7, yOffset: 0.1, zOffset: 0.6 }}
          scale={0.02}
          baseRotation={[0, 0, 0]}
          tiltSpeed={0.4}
        />
        <OrbitingModel
          path={MODELS.python}
          orbit={{ radius: 3.6, speed: 0.8, angleOffset: (Math.PI * 10) / 7, yOffset: 0.1, zOffset: 0.6 }}
          scale={0.02}
          baseRotation={[0, 0, 0]}
          tiltSpeed={0.4}
        />
        <OrbitingModel
          path={MODELS.threejs}
          orbit={{ radius: 3.6, speed: 0.8, angleOffset: (Math.PI * 12) / 7, yOffset: 0.1, zOffset: 0.6 }}
          scale={0.02}
          baseRotation={[0, 0, 0]}
          tiltSpeed={0.4}
        />
        <ServerBanks />
      </group>

      <Sparkles count={40} scale={[6.5, 4.5, 5.5]} size={2.8} speed={0.22} color="#818cf8" opacity={0.35} />

      <EffectComposer>
        <Bloom luminanceThreshold={0.62} luminanceSmoothing={0.92} intensity={0.62} />
      </EffectComposer>
    </>
  );
}

export default function TechHero() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const [roleIndex, setRoleIndex] = useState(0);
  const [introCollapsed, setIntroCollapsed] = useState(false);

  useEffect(() => {
    const introTimer = window.setTimeout(() => {
      setIntroCollapsed(true);
    }, 2200);

    return () => window.clearTimeout(introTimer);
  }, []);

  useEffect(() => {
    if (!introCollapsed) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setRoleIndex((current) => (current + 1) % ROLE_TITLES.length);
    }, 2800);

    return () => window.clearInterval(interval);
  }, [introCollapsed]);

  const activeRole = ROLE_TITLES[roleIndex];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#010102] px-4 py-6 md:px-8 md:py-10">
      <div className="mx-auto relative h-[76vh] md:h-[82vh] max-w-[1500px] overflow-hidden rounded-[42px] border border-white/10 bg-[#020205]/85 shadow-2xl">
      <div className="absolute inset-0 pointer-events-none hero-canvas">
        <Canvas
          camera={{ position: [0, 0, 8.8], fov: 36 }}
          shadows
          dpr={[1, 1.5]}
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
          style={{ background: 'transparent', pointerEvents: 'none' }}
        >
          <Suspense fallback={<group />}>
            <HeroScene role={activeRole} />
          </Suspense>
        </Canvas>
      </div>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(90deg, rgba(1,2,8,0.98) 0%, rgba(1,2,8,0.92) 40%, rgba(1,2,8,0.56) 62%, rgba(1,2,8,0.24) 100%), radial-gradient(circle at 72% 28%, rgba(99,102,241,0.3) 0%, rgba(8,12,20,0) 44%)',
        }}
      />

      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-y-0 left-0 w-[48%] bg-[radial-gradient(circle_at_bottom,rgba(99,102,241,0.18),transparent_52%)]" />
      </div>

      <svg className="absolute left-0 top-12 h-52 w-64 pointer-events-none opacity-30" viewBox="0 0 240 180">
        <path d="M0 96 H62 L92 62 H132 L154 34 H214" stroke="#4f46e5" strokeWidth="1.2" fill="none" />
        <path d="M0 124 H78 L102 98 H144 L174 72 H232" stroke="#4f46e5" strokeWidth="1" fill="none" />
        <circle cx="92" cy="62" r="3" fill="#818cf8" />
        <circle cx="174" cy="72" r="3" fill="#818cf8" />
      </svg>

      <svg className="absolute bottom-12 right-0 h-44 w-64 pointer-events-none opacity-22" viewBox="0 0 240 180">
        <path d="M240 44 H182 L160 62 H110 L88 86 H20" stroke="#4f46e5" strokeWidth="1.2" fill="none" />
        <path d="M240 78 H196 L166 102 H126 L90 126 H22" stroke="#4f46e5" strokeWidth="1" fill="none" />
        <circle cx="160" cy="62" r="3" fill="#818cf8" />
        <circle cx="90" cy="126" r="3" fill="#818cf8" />
      </svg>

      <div className="absolute inset-0 flex items-center">
        <div className="mx-4 sm:ml-8 md:ml-14 lg:ml-24 max-w-[36rem] pointer-events-auto">
          <div className="h-[150px] sm:h-[182px] md:h-[214px]">
            <div className="text-3xl sm:text-5xl font-semibold leading-tight text-white md:text-6xl lg:text-[4.2rem]">
              <span className="block text-white/65">{introCollapsed ? "I'm" : "Hi, I'm"}</span>
              <div className="mt-2 flex items-center gap-3 sm:gap-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeRole.key}
                    initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -14, filter: 'blur(8px)' }}
                    transition={{ duration: 0.46, ease: 'easeOut' }}
                    className="flex items-center gap-3 sm:gap-4"
                  >
                    <span className="relative flex h-11 w-11 items-center justify-center sm:h-12 sm:w-12">
                      <span className="absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle,rgba(129,140,248,0.18)_0%,rgba(129,140,248,0.08)_45%,transparent_72%)] blur-[2px]" />
                      <span className="absolute left-1/2 top-[46%] h-9 w-7 -translate-x-1/2 bg-[linear-gradient(180deg,rgba(129,140,248,0.24)_0%,rgba(129,140,248,0.12)_42%,rgba(129,140,248,0.04)_78%,rgba(129,140,248,0)_100%)] [clip-path:polygon(0%_0%,100%_0%,50%_100%)]" />
                      <span className="absolute left-1/2 top-[84%] h-[3px] w-[3px] -translate-x-1/2 rounded-full bg-[#a5b4fc]/55 blur-[1px]" />
                      <span className="relative z-10">
                        <RoleWordmark roleKey={activeRole.key} />
                      </span>
                    </span>
                    <span className="bg-gradient-to-r from-[#e0e7ff] via-[#a5b4fc] to-[#6366f1] bg-clip-text text-transparent" style={{ filter: 'drop-shadow(0 0 10px rgba(129,140,248,0.45))' }}>
                      {activeRole.label}
                    </span>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38, duration: 0.6 }}
            className="mt-6 sm:mt-10"
          >
            <button
              onClick={() => navigate('/projects')}
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              className="group relative rounded-full px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-xl font-medium transition-all duration-[180ms] ease-out hover:scale-[1.03]"
              style={{
                border: '1.5px solid',
                borderColor: hovered ? 'rgba(165,180,252,0.65)' : 'rgba(129,140,248,0.42)',
                background: hovered ? 'rgba(14,16,40,0.85)' : 'linear-gradient(135deg, #818cf8, #4f46e5)',
                boxShadow: hovered
                  ? '0 0 28px rgba(99,102,241,0.45), inset 0 0 20px rgba(129,140,248,0.1)'
                  : '0 0 22px rgba(99,102,241,0.34)',
              }}
            >
              <span className="relative z-10 flex items-center gap-0">
                <span
                  className="transition-colors duration-[180ms]"
                  style={{ color: '#ffffff' }}
                >Explore My&nbsp;</span>
                <span
                  className="font-semibold transition-all duration-[180ms]"
                  style={{
                    background: hovered ? 'linear-gradient(90deg, #c7d2fe, #a5b4fc, #818cf8)' : 'none',
                    WebkitBackgroundClip: hovered ? 'text' : 'unset',
                    WebkitTextFillColor: hovered ? 'transparent' : '#ffffff',
                    textShadow: hovered ? '0 0 18px rgba(129,140,248,0.7)' : 'none',
                    filter: hovered ? 'drop-shadow(0 0 6px rgba(129,140,248,0.65))' : 'none',
                  }}
                >Work</span>
              </span>
            </button>
          </motion.div>
        </div>
      </div>
      </div>
    </div>
  );
}

useGLTF.preload(MODELS.abdullah);
useGLTF.preload(MODELS.circuitBoard);
useGLTF.preload(MODELS.processor);
useGLTF.preload(MODELS.reactLogo);
useGLTF.preload(MODELS.cpp);
useGLTF.preload(MODELS.csharp);
useGLTF.preload(MODELS.python);
useGLTF.preload(MODELS.threejs);
