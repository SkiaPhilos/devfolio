import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface Line { type: 'input' | 'output' | 'error'; text: string }

interface TerminalProps {
  onClose: () => void;
  builderUnlocked: boolean;
  onBuilderUnlock: (unlocked: boolean) => void;
  onContentUnlock: (unlocked: boolean) => void;
}

const CONTENT_ACCESS_PASSWORD = 'Philos@2006';

const COMMANDS: Record<string, () => string[]> = {
  about: () => [
    '> Software Engineer and Electronics Designer',
    '> 5 years building production software and hardware systems',
    '> Delivered 4 websites and 4 apps for real client use-cases',
    '> Core stack: React, TypeScript, Node.js, PCB and embedded firmware',
    '> Engagement style: clear scope, weekly demos, reliable handoff',
    '> Available for freelance and contract projects',
  ],
  skills: () => [
    '── FRONTEND ──────────────────────────────',
    '  React · TypeScript · Three.js · Tailwind',
    '  Framer Motion · Next.js · Vue',
    '── BACKEND ───────────────────────────────',
    '  Node.js · Python · PostgreSQL · MongoDB',
    '  REST APIs · GraphQL · Prisma',
    '── HARDWARE ──────────────────────────────',
    '  PCB Design (KiCad · Altium)',
    '  Embedded C/C++ · Arduino · STM32',
    '  Circuit Simulation · SPICE',
    '── TOOLS ─────────────────────────────────',
    '  Git · Docker · Linux · Blender · Figma',
  ],
  projects: () => [
    '── RECENT PROJECTS ───────────────────────',
    '  [WEB]  E-commerce Platform (React+Node)',
    '  [WEB]  Real-time Dashboard (WebSockets)',
    '  [PCB]  Motor Controller Board (STM32)',
    '  [PCB]  IoT Sensor Node (ESP32)',
    '  [3D]   Product Configurator (Three.js)',
    '  [APP]  CLI Dev Tools (Python)',
    '',
    '  → Navigate to /projects for full gallery',
  ],
  contact: () => [
    '  Email   : engg.abdullahsaeed@gmail.com',
    '  GitHub  : github.com',
    '  LinkedIn: linkedin.com',
    '  Fiverr  : fiverr.com',
    '',
    '  → Navigate to /contact to send a message',
  ],
  resume: () => [
    '  Preparing resume download...',
    '  > Format: PDF',
    '  > Status: [████████████] 100%',
    '  ✓ Download initiated: resume_2025.pdf',
  ],
  hire: () => [
    '── SERVICES ──────────────────────────────',
    '  • Full Stack Web App          — from $3,000',
    '  • CMS Website                 — from $800',
    '  • PCB Design                  — from $500',
    '  • Embedded Firmware           — from $1,200',
    '  • 3D Web Experience           — from $2,000',
    '  • IoT System                  — from $2,500',
    '',
    '  → Navigate to /hire for full pricing',
  ],
  whoami: () => [
    '  uid=1337(developer) gid=1337(engineer)',
    '  groups=web,hardware,3d,coffee,nocturnal',
  ],
  matrix: () => [
    '  Wake up, Neo...',
    '  The Matrix has you...',
    '  Follow the white rabbit. 🐇',
    '',
    '  (just kidding, stay here and hire me)',
  ],
};

export default function Terminal({ onClose, builderUnlocked, onBuilderUnlock, onContentUnlock }: TerminalProps) {
  const [lines, setLines] = useState<Line[]>([
    { type: 'output', text: '╔══════════════════════════════════════════╗' },
    { type: 'output', text: '║         DEVFOLIO TERMINAL v1.0           ║' },
    { type: 'output', text: '║   Type "help" to see available commands  ║' },
    { type: 'output', text: '╚══════════════════════════════════════════╝' },
    { type: 'output', text: '' },
  ]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const handleCommand = (cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();
    const newLines: Line[] = [
      ...lines,
      { type: 'input', text: `$ ${cmd}` },
    ];

    if (cmd.trim() === CONTENT_ACCESS_PASSWORD) {
      onContentUnlock(true);
      newLines.push({ type: 'output', text: '  Access granted.' });
      setLines(newLines);
      setTimeout(() => { navigate('/admin/content'); onClose(); }, 300);
      return;
    }

    if (trimmed === 'help') {
      [
        '┌──────────────────────────────────────────────────────────────┐',
        '│                     AVAILABLE COMMANDS                      │',
        '├──────────────────────────────────────────────────────────────┤',
        '│ about          — About this developer                       │',
        '│ skills         — Technical skill stack                      │',
        '│ projects       — View portfolio projects                    │',
        '│ contact        — Get in touch                               │',
        '│ resume         — Download resume                            │',
        '│ hire           — Services & pricing                         │',
        '│ builder unlock — Reveal builder route                       │',
        '│ builder open   — Open builder (after unlock)                │',
        '│ builder lock   — Hide builder again                         │',
        '│ clear          — Clear terminal                             │',
        '│ whoami         — Who are you?                               │',
        '│ matrix         — Enter the matrix                           │',
        '└──────────────────────────────────────────────────────────────┘',
      ].forEach((t) => newLines.push({ type: 'output', text: t }));
      newLines.push({ type: 'output', text: '' });
      setLines(newLines);
      return;
    }

    if (trimmed === 'builder unlock') {
      onBuilderUnlock(true);
      newLines.push({ type: 'output', text: '  Builder unlocked.' });
      newLines.push({ type: 'output', text: '  Run "builder open" to launch the builder.' });
      newLines.push({ type: 'output', text: '' });
      setLines(newLines);
      return;
    }

    if (trimmed === 'builder lock') {
      onBuilderUnlock(false);
      newLines.push({ type: 'output', text: '  Builder hidden. Access removed from route guard.' });
      newLines.push({ type: 'output', text: '' });
      setLines(newLines);
      return;
    }

    if (trimmed === 'builder open') {
      if (!builderUnlocked) {
        newLines.push({ type: 'error', text: '  Builder is locked. Run "builder unlock" first.' });
        newLines.push({ type: 'output', text: '' });
        setLines(newLines);
        return;
      }
      newLines.push({ type: 'output', text: '  Navigating to /builder...' });
      setLines(newLines);
      setTimeout(() => { navigate('/builder'); onClose(); }, 400);
      return;
    }

    if (trimmed === 'clear') {
      setLines([]);
      return;
    }

    if (['projects', 'skills', 'contact', 'hire'].includes(trimmed)) {
      const route = trimmed === 'hire' ? '/hire' : `/${trimmed}`;
      newLines.push({ type: 'output', text: `  Navigating to ${route}...` });
      setLines(newLines);
      setTimeout(() => { navigate(route); onClose(); }, 500);
      return;
    }

    const handler = COMMANDS[trimmed];
    if (handler) {
      handler().forEach(t => newLines.push({ type: 'output', text: t }));
    } else if (trimmed) {
      newLines.push({ type: 'error', text: `  command not found: ${trimmed}. Try "help"` });
    }

    newLines.push({ type: 'output', text: '' });
    setLines(newLines);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (input.trim()) setHistory(h => [input, ...h]);
      setHistIdx(-1);
      handleCommand(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const next = Math.min(histIdx + 1, history.length - 1);
      setHistIdx(next);
      setInput(history[next] ?? '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = Math.max(histIdx - 1, -1);
      setHistIdx(next);
      setInput(next === -1 ? '' : history[next]);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <motion.div
        className="relative w-full max-w-3xl mx-4 rounded-lg overflow-hidden border border-[#6366f1]/30"
        style={{ background: 'rgba(5,5,8,0.98)' }}
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        {/* Title bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57] cursor-pointer" onClick={onClose} />
            <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <span className="font-mono text-xs text-white/40">devfolio — terminal</span>
          <div className="w-16" />
        </div>

        {/* Output */}
        <div
          className="h-96 overflow-y-auto p-4 font-mono text-xs leading-relaxed"
          onClick={() => inputRef.current?.focus()}
        >
          {lines.map((line, i) => (
            <div key={i} className={`whitespace-pre ${
              line.type === 'input' ? 'text-[#6366f1]' :
              line.type === 'error' ? 'text-yellow-400' :
              'text-green-400/90'
            }`}>
              {line.text}
            </div>
          ))}

          {/* Input row */}
          <div className="flex items-center gap-2 text-[#6366f1]">
            <span>$</span>
            <input
              ref={inputRef}
              className="flex-1 bg-transparent outline-none text-white font-mono text-xs"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              autoComplete="off"
            />
            <span className="cursor-blink text-[#6366f1]">█</span>
          </div>
          <div ref={bottomRef} />
        </div>
      </motion.div>
    </motion.div>
  );
}


