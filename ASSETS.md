# Asset Sourcing Guide

This document lists all assets needed for the portfolio and where to find free, high-quality versions.

## ✅ Verified Free Sources

### PBR Textures — ambientCG.com (CC0)
All textures below are free CC0 from https://ambientcg.com

| Asset | Search Query on ambientCG |
|-------|--------------------------|
| `wood_*.jpg` | Search "Wood" — e.g. "Wood049" |
| `metal_*.jpg` | Search "Metal" — e.g. "Metal032" |
| `fabric_*.jpg` | Search "Fabric" — e.g. "Fabric021" |
| `ceramic_*.jpg` | Search "Ceramic" or "Plastic" |
| `floor_*.jpg` | Search "Concrete" — e.g. "Concrete018" |
| `wall_*.jpg` | Search "Painted Plaster" or "Concrete" |
| `pcb_*.jpg` | Search "Circuit" (limited) |

**Download format:** JPEG 2K or 4K for each map (diffuse, normal, roughness, metalness, AO, height)

### HDRI Environment Maps — Poly Haven (CC0)
https://polyhaven.com/hdris

| File | Search |
|------|--------|
| `studio.hdr` | "Studio Small" or "Photo Studio" |
| `workshop.hdr` | "Workshop" |
| `night.hdr` | "Urban" or "Night" |

**Note:** Download at 2K or 4K resolution, .hdr or .exr format

### 3D Models — Poly Haven (CC0)
https://polyhaven.com/models

| Model | Search |
|-------|--------|
| `coffee_cup.glb` | "Coffee Cup" |
| `desk.glb` | "Desk" or "Table" |

### 3D Models — Sketchfab (many free)
https://sketchfab.com/search?features=downloadable&sort_by=-likeCount

Search terms: "computer desk", "mechanical keyboard", "gaming mouse", "PC tower", "PCB board", "monitor", "speakers", "whiteboard", "soldering iron"

**Filter:** Free + Downloadable → Export as GLB

### KiCad PCB Models
Export PCB from KiCad as GLTF/STEP and convert with:
```bash
# Convert STEP to GLB using assimp
assimp export board.step board.glb
```

---

## 📁 File Placement

Place assets in these directories:

```
public/
├── models/
│   ├── desk.glb
│   ├── monitor_stand.glb
│   ├── keyboard.glb
│   ├── mouse.glb
│   ├── pc_case.glb
│   ├── speakers.glb
│   ├── coffee_cup.glb
│   ├── pcb_board.glb
│   └── door_handle.glb
├── textures/
│   ├── wood/
│   │   ├── wood_diffuse.jpg
│   │   ├── wood_normal.jpg
│   │   ├── wood_roughness.jpg
│   │   └── wood_ao.jpg
│   ├── metal/
│   │   ├── metal_diffuse.jpg
│   │   ├── metal_normal.jpg
│   │   ├── metal_roughness.jpg
│   │   └── metal_metalness.jpg
│   ├── fabric/
│   │   ├── fabric_diffuse.jpg
│   │   ├── fabric_normal.jpg
│   │   └── fabric_roughness.jpg
│   ├── pcb/
│   │   ├── pcb_diffuse.jpg
│   │   ├── pcb_normal.jpg
│   │   └── trace_emissive.jpg
│   └── shared/
│       ├── dust_overlay.png
│       └── film_grain.png
└── hdri/
    └── studio.hdr
```

---

## 🔧 Loading Textures in Code

```tsx
import { useTexture } from '@react-three/drei';

function DeskWithTextures() {
  const textures = useTexture({
    map:           `${import.meta.env.BASE_URL}textures/wood/wood_diffuse.jpg`,
    normalMap:     `${import.meta.env.BASE_URL}textures/wood/wood_normal.jpg`,
    roughnessMap:  `${import.meta.env.BASE_URL}textures/wood/wood_roughness.jpg`,
    aoMap:         `${import.meta.env.BASE_URL}textures/wood/wood_ao.jpg`,
  });

  return (
    <mesh>
      <boxGeometry args={[3.2, 0.08, 1.4]} />
      <meshStandardMaterial {...textures} />
    </mesh>
  );
}
```

## 🔧 Loading Models in Code

```tsx
import { useGLTF } from '@react-three/drei';

function DeskModel() {
  const { scene } = useGLTF(`${import.meta.env.BASE_URL}models/desk.glb`);
  return <primitive object={scene} />;
}
// Preload for instant display:
useGLTF.preload(`${import.meta.env.BASE_URL}models/desk.glb`);
```

## 🔧 Environment HDR

```tsx
import { Environment } from '@react-three/drei';

// In your Canvas:
<Environment files={`${import.meta.env.BASE_URL}hdri/studio.hdr`} background={false} />
```

## ⚡ Optimization Tips

1. **Compress textures** → Use WebP instead of JPG for ~30% smaller
2. **Resize textures** → 1K for small objects, 2K for main surfaces, 4K for floor/walls
3. **Draco compress models**:
   ```bash
   npx gltf-transform draco input.glb output.glb
   ```
4. **Bake lighting** in Blender before exporting → massive performance win
5. **Use KTX2 textures** for GPU-compressed formats:
   ```bash
   npx gltf-transform etc1s input.glb output.glb
   ```
