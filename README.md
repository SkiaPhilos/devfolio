# DevFolio — Developer Portfolio

A cinematic, interactive developer portfolio built with React, Three.js, React Three Fiber, Tailwind CSS, and Framer Motion.

## Features

### 🎮 3D Workspace
- Fully interactive 3D developer workspace with orbit camera controls
- Cinematic intro fly-through on first load
- Clickable objects (monitor, keyboard, PCB, mouse, PC tower, whiteboard, door) navigate to portfolio sections
- Monitor displays animated screen interfaces (code editor, terminal, UI design, PCB editor, browser, 3D viewport)
- RGB lighting strips, ambient particles, bloom post-processing

### 🔬 Advanced Features
1. **Holographic Project Gallery** — 3D floating panels in orbit, hover & click to inspect projects
2. **Skills Network Visualization** — 3D node graph of technical skills with animated connections
3. **Terminal Easter Egg** — Press `` ` `` to open a hidden developer terminal with portfolio commands
4. **Realistic Monitor UI** — Live-animated interfaces on the 3D monitor screen (cycles every 2s)

### 📄 Pages
- **Home** — 3D workspace hero + service overview
- **Projects** — Holographic 3D gallery + traditional grid view
- **Skills** — 3D network visualization + skill bars
- **Hire Me** — Service cards with pricing
- **Freelancing** — Platform links (GitHub, LinkedIn, Fiverr, Upwork)
- **Contact** — Multi-step animated contact form

## Stack
- React 18 + TypeScript
- Vite (build tool)
- Three.js + React Three Fiber + Drei
- @react-three/postprocessing (Bloom, ChromaticAberration)
- Framer Motion
- Tailwind CSS v4
- React Router (HashRouter for GitHub Pages)
- Zustand (state management, optional)

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
# → http://localhost:3000

# Production build
npm run build

# Preview production build locally
npm run preview
```

## GitHub Pages Deployment

### Automatic (recommended)
1. Push to `main` branch
2. GitHub Actions builds and deploys automatically
3. Enable Pages in: Repo → Settings → Pages → Source: GitHub Actions

### Manual
```bash
npm install -D gh-pages
npm run build
npx gh-pages -d dist
# Then: Settings → Pages → Branch: gh-pages
```

### Base path handling
The Vite base path is detected automatically for GitHub Pages using `GITHUB_REPOSITORY`.

- `username.github.io` repos deploy with `/`
- project repos deploy with `/<repo-name>/`

If needed, override manually with:
```bash
VITE_BASE_PATH=/custom-base/ npm run build
```

## Project Structure

```
src/
├── components/
│   ├── 3d/
│   │   ├── WorkspaceCanvas.tsx    ← Main 3D scene
│   │   ├── SkillsVisualization.tsx ← 3D skill network
│   │   └── HolographicGallery.tsx ← 3D project gallery
│   └── ui/
│       ├── Navbar.tsx
│       ├── Terminal.tsx           ← Hidden terminal (press `)
│       └── LoadingScreen.tsx
├── pages/
│   ├── Home.tsx
│   ├── Projects.tsx
│   ├── Skills.tsx
│   ├── HireMe.tsx
│   ├── Freelancing.tsx
│   └── Contact.tsx
├── App.tsx
├── main.tsx
└── index.css
public/
├── models/      ← Place .glb model files here
├── textures/    ← PBR texture files
└── hdri/        ← HDR environment maps
```

## Terminal Commands
Press `` ` `` to open the terminal. Available commands:
- `help` — list commands
- `about` — developer info
- `skills` — skill stack
- `projects` — navigate to projects
- `contact` — contact info
- `resume` — download resume
- `hire` — services & pricing
- `matrix` — 🐇
- `whoami` — who are you?
- `clear` — clear terminal

## Customization

### Replace placeholder data:
1. **Projects** — Edit `PROJECTS` array in `src/pages/Projects.tsx`
2. **Skills** — Edit `SKILLS` array in `src/components/3d/SkillsVisualization.tsx`
3. **Services** — Edit `SERVICES` array in `src/pages/HireMe.tsx`
4. **Contact info** — Update email/socials in `src/pages/Contact.tsx` and `src/pages/Freelancing.tsx`

### Add 3D models:
Place GLB files in `public/models/` and load them with:
```tsx
import { useGLTF } from '@react-three/drei';
const { scene } = useGLTF(`${import.meta.env.BASE_URL}models/desk.glb`);
```

## Asset Sources (for finding free PBR textures)
- [ambientCG.com](https://ambientcg.com) — Free CC0 PBR textures
- [Poly Haven](https://polyhaven.com) — HDRI maps & textures
- [Sketchfab](https://sketchfab.com) — Free 3D models
- [KitBash3D](https://kitbash3d.com) — Detailed tech models
