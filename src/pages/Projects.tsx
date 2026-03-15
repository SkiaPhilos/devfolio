import { useEffect, useState, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Project } from '../components/3d/HolographicGallery';
import PolymorphicDeck from '../components/ui/PolymorphicDeck';
import { fetchProjects } from '../utils/projectApi';

const HolographicGallery = lazy(() => import('../components/3d/HolographicGallery'));
const PCBViewer = lazy(() => import('../components/3d/PCBViewer'));

const PROJECTS: Project[] = [
  {
    id: 'p1', title: 'Lahautedarbie', category: 'Web App',
    description: 'Shipped brand and commerce website focused on premium presentation, structured catalog browsing, and direct customer conversion paths.',
    tech: ['React', 'TypeScript', 'Responsive UI', 'CMS Integration', 'SEO'],
    color: '#4488ff', icon: '🛍️'
  },
  {
    id: 'p2', title: 'IoT Motor Controller', category: 'PCB Design',
    description: 'STM32 control board with CAN communication, protection circuits, and firmware interfaces for deterministic motion control.',
    tech: ['KiCad', 'STM32', 'FreeRTOS', 'CAN Bus', 'Altium'],
    color: '#ff8822', icon: '⚙️'
  },
  {
    id: 'p3', title: 'Berlin-Benz', category: 'Web App',
    description: 'Marketing website built for a strong visual brand presence with clean navigation, polished motion, and mobile-first presentation.',
    tech: ['React', 'TypeScript', 'Motion Design', 'Responsive Layout', 'Performance Tuning'],
    color: '#aa44ff', icon: '🎮'
  },
  {
    id: 'p4', title: 'Alsaeed Organics', category: 'Web App',
    description: 'Product and inquiry website designed to present agricultural offerings clearly while supporting trust-building business communication.',
    tech: ['React', 'Content Modeling', 'Responsive UI', 'Inquiry Flow', 'Deployment'],
    color: '#44cc88', icon: '🌤️'
  },
  {
    id: 'p5', title: 'ChemZone', category: 'Web App',
    description: 'Business website implementation focused on technical clarity, service presentation, and straightforward contact conversion.',
    tech: ['React', 'TypeScript', 'UI Architecture', 'Content Strategy', 'SEO'],
    color: '#ffcc22', icon: '📊'
  },
  {
    id: 'p6', title: '3D Portfolio Builder', category: 'Web App',
    description: 'Application workflow for building immersive portfolio presentations with interactive scenes and reusable visual sections.',
    tech: ['React', 'Three.js', 'R3F', 'TypeScript', 'Supabase'],
    color: '#ff4466', icon: '🔋'
  },
  {
    id: 'p7', title: 'Operations Dashboard', category: 'Web App',
    description: 'Application interface for operational visibility, role-based workflows, and fast access to business-critical information.',
    tech: ['Next.js', 'TypeScript', 'Charts', 'WebSockets', 'PostgreSQL'],
    color: '#00ccff', icon: '🌐'
  },
  {
    id: 'p8', title: 'Interactive Monitoring App', category: 'Web App',
    description: 'Application build combining live system visibility, structured UI states, and practical controls for ongoing technical workflows.',
    tech: ['React', 'TypeScript', 'State Management', 'API Integration', 'Realtime UI'],
    color: '#ff6600', icon: '🔄'
  },
];

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      {children}
    </motion.div>
  );
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      className="rounded-xl overflow-hidden cursor-pointer group border transition-all duration-300"
      style={{
        borderColor: 'rgba(255,255,255,0.06)',
        background: 'rgba(255,255,255,0.02)',
      }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -3, borderColor: project.color + '35', background: project.color + '06' }}
      onClick={() => setExpanded(!expanded)}
      layout
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-lg"
            style={{ background: project.color + '15' }}
          >
            {project.icon}
          </div>
          <span
            className="text-[10px] font-mono px-2 py-0.5 rounded-full"
            style={{ background: project.color + '15', color: project.color + 'cc' }}
          >
            {project.category}
          </span>
        </div>

        <h3 className="text-white font-semibold text-sm mb-1.5 tracking-tight">{project.title}</h3>
        <p className="text-white/40 text-[13px] leading-relaxed">{project.description}</p>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-white/[0.06]"
            >
              <div className="flex flex-wrap gap-1.5">
                {project.tech.map(tech => (
                  <span
                    key={tech}
                    className="px-2 py-0.5 rounded text-[10px] font-mono"
                    style={{ background: project.color + '12', color: project.color + 'cc', border: `1px solid ${project.color}20` }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  className="px-3.5 py-1.5 text-[11px] font-mono font-medium rounded-md transition-colors"
                  style={{ background: project.color + '18', color: project.color, border: `1px solid ${project.color}30` }}
                >
                  VIEW PROJECT ↗
                </button>
                <button className="px-3.5 py-1.5 text-[11px] font-mono text-white/40 hover:text-white transition-colors">
                  GitHub ↗
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function Projects() {
  const [filter, setFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'holographic' | 'grid'>('holographic');
  const [projects, setProjects] = useState<Project[]>(PROJECTS);

  useEffect(() => {
    let active = true;

    async function loadProjects() {
      try {
        const remoteProjects = await fetchProjects();
        if (active && remoteProjects.length > 0) {
          setProjects(remoteProjects);
        }
      } catch {
        // Keep local fallback data when the backend is unavailable.
      }
    }

    loadProjects();
    return () => {
      active = false;
    };
  }, []);

  const categories = ['All', ...Array.from(new Set(projects.map((project) => project.category)))];

  const filtered = filter === 'All' ? projects : projects.filter((p) => p.category === filter);
  const deckItems = filtered.map((project) => ({ ...project, id: `deck-${project.id}` }));

  return (
    <PageWrapper>
      <div className="min-h-screen pt-20">
        {/* Header */}
        <div className="max-w-6xl mx-auto px-6 pt-24 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="font-mono text-[#6366f1]/80 text-xs uppercase tracking-[0.2em]">Portfolio</span>
            <h1 className="text-4xl md:text-6xl font-bold text-white mt-3 mb-6 tracking-tight">
              Selected <span className="text-[#6366f1]">Work</span>
            </h1>
            <p className="text-white/40 max-w-2xl leading-relaxed text-lg">
              The portfolio includes four shipped websites and four application builds.
              Each project is presented as a delivery case focused on architecture, implementation quality, and business use.
            </p>
          </motion.div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-4 mt-10">
            <div className="flex gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-3 py-1.5 text-[11px] font-mono rounded-md transition-all ${
                    filter === cat
                      ? 'bg-[#6366f1] text-white'
                      : 'text-white/45 hover:text-white border border-white/[0.06] hover:border-white/15'
                  }`}
                  style={filter !== cat ? { background: 'rgba(255,255,255,0.02)' } : undefined}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="ml-auto flex gap-1.5">
              {(['holographic', 'grid'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1.5 text-[11px] font-mono rounded-md transition-all capitalize ${
                    viewMode === mode
                      ? 'bg-[#6366f1]/15 text-[#6366f1] border border-[#6366f1]/30'
                      : 'text-white/35 hover:text-white/60 border border-white/[0.06]'
                  }`}
                  style={viewMode !== mode ? { background: 'rgba(255,255,255,0.02)' } : undefined}
                >
                  {mode === 'holographic' ? '◈ 3D Gallery' : '⊞ Grid'}
                </button>
              ))}
            </div>
          </div>

          <PolymorphicDeck
            items={deckItems}
            className="mt-8"
            variant="neon"
            renderCard={(project) => (
              <div className="p-7 md:p-8 min-h-[280px]">
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{ background: project.color + '20' }}>
                      {project.icon}
                    </div>
                    <div>
                      <h3 className="text-white text-2xl font-bold tracking-tight">{project.title}</h3>
                      <p className="text-sm" style={{ color: project.color }}>{project.category}</p>
                    </div>
                  </div>
                </div>

                <p className="text-white/65 text-sm leading-relaxed mb-5 max-w-2xl">{project.description}</p>

                <div className="flex flex-wrap gap-2">
                  {project.tech.slice(0, 5).map((tech) => (
                    <span
                      key={tech}
                      className="px-2.5 py-1 rounded text-[11px] font-mono border"
                      style={{ borderColor: project.color + '35', color: project.color + 'd8', background: project.color + '12' }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}
          />
        </div>

        {/* Holographic gallery */}
        <AnimatePresence mode="wait">
          {viewMode === 'holographic' ? (
            <motion.div
              key="holo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-16"
            >
              <div className="glass rounded-[24px] overflow-hidden p-1 shadow-2xl">
                <Suspense fallback={
                  <div className="flex items-center justify-center h-[500px]">
                    <div className="text-white/40 font-mono text-sm">Loading 3D gallery...</div>
                  </div>
                }>
                  <div className="relative w-full h-[500px] rounded-[20px] overflow-hidden bg-[#030408]">
                    <HolographicGallery projects={filtered} />
                  </div>
                </Suspense>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-6xl mx-auto px-6 pb-16"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((project, i) => (
                  <ProjectCard key={project.id} project={project} index={i} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Interactive PCB Viewer */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 py-20 border-t border-white/[0.04]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {/* Section header */}
            <div className="mb-8">
              <span className="font-mono text-[#ff8822]/80 text-xs uppercase tracking-[0.2em]">Hardware</span>
              <p className="text-white/40 text-sm leading-relaxed mt-3 max-w-xl">
                Orbit, zoom, and pan the actual board geometry. Full 3D inspection of the IoT Motor Controller — rotate to examine routing, placement, and layer stack.
              </p>
            </div>

            {/* Framed viewer */}
            <div className="relative overflow-hidden rounded-[28px] border border-[#ff8822]/22">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_45%_at_20%_18%,rgba(255,136,34,0.12),transparent_70%),radial-gradient(45%_38%_at_84%_22%,rgba(99,102,241,0.08),transparent_72%),radial-gradient(60%_55%_at_50%_100%,rgba(51,255,170,0.05),transparent_78%)]" />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ff8822]/40 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#ff8822]/20 to-transparent" />

              <div style={{ height: '68vh', minHeight: 480 }}>
                <Suspense fallback={
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                      <div className="font-mono text-[#ff8822]/60 text-xs uppercase tracking-widest mb-2">Loading</div>
                      <div className="text-white/30 text-sm">Initialising PCB model...</div>
                    </div>
                  </div>
                }>
                  <PCBViewer />
                </Suspense>
              </div>

              {/* Controls hint */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none rounded-full border border-white/[0.07] bg-black/25 px-4 py-1.5 backdrop-blur-sm whitespace-nowrap">
                <span className="text-white/35 text-[11px] font-mono">Left drag — Orbit &nbsp;·&nbsp; Scroll — Zoom &nbsp;·&nbsp; Right drag — Pan</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
}

