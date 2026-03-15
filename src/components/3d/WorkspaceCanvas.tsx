import { useRef, useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import {
  OrbitControls,
  Environment,
  Text,
  Sparkles,
  useProgress,
  useGLTF,
} from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { listRecentLayouts } from '../../utils/layoutApi';

// ── Constants ──────────────────────────────────────────────────────────────

const BASE = import.meta.env.BASE_URL;

interface ClickableObject {
  name: string;
  label: string;
  route: string;
  description: string;
}

const CLICKABLE_OBJECTS: Record<string, ClickableObject> = {
  monitor: { name: 'monitor', label: 'Projects', route: '/projects', description: 'View my portfolio' },
  keyboard: { name: 'keyboard', label: 'Code', route: '/projects', description: 'Software & coding work' },
  mouse: { name: 'mouse', label: 'Contact', route: '/contact', description: 'Get in touch' },
  tower: { name: 'tower', label: 'About', route: '/', description: 'About me' },
  whiteboard: { name: 'whiteboard', label: 'Skills', route: '/skills', description: 'Technical skills' },
};

const NODE_CATEGORY_PATTERNS: [RegExp, string][] = [
  [/MY[ _-]?SCREEN|gallerymodel|gigabyte-logo|bg2/i, 'monitor'],
  [/Tastatur|keyboard/i, 'keyboard'],
  [/souris|mouse/i, 'mouse'],
  [/aorus case fans|IOSHIELD|psuback|usb|metal-mesh|rgb-hdd|MOBOAORUSORANGETRANS/i, 'tower'],
];

// ── Model Paths ────────────────────────────────────────────────────────

const DESK_MODEL_PATH = `${BASE}models/desktop table full setup.glb`;
const CHAIR_MODEL_PATH = `${BASE}models/chair.glb`;
const SOFA_MODEL_PATH = `${BASE}models/sofa.glb`;
const PLANT_INDOOR_PATH = `${BASE}models/indoor_plant.glb`;
const PLANT_PALM_PATH = `${BASE}models/palm_plant.glb`;
const SKATEBOARD_PATH = `${BASE}models/skateboard.glb`;
const WHITEBOARD_PATH = `${BASE}models/whiteboard.glb`;

// Monitor slideshow images
const SCREEN_IMAGES = [
  '1.png', '2.jpg', '3.jpg', '4.jpg', '5.png', '6.jpg', 'Capture.PNG',
];

const SCREEN_MODES = ['code', 'design', 'terminal', 'pcb', 'browser', '3d', 'showcase'] as const;
type ScreenMode = (typeof SCREEN_MODES)[number];

interface RecentPublisherItem {
  name: string;
  createdBy: string;
  publishedBy: string;
  publishedAt: string;
}

// ── Room Layout Constants ──────────────────────────────────────────────
// Room: 12 wide (x), 8 deep (z), 4.5 tall (y)
// Back wall at z = -4, left wall x = -6, right wall x = 6

const ROOM = {
  width: 12,
  depth: 8,
  height: 4.5,
  wallZ: -4,
  leftX: -6,
  rightX: 6,
};

// Desk sits center-ish, chair behind it (toward back wall)
const DESK_POS_XZ: [number, number] = [0, 0]; // x, z only — Y is computed from chair height
const DESK_SCALE = 0.33; // 1.5× the previous 0.22

// Chair in front of desk
const CHAIR_POS: [number, number, number] = [1.5, 0, 1.4];
const CHAIR_SCALE = 1.2;

// Sofas along left & right walls, facing inward
const SOFA_LEFT_POS: [number, number, number] = [-5.2, 0, 0];
const SOFA_RIGHT_POS: [number, number, number] = [5.2, 0, 0];
const SOFA_SCALE = 1.2;

// Plants scattered around the room — near walls
const PLANT_POSITIONS: [number, number, number][] = [
  [-5.2, 0, -3.2],  // back-left near wall
  [5.2, 0, -3.2],   // back-right near wall
  [-5.2, 0, 2.5],   // front-left near wall
];

// Whiteboard on back wall
const WHITEBOARD_POS: [number, number, number] = [-2.5, 1.6, -3.92];
const WHITEBOARD_SCALE = 3.6;

// Skateboard on the floor
const SKATEBOARD_POS = new THREE.Vector3(2.0, 0.02, 1.8);
const SKATEBOARD_SCALE = 0.04;

// Camera
const CAM_START: [number, number, number] = [6, 4.5, 7];
const CAM_END: [number, number, number] = [3.5, 2.5, 5];
const CAM_TARGET: [number, number, number] = [0, 0.6, -0.5];

// ── Canvas Texture Drawers (fallback when no PNGs) ─────────────────────

function drawCodeEditor(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, w, 28);
  const tabs = ['App.tsx', 'Scene.tsx', 'styles.css'];
  tabs.forEach((tab, i) => {
    ctx.fillStyle = i === 0 ? '#0d0d1a' : 'transparent';
    ctx.fillRect(i * 100, 0, 98, 28);
    ctx.fillStyle = i === 0 ? '#6366f1' : '#888';
    ctx.font = '11px monospace';
    ctx.fillText(tab, i * 100 + 10, 18);
  });
  const lines = [
    [['#888', 'import '], ['#00ffe0', 'React'], ['#888', ' from '], ['#aed581', "'react'"]],
    [['#888', '']],
    [['#888', 'export default '], ['#7986cb', 'function '], ['#ffb74d', 'App'], ['#888', '() {']],
    [['#888', '  return (']],
    [['#888', '    <'], ['#ef9a9a', 'Canvas'], ['#888', ' camera='], ['#aed581', '{{ fov: 60 }}'], ['#888', '>']],
    [['#888', '      <'], ['#ef9a9a', 'WorkspaceScene'], ['#888', ' />']],
    [['#888', '    </'], ['#ef9a9a', 'Canvas'], ['#888', '>']],
    [['#888', '  )']],
    [['#888', '}']],
  ];
  ctx.font = '12px monospace';
  let y = 52;
  let lineNum = 1;
  lines.forEach((parts, i) => {
    ctx.fillStyle = '#444';
    ctx.fillText(String(lineNum++).padStart(3), 4, y);
    let x = 40;
    parts.forEach(([color, text]) => {
      ctx.fillStyle = color;
      ctx.fillText(text, x, y);
      x += ctx.measureText(text).width;
    });
    if (i === lines.length - 1 && Math.sin(t * 3) > 0) {
      ctx.fillStyle = '#6366f1';
      ctx.fillRect(x, y - 13, 8, 14);
    }
    y += 22;
  });
}

function drawTerminalUI(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, w, 26);
  ctx.fillStyle = '#00ff41';
  ctx.font = '12px monospace';
  ctx.fillText('devfolio@arch ~ $', 8, 18);
  const cmds = [
    '> npm run dev',
    '  VITE v5.2.0 ready in 342ms',
    '  ➜ Local: http://localhost:3000/',
    '> git commit -m "feat: 3d workspace"',
    '  [main 7f3a2b] feat: 3d workspace',
  ];
  let y = 52;
  const visible = Math.floor((t * 2) % cmds.length) + 1;
  cmds.slice(0, visible).forEach((line) => {
    ctx.fillStyle = line.startsWith('>') ? '#6366f1' : '#00ff41';
    ctx.fillText(line, 8, y);
    y += 22;
  });
}

function drawDesignUI(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#1c1c1c';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#2c2c2c';
  ctx.fillRect(0, 0, 48, h);
  ctx.fillRect(48, 0, w - 48, 28);
  ctx.strokeStyle = '#6366f1';
  ctx.lineWidth = 1;
  ctx.strokeRect(100, 50, 200, 140);
  ctx.fillStyle = '#fff';
  ctx.fillRect(100, 50, 200, 140);
  ctx.fillStyle = '#6366f1';
  ctx.fillRect(120, 70, 160, 30);
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(120, 112, 80, 60);
  ctx.fillRect(210, 112, 70, 60);
}

function drawPCBEditor(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#001a00';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(0,255,100,0.08)';
  ctx.lineWidth = 0.5;
  for (let x = 0; x < w; x += 20) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
  for (let y = 0; y < h; y += 20) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
  ctx.strokeStyle = '#ffff00';
  ctx.lineWidth = 2;
  ctx.strokeRect(60, 40, 280, 180);
}

function drawBrowserUI(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#f1f3f4';
  ctx.fillRect(0, 0, w, 36);
  ctx.fillStyle = '#e8eaed';
  ctx.fillRect(80, 8, 280, 20);
  ctx.fillStyle = '#555';
  ctx.font = '11px sans-serif';
  ctx.fillText('abdullah.devfolio', 92, 22);
  ctx.fillStyle = '#0d0d1a';
  ctx.fillRect(0, 36, w, 60);
  ctx.fillStyle = '#6366f1';
  ctx.fillRect(20, 50, 180, 12);
}

function draw3DViewport(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, w, h);
}

function drawShowcase(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  const projects = [
    { name: 'E-Commerce Platform', tech: 'React · Node.js · Stripe', color: '#6366f1', bg: '#1a0a10' },
    { name: 'CMS Page Builder', tech: 'TypeScript · Canvas · MongoDB', color: '#00ffe0', bg: '#0a1a18' },
    { name: 'IoT Dashboard', tech: 'React · MQTT · D3.js', color: '#ffaa22', bg: '#1a150a' },
    { name: 'PCB Design Tool', tech: 'WebGL · KiCad · Python', color: '#aa66ff', bg: '#140a1a' },
  ];
  const p = projects[Math.floor(t / 6) % 4];
  ctx.fillStyle = p.bg;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = p.color;
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText(p.name, 20, 68);
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.font = '11px monospace';
  ctx.fillText(p.tech, 20, 90);
}

// ── Categorize GLB mesh by name ────────────────────────────────────────

function categorize(name: string, parentName?: string): string | null {
  for (const [pattern, category] of NODE_CATEGORY_PATTERNS) {
    if (pattern.test(name) || (parentName && pattern.test(parentName))) return category;
  }
  return null;
}

// ── Monitor Screen with PNG slideshow + canvas fallback ────────────────

function useMonitorScreen() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [canvasMode, setCanvasMode] = useState<ScreenMode>('code');
  const [latestPublisherPages, setLatestPublisherPages] = useState<RecentPublisherItem[]>([]);
  const transitionRef = useRef(0);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 640;
    canvasRef.current = canvas;
    textureRef.current = new THREE.CanvasTexture(canvas);
  }, []);

  useEffect(() => {
    if (SCREEN_IMAGES.length === 0) return;
    let loaded = 0;
    const imgs: HTMLImageElement[] = [];
    SCREEN_IMAGES.forEach((name, i) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        loaded++;
        if (loaded === SCREEN_IMAGES.length) {
          imagesRef.current = imgs;
          setImagesLoaded(true);
        }
      };
      img.onerror = () => {
        loaded++;
        if (loaded === SCREEN_IMAGES.length && imgs.filter(Boolean).length > 0) {
          imagesRef.current = imgs.filter(Boolean);
          setImagesLoaded(true);
        }
      };
      img.src = `${BASE}textures/screens/${name}`;
      imgs[i] = img;
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadLatestPublishers() {
      try {
        const result = await listRecentLayouts(20);
        if (cancelled) return;

        const latest = result.layouts
          .filter((raw) => {
            const item = raw as Record<string, unknown>;
            return String(item.status || '').toLowerCase() === 'published';
          })
          .slice(0, 5)
          .map((raw) => {
            const item = raw as Record<string, unknown>;
            const metadata = (item.metadata && typeof item.metadata === 'object')
              ? item.metadata as Record<string, unknown>
              : {};
            const createdBy = String(item.ownerId || 'unknown');
            const publishedBy = String(metadata.publishedBy || createdBy);
            return {
              name: String(item.name || 'Untitled Page'),
              createdBy,
              publishedBy,
              publishedAt: String(item.updatedAt || item.createdAt || ''),
            };
          });

        setLatestPublisherPages(latest);
      } catch {
        if (!cancelled) {
          setLatestPublisherPages([]);
        }
      }
    }

    void loadLatestPublishers();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (imagesLoaded && imagesRef.current.length > 0) {
        transitionRef.current = 1;
        setTimeout(() => {
          const totalSlides = imagesRef.current.length + 1;
          setCurrentImage((c) => (c + 1) % totalSlides);
          transitionRef.current = 0;
        }, 600);
      } else {
        setCanvasMode((m) => {
          const idx = SCREEN_MODES.indexOf(m);
          return SCREEN_MODES[(idx + 1) % SCREEN_MODES.length];
        });
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [imagesLoaded]);

  const draw = useCallback(() => {
    if (!canvasRef.current || !textureRef.current) return;
    const ctx = canvasRef.current.getContext('2d')!;
    const w = 1024, h = 640;
    const t = Date.now() / 1000;

    if (imagesLoaded && imagesRef.current.length > 0) {
      const totalSlides = imagesRef.current.length + 1;
      const customSlideIndex = imagesRef.current.length;
      const isPublishersSlide = currentImage === customSlideIndex;

      if (isPublishersSlide) {
        ctx.fillStyle = '#060610';
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = '#6366f1';
        ctx.font = 'bold 26px sans-serif';
        ctx.fillText('Latest Published Pages', 28, 56);

        ctx.fillStyle = 'rgba(255,255,255,0.66)';
        ctx.font = '12px monospace';
        ctx.fillText('Creators and publishers (latest 5)', 28, 80);

        const rows = latestPublisherPages.length > 0
          ? latestPublisherPages
          : [{ name: 'No published pages yet', createdBy: '-', publishedBy: '-', publishedAt: '' }];

        let y = 126;
        rows.slice(0, 5).forEach((row, i) => {
          ctx.fillStyle = 'rgba(255,255,255,0.07)';
          ctx.fillRect(28, y - 24, w - 56, 78);

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 16px sans-serif';
          ctx.fillText(`${i + 1}. ${row.name}`, 42, y);

          ctx.fillStyle = 'rgba(255,255,255,0.72)';
          ctx.font = '12px monospace';
          ctx.fillText(`Created: ${row.createdBy}  |  Published: ${row.publishedBy}`, 42, y + 22);

          if (row.publishedAt) {
            const parsed = new Date(row.publishedAt);
            if (!Number.isNaN(parsed.getTime())) {
              ctx.fillText(`Updated: ${parsed.toLocaleString()}`, 42, y + 40);
            }
          }

          y += 92;
        });

        const dotR = 5;
        const dotGap = 20;
        const dotsX = 30;
        for (let i = 0; i < totalSlides; i++) {
          ctx.beginPath();
          ctx.arc(dotsX + i * dotGap + dotR, h - 30, dotR, 0, Math.PI * 2);
          ctx.fillStyle = i === currentImage ? '#6366f1' : 'rgba(255,255,255,0.4)';
          ctx.fill();
        }
      } else {
        const img = imagesRef.current[currentImage % imagesRef.current.length];
        if (img && img.complete && img.naturalWidth > 0) {
        ctx.fillStyle = '#060610';
        ctx.fillRect(0, 0, w, h);
        const scale = Math.max(w / img.width, h / img.height);
        const dw = img.width * scale;
        const dh = img.height * scale;
        const offset = transitionRef.current > 0 ? (transitionRef.current * w * 0.3) : 0;
        ctx.drawImage(img, (w - dw) / 2 - offset, (h - dh) / 2, dw, dh);
        if (transitionRef.current > 0) {
          ctx.fillStyle = `rgba(6,6,16,${transitionRef.current * 0.5})`;
          ctx.fillRect(0, 0, w, h);
          transitionRef.current = Math.max(0, transitionRef.current - 0.04);
        }

        // ── Semi-transparent bottom bar ──
        const barH = 80;
        const grad = ctx.createLinearGradient(0, h - barH - 20, 0, h);
        grad.addColorStop(0, 'rgba(6,6,16,0)');
        grad.addColorStop(0.4, 'rgba(6,6,16,0.7)');
        grad.addColorStop(1, 'rgba(6,6,16,0.9)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, h - barH - 20, w, barH + 20);

        // ── CTA button: "View Projects →" ──
        const btnW = 280, btnH = 52;
        const btnX = w - btnW - 30, btnY = h - btnH - 20;
        const pulse = 0.6 + 0.4 * Math.sin(t * 3);
        ctx.save();
        ctx.shadowColor = `rgba(99,102,241,${pulse * 0.7})`;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.roundRect(btnX, btnY, btnW, btnH, btnH / 2);
        ctx.fillStyle = `rgba(99,102,241,${0.85 + pulse * 0.15})`;
        ctx.fill();
        ctx.restore();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 22px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('View Projects  \u2192', btnX + btnW / 2, btnY + btnH / 2);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';

        // ── Image counter dots ──
        const dotR = 5, dotGap = 20;
        const totalDotsW = totalSlides * dotGap;
        const dotsX = 30;
        for (let i = 0; i < totalSlides; i++) {
          ctx.beginPath();
          ctx.arc(dotsX + i * dotGap + dotR, h - 30, dotR, 0, Math.PI * 2);
          ctx.fillStyle = i === currentImage ? '#6366f1' : 'rgba(255,255,255,0.4)';
          ctx.fill();
        }
      }
      }
    } else {
      ctx.fillStyle = '#060610';
      ctx.fillRect(0, 0, w, h);
      switch (canvasMode) {
        case 'code': drawCodeEditor(ctx, w, h, t); break;
        case 'terminal': drawTerminalUI(ctx, w, h, t); break;
        case 'design': drawDesignUI(ctx, w, h); break;
        case 'pcb': drawPCBEditor(ctx, w, h); break;
        case 'browser': drawBrowserUI(ctx, w, h); break;
        case '3d': draw3DViewport(ctx, w, h); break;
        case 'showcase': drawShowcase(ctx, w, h, t); break;
      }
    }
    textureRef.current.needsUpdate = true;
  }, [imagesLoaded, currentImage, canvasMode, latestPublisherPages]);

  return { textureRef, draw };
}

// ── Desk Setup ─────────────────────────────────────────────────────────

function DeskSetup({
  hovered,
  onHover,
  onClick,
  chairHeight,
}: {
  hovered: string | null;
  onHover: (category: string | null) => void;
  onClick: (category: string) => void;
  chairHeight: number;
}) {
  const { scene } = useGLTF(DESK_MODEL_PATH);
  const cloned = useMemo(() => scene.clone(true), [scene]);
  const groupRef = useRef<THREE.Group>(null);
  const screenMeshRef = useRef<THREE.Mesh | null>(null);
  const { textureRef, draw } = useMonitorScreen();

  // Desk Y position = 0.7 × chair total height
  const deskY = chairHeight * 0.7;

  // Compute leg data from the model's actual bounding box
  // IMPORTANT: Use `scene` (the original, unparented model) to get consistent model-space coords.
  // Using `cloned` would include parent scale after first render, causing double-scaling.
  const legData = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);

    // The leg should go from the floor (Y=0) up to the desk group's Y position (deskY).
    const legHeight = Math.max(deskY, 0.05);

    // Model-space XZ corners (tiny inset so legs sit just inside the surface edges)
    const inset = 0.05;
    const minX = box.min.x + inset;
    const maxX = box.max.x - inset;
    const minZ = box.min.z + inset;
    const maxZ = box.max.z - inset;

    // World-space XZ = modelCoord * DESK_SCALE + DESK_POS_XZ offset
    // Legs centered vertically: positioned at legHeight/2, spanning from 0 to legHeight
    const corners: [number, number, number][] = [
      [minX * DESK_SCALE + DESK_POS_XZ[0], legHeight / 2, minZ * DESK_SCALE + DESK_POS_XZ[1]],
      [maxX * DESK_SCALE + DESK_POS_XZ[0], legHeight / 2, minZ * DESK_SCALE + DESK_POS_XZ[1]],
      [minX * DESK_SCALE + DESK_POS_XZ[0], legHeight / 2, maxZ * DESK_SCALE + DESK_POS_XZ[1]],
      [maxX * DESK_SCALE + DESK_POS_XZ[0], legHeight / 2, maxZ * DESK_SCALE + DESK_POS_XZ[1]],
    ];

    return { corners, legHeight };
  }, [scene, deskY]);

  const categoryMeshes = useMemo(() => {
    const map: Record<string, THREE.Mesh[]> = {};
    cloned.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const parentName = child.parent?.name || '';
      const cat = categorize(child.name, parentName);
      if (cat) {
        child.userData.interactiveCategory = cat;
        if (!map[cat]) map[cat] = [];
        map[cat].push(child);
      }
      if (/MY.SCREEN/i.test(child.name) || /MY.SCREEN/i.test(parentName)) {
        screenMeshRef.current = child;
      }
    });
    return map;
  }, [cloned]);

  useEffect(() => {
    if (screenMeshRef.current && textureRef.current) {
      const mat = screenMeshRef.current.material as THREE.MeshStandardMaterial;
      mat.map = textureRef.current;
      mat.emissiveMap = textureRef.current;
      mat.emissive = new THREE.Color(0.3, 0.3, 0.3);
      mat.emissiveIntensity = 0.5;
      mat.needsUpdate = true;
    }
  }, [categoryMeshes, textureRef]);

  useEffect(() => {
    Object.entries(categoryMeshes).forEach(([cat, meshes]) => {
      meshes.forEach((mesh) => {
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (mat.isMeshStandardMaterial) {
          if (!mesh.userData._origEmissive) {
            mesh.userData._origEmissive = mat.emissive.clone();
            mesh.userData._origEmissiveIntensity = mat.emissiveIntensity;
          }
          if (cat === hovered) {
            mat.emissive.set('#6366f1');
            mat.emissiveIntensity = 0.15;
          } else {
            mat.emissive.copy(mesh.userData._origEmissive);
            mat.emissiveIntensity = mesh.userData._origEmissiveIntensity;
          }
        }
      });
    });
  }, [hovered, categoryMeshes]);

  useFrame(draw);

  const handlePointerOver = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    let obj: THREE.Object3D | null = e.object;
    while (obj) {
      if (obj.userData.interactiveCategory) {
        onHover(obj.userData.interactiveCategory);
        document.body.style.cursor = 'pointer';
        return;
      }
      obj = obj.parent;
    }
    onHover(null);
    document.body.style.cursor = 'default';
  }, [onHover]);

  const handlePointerOut = useCallback(() => {
    onHover(null);
    document.body.style.cursor = 'default';
  }, [onHover]);

  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    let obj: THREE.Object3D | null = e.object;
    while (obj) {
      if (obj.userData.interactiveCategory) {
        onClick(obj.userData.interactiveCategory);
        return;
      }
      obj = obj.parent;
    }
  }, [onClick]);

  return (
    <>
      <group ref={groupRef} position={[DESK_POS_XZ[0], deskY, DESK_POS_XZ[1]]} scale={DESK_SCALE}>
        <primitive
          object={cloned}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          onClick={handleClick}
        />

        {hovered && CLICKABLE_OBJECTS[hovered] && (() => {
          const meshes = categoryMeshes[hovered];
          if (!meshes?.length) return null;
          const box = new THREE.Box3();
          meshes.forEach((m) => box.expandByObject(m));
          const center = new THREE.Vector3();
          box.getCenter(center);
          return (
            <Text
              position={[center.x, box.max.y + 0.3, center.z]}
              fontSize={0.16}
              color="#6366f1"
              anchorX="center"
            >
              {CLICKABLE_OBJECTS[hovered].label}
            </Text>
          );
        })()}
      </group>

      {/* Desk legs — placed in world space at computed bbox corners */}
      {legData.corners.map(([lx, ly, lz], i) => (
        <mesh key={`leg-${i}`} position={[lx, ly, lz]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, legData.legHeight, 8]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.4} metalness={0.8} />
        </mesh>
      ))}
    </>
  );
}

// ── Room ───────────────────────────────────────────────────────────────

function Room() {
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[ROOM.width, ROOM.depth]} />
        <meshStandardMaterial color="#111118" roughness={0.8} metalness={0.1} />
      </mesh>

      {/* Floor mat / rug under desk area */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, -0.3]} receiveShadow>
        <planeGeometry args={[3.5, 3.0]} />
        <meshStandardMaterial color="#151b28" roughness={0.95} metalness={0.05} />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, ROOM.height / 2, ROOM.wallZ]} receiveShadow>
        <planeGeometry args={[ROOM.width, ROOM.height]} />
        <meshStandardMaterial color="#0d0d16" roughness={0.9} />
      </mesh>

      {/* Left wall */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[ROOM.leftX, ROOM.height / 2, 0]} receiveShadow>
        <planeGeometry args={[ROOM.depth, ROOM.height]} />
        <meshStandardMaterial color="#0a0a12" roughness={0.9} />
      </mesh>

      {/* Right wall */}
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[ROOM.rightX, ROOM.height / 2, 0]} receiveShadow>
        <planeGeometry args={[ROOM.depth, ROOM.height]} />
        <meshStandardMaterial color="#0a0a12" roughness={0.9} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ROOM.height, 0]}>
        <planeGeometry args={[ROOM.width, ROOM.depth]} />
        <meshStandardMaterial color="#080810" roughness={0.95} />
      </mesh>
    </group>
  );
}

// ── Chair (GLB model) ─────────────────────────────────────────────────

function Chair({ onMeasured }: { onMeasured?: (height: number) => void }) {
  const { scene } = useGLTF(CHAIR_MODEL_PATH);
  const cloned = useMemo(() => scene.clone(true), [scene]);

  // Fix materials (KHR_materials_pbrSpecularGlossiness not supported → falls back to white metallic)
  useEffect(() => {
    cloned.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const mat = child.material as THREE.MeshStandardMaterial;
        if (mat.isMeshStandardMaterial) {
          if (mat.color.r > 0.9 && mat.color.g > 0.9 && mat.color.b > 0.9) {
            mat.color.set('#2a2a2a');
          }
          mat.metalness = Math.min(mat.metalness, 0.15);
          mat.roughness = Math.max(mat.roughness, 0.6);
          mat.needsUpdate = true;
        }
      }
    });
  }, [cloned]);

  // Compute floor offset & total height from unscaled model bounding box
  const { posY, worldHeight } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(cloned);
    // Model-space bottom * scale = how far below origin the feet are
    const modelBottomY = box.min.y * CHAIR_SCALE;
    const h = (box.max.y - box.min.y) * CHAIR_SCALE;
    return { posY: CHAIR_POS[1] - modelBottomY, worldHeight: h };
  }, [cloned]);

  // Report height once computed
  useEffect(() => {
    if (onMeasured) onMeasured(worldHeight);
  }, [worldHeight, onMeasured]);

  return (
    <group position={[CHAIR_POS[0], posY, CHAIR_POS[2]]} scale={CHAIR_SCALE} rotation={[0, -Math.PI / 2, 0]}>
      <primitive object={cloned} />
    </group>
  );
}

// ── Sofa (GLB model) ──────────────────────────────────────────────────

function SofaModel({ position, rotation = [0, 0, 0], scale = SOFA_SCALE }: {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}) {
  const { scene } = useGLTF(SOFA_MODEL_PATH);
  const cloned = useMemo(() => scene.clone(true), [scene]);

  // Fix materials (KHR_materials_pbrSpecularGlossiness not supported → falls back to white metallic)
  useEffect(() => {
    cloned.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const mat = child.material as THREE.MeshStandardMaterial;
        if (mat.isMeshStandardMaterial) {
          if (mat.color.r > 0.9 && mat.color.g > 0.9 && mat.color.b > 0.9) {
            mat.color.set('#3a3540');
          }
          mat.metalness = Math.min(mat.metalness, 0.05);
          mat.roughness = Math.max(mat.roughness, 0.85);
          mat.needsUpdate = true;
        }
      }
    });
  }, [cloned]);

  // Compute floor offset from unscaled model bounding box
  const posY = useMemo(() => {
    const box = new THREE.Box3().setFromObject(cloned);
    const modelBottomY = box.min.y * scale;
    return position[1] - modelBottomY;
  }, [cloned, position, scale]);

  return (
    <group position={[position[0], posY, position[2]]} rotation={rotation} scale={scale}>
      <primitive object={cloned} />
    </group>
  );
}

// ── Plant with shatter support ────────────────────────────────────────

interface PlantProps {
  modelPath: string;
  position: [number, number, number];
  scale?: number;
  rotation?: [number, number, number];
  broken: boolean;
}

interface Fragment {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  rot: THREE.Euler;
  rotVel: THREE.Vector3;
  scale: number;
  color: string;
}

function Plant({ modelPath, position, scale = 1, rotation = [0, 0, 0], broken }: PlantProps) {
  const { scene } = useGLTF(modelPath);
  const cloned = useMemo(() => scene.clone(true), [scene]);
  const fragmentsRef = useRef<Fragment[]>([]);
  const meshRefs = useRef<THREE.Mesh[]>([]);
  const [fragments, setFragments] = useState<Fragment[]>([]);

  useEffect(() => {
    if (!broken) return;
    const frags: Fragment[] = [];
    const count = 10;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const speed = 1.5 + Math.random() * 2;
      frags.push({
        pos: new THREE.Vector3(
          position[0] + (Math.random() - 0.5) * 0.15,
          position[1] + 0.1 + Math.random() * 0.2,
          position[2] + (Math.random() - 0.5) * 0.15
        ),
        vel: new THREE.Vector3(
          Math.cos(angle) * speed * 0.5,
          2 + Math.random() * 2,
          Math.sin(angle) * speed * 0.5
        ),
        rot: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, 0),
        rotVel: new THREE.Vector3(
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 8
        ),
        scale: 0.02 + Math.random() * 0.04,
        color: i < 4 ? '#8B4513' : (i < 7 ? '#654321' : '#2d5a27'),
      });
    }
    fragmentsRef.current = frags;
    setFragments(frags);
  }, [broken, position]);

  useFrame((_, delta) => {
    if (!broken || fragmentsRef.current.length === 0) return;
    const dt = Math.min(delta, 0.05);
    fragmentsRef.current.forEach((f) => {
      f.vel.y -= 9.8 * dt;
      f.pos.addScaledVector(f.vel, dt);
      f.rot.x += f.rotVel.x * dt;
      f.rot.y += f.rotVel.y * dt;
      if (f.pos.y < 0) {
        f.pos.y = 0;
        f.vel.y *= -0.3;
        f.vel.x *= 0.7;
        f.vel.z *= 0.7;
      }
    });
    meshRefs.current.forEach((mesh, i) => {
      if (mesh && fragmentsRef.current[i]) {
        mesh.position.copy(fragmentsRef.current[i].pos);
        mesh.rotation.copy(fragmentsRef.current[i].rot);
      }
    });
  });

  if (broken) {
    return (
      <group>
        {fragments.map((f, i) => (
          <mesh
            key={i}
            ref={(el) => { if (el) meshRefs.current[i] = el; }}
            position={f.pos}
            rotation={f.rot}
            castShadow
          >
            <boxGeometry args={[f.scale, f.scale, f.scale]} />
            <meshStandardMaterial color={f.color} roughness={0.8} />
          </mesh>
        ))}
      </group>
    );
  }

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <primitive object={cloned} />
    </group>
  );
}

// ── Whiteboard (loads GLB, clickable → Skills) ────────────────────────

function Whiteboard({
  hovered,
  onHover,
  onClick,
}: {
  hovered: boolean;
  onHover: (hovering: boolean) => void;
  onClick: () => void;
}) {
  const { scene } = useGLTF(WHITEBOARD_PATH);
  const cloned = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    cloned.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const mat = child.material as THREE.MeshStandardMaterial;
        if (mat.isMeshStandardMaterial) {
          if (hovered) {
            mat.emissive = new THREE.Color('#6366f1');
            mat.emissiveIntensity = 0.12;
          } else {
            mat.emissive = new THREE.Color(0, 0, 0);
            mat.emissiveIntensity = 0;
          }
        }
      }
    });
  }, [hovered, cloned]);

  return (
    <group position={WHITEBOARD_POS} rotation={[0, 0, 0]} scale={WHITEBOARD_SCALE}>
      <primitive
        object={cloned}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          onHover(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          onHover(false);
          document.body.style.cursor = 'default';
        }}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          onClick();
        }}
      />
      <Text
        position={[0, 1.2, 0.1]}
        fontSize={0.14}
        color={hovered ? '#6366f1' : '#ffffff'}
        anchorX="center"
      >
        Skills
      </Text>
    </group>
  );
}

// ── Skateboard (click to fling → plant shatter) ──────────────────────

interface SkateboardProps {
  plantPositions: [number, number, number][];
  onHitPlant: (plantIndex: number) => void;
}

function Skateboard({ plantPositions, onHitPlant }: SkateboardProps) {
  const { scene } = useGLTF(SKATEBOARD_PATH);
  const cloned = useMemo(() => scene.clone(true), [scene]);
  const groupRef = useRef<THREE.Group>(null);

  // Floor-snap: compute Y so model bottom sits on the floor
  const posY = useMemo(() => {
    cloned.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(cloned);
    return -(box.min.y * SKATEBOARD_SCALE);
  }, [cloned]);

  const [state, setState] = useState<'idle' | 'flying' | 'cooldown'>('idle');
  const velocityRef = useRef(new THREE.Vector3());
  const targetPlantRef = useRef(-1);
  const flyTimeRef = useRef(0);

  const fling = useCallback(() => {
    if (state !== 'idle' || plantPositions.length === 0) return;

    let nearest = 0;
    let nearestDist = Infinity;
    plantPositions.forEach((pp, i) => {
      const d = SKATEBOARD_POS.distanceTo(new THREE.Vector3(...pp));
      if (d < nearestDist) { nearestDist = d; nearest = i; }
    });

    const target = new THREE.Vector3(...plantPositions[nearest]);
    const dir = target.clone().sub(SKATEBOARD_POS).normalize();
    velocityRef.current.copy(dir).multiplyScalar(5);
    velocityRef.current.y = 1.5;
    targetPlantRef.current = nearest;
    flyTimeRef.current = 0;
    setState('flying');
  }, [state, plantPositions]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const dt = Math.min(delta, 0.05);

    if (state === 'flying') {
      flyTimeRef.current += dt;
      velocityRef.current.y -= 6 * dt;
      groupRef.current.position.addScaledVector(velocityRef.current, dt);
      groupRef.current.rotation.x += dt * 8;
      groupRef.current.rotation.z += dt * 3;

      if (targetPlantRef.current >= 0) {
        const pp = plantPositions[targetPlantRef.current];
        const dist = groupRef.current.position.distanceTo(new THREE.Vector3(...pp));
        if (dist < 0.4) {
          onHitPlant(targetPlantRef.current);
          setState('cooldown');
          setTimeout(() => {
            if (groupRef.current) {
              groupRef.current.position.set(SKATEBOARD_POS.x, posY, SKATEBOARD_POS.z);
              groupRef.current.rotation.set(0, 0.3, 0);
            }
            setState('idle');
          }, 3000);
          return;
        }
      }

      if (flyTimeRef.current > 3) {
        setState('cooldown');
        setTimeout(() => {
          if (groupRef.current) {
            groupRef.current.position.set(SKATEBOARD_POS.x, posY, SKATEBOARD_POS.z);
            groupRef.current.rotation.set(0, 0.3, 0);
          }
          setState('idle');
        }, 2000);
      }
    }

    if (state === 'idle') {
      groupRef.current.position.y = posY + Math.sin(Date.now() * 0.002) * 0.01;
    }
  });

  return (
    <group
      ref={groupRef}
      position={[SKATEBOARD_POS.x, posY, SKATEBOARD_POS.z]}
      rotation={[0, 0.3, 0]}
      scale={SKATEBOARD_SCALE}
    >
      <primitive
        object={cloned}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          fling();
        }}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          if (state === 'idle') document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default';
        }}
      />
      {state === 'idle' && (
        <Text
          position={[0, 1.5, 0]}
          fontSize={0.5}
          color="#6366f1"
          anchorX="center"
        >
          🛹 Click!
        </Text>
      )}
    </group>
  );
}

// ── Ambient Particles ─────────────────────────────────────────────────

function AmbientParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const geometry = useMemo(() => {
    const count = 200;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = Math.random() * ROOM.height;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < positions.length / 3; i++) {
      positions[i * 3 + 1] += Math.sin(clock.getElapsedTime() * 0.3 + i) * 0.0005;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial color="#6366f1" size={0.01} transparent opacity={0.4} />
    </points>
  );
}

// ── Camera Controller ─────────────────────────────────────────────────

function CameraController({ introComplete, setIntroComplete }: {
  introComplete: boolean;
  setIntroComplete: (v: boolean) => void;
}) {
  const { camera } = useThree();
  const startPos = useMemo(() => new THREE.Vector3(...CAM_START), []);
  const endPos = useMemo(() => new THREE.Vector3(...CAM_END), []);
  const target = useMemo(() => new THREE.Vector3(...CAM_TARGET), []);

  useEffect(() => {
    camera.position.copy(startPos);
  }, [camera, startPos]);

  useFrame(({ clock }) => {
    if (introComplete) return;
    const t = Math.min(clock.getElapsedTime() / 3, 1);
    const ease = 1 - Math.pow(1 - t, 3);
    camera.position.lerpVectors(startPos, endPos, ease);
    camera.lookAt(target);
    if (t >= 1) setIntroComplete(true);
  });

  return null;
}

// ── Workspace Scene ───────────────────────────────────────────────────

function WorkspaceScene({ onNavigate }: { onNavigate: (route: string) => void }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [introComplete, setIntroComplete] = useState(false);
  const [whiteboardHovered, setWhiteboardHovered] = useState(false);
  const [brokenPlants, setBrokenPlants] = useState<Set<number>>(new Set());
  const [chairHeight, setChairHeight] = useState(1.0); // updated once chair measures itself

  const handleClick = useCallback((category: string) => {
    const obj = CLICKABLE_OBJECTS[category];
    if (obj) onNavigate(obj.route);
  }, [onNavigate]);

  const handlePlantHit = useCallback((plantIndex: number) => {
    setBrokenPlants((prev) => new Set(prev).add(plantIndex));
  }, []);

  const intactPlantPositions = useMemo(() =>
    PLANT_POSITIONS.filter((_, i) => !brokenPlants.has(i)),
    [brokenPlants]
  );

  return (
    <>
      <CameraController introComplete={introComplete} setIntroComplete={setIntroComplete} />
      {introComplete && (
        <OrbitControls
          enablePan={false}
          maxPolarAngle={Math.PI * 0.65}
          minPolarAngle={Math.PI * 0.15}
          minDistance={2}
          maxDistance={8}
          target={CAM_TARGET}
          enableDamping
          dampingFactor={0.05}
        />
      )}

      {/* Lighting — toned down so room stays dark */}
      <ambientLight intensity={0.15} color="#1a2244" />
      <directionalLight
        position={[3, 5, 3]}
        intensity={0.6}
        color="#ccd0e0"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[-3, 3, -2]} intensity={0.4} color="#6366f1" distance={8} />
      <pointLight position={[3, 2, 2]} intensity={0.3} color="#0044ff" distance={7} />
      <pointLight position={[0, 3, -2]} intensity={0.2} color="#00aaff" distance={6} />

      <Environment preset="night" environmentIntensity={0.15} background={false} />

      {/* Room */}
      <Room />

      {/* Chair behind desk (real GLB) — measured first so desk knows its height */}
      <Chair onMeasured={setChairHeight} />

      {/* Desk setup — the full gaming desk GLB, Y = 0.7 × chair height */}
      <DeskSetup hovered={hovered} onHover={setHovered} onClick={handleClick} chairHeight={chairHeight} />

      {/* Sofas along left & right walls (real GLBs) */}
      <SofaModel position={SOFA_LEFT_POS} rotation={[0, Math.PI / 2, 0]} />
      <SofaModel position={SOFA_RIGHT_POS} rotation={[0, -Math.PI / 2, 0]} />

      {/* Whiteboard on back wall → Skills */}
      <Whiteboard
        hovered={whiteboardHovered}
        onHover={setWhiteboardHovered}
        onClick={() => onNavigate('/skills')}
      />

      {/* Plants */}
      <Plant
        modelPath={PLANT_INDOOR_PATH}
        position={PLANT_POSITIONS[0]}
        scale={1.0}
        broken={brokenPlants.has(0)}
      />
      <Plant
        modelPath={PLANT_PALM_PATH}
        position={PLANT_POSITIONS[1]}
        scale={0.9}
        rotation={[0, 1.2, 0]}
        broken={brokenPlants.has(1)}
      />
      <Plant
        modelPath={PLANT_INDOOR_PATH}
        position={PLANT_POSITIONS[2]}
        scale={0.8}
        rotation={[0, -0.8, 0]}
        broken={brokenPlants.has(2)}
      />

      {/* Skateboard — click to fling at a plant */}
      <Skateboard
        plantPositions={intactPlantPositions}
        onHitPlant={(idx) => {
          let count = 0;
          for (let i = 0; i < PLANT_POSITIONS.length; i++) {
            if (!brokenPlants.has(i)) {
              if (count === idx) { handlePlantHit(i); return; }
              count++;
            }
          }
        }}
      />

      {/* Effects */}
      <AmbientParticles />
      <Sparkles count={40} scale={8} size={1.5} speed={0.2} color="#6366f1" opacity={0.3} />

      <EffectComposer>
        <Bloom luminanceThreshold={0.7} luminanceSmoothing={0.9} intensity={0.5} />
        <ChromaticAberration offset={[0.0005, 0.0005]} />
      </EffectComposer>
    </>
  );
}

// ── Loading Overlay ───────────────────────────────────────────────────

function LoadingOverlay() {
  const { progress } = useProgress();
  return progress < 100 ? (
    <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50">
      <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#6366f1] transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-white/60 text-sm mt-4 font-mono">{Math.round(progress)}%</p>
    </div>
  ) : null;
}

// ── Main Export ───────────────────────────────────────────────────────

useGLTF.preload(DESK_MODEL_PATH);
useGLTF.preload(CHAIR_MODEL_PATH);
useGLTF.preload(SOFA_MODEL_PATH);
useGLTF.preload(PLANT_INDOOR_PATH);
useGLTF.preload(PLANT_PALM_PATH);
useGLTF.preload(SKATEBOARD_PATH);
useGLTF.preload(WHITEBOARD_PATH);

export default function WorkspaceCanvas() {
  const navigate = useNavigate();
  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full h-full">
      <Canvas
        camera={{ position: CAM_START, fov: 55 }}
        shadows
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={<group />}>
          <WorkspaceScene
            onNavigate={(route) => {
              document.body.style.cursor = 'default';
              navigate(route);
            }}
          />
        </Suspense>
      </Canvas>

      <LoadingOverlay />

      <AnimatePresence>
        {showHint && (
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 glass px-4 py-2 rounded-full text-white/60 text-sm font-mono pointer-events-none"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            🖱 Drag to orbit · Scroll to zoom · Click objects to explore
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-4 left-4 flex flex-col gap-1 pointer-events-none">
        {Object.values(CLICKABLE_OBJECTS).map((obj) => (
          <div key={obj.name} className="font-mono text-xs text-white/30 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6366f1]/50" />
            {obj.label}
          </div>
        ))}
      </div>
    </div>
  );
}


