import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Move, RoundOutcome } from '../types';
import { Sparkles, Flame, ShieldCheck } from 'lucide-react';

interface RoundResultOverlayProps {
  playerMove: Move;
  aiMove: Move;
  outcome: RoundOutcome;
  pointsEarned: number;
  comboMultiplier: number;
  aiCommentary: string;
  shieldUsed?: boolean;
  onFinished: () => void;
}

const MOVE_ICONS: Record<Move, { emoji: string; label: string; color: string }> = {
  rock: { emoji: '🪨', label: 'ROCK', color: 'text-cyan-400 border-cyan-400/60 neon-glow-cyan' },
  paper: { emoji: '📄', label: 'PAPER', color: 'text-purple-400 border-purple-400/60 neon-glow-purple' },
  scissors: { emoji: '✂️', label: 'SCISSORS', color: 'text-pink-400 border-pink-400/60 neon-glow-pink' },
};

export const RoundResultOverlay: React.FC<RoundResultOverlayProps> = ({
  playerMove,
  aiMove,
  outcome,
  pointsEarned,
  comboMultiplier,
  aiCommentary,
  shieldUsed,
  onFinished,
}) => {
  const [phase, setPhase] = useState<'suspense' | 'reveal'>('suspense');
  const [suspenseTick, setSuspenseTick] = useState<number>(3);

  useEffect(() => {
    // Quick suspense 3... 2... 1... sequence
    const t1 = setTimeout(() => setSuspenseTick(2), 220);
    const t2 = setTimeout(() => setSuspenseTick(1), 440);
    const t3 = setTimeout(() => {
      setPhase('reveal');
    }, 660);

    // Auto dismiss after showing result
    const t4 = setTimeout(() => {
      onFinished();
    }, 2500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onFinished]);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md select-none">
      <AnimatePresence mode="wait">
        {phase === 'suspense' ? (
          <motion.div
            key="suspense"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.1, opacity: 0 }}
            className="flex flex-col items-center justify-center text-center"
          >
            <div className="flex items-center gap-8 sm:gap-16 mb-6">
              {/* Player Mystery Card */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs font-bold font-orbitron text-cyan-400 tracking-wider">PLAYER</span>
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-slate-900 border-2 border-cyan-400/50 flex items-center justify-center text-4xl sm:text-5xl font-orbitron font-black text-cyan-300 neon-glow-cyan animate-pulse">
                  ?
                </div>
              </div>

              <div className="text-2xl sm:text-3xl font-black font-orbitron text-slate-500">
                VS
              </div>

              {/* AI Mystery Card */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs font-bold font-orbitron text-purple-400 tracking-wider">AI ENEMY</span>
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-slate-900 border-2 border-purple-400/50 flex items-center justify-center text-4xl sm:text-5xl font-orbitron font-black text-purple-300 neon-glow-purple animate-pulse">
                  ?
                </div>
              </div>
            </div>

            <motion.div
              key={suspenseTick}
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-4xl sm:text-5xl font-black font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-400 tracking-widest"
            >
              CLASH IN {suspenseTick}
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="reveal"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={`flex flex-col items-center justify-center text-center max-w-lg w-full p-6 rounded-3xl backdrop-blur-xl border ${
              outcome === 'win'
                ? 'bg-emerald-950/40 border-emerald-400/60 neon-glow-green shadow-emerald-900/40'
                : outcome === 'loss'
                ? 'bg-rose-950/40 border-rose-500/60 shadow-rose-900/40 animate-screen-shake'
                : 'bg-purple-950/40 border-purple-400/60 neon-glow-purple shadow-purple-900/40'
            }`}
          >
            {/* Outcome Banner */}
            <motion.div
              initial={{ y: -20, scale: 0.8 }}
              animate={{ y: 0, scale: 1 }}
              transition={{ type: 'spring', damping: 12 }}
              className="mb-6"
            >
              {outcome === 'win' && (
                <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-black font-orbitron text-2xl sm:text-3xl tracking-widest neon-glow-green">
                  <span>🔥 YOU WIN!</span>
                </div>
              )}
              {outcome === 'loss' && (
                <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-rose-500/20 border border-rose-500 text-rose-300 font-black font-orbitron text-2xl sm:text-3xl tracking-widest">
                  <span>💀 AI WINS!</span>
                </div>
              )}
              {outcome === 'draw' && (
                <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-purple-500/20 border border-purple-400 text-purple-300 font-black font-orbitron text-2xl sm:text-3xl tracking-widest neon-glow-purple">
                  <span>⚡ DRAW!</span>
                </div>
              )}
            </motion.div>

            {/* Revealed Clash Cards */}
            <div className="flex items-center justify-center gap-6 sm:gap-12 my-2 w-full">
              {/* Player Choice */}
              <motion.div
                initial={{ x: -40, rotate: -15, scale: 0.7 }}
                animate={{ x: 0, rotate: 0, scale: 1.05 }}
                transition={{ type: 'spring', damping: 10 }}
                className="flex flex-col items-center gap-2"
              >
                <div className="text-xs font-bold font-orbitron text-cyan-400 tracking-wider">YOUR MOVE</div>
                <div
                  className={`w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-slate-900/90 border-3 flex flex-col items-center justify-center text-5xl sm:text-6xl shadow-2xl ${
                    MOVE_ICONS[playerMove].color
                  }`}
                >
                  <span>{MOVE_ICONS[playerMove].emoji}</span>
                  <span className="text-[11px] font-black font-orbitron mt-1 tracking-widest">
                    {MOVE_ICONS[playerMove].label}
                  </span>
                </div>
              </motion.div>

              <div className="text-xl sm:text-2xl font-black font-orbitron text-slate-500">
                VS
              </div>

              {/* AI Choice */}
              <motion.div
                initial={{ x: 40, rotate: 15, scale: 0.7 }}
                animate={{ x: 0, rotate: 0, scale: 1.05 }}
                transition={{ type: 'spring', damping: 10 }}
                className="flex flex-col items-center gap-2"
              >
                <div className="text-xs font-bold font-orbitron text-purple-400 tracking-wider">AI MOVE</div>
                <div
                  className={`w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-slate-900/90 border-3 flex flex-col items-center justify-center text-5xl sm:text-6xl shadow-2xl ${
                    MOVE_ICONS[aiMove].color
                  }`}
                >
                  <span>{MOVE_ICONS[aiMove].emoji}</span>
                  <span className="text-[11px] font-black font-orbitron mt-1 tracking-widest">
                    {MOVE_ICONS[aiMove].label}
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Floating points animation */}
            {pointsEarned > 0 && (
              <motion.div
                initial={{ y: 20, opacity: 0, scale: 0.6 }}
                animate={{ y: -10, opacity: 1, scale: 1.2 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-4 flex items-center gap-2 text-2xl sm:text-3xl font-black font-orbitron text-amber-300 drop-shadow-[0_0_15px_rgba(245,158,11,0.8)]"
              >
                <Sparkles className="w-6 h-6 text-amber-400 fill-amber-400" />
                <span>+{pointsEarned} PTS</span>
                {comboMultiplier > 1 && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/30 border border-amber-400 text-amber-200">
                    COMBO x{comboMultiplier}
                  </span>
                )}
              </motion.div>
            )}

            {/* Shield used notification */}
            {shieldUsed && (
              <div className="mt-3 flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400 text-cyan-300 text-xs font-bold font-orbitron">
                <ShieldCheck className="w-4 h-4" />
                <span>SHIELD SAVED YOUR STREAK!</span>
              </div>
            )}

            {/* AI Commentary Quote */}
            {aiCommentary && (
              <div className="mt-4 px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-700/60 text-xs sm:text-sm text-slate-300 font-medium italic max-w-sm">
                AI: {aiCommentary}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
