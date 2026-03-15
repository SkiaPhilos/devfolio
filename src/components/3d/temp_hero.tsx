import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { Center, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

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

const TITLES = [
  { intro: "Hi, I'm", text: "Abdullah", model: MODELS.abdullah, scale: 6.8, y: -1.2, isHuman: true },
  { intro: "I'm", text: "a designer", model: MODELS.threejs, scale: 0.16, y: -0.2, isHuman: false },
  { intro: "I'm", text: "a web developer", model: MODELS.reactLogo, scale: 0.28, y: -0.2, isHuman: false },
  { intro: "I'm", text: "an engineer", model: MODELS.processor, scale: 0.5, y: -0.1, isHuman: false },
  { intro: "I'm", text: "a creative technologist", model: MODELS.circuitBoard, scale: 0.45, y: -0.3, isHuman: false },
];

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
          material.forEach((entry) => { entry.depthWrite = true; });
        } else if (material) {
          material.depthWrite = true;
        }
      }
    });
    return cloned;
  }, [gltf.scene]);
}

function DynamicHeroModel({ activeRole }: { activeRole: typeof TITLES[0] }) {
  const model = useSceneClone(activeRole.model);
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.position.y = activeRole.y + Math.sin(t * 0.8) * 0.08;
    groupRef.current.rotation.y = mouseState.x * 0.08 + (!activeRole.isHuman ? t * 0.6 : 0);
    groupRef.current.rotation.x = !activeRole.isHuman ? Math.sin(t * 0.5) * 0.15 : 0;
  });

  return (
    <group ref={groupRef} position={[2.05, activeRole.y, 0.15]} scale={activeRole.scale}>
      <group rotation={activeRole.isHuman ? [0, -Math.PI / 2, 0] : [0.2, 0, 0]}>
        <Center>
          <primitive object={model} />
        </Center>
      </group>
    </group>
  );
}

interface OrbitSpec { radius: number; speed: number; angleOffset: number; yOffset: number; zOffset: number; }
function OrbitingModel({ path, orbit, scale, baseRotation, tiltSpeed }: { path: AssetPath; orbit: OrbitSpec; scale: number; baseRotation?: [number, number, number]; tiltSpeed?: number; }) {
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
      <Center><primitive object={model} /></Center>
    </group>
  );
}

function FloorGrid() {
  return (
    <group position={[0, -2.55, -1.4]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 8]} />
        <meshBasicMaterial color="#0a0a14" transparent opacity={0.34} />
      </mesh>
      {Array.from({ length: 20 }, (_, index) => (
        <mesh key={`x-${index}`} position={[-7 + index * 0.74, 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.012, 8]} />
          <meshBasicMaterial color="#1e1b4b" transparent opacity={0.34} />
        </mesh>
      ))}
      {Array.from({ length: 12 }, (_, index) => (
        <mesh key={`z-${index}`} position={[0, 0.004, -4 + index * 0.72]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[14, 0.012]} />
          <meshBasicMaterial color="#312e81" transparent opacity={0.26} />
        </mesh>
      ))}
    </group>
  );
}

function HeroScene({ activeRole }: { activeRole: typeof TITLES[0] }) {
  const sceneRef = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!sceneRef.current) return;
    sceneRef.current.rotation.y += (mouseState.x * 0.08 - sceneRef.current.rotation.y) * 0.03;
    sceneRef.current.rotation.x += (mouseState.y * 0.05 - sceneRef.current.rotation.x) * 0.02;
  });

  return (
    <>
      <MouseTracker />
      <color attach="background" args={['#020205']} />
      <ambientLight intensity={0.52} color="#1b1c42" />
      <directionalLight position={[2, 6, 5]} intensity={1.35} color="#eef2ff" castShadow />
      <pointLight position={[2.4, 1.8, 2.4]} intensity={2.2} color="#818cf8" distance={14} />
      <pointLight position={[3.2, 0.2, 1.8]} intensity={1.4} color="#6366f1" distance={10} />
      <pointLight position={[0.5, 0.8, 1.4]} intensity={1.1} color="#4338ca" distance={8} />

      <group ref={sceneRef}>
        <FloorGrid />
        
        <DynamicHeroModel activeRole={activeRole} />

        <OrbitingModel path={MODELS.circuitBoard} orbit={{ radius: 3.6, speed: 0.5, angleOffset: 0, yOffset: 0.1, zOffset: 0.6 }} scale={0.4} baseRotation={[0.2, 0, -0.15]} tiltSpeed={0.4} />
        <OrbitingModel path={MODELS.cpp} orbit={{ radius: 3.6, speed: 0.5, angleOffset: (Math.PI * 2) / 3, yOffset: 0.1, zOffset: 0.6 }} scale={0.4} baseRotation={[0.1, -0.6, 0.06]} tiltSpeed={0.4} />
        <OrbitingModel path={MODELS.reactLogo} orbit={{ radius: 3.6, speed: 0.5, angleOffset: (Math.PI * 4) / 3, yOffset: 0.1, zOffset: 0.6 }} scale={0.15} baseRotation={[0.3, 1.0, -0.2]} tiltSpeed={0.3} />
      </group>

      <EffectComposer enableNormalPass={false}>
        <Bloom luminanceThreshold={0.5} mipmapBlur intensity={0.8} />
      </EffectComposer>
    </>
  );
}

export default function TechHero() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const [roleIndex, setRoleIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRoleIndex((current) => (current + 1) % TITLES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const activeRole = TITLES[roleIndex];

  return (
    <div className="relative w-full p-4 sm:p-6 lg:p-12 min-h-[90vh] flex items-center justify-center isolate">
      <div className="absolute inset-0 z-0 bg-[#010102]"></div>

      <div className="relative w-full max-w-[1400px] h-[80vh] organic-border bg-[#020205] shadow-2xl z-10 transition-colors duration-1000">
        <div className="absolute inset-0 pointer-events-none hero-canvas">
          <Canvas
            camera={{ position: [0, 0, 8.8], fov: 36 }}
            shadows
            dpr={[1, 1.5]}
            gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
          >
            <Suspense fallback={<group />}>
              <HeroScene activeRole={activeRole} />
            </Suspense>
          </Canvas>
        </div>

        <div
          className="absolute inset-0 pointer-events-none mix-blend-overlay"
          style={{
            background: 'radial-gradient(circle at 72% 28%, rgba(99,102,241,0.15) 0%, rgba(2,2,5,0) 50%)',
          }}
        />

        <div className="absolute inset-0 flex items-center">
          <div className="mx-6 sm:ml-10 md:ml-16 lg:ml-24 max-w-[44rem] pointer-events-auto z-20">
            <div className="h-[160px] md:h-[200px] flex flex-col justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={roleIndex}
                  initial={{ opacity: 0, y: 15, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -15, filter: 'blur(8px)' }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                >
                  <h1 className="text-3xl sm:text-5xl font-semibold leading-tight text-white md:text-6xl lg:text-[4rem]">
                    <span className="text-white/60 font-light block mb-2">{activeRole.intro}</span>
                    <span className="bg-gradient-to-r from-[#818cf8] via-[#6366f1] to-[#a5b4fc] text-transparent bg-clip-text font-bold block">
                      {activeRole.text}
                    </span>
                  </h1>
                </motion.div>
              </AnimatePresence>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-8 sm:mt-10"
            >
              <button
                onClick={() => navigate('/projects')}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                className="group relative rounded-full px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg font-medium transition-all duration-300 ease-out"
                style={{
                  border: '1px solid rgba(99, 102, 241, 0.4)',
                  background: hovered ? 'rgba(99, 102, 241, 0.15)' : 'rgba(2, 2, 5, 0.6)',
                  boxShadow: hovered
                    ? '0 0 30px rgba(99, 102, 241, 0.4), inset 0 0 15px rgba(99, 102, 241, 0.2)'
                    : 'none',
                  backdropFilter: 'blur(12px)'
                }}
              >
                <span className="relative z-10 flex items-center gap-2 text-white">
                  Explore My Work <span className="text-[#a5b4fc] transition-transform duration-300 group-hover:translate-x-1">→</span>
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
