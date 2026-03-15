import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_LINKS = [
  { path: '/', label: 'Home' },
  { path: '/projects', label: 'Projects' },
  { path: '/skills', label: 'Skills' },
  { path: '/hire', label: 'Hire Me' },
  { path: '/freelancing', label: 'Freelancing' },
  { path: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [location]);

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${scrolled ? 'backdrop-blur-xl border-b border-white/[0.04] py-3' : 'py-5'}`}
      style={scrolled ? { background: 'rgba(6,8,13,0.85)' } : {}}
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 relative">
            <div className="absolute inset-0 border border-[#6366f1] rotate-45 group-hover:rotate-[405deg] transition-transform duration-700" />
            <div className="absolute inset-2 bg-[#6366f1] rotate-45 group-hover:scale-110 transition-transform duration-500" />
          </div>
          <span className="font-mono font-bold text-[15px] tracking-[0.15em]">
            <span className="text-white">DEV</span>
            <span className="text-[#6366f1]">FOLIO</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ path, label }) => (
            <NavLink key={path} path={path} label={label} active={location.pathname === path} />
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/contact"
            className="px-4 py-1.5 text-[12px] font-mono font-medium text-[#6366f1] border border-[#6366f1]/30 rounded-lg hover:bg-[#6366f1] hover:text-white transition-all duration-200"
          >
            Start Inquiry
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <motion.span className="block w-6 h-0.5 bg-white" animate={menuOpen ? { rotate: 45, y: 8 } : {}} />
          <motion.span className="block w-6 h-0.5 bg-white" animate={menuOpen ? { opacity: 0 } : { opacity: 1 }} />
          <motion.span className="block w-6 h-0.5 bg-white" animate={menuOpen ? { rotate: -45, y: -8 } : {}} />
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="md:hidden backdrop-blur-xl border-t border-white/[0.04] mt-2"
            style={{ background: 'rgba(6,8,13,0.95)' }}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="px-6 py-4 flex flex-col gap-2">
              {NAV_LINKS.map(({ path, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`font-mono text-[13px] py-2 px-3 rounded-lg transition-colors ${
                    location.pathname === path
                      ? 'text-[#6366f1] bg-[#6366f1]/10'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

function NavLink({ path, label, active }: { path: string; label: string; active: boolean }) {
  return (
    <Link
      to={path}
      className={`relative px-3.5 py-2 font-mono text-[13px] transition-colors duration-200 ${
        active ? 'text-[#6366f1]' : 'text-white/50 hover:text-white/80'
      }`}
    >
      {label}
      {active && (
        <motion.div
          className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#6366f1]"
          layoutId="nav-indicator"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}
    </Link>
  );
}


