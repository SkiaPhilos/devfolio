import { useEffect, useState, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SKILLS, CATEGORY_COLORS } from '../components/3d/skillsData';
import type { SkillNode } from '../components/3d/skillsData';
import PolymorphicDeck from '../components/ui/PolymorphicDeck';
import { fetchSkills } from '../utils/skillApi';

const SkillsVisualization = lazy(() => import('../components/3d/SkillsVisualization'));

const CATEGORY_META = {
  frontend: {
    strap: 'Interfaces that convert complexity into clarity',
    implementation: 'I use these tools to build fast, responsive product surfaces with clear state transitions, maintainable component systems, and polished interaction feedback.',
    examples: ['Design systems', 'Interactive product UIs', 'Responsive marketing sites'],
    outcomes: 'The result is a UI layer that feels precise, scales cleanly, and stays maintainable as the product grows.',
  },
  backend: {
    strap: 'Systems that keep product logic reliable',
    implementation: 'I use this stack to model data, expose APIs, manage real-time updates, and keep integration boundaries clear between services and clients.',
    examples: ['REST and realtime APIs', 'Auth and role logic', 'Structured data workflows'],
    outcomes: 'That gives projects predictable behavior, easier debugging, and safer long-term iteration.',
  },
  hardware: {
    strap: 'Electronics built for manufacturability and control',
    implementation: 'These tools support schematic capture, PCB layout, firmware integration, and prototype validation from concept through production handoff.',
    examples: ['Custom PCB layouts', 'Embedded control systems', 'Connected device prototypes'],
    outcomes: 'The payoff is tighter hardware-software alignment and fewer surprises between prototype and deployment.',
  },
  graphics: {
    strap: 'Visual depth where interaction needs presence',
    implementation: 'I apply graphics tooling when products need immersive presentation, scene-based storytelling, or a stronger interactive visual layer.',
    examples: ['3D showcases', 'Shader-driven motion', 'Interactive visual systems'],
    outcomes: 'This helps technical products feel more legible, memorable, and differentiated without sacrificing usability.',
  },
  tools: {
    strap: 'Workflow support around delivery and iteration',
    implementation: 'These tools keep automation, deployment support, version control, and AI-assisted workflows practical across the full delivery cycle.',
    examples: ['Deployment tooling', 'Automation scripts', 'Collaboration workflows'],
    outcomes: 'The benefit is faster iteration, cleaner collaboration, and a more repeatable delivery process.',
  },
} as const;

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {children}
    </motion.div>
  );
}

export default function Skills() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [skills, setSkills] = useState<SkillNode[]>(SKILLS);
  const [categoryColors, setCategoryColors] = useState<Record<string, string>>(CATEGORY_COLORS);

  useEffect(() => {
    let active = true;

    async function loadSkills() {
      try {
        const payload = await fetchSkills();
        if (active && payload.skills.length > 0) {
          setSkills(payload.skills);
          setCategoryColors(payload.categoryColors);
        }
      } catch {
        // Keep local fallback skills when backend is unavailable.
      }
    }

    loadSkills();
    return () => {
      active = false;
    };
  }, []);

  const selectedSkill = skills.find((s) => s.id === selectedId);

  const categories = [...new Set(skills.map((s) => s.category))];
  const categoryDeck = categories.map((category) => {
    const list = skills.filter((skill) => skill.category === category);
    const avg = Math.round((list.reduce((sum, skill) => sum + skill.level, 0) / Math.max(list.length, 1)) * 100);
    const meta = CATEGORY_META[category as keyof typeof CATEGORY_META];
    return {
      id: `category-${category}`,
      category,
      color: categoryColors[category] || '#ffffff',
      count: list.length,
      average: avg,
      highlights: list.slice(0, 4).map((skill) => skill.label),
      strap: meta.strap,
      implementation: meta.implementation,
      examples: meta.examples,
      outcomes: meta.outcomes,
    };
  });

  return (
    <PageWrapper>
      <div className="min-h-screen pt-20">
        <div className="max-w-6xl mx-auto px-6 pt-24 pb-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="font-mono text-[#6366f1]/80 text-xs uppercase tracking-[0.2em]">Technical Skills</span>
            <h1 className="text-4xl md:text-6xl font-bold text-white mt-3 mb-6 tracking-tight">
              Skill <span className="text-[#6366f1]">Network</span>
            </h1>
            <p className="text-white/40 max-w-2xl leading-relaxed text-lg">
              A practical map of the technologies I use in production delivery.
              Connections highlight how tools combine across frontend, backend, and embedded workflows.
            </p>
          </motion.div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-8">
            {categories.map(cat => (
              <div key={cat} className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-full shadow-[0_0_12px_currentColor]"
                  style={{ background: categoryColors[cat] || '#ffffff' }}
                />
                <span className="text-[11px] font-mono text-white/40 capitalize">{cat}</span>
              </div>
            ))}
          </div>
        </div>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 lg:px-14 xl:px-16 pb-24">
          <div className="skills-stage-shell p-1">
            <div className="relative px-5 py-6 sm:px-7 md:px-8 lg:px-10">
              <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_340px] gap-6 xl:gap-8 items-stretch">
                <div className="relative glass rounded-[24px] overflow-hidden min-h-[520px] md:min-h-[640px]">
                  <div className="absolute left-5 top-5 z-10 max-w-md rounded-2xl glass bg-black/20 px-4 py-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/45">Interactive Map</p>
                    <p className="mt-2 text-sm text-white/70 leading-relaxed">
                      Explore how frontend, backend, hardware, graphics, and tooling overlap in real delivery work.
                    </p>
                  </div>
                  <Suspense fallback={
                    <div className="flex items-center justify-center h-full">
                      <div className="text-white/40 font-mono text-sm">Loading skill network...</div>
                    </div>
                  }>
                    <SkillsVisualization
                      selectedId={selectedId}
                      setSelectedId={setSelectedId}
                      skills={skills}
                      categoryColors={categoryColors}
                    />
                  </Suspense>
                  <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full border border-white/[0.08] bg-black/25 px-4 py-2 text-white/35 text-[11px] font-mono backdrop-blur-md text-center whitespace-nowrap max-w-[calc(100%-2rem)] overflow-hidden text-ellipsis">
                    Drag to orbit - Scroll to zoom - Click nodes for implementation notes
                  </div>
                </div>

                <div className="relative min-h-[320px] xl:min-h-full">
                  <AnimatePresence mode="wait">
                    {selectedSkill ? (
                      <motion.div
                        key={selectedSkill.id}
                        className="h-full rounded-[24px] border p-6 md:p-7 bg-[linear-gradient(180deg,rgba(11,14,24,0.72)_0%,rgba(7,9,16,0.80)_100%)] backdrop-blur-xl shadow-[0_24px_70px_rgba(0,0,0,0.28)]"
                        style={{ borderColor: (categoryColors[selectedSkill.category] || '#ffffff') + '55', boxShadow: `0 24px 70px rgba(0,0,0,0.38), 0 0 0 1px ${(categoryColors[selectedSkill.category] || '#ffffff')}18 inset` }}
                        initial={{ opacity: 0, y: 18, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 18, scale: 0.98 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                      >
                        <div className="flex items-start justify-between gap-4 mb-5">
                          <div>
                            <p className="font-mono text-[10px] uppercase tracking-[0.22em]" style={{ color: categoryColors[selectedSkill.category] || '#ffffff' }}>
                              {selectedSkill.category}
                            </p>
                            <h3 className="mt-2 text-2xl md:text-3xl font-bold tracking-tight text-white">{selectedSkill.label}</h3>
                          </div>
                          <button
                            className="w-9 h-9 rounded-full border border-white/[0.08] bg-white/[0.03] text-white/45 hover:text-white transition-colors"
                            onClick={() => setSelectedId(null)}
                            aria-label="Close selected skill details"
                          >
                            ×
                          </button>
                        </div>

                        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 mb-5">
                          <div className="flex items-center justify-between gap-3 mb-2">
                            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/40">Capability</span>
                            <span className="text-sm font-mono" style={{ color: categoryColors[selectedSkill.category] || '#ffffff' }}>
                              {Math.round(selectedSkill.level * 100)}%
                            </span>
                          </div>
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full rounded-full"
                              style={{ background: `linear-gradient(90deg, ${categoryColors[selectedSkill.category] || '#ffffff'}, rgba(255,255,255,0.9))` }}
                              initial={{ width: 0 }}
                              animate={{ width: `${selectedSkill.level * 100}%` }}
                              transition={{ duration: 0.8, ease: 'easeOut' }}
                            />
                          </div>
                        </div>

                        <p className="text-white/68 text-sm leading-relaxed">
                          {selectedSkill.description}
                        </p>

                        {selectedSkill.connections.length > 0 && (
                          <div className="mt-6 pt-5 border-t border-white/[0.08]">
                            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/35">Works Closely With</span>
                            <div className="flex flex-wrap gap-2 mt-3">
                              {selectedSkill.connections.map((connId) => {
                                const conn = skills.find((s) => s.id === connId);
                                return conn ? (
                                  <button
                                    key={connId}
                                    onClick={() => setSelectedId(connId)}
                                    className="px-3 py-1.5 rounded-full text-[11px] font-mono border transition-all hover:-translate-y-0.5"
                                    style={{
                                      background: (categoryColors[conn.category] || '#ffffff') + '14',
                                      color: categoryColors[conn.category] || '#ffffff',
                                      borderColor: (categoryColors[conn.category] || '#ffffff') + '2f',
                                    }}
                                  >
                                    {conn.label}
                                  </button>
                                ) : null;
                              })}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="placeholder"
                        className="h-full rounded-[24px] border border-white/[0.05] p-6 md:p-7 bg-[linear-gradient(180deg,rgba(11,14,24,0.56)_0%,rgba(7,9,16,0.68)_100%)] backdrop-blur-xl"
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 18 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                      >
                        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#6366f1]">Node Detail</p>
                        <h3 className="mt-3 text-2xl font-bold tracking-tight text-white">Select a skill to inspect how it connects into delivery.</h3>
                        <p className="mt-4 text-white/62 text-sm leading-relaxed">
                          The network is organized around real implementation overlap. Choosing a node reveals the capability, supporting technologies, and the role it plays across builds.
                        </p>
                        <div className="mt-6 grid grid-cols-2 gap-3">
                          {categories.slice(0, 4).map((cat) => (
                            <div key={cat} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3">
                              <div className="w-2.5 h-2.5 rounded-full mb-3 shadow-[0_0_12px_currentColor]" style={{ background: categoryColors[cat] || '#ffffff', color: categoryColors[cat] || '#ffffff' }} />
                              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">{cat}</p>
                              <p className="mt-2 text-white/70 text-sm">{skills.filter((skill) => skill.category === cat).length} linked capabilities</p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Skills grid */}
        <div className="max-w-6xl mx-auto px-6 py-28 border-t border-white/[0.04]">
          <div className="text-center mb-16">
            <span className="font-mono text-[#6366f1]/80 text-xs uppercase tracking-[0.2em]">Breakdown</span>
            <h2 className="text-2xl md:text-3xl font-bold text-white mt-3 tracking-tight">
              Capability <span className="text-[#6366f1]">Breakdown</span>
            </h2>
            <p className="text-white/42 mt-5 max-w-2xl mx-auto leading-relaxed">
              These category summaries describe how the stack is applied during implementation, not just which tools are available.
            </p>
          </div>
          <PolymorphicDeck
            items={categoryDeck}
            className="mb-8"
            variant="carbon"
            renderCard={(item) => (
              <div className="p-8 md:p-9 min-h-[360px] flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-mono text-[12px] uppercase tracking-[0.18em]" style={{ color: item.color }}>
                    {item.category}
                  </h3>
                  <span className="text-[11px] font-mono px-2 py-1 rounded-md" style={{ color: item.color, background: item.color + '16' }}>
                    {item.count} skills
                  </span>
                </div>
                <p className="text-white text-4xl font-bold font-mono mb-3">{item.average}%</p>
                <p className="text-white/82 text-base tracking-tight mb-4">{item.strap}</p>
                <p className="text-white/62 text-sm leading-relaxed mb-5">{item.implementation}</p>
                <div className="flex flex-wrap gap-2 mb-5">
                  {item.highlights.map((label) => (
                    <span key={label} className="text-[11px] font-mono px-2.5 py-1 rounded-md border" style={{ borderColor: item.color + '3a', color: item.color + 'da', background: item.color + '12' }}>
                      {label}
                    </span>
                  ))}
                </div>
                <div className="mt-auto pt-5 border-t border-white/[0.08]">
                  <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-white/35 mb-3">Implementation Focus</p>
                  <div className="space-y-2.5 mb-4">
                    {item.examples.map((example) => (
                      <div key={example} className="flex items-start gap-2.5 text-sm text-white/68">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full" style={{ background: item.color }} />
                        <span>{example}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-white/58 leading-relaxed">{item.outcomes}</p>
                </div>
              </div>
            )}
          />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map(cat => {
              const catSkills = skills.filter(s => s.category === cat);
              const color = categoryColors[cat] || '#ffffff';
              return (
                <motion.div
                  key={cat}
                  className="rounded-xl p-6 border"
                  style={{ borderColor: color + '15', background: 'rgba(255,255,255,0.02)' }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <h3
                    className="font-mono text-[11px] uppercase tracking-[0.2em] font-semibold mb-4"
                    style={{ color }}
                  >
                    {cat}
                  </h3>
                  <div className="flex flex-col gap-3">
                    {catSkills.map(skill => (
                      <div
                        key={skill.id}
                        className="cursor-pointer"
                        onClick={() => setSelectedId(skill.id)}
                      >
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-white/80">{skill.label}</span>
                          <span className="font-mono text-xs" style={{ color }}>{Math.round(skill.level * 100)}%</span>
                        </div>
                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: color }}
                            initial={{ width: 0 }}
                            whileInView={{ width: `${skill.level * 100}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, ease: 'easeOut', delay: 0.1 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

