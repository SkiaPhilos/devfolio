import path from 'node:path';
import { promises as fs } from 'node:fs';

const DEFAULT_PROJECTS = [
  {
    id: 'p1',
    title: 'Lahautedarbie',
    category: 'Web App',
    description: 'Shipped brand and commerce website focused on premium presentation, structured catalog browsing, and direct customer conversion paths.',
    tech: ['React', 'TypeScript', 'Responsive UI', 'CMS Integration', 'SEO'],
    color: '#4488ff',
    icon: '🛍️'
  },
  {
    id: 'p2',
    title: 'IoT Motor Controller',
    category: 'PCB Design',
    description: 'STM32 control board with CAN communication, protection circuits, and firmware interfaces for deterministic motion control.',
    tech: ['KiCad', 'STM32', 'FreeRTOS', 'CAN Bus', 'Altium'],
    color: '#ff8822',
    icon: '⚙️'
  },
  {
    id: 'p3',
    title: 'Berlin-Benz',
    category: 'Web App',
    description: 'Marketing website built for a strong visual brand presence with clean navigation, polished motion, and mobile-first presentation.',
    tech: ['React', 'TypeScript', 'Motion Design', 'Responsive Layout', 'Performance Tuning'],
    color: '#aa44ff',
    icon: '🎮'
  },
  {
    id: 'p4',
    title: 'Alsaeed Organics',
    category: 'Web App',
    description: 'Product and inquiry website designed to present agricultural offerings clearly while supporting trust-building business communication.',
    tech: ['React', 'Content Modeling', 'Responsive UI', 'Inquiry Flow', 'Deployment'],
    color: '#44cc88',
    icon: '🌤️'
  },
  {
    id: 'p5',
    title: 'ChemZone',
    category: 'Web App',
    description: 'Business website implementation focused on technical clarity, service presentation, and straightforward contact conversion.',
    tech: ['React', 'TypeScript', 'UI Architecture', 'Content Strategy', 'SEO'],
    color: '#ffcc22',
    icon: '📊'
  },
  {
    id: 'p6',
    title: '3D Portfolio Builder',
    category: 'Web App',
    description: 'Application workflow for building immersive portfolio presentations with interactive scenes and reusable visual sections.',
    tech: ['React', 'Three.js', 'R3F', 'TypeScript', 'Supabase'],
    color: '#ff4466',
    icon: '🔋'
  },
  {
    id: 'p7',
    title: 'Operations Dashboard',
    category: 'Web App',
    description: 'Application interface for operational visibility, role-based workflows, and fast access to business-critical information.',
    tech: ['Next.js', 'TypeScript', 'Charts', 'WebSockets', 'PostgreSQL'],
    color: '#00ccff',
    icon: '🌐'
  },
  {
    id: 'p8',
    title: 'Interactive Monitoring App',
    category: 'Web App',
    description: 'Application build combining live system visibility, structured UI states, and practical controls for ongoing technical workflows.',
    tech: ['React', 'TypeScript', 'State Management', 'API Integration', 'Realtime UI'],
    color: '#ff6600',
    icon: '🔄'
  }
];

function sanitize(value) {
  return String(value ?? '').trim();
}

function ensureProjectShape(project) {
  return {
    id: sanitize(project.id),
    title: sanitize(project.title),
    category: sanitize(project.category),
    description: sanitize(project.description),
    tech: Array.isArray(project.tech)
      ? project.tech.map((item) => sanitize(item)).filter(Boolean)
      : [],
    color: sanitize(project.color) || '#ffffff',
    icon: sanitize(project.icon) || '•',
  };
}

export class FileProjectStore {
  constructor({ dataDir, projectsFile }) {
    this.dataDir = dataDir;
    this.projectsFile = projectsFile;
    this.mode = 'file';
  }

  async init() {
    await fs.mkdir(this.dataDir, { recursive: true });
    try {
      await fs.access(this.projectsFile);
    } catch {
      await fs.writeFile(this.projectsFile, JSON.stringify(DEFAULT_PROJECTS, null, 2), 'utf8');
    }
  }

  async _read() {
    await this.init();
    const raw = await fs.readFile(this.projectsFile, 'utf8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.map(ensureProjectShape).filter((item) => item.id && item.title);
  }

  async _write(projects) {
    await fs.writeFile(this.projectsFile, JSON.stringify(projects, null, 2), 'utf8');
  }

  async list({ category }) {
    const projects = await this._read();
    if (!category) {
      return projects;
    }
    return projects.filter((item) => item.category.toLowerCase() === category.toLowerCase());
  }

  async upsert(projectInput) {
    const project = ensureProjectShape(projectInput);
    const projects = await this._read();
    const index = projects.findIndex((item) => item.id === project.id);
    if (index === -1) {
      projects.push(project);
    } else {
      projects[index] = {
        ...projects[index],
        ...project,
      };
    }
    await this._write(projects);
    return project;
  }

  async delete(id) {
    const targetId = sanitize(id);
    if (!targetId) return false;
    const projects = await this._read();
    const next = projects.filter((item) => item.id !== targetId);
    if (next.length === projects.length) {
      return false;
    }
    await this._write(next);
    return true;
  }
}

export async function createProjectStore({ rootDir }) {
  const dataDir = path.join(rootDir, 'data');
  const projectsFile = path.join(dataDir, 'projects.json');
  const fileStore = new FileProjectStore({ dataDir, projectsFile });
  await fileStore.init();
  return fileStore;
}
