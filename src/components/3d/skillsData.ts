export interface SkillNode {
  id: string;
  label: string;
  category: string;
  level: number;
  position: [number, number, number];
  connections: string[];
  description: string;
}

export const SKILLS: SkillNode[] = [
  { id: 'react', label: 'React', category: 'frontend', level: 0.95, position: [0, 0, 0], connections: ['ts', 'r3f', 'nextjs', 'tailwind'], description: 'Primary UI framework for production interfaces, reusable components, and state-driven application flows.' },
  { id: 'ts', label: 'TypeScript', category: 'frontend', level: 0.9, position: [2, 0.5, -1], connections: ['react', 'node', 'nextjs'], description: 'Strong typing, generics, utility types, strict mode.' },
  { id: 'r3f', label: 'Three.js / R3F', category: 'frontend', level: 0.8, position: [-2, 1, -0.5], connections: ['react', 'glsl'], description: 'Interactive 3D interfaces, scene composition, shaders, and real-time presentation work on the web.' },
  { id: 'tailwind', label: 'Tailwind CSS', category: 'frontend', level: 0.9, position: [1.5, -1, 1], connections: ['react', 'nextjs'], description: 'Utility-first CSS, custom themes, responsive design.' },
  { id: 'nextjs', label: 'Next.js', category: 'frontend', level: 0.85, position: [2.5, -0.5, 0.5], connections: ['react', 'ts', 'node'], description: 'SSR, SSG, App Router, API routes, edge functions.' },
  { id: 'glsl', label: 'GLSL Shaders', category: 'graphics', level: 0.65, position: [-3, 0.5, 0], connections: ['r3f'], description: 'Custom vertex/fragment shaders, post-processing effects.' },
  { id: 'node', label: 'Node.js', category: 'backend', level: 0.88, position: [0.5, -2, -1.5], connections: ['ts', 'postgres', 'express'], description: 'Backend services, APIs, real-time endpoints, and application integration work.' },
  { id: 'express', label: 'Express', category: 'backend', level: 0.85, position: [1.8, -2.5, -1], connections: ['node', 'postgres'], description: 'Service routing, middleware layers, auth handling, and API composition.' },
  { id: 'postgres', label: 'PostgreSQL', category: 'backend', level: 0.82, position: [-0.5, -2.5, -0.5], connections: ['node', 'express'], description: 'Relational modeling, query design, indexing strategy, and schema evolution.' },
  { id: 'pcb', label: 'PCB Design', category: 'hardware', level: 0.88, position: [-1, 2, 1.5], connections: ['kicad', 'embedded'], description: 'Board-level design covering schematics, routing, manufacturability, and handoff files.' },
  { id: 'kicad', label: 'KiCad / Altium', category: 'hardware', level: 0.85, position: [-2.5, 2.5, 1], connections: ['pcb'], description: 'Schematic capture, layout iteration, design-rule validation, and production output prep.' },
  { id: 'embedded', label: 'Embedded C/C++', category: 'hardware', level: 0.82, position: [-0.5, 3, 0.5], connections: ['pcb', 'stm32', 'arduino'], description: 'Firmware development for peripherals, control logic, communication, and low-level system behavior.' },
  { id: 'stm32', label: 'STM32 / ESP32', category: 'hardware', level: 0.8, position: [0.8, 2.8, 1.5], connections: ['embedded'], description: 'Microcontroller platform work for connected devices, sensing, control, and field integration.' },
  { id: 'arduino', label: 'Arduino', category: 'hardware', level: 0.9, position: [-1.5, 1.5, 2.5], connections: ['embedded', 'stm32'], description: 'Fast prototyping, sensor validation, proof-of-concept builds, and interface testing.' },
  { id: 'python', label: 'Python', category: 'tools', level: 0.85, position: [2, 1.5, 2], connections: ['node', 'ml'], description: 'Automation scripts, data handling, backend utilities, and workflow tooling.' },
  { id: 'ml', label: 'ML / AI', category: 'tools', level: 0.6, position: [3, 2, 1.5], connections: ['python'], description: 'Practical integration work around model APIs, automation, and AI-assisted product features.' },
  { id: 'docker', label: 'Docker', category: 'tools', level: 0.78, position: [0, -3, 1], connections: ['node', 'postgres'], description: 'Containerized development, reproducible local environments, and deployment support workflows.' },
  { id: 'git', label: 'Git', category: 'tools', level: 0.95, position: [2.5, -3, 0], connections: ['node', 'react'], description: 'Version control workflows, collaboration hygiene, review-friendly history, and release tracking.' },
];

export const CATEGORY_COLORS: Record<string, string> = {
  frontend: '#4488ff',
  backend: '#44cc88',
  hardware: '#ff8822',
  graphics: '#aa44ff',
  tools: '#ffcc22',
};