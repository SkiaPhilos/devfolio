import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import PolymorphicDeck from '../components/ui/PolymorphicDeck';

const SERVICES = [
  {
    icon: '🌐',
    title: 'Full Stack Web App',
    tagline: 'End-to-end product delivery',
    price: 'From $3,000',
    color: '#4488ff',
    features: [
      'React / Next.js frontend',
      'Node.js / Python backend',
      'PostgreSQL / MongoDB',
      'Auth, payments, file uploads',
      'Deployed & production-ready',
      'Documentation & handoff',
    ],
    popular: true,
  },
  {
    icon: '📄',
    title: 'CMS Website',
    tagline: 'Marketing & content sites',
    price: 'From $800',
    color: '#44cc88',
    features: [
      'Next.js or Astro frontend',
      'Sanity / Contentful CMS',
      'Custom design, responsive',
      '99+ Lighthouse performance',
      'SEO optimized',
      'Easy content management',
    ],
    popular: false,
  },
  {
    icon: '🔌',
    title: 'PCB Design',
    tagline: 'Hardware design & layout',
    price: 'From $500',
    color: '#ff8822',
    features: [
      'Schematic capture (KiCad/Altium)',
      'Multi-layer PCB layout',
      'DFM review & sign-off',
      'Gerber / BOM / pick & place',
      'SPICE simulation',
      'Manufacturer coordination',
    ],
    popular: false,
  },
  {
    icon: '⚡',
    title: 'Embedded Firmware',
    tagline: 'MCU programming & drivers',
    price: 'From $1,200',
    color: '#ff4466',
    features: [
      'STM32, ESP32, RP2040',
      'FreeRTOS / bare-metal',
      'Peripheral drivers',
      'Bootloader development',
      'OTA updates',
      'Unit tests & CI',
    ],
    popular: false,
  },
  {
    icon: '🎮',
    title: '3D Web Experience',
    tagline: 'Immersive WebGL & Three.js',
    price: 'From $2,000',
    color: '#aa44ff',
    features: [
      'Three.js / React Three Fiber',
      'Custom GLSL shaders',
      'Interactive 3D scenes',
      'Product configurators',
      'Performance optimized',
      'Mobile responsive',
    ],
    popular: false,
  },
  {
    icon: '🤖',
    title: 'IoT System',
    tagline: 'Hardware + cloud integration',
    price: 'From $2,500',
    color: '#00ccff',
    features: [
      'PCB + firmware design',
      'MQTT / REST / CoAP',
      'Cloud dashboard (AWS/GCP)',
      'Real-time monitoring',
      'OTA firmware updates',
      'End-to-end delivery',
    ],
    popular: false,
  },
];

const PROCESS = [
  { step: '01', title: 'Discovery', desc: 'We align on scope, constraints, success criteria, and dependencies before implementation starts.' },
  { step: '02', title: 'Architecture', desc: 'I define the delivery approach, technical stack, and milestone plan tied to your priorities.' },
  { step: '03', title: 'Build', desc: 'Implementation runs in short iterations with demos and risk updates at each checkpoint.' },
  { step: '04', title: 'Deliver', desc: 'Final delivery includes deployment guidance, documentation, and a post-launch support window.' },
];

const SERVICE_DECK_ITEMS = SERVICES.map((service, index) => ({
  ...service,
  id: `hire-service-${index}`,
}));

const PROCESS_DECK_ITEMS = PROCESS.map((step, index) => ({
  ...step,
  id: `process-${index}`,
}));

const GUARANTEE_ITEMS = [
  { id: 'g-1', icon: '🎯', title: 'Clear Scope', desc: 'Each engagement starts with a defined scope, timeline assumptions, and deliverables.' },
  { id: 'g-2', icon: '⚡', title: 'Transparent Updates', desc: 'You receive regular delivery updates and visible milestones throughout the project.' },
  { id: 'g-3', icon: '🔧', title: 'Post-Launch Support', desc: 'A support window is included after handoff for fixes and practical stabilization tasks.' },
];

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

export default function HireMe() {
  return (
    <PageWrapper>
      <div className="min-h-screen pt-20">
        {/* Header */}
        <div className="max-w-6xl mx-auto px-6 pt-24 pb-16 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="font-mono text-[#6366f1]/80 text-xs uppercase tracking-[0.2em]">Services</span>
            <h1 className="text-4xl md:text-6xl font-bold text-white mt-3 mb-6 tracking-tight">
              Hire <span className="text-[#6366f1]">Me</span>
            </h1>
            <p className="text-white/40 max-w-2xl mx-auto leading-relaxed text-lg">
              Engagements are structured around outcomes: stable web products, production-ready hardware,
              and clear technical communication from first scope review to final handoff.
            </p>
          </motion.div>
        </div>

        {/* Service cards */}
        <div className="max-w-6xl mx-auto px-6 pb-24">
          <PolymorphicDeck
            items={SERVICE_DECK_ITEMS}
            className="mb-8"
            variant="frost"
            renderCard={(service) => (
              <div className="p-7 md:p-8 min-h-[280px]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-lg flex items-center justify-center text-2xl" style={{ background: service.color + '18' }}>
                      {service.icon}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-xl tracking-tight">{service.title}</h3>
                      <p className="text-white/45 text-sm">{service.tagline}</p>
                    </div>
                  </div>
                  <span className="font-mono text-sm" style={{ color: service.color }}>{service.price}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {service.features.slice(0, 4).map((feat) => (
                    <div key={feat} className="text-[12px] text-white/70 rounded-md border border-white/10 px-2.5 py-1.5">
                      {feat}
                    </div>
                  ))}
                </div>
              </div>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SERVICES.map((service, i) => (
              <motion.div
                key={service.title}
                className="relative rounded-xl p-6 overflow-hidden group border transition-all duration-300"
                style={{
                  borderColor: service.popular ? service.color + '30' : 'rgba(255,255,255,0.06)',
                  background: service.popular ? service.color + '06' : 'rgba(255,255,255,0.02)',
                }}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -4, borderColor: service.color + '40' }}
              >
                {service.popular && (
                  <div
                    className="absolute top-4 right-4 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: service.color + '20', color: service.color }}
                  >
                    POPULAR
                  </div>
                )}

                {/* Background glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `radial-gradient(ellipse at center, ${service.color}08 0%, transparent 60%)` }}
                />

                <div className="relative z-10">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-2xl mb-4"
                    style={{ background: service.color + '12' }}
                  >
                    {service.icon}
                  </div>

                  <h3 className="text-white font-semibold text-lg mb-1 tracking-tight">{service.title}</h3>
                  <p className="text-white/35 text-sm mb-4">{service.tagline}</p>

                  <div className="text-lg font-bold font-mono mb-5" style={{ color: service.color }}>
                    {service.price}
                  </div>

                  <div className="flex flex-col gap-2 mb-6">
                    {service.features.map(feat => (
                      <div key={feat} className="flex items-center gap-2.5 text-[13px] text-white/55">
                        <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: service.color + 'aa' }} />
                        {feat}
                      </div>
                    ))}
                  </div>

                  <Link
                    to="/contact"
                    className="block w-full text-center py-2.5 text-[13px] font-mono font-medium rounded-lg transition-all duration-200"
                    style={{
                      background: service.popular ? service.color : service.color + '10',
                      color: service.popular ? '#fff' : service.color,
                      border: `1px solid ${service.color}${service.popular ? '' : '30'}`,
                    }}
                  >
                    Get Started →
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Process */}
        <div className="border-t border-white/[0.04] py-28 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="font-mono text-[#6366f1]/80 text-xs uppercase tracking-[0.2em]">How it works</span>
              <h2 className="text-2xl md:text-3xl font-bold text-white mt-3 tracking-tight">The Process</h2>
            </motion.div>

            <PolymorphicDeck
              items={PROCESS_DECK_ITEMS}
              className="mb-10"
              variant="neon"
              renderCard={(step) => (
                <div className="p-8 min-h-[250px] flex flex-col justify-between">
                  <div className="text-5xl font-bold font-mono text-[#6366f1]/20">{step.step}</div>
                  <div>
                    <h3 className="text-white font-semibold text-2xl tracking-tight mb-2">{step.title}</h3>
                    <p className="text-white/65 text-sm leading-relaxed max-w-2xl">{step.desc}</p>
                  </div>
                </div>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {PROCESS.map((step, i) => (
                <motion.div
                  key={step.step}
                  className="relative"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="text-5xl font-bold font-mono text-[#6366f1]/15 mb-4">{step.step}</div>
                  <h3 className="text-white font-semibold text-lg mb-3 tracking-tight">{step.title}</h3>
                  <p className="text-white/35 text-[15px] leading-relaxed">{step.desc}</p>
                  {i < 3 && (
                    <div className="hidden md:block absolute top-8 left-[calc(100%+8px)] w-4 text-white/20 text-xl">→</div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ / Guarantees */}
        <div className="max-w-5xl mx-auto px-6 pb-20">
          <div className="text-center mb-14">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="font-mono text-[#6366f1]/80 text-xs uppercase tracking-[0.2em]">Guarantees</span>
              <h2 className="text-2xl md:text-3xl font-bold text-white mt-3 tracking-tight">What you can expect</h2>
            </motion.div>
          </div>

          <PolymorphicDeck
            items={GUARANTEE_ITEMS}
            className="mb-8"
            variant="carbon"
            renderCard={(item) => (
              <div className="p-8 min-h-[230px]">
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="text-white font-semibold text-2xl tracking-tight mb-3">{item.title}</h3>
                <p className="text-white/65 leading-relaxed">{item.desc}</p>
              </div>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {GUARANTEE_ITEMS.map((item, i) => (
              <motion.div
                key={i}
                className="rounded-xl p-8 text-center border border-white/[0.06]"
                style={{ background: 'rgba(255,255,255,0.02)' }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="text-white font-semibold text-lg mb-2 tracking-tight">{item.title}</h3>
                <p className="text-white/40 text-[15px] leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            className="text-center mt-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-white/40 text-lg mb-6">Have a project in mind?</p>
            <a
              href="mailto:engg.abdullahsaeed@gmail.com"
              className="inline-block px-8 py-3.5 bg-[#6366f1] text-white font-mono text-sm font-semibold rounded-lg hover:bg-[#4338ca] transition-colors"
            >
              EMAIL INQUIRY
            </a>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
}

