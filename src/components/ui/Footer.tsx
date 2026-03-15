import { Link } from 'react-router-dom';

const NAV = [
  { label: 'Home', path: '/' },
  { label: 'Projects', path: '/projects' },
  { label: 'Skills', path: '/skills' },
  { label: 'Hire Me', path: '/hire' },
  { label: 'Freelancing', path: '/freelancing' },
  { label: 'Contact', path: '/contact' },
];

const SOCIALS = [
  { label: 'GitHub', href: 'https://github.com' },
  { label: 'LinkedIn', href: 'https://linkedin.com' },
  { label: 'Fiverr', href: 'https://fiverr.com' },
  { label: 'Upwork', href: 'https://upwork.com' },
];

export default function Footer() {
  return (
    <footer className="footer-atmo relative overflow-hidden border-t border-white/[0.04]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-white/[0.05] via-white/[0.015] to-transparent" />
        <div className="absolute -left-20 top-6 h-56 w-56 rounded-full bg-[#1d4ed8]/20 blur-3xl" />
        <div className="absolute right-0 top-16 h-64 w-64 rounded-full bg-[#6366f1]/16 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-52 w-52 rounded-full bg-cyan-400/12 blur-3xl" />
      </div>
      <div className="relative max-w-6xl mx-auto px-6 py-14">
        <div className="rounded-[26px] border border-white/[0.08] bg-white/[0.035] px-6 py-6 shadow-[0_24px_80px_rgba(3,6,13,0.42)] backdrop-blur-xl md:px-8 md:py-7 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#6366f1]">Open for freelance work</p>
            <p className="text-white/70 text-sm mt-2 max-w-xl leading-relaxed">
              Need a web app, embedded firmware, or a hardware-plus-software build? Send a brief and I will reply with scope and next steps.
            </p>
          </div>
          <a
            href="mailto:engg.abdullahsaeed@gmail.com"
            className="inline-flex items-center justify-center px-5 py-2.5 bg-[#6366f1] text-white text-xs font-mono font-semibold rounded-lg hover:bg-[#4338ca] transition-colors whitespace-nowrap"
          >
            Email Inquiry
          </a>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <Link to="/" className="inline-flex items-center gap-2 group mb-4">
              <div className="w-7 h-7 relative">
                <div className="absolute inset-0 border border-[#6366f1] rotate-45" />
                <div className="absolute inset-1.5 bg-[#6366f1] rotate-45" />
              </div>
              <span className="font-mono font-bold text-sm tracking-widest">
                <span className="text-white">DEV</span>
                <span className="text-[#6366f1]">FOLIO</span>
              </span>
            </Link>
            <p className="text-white/45 text-[14px] leading-relaxed max-w-sm">
              Software engineer and electronics designer building reliable products for startups and teams.
            </p>
            <a href="mailto:engg.abdullahsaeed@gmail.com" className="inline-block mt-3 text-white/65 text-sm hover:text-white transition-colors font-mono">
              engg.abdullahsaeed@gmail.com
            </a>
          </div>

          <div>
            <h4 className="font-mono text-xs uppercase tracking-widest text-white/30 mb-4">Navigate</h4>
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              {NAV.map((n) => (
                <Link key={n.path} to={n.path} className="text-white/50 hover:text-white transition-colors">
                  {n.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-mono text-xs uppercase tracking-widest text-white/30 mb-4">Links</h4>
            <div className="flex flex-wrap gap-2 mb-3">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[12px] font-mono px-2.5 py-1 rounded border border-white/[0.08] text-white/55 hover:text-white hover:border-white/20 transition-colors"
                >
                  {s.label}
                </a>
              ))}
            </div>
            <p className="text-[12px] text-white/35">Availability: accepting new projects for the next cycle.</p>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-white/[0.05] pt-5 sm:flex-row">
          <p className="text-white/25 text-xs font-mono">&copy; {new Date().getFullYear()} Abdullah</p>
          <p className="text-white/20 text-xs">Built with React and Three.js</p>
        </div>
      </div>
    </footer>
  );
}


