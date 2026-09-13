import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Skull, RotateCcw, SlidersHorizontal, Home, Zap, Flame, Award } from 'lucide-react';
import { MatchSummary } from '../types';
import { sound } from '../services/sound';

interface MatchResultModalProps {
  summary: MatchSummary | null;
  onPlayAgain: () => void;
  onChangeMode: () => void;
  onMainMenu: () => void;
}

export const MatchResultModal: React.FC<MatchResultModalProps> = ({
  summary,
  onPlayAgain,
  onChangeMode,
  onMainMenu,
}) => {
  if (!summary) return null;

  const winRate = summary.totalRounds > 0 ? Math.round((summary.playerWins / summary.totalRounds) * 100) : 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 20 }}
          className={`relative w-full max-w-lg my-6 rounded-3xl p-6 sm:p-8 text-center text-slate-100 shadow-2xl border ${
            summary.isVictory
              ? 'bg-gradient-to-b from-slate-900 to-slate-950 border-cyan-400 neon-glow-cyan'
              : 'bg-gradient-to-b from-slate-900 to-slate-950 border-rose-600/80 shadow-rose-900/30'
          }`}
        >
          {/* Main Title Badge */}
          <motion.div
            initial={{ scale: 0.7 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 10 }}
            className="mb-4 inline-flex items-center justify-center"
          >
            {summary.isVictory ? (
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-3xl bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center text-4xl neon-glow-cyan shadow-xl mb-3">
                  <Trophy className="w-10 h-10 text-cyan-300" />
                </div>
                <h2 className="text-3xl sm:text-4xl font-black font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-300 to-emerald-400 tracking-wider">
                  ARENA VICTORY
                </h2>
                <p className="text-xs text-cyan-300/80 font-bold font-orbitron tracking-widest mt-1">
                  AI DEFENSES DECIMATED
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-3xl bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center text-4xl shadow-xl mb-3">
                  <Skull className="w-10 h-10 text-rose-400" />
                </div>
                <h2 className="text-3xl sm:text-4xl font-black font-orbitron text-rose-400 tracking-wider">
                  MATCH DEFEAT
                </h2>
                <p className="text-xs text-rose-300/80 font-bold font-orbitron tracking-widest mt-1">
                  AI OUTMANEUVERED YOUR PATTERN
                </p>
              </div>
            )}
          </motion.div>

          {/* Opponent score breakdown */}
          <div className="grid grid-cols-3 items-center py-3 my-3 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="flex flex-col items-center">
              <span className="text-2xl">{summary.avatar}</span>
              <span className="text-xs font-bold font-orbitron text-slate-300 mt-1 truncate max-w-[80px]">
                {summary.playerName}
              </span>
              <span className="text-xl font-black font-orbitron text-cyan-400">{summary.playerWins} WINS</span>
            </div>

            <div className="text-sm font-black font-orbitron text-slate-500">
              VS
              <div className="text-[10px] text-slate-400 font-normal">({summary.draws} DRAWS)</div>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-2xl">🤖</span>
              <span className="text-xs font-bold font-orbitron text-slate-300 mt-1">AI</span>
              <span className="text-xl font-black font-orbitron text-purple-400">{summary.aiWins} WINS</span>
            </div>
          </div>

          {/* Final Score Highlight */}
          <div className="my-4 py-3 rounded-2xl bg-gradient-to-r from-cyan-950/50 via-purple-950/50 to-pink-950/50 border border-slate-700/60">
            <div className="text-xs font-extrabold font-orbitron text-slate-400 uppercase tracking-widest">
              FINAL SCORE
            </div>
            <div className="text-4xl font-black font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.6)]">
              {summary.finalScore}
            </div>
            <div className="text-xs font-bold text-cyan-400 font-orbitron mt-1">
              +{summary.xpGained} XP EARNED
            </div>
          </div>

          {/* Stats Bento Grid */}
          <div className="grid grid-cols-4 gap-2 my-4 text-center">
            <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-[10px] text-slate-400 font-bold font-orbitron">ACCURACY</div>
              <div className="text-sm sm:text-base font-black font-orbitron text-slate-100">{winRate}%</div>
            </div>

            <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-[10px] text-slate-400 font-bold font-orbitron">BEST STREAK</div>
              <div className="text-sm sm:text-base font-black font-orbitron text-amber-400">{summary.bestStreak}</div>
            </div>

            <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-[10px] text-slate-400 font-bold font-orbitron">MAX COMBO</div>
              <div className="text-sm sm:text-base font-black font-orbitron text-pink-400">x{summary.highestCombo}</div>
            </div>

            <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-[10px] text-slate-400 font-bold font-orbitron">ROUNDS</div>
              <div className="text-sm sm:text-base font-black font-orbitron text-slate-100">{summary.totalRounds}</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2.5 mt-6">
            <button
              id="btn-result-play-again"
              onClick={() => {
                sound.playGoSound();
                onPlayAgain();
              }}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-500 text-slate-950 font-black font-orbitron tracking-wider text-base hover:neon-glow-cyan transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-5 h-5" />
              <span>PLAY AGAIN</span>
            </button>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                id="btn-result-change-mode"
                onClick={() => {
                  sound.playButtonClick();
                  onChangeMode();
                }}
                className="py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-purple-400 hover:text-purple-300 text-slate-300 font-bold font-orbitron text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>CHANGE MODE</span>
              </button>

              <button
                id="btn-result-main-menu"
                onClick={() => {
                  sound.playButtonClick();
                  onMainMenu();
                }}
                className="py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 hover:text-cyan-300 text-slate-300 font-bold font-orbitron text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>MAIN MENU</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
