import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface DeckItem {
  id: string;
}

type DeckStage = 'idle' | 'open' | 'settled';
type DeckVariant = 'frost' | 'neon' | 'carbon';

interface VariantMotion {
  openDelayMs: number;
  collapseDelayMs: number;
  cycleDelayMs: number;
  openSpreadX: number;
  openLiftY: number;
  openRotateZ: number;
  openRotateYBase: number;
  settledX: number;
  settledDropY: number;
  settledRotateZ: number;
  settledRotateYBase: number;
  cycleArcX: number;
  cycleArcY: number;
  cycleRotateZ: number;
  cycleRotateY: number;
  cycleScale: number;
  springStiffness: number;
  springDamping: number;
  cycleStiffness: number;
  cycleDamping: number;
  collapseStepMs: number;
}

interface PolymorphicDeckProps<T extends DeckItem> {
  items: T[];
  className?: string;
  maxVisible?: number;
  variant?: DeckVariant;
  cardClassName?: string;
  onFrontClick?: (item: T) => void;
  renderCard: (item: T, index: number, isFront: boolean) => React.ReactNode;
}

function getVariantMotion(variant: DeckVariant): VariantMotion {
  if (variant === 'neon') {
    return {
      openDelayMs: 240,
      collapseDelayMs: 2000,
      cycleDelayMs: 150,
      openSpreadX: 66,
      openLiftY: 30,
      openRotateZ: 4.6,
      openRotateYBase: -36,
      settledX: 10,
      settledDropY: 32,
      settledRotateZ: -2.7,
      settledRotateYBase: -10,
      cycleArcX: 112,
      cycleArcY: 58,
      cycleRotateZ: 10,
      cycleRotateY: -16,
      cycleScale: 0.93,
      springStiffness: 250,
      springDamping: 22,
      cycleStiffness: 190,
      cycleDamping: 17,
      collapseStepMs: 160,
    };
  }

  if (variant === 'carbon') {
    return {
      openDelayMs: 320,
      collapseDelayMs: 2100,
      cycleDelayMs: 200,
      openSpreadX: 44,
      openLiftY: 18,
      openRotateZ: 3.2,
      openRotateYBase: -24,
      settledX: 5,
      settledDropY: 32,
      settledRotateZ: -1.8,
      settledRotateYBase: -6,
      cycleArcX: 88,
      cycleArcY: 46,
      cycleRotateZ: 7,
      cycleRotateY: -12,
      cycleScale: 0.95,
      springStiffness: 210,
      springDamping: 24,
      cycleStiffness: 170,
      cycleDamping: 20,
      collapseStepMs: 190,
    };
  }

  return {
    openDelayMs: 280,
    collapseDelayMs: 2000,
    cycleDelayMs: 170,
    openSpreadX: 58,
    openLiftY: 26,
    openRotateZ: 4,
    openRotateYBase: -32,
    settledX: 6,
    settledDropY: 36,
    settledRotateZ: -2.3,
    settledRotateYBase: -8,
    cycleArcX: 96,
    cycleArcY: 52,
    cycleRotateZ: 8,
    cycleRotateY: -14,
    cycleScale: 0.94,
    springStiffness: 230,
    springDamping: 23,
    cycleStiffness: 180,
    cycleDamping: 18,
    collapseStepMs: 170,
  };
}

function getVariantClass(variant: DeckVariant) {
  if (variant === 'neon') {
    return {
      card: 'border-[#7ba0ff]/40 bg-[linear-gradient(145deg,rgba(34,53,120,0.7),rgba(10,16,32,0.88)_45%,rgba(33,10,28,0.84)_100%)] shadow-[0_18px_55px_rgba(35,55,120,0.45)]',
      side: 'from-[#8aaaff]/45 via-[#7ba0ff]/20 to-transparent',
    };
  }
  if (variant === 'carbon') {
    return {
      card: 'border-white/[0.16] bg-[linear-gradient(165deg,rgba(55,62,74,0.72),rgba(18,22,30,0.9)_46%,rgba(10,12,16,0.95)_100%)] shadow-[0_18px_54px_rgba(0,0,0,0.52)]',
      side: 'from-white/20 via-white/8 to-transparent',
    };
  }
  return {
    card: 'border-white/[0.14] bg-[linear-gradient(155deg,rgba(255,255,255,0.11),rgba(255,255,255,0.03)_40%,rgba(4,7,14,0.6)_100%)] shadow-[0_24px_65px_rgba(0,0,0,0.45)]',
    side: 'from-white/25 via-white/8 to-transparent',
  };
}

function getCardPose(stage: DeckStage, stackIndex: number, total: number, motion: VariantMotion) {
  const depth = Math.max(total - stackIndex, 1);

  if (stage === 'idle') {
    return {
      x: 0,
      y: 0,
      rotateZ: stackIndex * -0.25,
      rotateY: 0,
      scale: 1 - stackIndex * 0.01,
      opacity: stackIndex === 0 ? 1 : 0,
      zIndex: depth,
    };
  }

  if (stage === 'open') {
    const spread = stackIndex * motion.openSpreadX;
    return {
      x: spread,
      y: -stackIndex * motion.openLiftY,
      rotateZ: stackIndex * motion.openRotateZ,
      rotateY: motion.openRotateYBase + stackIndex * 7,
      scale: 1 - stackIndex * 0.05,
      opacity: Math.max(0.56, 1 - stackIndex * 0.12),
      zIndex: depth,
    };
  }

  return {
    x: stackIndex * motion.settledX,
    y: stackIndex * motion.settledDropY,
    rotateZ: stackIndex * motion.settledRotateZ,
    rotateY: motion.settledRotateYBase + stackIndex * 2,
    scale: 1 - stackIndex * 0.03,
    opacity: Math.max(0.74, 1 - stackIndex * 0.07),
    zIndex: depth,
  };
}

export default function PolymorphicDeck<T extends DeckItem>({
  items,
  className,
  maxVisible = 4,
  variant = 'frost',
  cardClassName,
  onFrontClick,
  renderCard,
}: PolymorphicDeckProps<T>) {
  const [stage, setStage] = useState<DeckStage>('idle');
  const [order, setOrder] = useState<string[]>(() => items.map((item) => item.id));
  const [cyclingId, setCyclingId] = useState<string | null>(null);

  const openTimerRef = useRef<number | null>(null);
  const collapseTimerRef = useRef<number | null>(null);
  const cycleTimerRef = useRef<number | null>(null);
  const collapseStepTimerRef = useRef<number | null>(null);
  const touchStartRef = useRef<{ x: number; y: number; t: number } | null>(null);

  const variantClass = getVariantClass(variant);
  const motionProfile = getVariantMotion(variant);

  const byId = useMemo(() => {
    const map = new Map<string, T>();
    items.forEach((item) => map.set(item.id, item));
    return map;
  }, [items]);

  useEffect(() => {
    setOrder(items.map((item) => item.id));
    setStage('idle');
    setCyclingId(null);
  }, [items]);

  const clearTimers = useCallback(() => {
    if (openTimerRef.current) {
      window.clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
    if (collapseTimerRef.current) {
      window.clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = null;
    }
    if (cycleTimerRef.current) {
      window.clearTimeout(cycleTimerRef.current);
      cycleTimerRef.current = null;
    }
    if (collapseStepTimerRef.current) {
      window.clearTimeout(collapseStepTimerRef.current);
      collapseStepTimerRef.current = null;
    }
  }, []);

  const armCollapse = useCallback(() => {
    if (collapseTimerRef.current) {
      window.clearTimeout(collapseTimerRef.current);
    }
    collapseTimerRef.current = window.setTimeout(() => {
      // Step through a quick "gather" phase before bundling fully to idle.
      setStage('open');
      collapseStepTimerRef.current = window.setTimeout(() => {
        setStage('idle');
      }, motionProfile.collapseStepMs);
    }, motionProfile.collapseDelayMs);
  }, [motionProfile.collapseDelayMs, motionProfile.collapseStepMs]);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  const handleEnter = useCallback(() => {
    clearTimers();
    setStage('open');
    openTimerRef.current = window.setTimeout(() => {
      setStage('settled');
      armCollapse();
    }, motionProfile.openDelayMs);
  }, [armCollapse, clearTimers, motionProfile.openDelayMs]);

  const handleLeave = useCallback(() => {
    clearTimers();
    setOrder(items.map((item) => item.id));
    setStage('idle');
    setCyclingId(null);
  }, [clearTimers, items]);

  const handleAdvance = useCallback(() => {
    if (cyclingId) return;

    const frontId = order[0];
    if (!frontId) return;

    setCyclingId(frontId);
    setStage('settled');
    cycleTimerRef.current = window.setTimeout(() => {
      setOrder((prev) => {
        if (prev.length <= 1) return prev;
        const [front, ...rest] = prev;
        return [...rest, front];
      });
      setCyclingId(null);
      armCollapse();
    }, motionProfile.cycleDelayMs);
  }, [armCollapse, cyclingId, motionProfile.cycleDelayMs, order]);

  const orderedItems = useMemo(() => {
    return order
      .map((id) => byId.get(id))
      .filter(Boolean)
      .slice(0, maxVisible) as T[];
  }, [order, byId, maxVisible]);

  if (items.length === 0) return null;

  const handleTapOrSwipeAdvance = () => {
    const front = orderedItems[0];
    if (front && onFrontClick) onFrontClick(front);
    handleAdvance();
  };

  return (
    <div
      className={className}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onFocus={handleEnter}
      onBlur={handleLeave}
      role="button"
      tabIndex={0}
      aria-label="Interactive project deck"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleTapOrSwipeAdvance();
        }
      }}
      onTouchStart={(e) => {
        const touch = e.touches[0];
        touchStartRef.current = { x: touch.clientX, y: touch.clientY, t: Date.now() };
        if (stage === 'idle') handleEnter();
      }}
      onTouchEnd={(e) => {
        const start = touchStartRef.current;
        if (!start) return;
        const touch = e.changedTouches[0];
        const dx = touch.clientX - start.x;
        const dy = touch.clientY - start.y;
        const dt = Date.now() - start.t;

        // Horizontal swipe advances cards; quick tap advances when deck is already opened.
        if (Math.abs(dx) > 46 && Math.abs(dy) < 36) {
          handleTapOrSwipeAdvance();
          return;
        }

        if (Math.abs(dx) < 14 && Math.abs(dy) < 14 && dt < 260) {
          if (stage === 'idle') {
            handleEnter();
          } else {
            handleTapOrSwipeAdvance();
          }
        }
      }}
    >
      <div className="relative h-[340px] sm:h-[360px] [perspective:1200px]">
        <AnimatePresence initial={false}>
          {orderedItems.map((item, stackIndex) => {
            const pose = getCardPose(stage, stackIndex, orderedItems.length, motionProfile);
            const isFront = stackIndex === 0;
            const isCyclingFront = isFront && cyclingId === item.id;

            const animatedPose = isCyclingFront
              ? {
                  x: pose.x + motionProfile.cycleArcX,
                  y: pose.y + motionProfile.cycleArcY,
                  rotateZ: pose.rotateZ + motionProfile.cycleRotateZ,
                  rotateY: pose.rotateY + motionProfile.cycleRotateY,
                  scale: pose.scale * motionProfile.cycleScale,
                  opacity: 0.78,
                }
              : pose;

            return (
              <motion.div
                key={item.id}
                layout
                className={`absolute left-0 right-0 mx-auto w-[min(92%,620px)] rounded-2xl border backdrop-blur-xl ${variantClass.card} ${cardClassName || ''}`}
                style={{
                  zIndex: pose.zIndex,
                  transformStyle: 'preserve-3d',
                }}
                initial={{ opacity: 0, y: 18, scale: 0.95 }}
                animate={{
                  x: animatedPose.x,
                  y: animatedPose.y,
                  rotateZ: animatedPose.rotateZ,
                  rotateY: animatedPose.rotateY,
                  scale: animatedPose.scale,
                  opacity: animatedPose.opacity,
                }}
                transition={{
                  ...(stage === 'idle' && !isCyclingFront
                    ? {
                        type: 'tween' as const,
                        duration: 0.42,
                        ease: [0.2, 0.92, 0.2, 1] as [number, number, number, number],
                      }
                    : {
                        type: 'spring' as const,
                        stiffness: isCyclingFront ? motionProfile.cycleStiffness : motionProfile.springStiffness,
                        damping: isCyclingFront ? motionProfile.cycleDamping : motionProfile.springDamping,
                        mass: 0.72,
                      }),
                }}
                onClick={() => {
                  if (!isFront) return;
                  handleTapOrSwipeAdvance();
                }}
              >
                <motion.div
                  className={`pointer-events-none absolute inset-y-0 right-0 rounded-r-2xl bg-gradient-to-l ${variantClass.side}`}
                  animate={{
                    width: stage === 'idle' ? 8 : stage === 'open' ? 24 : 16,
                    opacity: stage === 'idle' ? 0.55 : stage === 'open' ? 0.95 : 0.8,
                  }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                />
                {renderCard(item, stackIndex, isFront)}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
