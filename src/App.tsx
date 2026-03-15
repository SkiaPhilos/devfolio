import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { lazy, Suspense, useState, useEffect } from 'react';
import Navbar from './components/ui/Navbar';
import Footer from './components/ui/Footer';
import Terminal from './components/ui/Terminal';
import LoadingScreen from './components/ui/LoadingScreen';
import OrganicPageFrame from './components/layout/OrganicPageFrame';

const Home = lazy(() => import('./pages/Home'));
const Projects = lazy(() => import('./pages/Projects'));
const Skills = lazy(() => import('./pages/Skills'));
const HireMe = lazy(() => import('./pages/HireMe'));
const Freelancing = lazy(() => import('./pages/Freelancing'));
const Contact = lazy(() => import('./pages/Contact'));
const Builder = lazy(() => import('./pages/Builder'));
const ContentAdmin = lazy(() => import('./pages/ContentAdmin'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-screen" style={{ background: 'linear-gradient(180deg,#0b1020 0%, #080b16 55%, #05070e 100%)' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-[#6366f1] border-t-transparent rounded-full animate-spin" />
        <p className="text-[#6366f1] font-mono text-sm tracking-widest">LOADING...</p>
      </div>
    </div>
  );
}

export default function App() {
  const location = useLocation();
  const [appLoaded, setAppLoaded] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [builderUnlocked, setBuilderUnlocked] = useState(false);
  const [contentUnlocked, setContentUnlocked] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAppLoaded(true), 2800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const unlocked = localStorage.getItem('devfolio:builder:unlocked') === '1';
    setBuilderUnlocked(unlocked);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === '`' || e.key === '~') {
        e.preventDefault();
        setTerminalOpen(prev => !prev);
      }
      if (e.key === 'Escape') setTerminalOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  if (!appLoaded) return <LoadingScreen />;

  return (
    <div className="noise relative min-h-screen overflow-x-hidden bg-black">
      <Navbar />
      <main className="relative z-10 px-3 pb-10 pt-20 md:px-6 md:pt-24 lg:px-8 lg:pt-28">
        <OrganicPageFrame>
          <AnimatePresence mode="wait">
            <Suspense fallback={<PageLoader />}>
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<Home />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/skills" element={<Skills />} />
                <Route path="/hire" element={<HireMe />} />
                <Route path="/freelancing" element={<Freelancing />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/builder" element={builderUnlocked ? <Builder /> : <Navigate to="/" replace />} />
                <Route path="/admin/content" element={contentUnlocked ? <ContentAdmin /> : <Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </AnimatePresence>
        </OrganicPageFrame>
      </main>
      <Footer />
      <AnimatePresence>
        {terminalOpen && (
          <Terminal
            onClose={() => setTerminalOpen(false)}
            builderUnlocked={builderUnlocked}
            onBuilderUnlock={(unlocked) => {
              setBuilderUnlocked(unlocked);
              localStorage.setItem('devfolio:builder:unlocked', unlocked ? '1' : '0');
            }}
            onContentUnlock={setContentUnlocked}
          />
        )}
      </AnimatePresence>
      <button
        className="fixed bottom-4 right-4 z-50 glass rounded px-3 py-1.5 text-xs font-mono text-white/30 hover:text-[#6366f1] transition-colors select-none"
        onClick={() => setTerminalOpen(prev => !prev)}
        title="Press ` to toggle terminal"
      >
        ` terminal
      </button>
    </div>
  );
}
