import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        const next = p + Math.random() * 18 + 4;
        if (next >= 100) { clearInterval(interval); return 100; }
        return next;
      });
    }, 120);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050508]">
      <div className="relative w-48 h-48 mb-8">
        <div className="spin-slow absolute inset-0">
          <PCBCircle />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-[#6366f1] text-3xl font-bold font-mono">{Math.floor(progress)}%</div>
        </div>
        <div className="absolute inset-0 rounded-full" style={{
          background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
        }} />
      </div>

      <motion.h1
        className="text-white font-mono text-xl font-bold mb-2 tracking-widest"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        DEVFOLIO
      </motion.h1>
      <p className="text-white/40 font-mono text-xs mb-8 tracking-widest">INITIALIZING WORKSPACE...</p>

      <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #6366f1, #818cf8)', width: `${progress}%` }}
        />
      </div>

      <div className="mt-4 font-mono text-xs text-white/30 min-h-[16px]">
        {progress < 30 && 'Loading assets...'}
        {progress >= 30 && progress < 60 && 'Building workspace...'}
        {progress >= 60 && progress < 85 && 'Initializing 3D scene...'}
        {progress >= 85 && progress < 100 && 'Compiling shaders...'}
        {progress >= 100 && 'Ready.'}
      </div>

      {['tl', 'tr', 'bl', 'br'].map(corner => (
        <div key={corner} className={`absolute w-8 h-8 ${
          corner === 'tl' ? 'top-6 left-6 border-t-2 border-l-2' :
          corner === 'tr' ? 'top-6 right-6 border-t-2 border-r-2' :
          corner === 'bl' ? 'bottom-6 left-6 border-b-2 border-l-2' :
          'bottom-6 right-6 border-b-2 border-r-2'
        } border-[#6366f1]/50`} />
      ))}
    </div>
  );
}

function PCBCircle() {
  const traces = Array.from({ length: 12 }, (_, i) => i);
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <defs>
        <filter id="glow-load">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <circle cx="100" cy="100" r="90" fill="none" stroke="#6366f1" strokeWidth="1" strokeOpacity="0.3" />
      <circle cx="100" cy="100" r="75" fill="none" stroke="#6366f1" strokeWidth="0.5" strokeOpacity="0.2" />
      {traces.map(i => {
        const angle = (i / 12) * Math.PI * 2;
        const x1 = 100 + Math.cos(angle) * 60;
        const y1 = 100 + Math.sin(angle) * 60;
        const x2 = 100 + Math.cos(angle) * 90;
        const y2 = 100 + Math.sin(angle) * 90;
        return (
          <g key={i}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#6366f1" strokeWidth="1.5" filter="url(#glow-load)" opacity="0.8" />
            <circle cx={x1} cy={y1} r="3" fill="#6366f1" filter="url(#glow-load)" opacity="0.9" />
          </g>
        );
      })}
      <rect x="82" y="82" width="36" height="36" rx="4" fill="#0a0a14" stroke="#6366f1" strokeWidth="1.5" />
      <rect x="88" y="88" width="24" height="24" rx="2" fill="#6366f1" opacity="0.2" />
      {[0,1,2].map(i => (
        <g key={i}>
          <rect x={88 + i*8} y="78" width="3" height="6" fill="#6366f1" opacity="0.7" />
          <rect x={88 + i*8} y="116" width="3" height="6" fill="#6366f1" opacity="0.7" />
          <rect x="78" y={88 + i*8} width="6" height="3" fill="#6366f1" opacity="0.7" />
          <rect x="116" y={88 + i*8} width="6" height="3" fill="#6366f1" opacity="0.7" />
        </g>
      ))}
    </svg>
  );
}


