import { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import PolymorphicDeck from '../components/ui/PolymorphicDeck';

const TechHero = lazy(() => import('../components/3d/TechHero'));
const WorkspaceCanvas = lazy(() => import('../components/3d/WorkspaceCanvas'));

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {children}
    </motion.div>
  );
}

function SceneLoader() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <div className="w-8 h-8 border-2 border-[#6366f1] border-t-transparent rounded-full animate-spin" />
      <p className="text-white/30 font-mono text-xs tracking-wider">Loading scene...</p>
    </div>
  );
}

const SERVICES = [
  {
    title: 'Web Development',
    color: '#4f8aff',
    desc: 'Modern full-stack applications with React, TypeScript, and Node.js. Performant, accessible, and built to scale.',
    skills: ['React', 'Next.js', 'TypeScript', 'Node.js', 'PostgreSQL'],
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
      </svg>
    ),
  },
  {
    title: 'PCB & Electronics',
    color: '#ff8833',
    desc: 'Schematic capture, multi-layer PCB layout, and embedded firmware. From concept to manufactured board.',
    skills: ['KiCad', 'Altium', 'STM32', 'ESP32', 'SPICE'],
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Zm.75-12h9v9h-9v-9Z" />
      </svg>
    ),
  },
  {
    title: '3D & Interactive',
    color: '#a855f7',
    desc: 'Immersive WebGL experiences, product configurators, and creative coding with Three.js and shaders.',
    skills: ['Three.js', 'R3F', 'Blender', 'GLSL', 'WebGL'],
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
      </svg>
    ),
  },
];

const STATS = [
  { num: '5', label: 'Years Experience' },
  { num: '4', label: 'Websites Shipped' },
  { num: '4', label: 'Apps Built' },
  { num: '3', label: 'Core Domains' },
];

const SERVICE_DECK_ITEMS = SERVICES.map((service, index) => ({
  ...service,
  id: `service-${index}`,
}));

const STAT_DECK_ITEMS = STATS.map((stat, index) => ({
  ...stat,
  id: `stat-${index}`,
}));

export default function Home() {
  return (
    <PageWrapper>
      {/* Hero */}
      <div className="relative w-full pt-16">
        <Suspense fallback={<SceneLoader />}>
          <TechHero />
        </Suspense>
      </div>

      {/* Marquee / tagline band */}
      <section className="py-6 border-y border-white/[0.04] overflow-hidden">
        <div className="flex items-center gap-12 animate-marquee whitespace-nowrap">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-12 font-mono text-white/15 text-sm tracking-widest uppercase">
              <span>Full Stack Development</span>
              <span className="text-[#6366f1]/30">◆</span>
              <span>PCB & Hardware Design</span>
              <span className="text-[#6366f1]/30">◆</span>
              <span>3D Web Experiences</span>
              <span className="text-[#6366f1]/30">◆</span>
              <span>Embedded Firmware</span>
              <span className="text-[#6366f1]/30">◆</span>
              <span>IoT Systems</span>
              <span className="text-[#6366f1]/30">◆</span>
              <span>Creative Technology</span>
              <span className="text-[#6366f1]/30">◆</span>
            </div>
          ))}
        </div>
      </section>

      {/* About / Intro */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="font-mono text-[#6366f1]/80 text-xs uppercase tracking-[0.2em]">About Me</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-3 mb-6 tracking-tight leading-tight">
              I engineer products where<br />
              <span className="text-white/30">software and electronics</span><br />
              work as one system.
            </h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <p className="text-white/45 text-lg leading-relaxed mb-6">
              I am a full-stack engineer and electronics designer with 5 years of hands-on delivery.
              I build production web applications, design manufacturable PCB hardware, and develop
              interactive 3D product experiences when visual depth matters.
            </p>
            <p className="text-white/30 text-base leading-relaxed">
              Projects are run with clear architecture, practical milestones, and weekly progress demos,
              so decisions are visible and delivery risk stays low.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 3D Studio */}
      <section className="relative py-28 px-4 md:px-8">
        <div className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="font-mono text-[#6366f1]/80 text-xs uppercase tracking-[0.2em]">Interactive</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-3 tracking-tight">
              My <span className="text-[#6366f1]">Studio</span>
            </h2>
            <p className="text-white/35 mt-4 text-[15px] max-w-md mx-auto leading-relaxed">
              Click objects in the scene to explore different sections. Drag to orbit, scroll to zoom.
            </p>
          </motion.div>
        </div>
        <div className="relative w-full max-w-6xl mx-auto h-[70vh] md:h-[80vh] glass rounded-3xl overflow-hidden shadow-2xl">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.08),transparent_70%)]" />
          <Suspense fallback={<SceneLoader />}>
            <WorkspaceCanvas />
          </Suspense>
        </div>
      </section>

      {/* What I Do */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="font-mono text-[#6366f1]/80 text-xs uppercase tracking-[0.2em]">What I Do</span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mt-3 tracking-tight">
              Engineering <span className="text-white/20">Across</span> Software and Hardware
            </h2>
            <p className="text-white/40 mt-5 max-w-xl mx-auto leading-relaxed text-lg">
              I help teams ship technical products end to end: user-facing web software,
              embedded and PCB subsystems, and interactive 3D interfaces that explain complex products.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-3 mb-6">
              <PolymorphicDeck
                items={SERVICE_DECK_ITEMS}
                className="mb-4"
                variant="neon"
                renderCard={(item, _index, isFront) => (
                  <div className="relative p-7 md:p-8 min-h-[260px]">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ background: item.color + '1a', color: item.color }}
                      >
                        {item.icon}
                      </div>
                      <span
                        className="text-[11px] font-mono px-2.5 py-1 rounded-full border"
                        style={{ borderColor: item.color + '33', color: item.color, background: item.color + '14' }}
                      >
                        {isFront ? 'FRONT CARD' : 'STACK'}
                      </span>
                    </div>
                    <h3 className="text-white text-2xl font-bold tracking-tight mb-2">{item.title}</h3>
                    <p className="text-white/65 text-sm leading-relaxed mb-5 max-w-2xl">{item.desc}</p>
                    <div className="flex flex-wrap gap-2">
                      {item.skills.slice(0, 4).map((skill) => (
                        <span
                          key={skill}
                          className="text-[11px] font-mono px-2.5 py-1 rounded-md border"
                          style={{ borderColor: item.color + '35', color: item.color + 'dd', background: item.color + '10' }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              />
            </div>
            {SERVICES.map((card, i) => (
              <motion.div
                key={i}
                className="group rounded-xl p-8 border transition-all duration-300 cursor-default"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  borderColor: 'rgba(255,255,255,0.06)',
                }}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{
                  y: -4,
                  borderColor: card.color + '40',
                  background: card.color + '08',
                }}
              >
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-6"
                  style={{ background: card.color + '15', color: card.color }}
                >
                  {card.icon}
                </div>
                <h3 className="text-white font-semibold text-lg mb-3 tracking-tight">{card.title}</h3>
                <p className="text-white/40 text-[15px] leading-relaxed mb-6">{card.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {card.skills.map(s => (
                    <span
                      key={s}
                      className="px-2.5 py-1 rounded text-[11px] font-mono"
                      style={{ background: card.color + '12', color: card.color + 'cc', border: `1px solid ${card.color}20` }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-24 border-y border-white/[0.04]">
        <div className="max-w-5xl mx-auto px-6">
          <PolymorphicDeck
            items={STAT_DECK_ITEMS}
            className="mb-10"
            variant="carbon"
            renderCard={(item) => (
              <div className="p-8 md:p-10 min-h-[240px] flex flex-col justify-between">
                <div>
                  <p className="text-white/35 font-mono text-xs tracking-[0.2em] uppercase mb-3">Studio Metrics</p>
                  <h3 className="text-[#6366f1] text-5xl md:text-6xl font-mono font-bold tracking-tight">{item.num}</h3>
                </div>
                <p className="text-white/70 text-lg tracking-tight">{item.label}</p>
              </div>
            )}
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          {STATS.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <div className="text-4xl md:text-5xl font-bold font-mono tracking-tight" style={{ color: '#6366f1' }}>{stat.num}</div>
              <div className="text-white/30 text-sm mt-2">{stat.label}</div>
            </motion.div>
          ))}
          </div>
        </div>
      </section>

      {/* Approach / Philosophy */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="font-mono text-[#6366f1]/80 text-xs uppercase tracking-[0.2em]">How I Work</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-3 tracking-tight">
              Build it right. <span className="text-white/25">Ship it fast.</span>
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                num: '01',
                title: 'Define scope and constraints',
                desc: 'I begin with requirements, edge cases, success criteria, and integration boundaries so the build plan is technically grounded.',
              },
              {
                num: '02',
                title: 'Ship in visible iterations',
                desc: 'You get frequent demos, practical checkpoints, and documented decisions so progress remains measurable and course corrections happen early.',
              },
              {
                num: '03',
                title: 'Handoff with confidence',
                desc: 'Delivery includes clean code structure, deployment readiness, and implementation notes so your team can maintain and extend without friction.',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="text-4xl font-bold font-mono text-[#6366f1]/15 mb-4">{item.num}</div>
                <h3 className="text-white font-semibold text-lg mb-3 tracking-tight">{item.title}</h3>
                <p className="text-white/35 text-[15px] leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6 text-center border-t border-white/[0.04]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight leading-tight">
            Have a project brief ready?<br /><span className="glow-red">Let us scope it.</span>
          </h2>
          <p className="text-white/40 mb-10 text-lg leading-relaxed max-w-lg mx-auto">
            Share your requirements by email and I will reply with scope, timeline, and recommended delivery model.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a
              href="mailto:engg.abdullahsaeed@gmail.com"
              className="px-8 py-3.5 bg-[#6366f1] text-white font-mono text-sm font-semibold rounded-lg hover:bg-[#4338ca] transition-colors"
            >
              EMAIL INQUIRY
            </a>
            <Link
              to="/projects"
              className="px-8 py-3.5 border border-white/15 text-white/70 font-mono text-sm font-semibold rounded-lg hover:border-white/30 hover:text-white transition-all"
            >
              VIEW PROJECTS
            </Link>
          </div>
        </motion.div>
      </section>
    </PageWrapper>
  );
}

