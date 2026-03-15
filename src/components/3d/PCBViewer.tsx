import { useMemo, Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, ContactShadows, Grid } from '@react-three/drei';
import * as THREE from 'three';

// Build a base-aware URL so this also works when deployed under /devfolio/
const MODEL_URL = `${import.meta.env.BASE_URL}models/bigger%20pcb%20more%20detail.glb`;

type LayerKind = 'plastic' | 'traces' | 'components';
type LayerSource = 'semantic' | 'fallback-material' | 'fallback-height';

interface ExplodePart {
  mesh: THREE.Mesh;
  base: THREE.Vector3;
  target: THREE.Vector3;
  kind: LayerKind;
  source: LayerSource;
}

interface LayerContext {
  minY: number;
  maxY: number;
}

function detectLayer(mesh: THREE.Mesh, ctx: LayerContext): { kind: LayerKind; source: LayerSource } {
  const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
  const matLabel = Array.isArray(mat)
    ? mat.map((m) => m.name).join(' ')
    : mat?.name ?? '';
  const label = `${mesh.name} ${matLabel}`.toLowerCase();

  if (/trace|copper|via|pad|route|silk/.test(label)) return { kind: 'traces', source: 'semantic' };
  if (/res|cap|ic|chip|connector|led|diode|transistor|component|smd|qfp|qfn/.test(label)) {
    return { kind: 'components', source: 'semantic' };
  }
  if (/board|substrate|fr4|mask|insulator|plastic/.test(label)) return { kind: 'plastic', source: 'semantic' };

  // Material-based fallback for unlabeled assets.
  const materials = Array.isArray(mat) ? mat : mat ? [mat] : [];
  const hasCopperLikeMaterial = materials.some((m) => {
    const std = m as THREE.MeshStandardMaterial;
    return typeof std.metalness === 'number' && std.metalness > 0.58;
  });
  if (hasCopperLikeMaterial) return { kind: 'traces', source: 'fallback-material' };

  // Geometry fallback by vertical band: top=components, middle=traces, bottom=substrate/plastic.
  const worldPos = new THREE.Vector3();
  mesh.getWorldPosition(worldPos);
  const span = Math.max(ctx.maxY - ctx.minY, 0.0001);
  const yNorm = (worldPos.y - ctx.minY) / span;
  if (yNorm > 0.64) return { kind: 'components', source: 'fallback-height' };
  if (yNorm > 0.36) return { kind: 'traces', source: 'fallback-height' };
  return { kind: 'plastic', source: 'fallback-height' };
}

function nameHash(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i += 1) h = (h * 31 + input.charCodeAt(i)) >>> 0;
  return h;
}

function buildOffset(base: THREE.Vector3, kind: LayerKind, salt: string): THREE.Vector3 {
  const radial = new THREE.Vector3(base.x, 0, base.z);
  if (radial.lengthSq() < 0.0001) radial.set(1, 0, 0);
  radial.normalize();

  const dist = Math.max(Math.hypot(base.x, base.z), 0.2);
  const radialScale = Math.min(1.35, 0.5 + dist * 0.35);

  const spread = kind === 'components' ? 1.18 : kind === 'traces' ? 0.8 : 0.48;
  const lift = kind === 'components' ? 1.45 : kind === 'traces' ? 0.52 : -1.1;

  const h = nameHash(salt);
  const jitterX = ((h & 0xff) / 255 - 0.5) * 0.18;
  const jitterY = (((h >> 8) & 0xff) / 255 - 0.5) * 0.14;
  const jitterZ = (((h >> 16) & 0xff) / 255 - 0.5) * 0.18;

  return radial.multiplyScalar(spread * radialScale).add(new THREE.Vector3(jitterX, lift + jitterY, jitterZ));
}

function PCBModel() {
  const { scene } = useGLTF(MODEL_URL);
  const [exploded, setExploded] = useState(false);
  const cloned = useMemo(() => scene.clone(true), [scene]);
  const partsRef = useRef<ExplodePart[]>([]);
  const explodeProgress = useRef(0);

  // Compute centering + fitting from the cloned scene
  const [position, scale] = useMemo<[[number, number, number], number]>(() => {
    const box = new THREE.Box3().setFromObject(cloned);
    if (box.isEmpty()) return [[0, 0, 0], 1];
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z, 0.001);
    const s = 4.2 / maxDim;
    return [[-center.x, -center.y, -center.z], s];
  }, [cloned]);

  useEffect(() => {
    cloned.updateMatrixWorld(true);
    const worldBox = new THREE.Box3().setFromObject(cloned);
    const ctx: LayerContext = {
      minY: worldBox.min.y,
      maxY: worldBox.max.y,
    };

    const parts: ExplodePart[] = [];
    const stats = {
      components: { semantic: 0, fallbackMaterial: 0, fallbackHeight: 0 },
      traces: { semantic: 0, fallbackMaterial: 0, fallbackHeight: 0 },
      plastic: { semantic: 0, fallbackMaterial: 0, fallbackHeight: 0 },
    };

    cloned.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;

      const base = mesh.position.clone();
      const detected = detectLayer(mesh, ctx);
      const target = base.clone().add(buildOffset(base, detected.kind, `${mesh.name}|${mesh.uuid}`));
      parts.push({ mesh, base, target, kind: detected.kind, source: detected.source });

      if (detected.kind === 'components') {
        if (detected.source === 'semantic') stats.components.semantic += 1;
        else if (detected.source === 'fallback-material') stats.components.fallbackMaterial += 1;
        else stats.components.fallbackHeight += 1;
      } else if (detected.kind === 'traces') {
        if (detected.source === 'semantic') stats.traces.semantic += 1;
        else if (detected.source === 'fallback-material') stats.traces.fallbackMaterial += 1;
        else stats.traces.fallbackHeight += 1;
      } else {
        if (detected.source === 'semantic') stats.plastic.semantic += 1;
        else if (detected.source === 'fallback-material') stats.plastic.fallbackMaterial += 1;
        else stats.plastic.fallbackHeight += 1;
      }

      const material = mesh.material as THREE.MeshStandardMaterial | THREE.MeshStandardMaterial[];
      if (Array.isArray(material)) {
        material.forEach((mat) => {
          mat.emissive = mat.emissive ?? new THREE.Color('#000000');
          mat.emissiveIntensity = 0.08;
        });
      } else if (material) {
        material.emissive = material.emissive ?? new THREE.Color('#000000');
        material.emissiveIntensity = 0.08;
      }
    });
    partsRef.current = parts;

    const semanticTotal =
      stats.components.semantic + stats.traces.semantic + stats.plastic.semantic;
    if (semanticTotal === 0) {
      console.info('[PCBViewer] No semantic layer names detected; using fallback explode classification.', stats);
    } else {
      console.info('[PCBViewer] Mixed semantic/fallback explode classification.', stats);
    }
  }, [cloned]);

  useFrame((_, delta) => {
    const target = exploded ? 1 : 0;
    const step = 1 - Math.exp(-delta * 6);
    explodeProgress.current += (target - explodeProgress.current) * step;

    const t = explodeProgress.current;
    for (const part of partsRef.current) {
      part.mesh.position.lerpVectors(part.base, part.target, t);
    }
  });

  return (
    <group
      position={position}
      scale={scale}
      onClick={(event) => {
        event.stopPropagation();
        setExploded((prev) => !prev);
      }}
    >
      <primitive object={cloned} />
    </group>
  );
}

export default function PCBViewer() {
  return (
    <Canvas camera={{ position: [0, 3.5, 6.5], fov: 40 }} dpr={[1, 2]} shadows>
      <color attach="background" args={['#030810']} />
      <fog attach="fog" args={['#030810', 14, 28]} />

      <ambientLight intensity={0.55} />
      <directionalLight
        position={[8, 14, 6]}
        intensity={2.0}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight position={[-6, 5, -5]} intensity={0.75} color="#4488ff" />
      <pointLight position={[0, 3, 4]} intensity={1.0} color="#33ffaa" />
      <pointLight position={[4, 1, -2]} intensity={0.6} color="#ff8822" />
      <pointLight position={[-4, 1, 2]} intensity={0.45} color="#4466ff" />

      <Suspense fallback={null}>
        <PCBModel />
        <ContactShadows
          position={[0, -2.4, 0]}
          opacity={0.45}
          scale={10}
          blur={3.2}
          color="#002200"
        />
        <Grid
          position={[0, -2.4, 0]}
          args={[14, 14]}
          cellColor="#1a2a1a"
          sectionColor="#2a3a2a"
          cellSize={0.5}
          sectionSize={2}
          fadeDistance={14}
          fadeStrength={1.6}
          infiniteGrid
        />
      </Suspense>

      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        minDistance={1.5}
        maxDistance={22}
        dampingFactor={0.07}
        enableDamping
        autoRotate
        autoRotateSpeed={0.5}
      />
    </Canvas>
  );
}

useGLTF.preload(MODEL_URL);
