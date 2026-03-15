import { motion } from 'framer-motion';
import PolymorphicDeck from '../components/ui/PolymorphicDeck';

const PLATFORMS = [
  {
    name: 'GitHub',
    icon: '🐙',
    url: 'https://github.com',
    desc: 'Code samples, experiments, and architecture patterns used in delivery workflows.',
    color: '#6e5494',
    stats: ['Code samples', 'Build history', 'Implementation style'],
    tag: 'Open Source',
    cta: 'View Profile',
  },
  {
    name: 'LinkedIn',
    icon: '💼',
    url: 'https://linkedin.com',
    desc: 'Professional profile, technical focus areas, and current availability status.',
    color: '#0077b5',
    stats: ['Professional profile', '5 years experience', 'Open to projects'],
    tag: 'Professional',
    cta: 'Connect',
  },
  {
    name: 'Fiverr',
    icon: '🟢',
    url: 'https://fiverr.com',
    desc: 'Best for scoped fixed-price tasks with clear start and end criteria.',
    color: '#1dbf73',
    stats: ['Fixed scope', 'Milestone-based', 'Fast kickoff'],
    tag: 'Freelance',
    cta: 'Hire on Fiverr',
  },
  {
    name: 'Upwork',
    icon: '🔷',
    url: 'https://upwork.com',
    desc: 'Best for long-running builds and multi-phase product engagements.',
    color: '#6fda44',
    stats: ['Longer engagements', 'Change tracking', 'Contract workflow'],
    tag: 'Contracts',
    cta: 'Hire on Upwork',
  },
];

const SOCIAL = [
  { name: 'Twitter / X', icon: '𝕏', url: '#', color: '#1da1f2' },
  { name: 'YouTube', icon: '▶', url: '#', color: '#ff0000' },
  { name: 'Dev.to', icon: '📝', url: '#', color: '#3b49df' },
  { name: 'Behance', icon: '🎨', url: '#', color: '#1769ff' },
];

const PLATFORM_DECK_ITEMS = PLATFORMS.map((platform, index) => ({
  ...platform,
  id: `platform-${index}`,
}));

const SOCIAL_DECK_ITEMS = SOCIAL.map((item, index) => ({
  ...item,
  id: `social-${index}`,
}));

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

export default function Freelancing() {
  return (
    <PageWrapper>
      <div className="min-h-screen pt-20">
        <div className="max-w-6xl mx-auto px-6 pt-24 pb-12 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="font-mono text-[#6366f1]/80 text-xs uppercase tracking-[0.2em]">Find Me Online</span>
            <h1 className="text-4xl md:text-6xl font-bold text-white mt-3 mb-6 tracking-tight">
              Freelancing <span className="text-[#6366f1]">Platforms</span>
            </h1>
            <p className="text-white/40 max-w-2xl mx-auto leading-relaxed text-lg">
              Choose the engagement channel that best fits your procurement process, project complexity,
              and collaboration style.
            </p>
          </motion.div>
        </div>

        {/* Platform cards */}
        <div className="max-w-5xl mx-auto px-6 pb-24">
          <PolymorphicDeck
            items={PLATFORM_DECK_ITEMS}
            className="mb-8"
            variant="neon"
            onFrontClick={(item) => window.open(item.url, '_blank', 'noopener,noreferrer')}
            renderCard={(platform) => (
              <div className="p-7 md:p-8 min-h-[270px]">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{ background: platform.color + '18' }}>
                      {platform.icon}
                    </div>
                    <div>
                      <h3 className="text-white text-xl font-semibold tracking-tight">{platform.name}</h3>
                      <p className="text-white/45 text-sm">{platform.tag}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-1 rounded-md" style={{ color: platform.color, background: platform.color + '16' }}>
                    {platform.cta}
                  </span>
                </div>
                <p className="text-white/65 text-sm leading-relaxed mb-4">{platform.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {platform.stats.map((stat) => (
                    <span key={stat} className="text-[11px] font-mono px-2 py-1 rounded-md border" style={{ borderColor: platform.color + '38', color: platform.color + 'd0', background: platform.color + '12' }}>
                      {stat}
                    </span>
                  ))}
                </div>
              </div>
            )}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PLATFORMS.map((platform, i) => (
              <motion.a
                key={platform.name}
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl p-8 group relative overflow-hidden cursor-pointer block border transition-all duration-300"
                style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -4, borderColor: platform.color + '40' }}
              >
                {/* Background glow on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `radial-gradient(ellipse at top left, ${platform.color}12 0%, transparent 60%)` }}
                />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-2xl"
                      style={{ background: platform.color + '12' }}
                    >
                      {platform.icon}
                    </div>
                    <span
                      className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                      style={{ background: platform.color + '15', color: platform.color }}
                    >
                      {platform.tag}
                    </span>
                  </div>

                  <h3 className="text-white font-semibold text-base mb-1.5 tracking-tight">{platform.name}</h3>
                  <p className="text-white/40 text-[13px] leading-relaxed mb-4">{platform.desc}</p>

                  {/* Stats */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {platform.stats.map(stat => (
                      <span
                        key={stat}
                        className="text-[11px] font-mono px-2 py-0.5 rounded-full"
                        style={{ background: platform.color + '10', color: platform.color + 'bb' }}
                      >
                        {stat}
                      </span>
                    ))}
                  </div>

                  <div
                    className="inline-flex items-center gap-2 text-[13px] font-mono font-medium transition-colors"
                    style={{ color: platform.color }}
                  >
                    {platform.cta}
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </div>

        {/* Why Freelance With Me */}
        <div className="border-t border-white/[0.04] py-28 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="font-mono text-[#6366f1]/80 text-xs uppercase tracking-[0.2em]">Why Me</span>
              <h2 className="text-2xl md:text-3xl font-bold text-white mt-3 tracking-tight">Why freelance with me</h2>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  num: '01',
                  title: 'End-to-end delivery',
                  desc: 'From architecture to deployment — I handle the full stack. You get one point of contact, not a chain of handoffs.',
                },
                {
                  num: '02',
                  title: 'Hardware + Software',
                  desc: 'Need firmware that talks to a custom PCB that connects to a web dashboard? I build all three layers.',
                },
                {
                  num: '03',
                  title: 'Transparent process',
                  desc: 'Weekly demos, clear milestones, and direct communication across technical and business stakeholders.',
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
        </div>

        {/* Social links */}
        <div className="border-t border-white/[0.04] py-24 px-6">
          <div className="max-w-3xl mx-auto">
            <motion.h2
              className="text-2xl font-bold text-white mb-10 text-center tracking-tight"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Also find me on
            </motion.h2>

            <PolymorphicDeck
              items={SOCIAL_DECK_ITEMS}
              className="mb-8"
              variant="frost"
              onFrontClick={(item) => window.open(item.url, '_blank', 'noopener,noreferrer')}
              renderCard={(item) => (
                <div className="p-8 min-h-[220px] flex flex-col justify-between">
                  <div className="text-4xl" style={{ color: item.color }}>{item.icon}</div>
                  <div>
                    <h3 className="text-white text-2xl font-semibold tracking-tight">{item.name}</h3>
                    <p className="text-white/55 text-sm mt-2">Tap to open profile and see the latest posts and work updates.</p>
                  </div>
                </div>
              )}
            />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {SOCIAL.map((s, i) => (
                <motion.a
                  key={s.name}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg p-4 text-center group border border-white/[0.06] transition-all duration-300"
                  style={{ background: 'rgba(255,255,255,0.02)' }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  whileHover={{ scale: 1.04, borderColor: s.color + '40' }}
                >
                  <div className="text-xl mb-2">{s.icon}</div>
                  <div className="text-[11px] font-mono text-white/45 group-hover:text-white/70 transition-colors">{s.name}</div>
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        {/* Availability banner */}
        <div className="max-w-4xl mx-auto px-6 pb-28">
          <motion.div
            className="rounded-xl p-8 text-center border border-[#6366f1]/15 relative overflow-hidden"
            style={{ background: 'rgba(99,102,241,0.03)' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="absolute inset-0 opacity-[0.03]"
              style={{ background: 'radial-gradient(ellipse at center, #6366f1 0%, transparent 70%)' }}
            />
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="font-mono text-green-400/80 text-xs">Available for new projects</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Currently accepting clients</h3>
              <p className="text-white/40 text-[13px] mb-6">
                For direct collaboration, send your brief by email.
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <a
                  href="mailto:engg.abdullahsaeed@gmail.com"
                  className="px-5 py-2 bg-[#6366f1] text-white font-mono font-medium text-[13px] rounded-lg hover:bg-[#4338ca] transition-colors"
                >
                  Email Inquiry
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
}

