import path from 'node:path';
import { promises as fs } from 'node:fs';

const DEFAULT_SKILLS = [
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
  { id: 'git', label: 'Git', category: 'tools', level: 0.95, position: [2.5, -3, 0], connections: ['node', 'react'], description: 'Version control workflows, collaboration hygiene, review-friendly history, and release tracking.' }
];

const DEFAULT_CATEGORY_COLORS = {
  frontend: '#4488ff',
  backend: '#44cc88',
  hardware: '#ff8822',
  graphics: '#aa44ff',
  tools: '#ffcc22',
};

function sanitize(value) {
  return String(value ?? '').trim();
}

function normalizePosition(position) {
  if (!Array.isArray(position) || position.length !== 3) {
    return [0, 0, 0];
  }
  const parsed = position.map((n) => Number(n));
  if (parsed.some((n) => !Number.isFinite(n))) {
    return [0, 0, 0];
  }
  return [parsed[0], parsed[1], parsed[2]];
}

function normalizeSkill(item) {
  return {
    id: sanitize(item.id),
    label: sanitize(item.label),
    category: sanitize(item.category) || 'tools',
    level: Math.min(Math.max(Number(item.level) || 0, 0), 1),
    position: normalizePosition(item.position),
    connections: Array.isArray(item.connections) ? item.connections.map((id) => sanitize(id)).filter(Boolean) : [],
    description: sanitize(item.description),
  };
}

export class FileSkillStore {
  constructor({ dataDir, skillsFile }) {
    this.dataDir = dataDir;
    this.skillsFile = skillsFile;
    this.mode = 'file';
  }

  async init() {
    await fs.mkdir(this.dataDir, { recursive: true });
    try {
      await fs.access(this.skillsFile);
    } catch {
      await fs.writeFile(
        this.skillsFile,
        JSON.stringify({ skills: DEFAULT_SKILLS, categoryColors: DEFAULT_CATEGORY_COLORS }, null, 2),
        'utf8'
      );
    }
  }

  async _readRaw() {
    await this.init();
    const raw = await fs.readFile(this.skillsFile, 'utf8');
    return JSON.parse(raw);
  }

  async _writeRaw(payload) {
    await fs.writeFile(this.skillsFile, JSON.stringify(payload, null, 2), 'utf8');
  }

  async list() {
    const raw = await this._readRaw();
    const skills = Array.isArray(raw.skills) ? raw.skills.map(normalizeSkill).filter((item) => item.id && item.label) : [];
    const categoryColors = raw.categoryColors && typeof raw.categoryColors === 'object'
      ? raw.categoryColors
      : DEFAULT_CATEGORY_COLORS;

    return { skills, categoryColors };
  }

  async upsert(skillInput) {
    const skill = normalizeSkill(skillInput);
    const raw = await this._readRaw();
    const skills = Array.isArray(raw.skills) ? raw.skills.map(normalizeSkill) : [];
    const index = skills.findIndex((item) => item.id === skill.id);

    if (index === -1) {
      skills.push(skill);
    } else {
      skills[index] = { ...skills[index], ...skill };
    }

    const next = {
      skills,
      categoryColors: raw.categoryColors && typeof raw.categoryColors === 'object'
        ? raw.categoryColors
        : DEFAULT_CATEGORY_COLORS,
    };

    await this._writeRaw(next);
    return skill;
  }

  async delete(id) {
    const targetId = sanitize(id);
    if (!targetId) return false;

    const raw = await this._readRaw();
    const skills = Array.isArray(raw.skills) ? raw.skills.map(normalizeSkill) : [];
    const nextSkills = skills.filter((item) => item.id !== targetId);

    if (nextSkills.length === skills.length) {
      return false;
    }

    const next = {
      skills: nextSkills,
      categoryColors: raw.categoryColors && typeof raw.categoryColors === 'object'
        ? raw.categoryColors
        : DEFAULT_CATEGORY_COLORS,
    };

    await this._writeRaw(next);
    return true;
  }
}

export async function createSkillStore({ rootDir }) {
  const dataDir = path.join(rootDir, 'data');
  const skillsFile = path.join(dataDir, 'skills.json');
  const store = new FileSkillStore({ dataDir, skillsFile });
  await store.init();
  return store;
}
