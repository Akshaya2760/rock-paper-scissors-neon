import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, BarChart3, TrendingUp, Flame, Zap, Award } from 'lucide-react';
import { PlayerStats } from '../types';
import { sound } from '../services/sound';

interface StatisticsModalProps {
  isOpen: boolean;
  stats: PlayerStats;
  onClose: () => void;
}

export const StatisticsModal: React.FC<StatisticsModalProps> = ({ isOpen, stats, onClose }) => {
  if (!isOpen) return null;

  const totalMoves = stats.rockUsed + stats.paperUsed + stats.scissorsUsed;
  const rockPct = totalMoves > 0 ? Math.round((stats.rockUsed / totalMoves) * 100) : 33;
  const paperPct = totalMoves > 0 ? Math.round((stats.paperUsed / totalMoves) * 100) : 33;
  const scissorsPct = totalMoves > 0 ? Math.round((stats.scissorsUsed / totalMoves) * 100) : 34;

  const winRate = stats.totalGames > 0 ? Math.round((stats.totalWins / stats.totalGames) * 100) : 0;

  // Determine most used move
  let mostUsedMove = 'None';
  if (totalMoves > 0) {
    if (stats.rockUsed >= stats.paperUsed && stats.rockUsed >= stats.scissorsUsed) {
      mostUsedMove = 'Rock 🪨';
    } else if (stats.paperUsed >= stats.scissorsUsed) {
      mostUsedMove = 'Paper 📄';
    } else {
      mostUsedMove = 'Scissors ✂️';
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-xl my-6 rounded-3xl bg-slate-900 border border-purple-500/40 neon-glow-purple shadow-2xl p-6 sm:p-8 text-slate-100 max-h-[90vh] overflow-y-auto"
        >
          {/* Close button */}
          <button
            id="btn-close-statistics"
            onClick={() => {
              sound.playButtonClick();
              onClose();
            }}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                COMBAT STATISTICS
              </h2>
              <p className="text-xs text-slate-400 font-medium">Telemetry and historical combat performance</p>
            </div>
          </div>

          {/* High-Level Numbers Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div className="text-[10px] font-bold font-orbitron text-slate-400">TOTAL MATCHES</div>
              <div className="text-xl sm:text-2xl font-black font-orbitron text-slate-100">{stats.totalGames}</div>
              <div className="text-[10px] text-slate-500">{stats.totalWins}W - {stats.totalLosses}L - {stats.totalDraws}D</div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div className="text-[10px] font-bold font-orbitron text-slate-400">WIN RATE</div>
              <div className="text-xl sm:text-2xl font-black font-orbitron text-cyan-400">{winRate}%</div>
              <div className="text-[10px] text-cyan-500/80">Victory Ratio</div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div className="text-[10px] font-bold font-orbitron text-slate-400">BEST STREAK</div>
              <div className="text-xl sm:text-2xl font-black font-orbitron text-amber-400">{stats.bestWinStreak}</div>
              <div className="text-[10px] text-amber-500/80">Consecutive Wins</div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div className="text-[10px] font-bold font-orbitron text-slate-400">TOTAL SCORE</div>
              <div className="text-xl sm:text-2xl font-black font-orbitron text-purple-400">{stats.totalScore}</div>
              <div className="text-[10px] text-purple-500/80">Max Combo x{stats.highestCombo}</div>
            </div>
          </div>

          {/* Animated Move Distribution Charts */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800 mb-6">
            <h3 className="text-xs font-bold font-orbitron text-cyan-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span>MOVE FREQUENCY ANALYSIS</span>
              <span className="text-slate-500 font-mono text-[10px]">({totalMoves} total moves)</span>
            </h3>

            <div className="space-y-4">
              {/* Rock Bar */}
              <div>
                <div className="flex justify-between text-xs font-bold font-orbitron mb-1.5">
                  <span className="text-cyan-300 flex items-center gap-1.5">
                    <span>🪨 ROCK</span>
                    <span className="text-[10px] text-slate-400">({stats.rockUsed})</span>
                  </span>
                  <span className="text-cyan-400">{rockPct}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${rockPct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 neon-glow-cyan"
                  />
                </div>
              </div>

              {/* Paper Bar */}
              <div>
                <div className="flex justify-between text-xs font-bold font-orbitron mb-1.5">
                  <span className="text-purple-300 flex items-center gap-1.5">
                    <span>📄 PAPER</span>
                    <span className="text-[10px] text-slate-400">({stats.paperUsed})</span>
                  </span>
                  <span className="text-purple-400">{paperPct}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${paperPct}%` }}
                    transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-purple-600 to-purple-400 neon-glow-purple"
                  />
                </div>
              </div>

              {/* Scissors Bar */}
              <div>
                <div className="flex justify-between text-xs font-bold font-orbitron mb-1.5">
                  <span className="text-pink-300 flex items-center gap-1.5">
                    <span>✂️ SCISSORS</span>
                    <span className="text-[10px] text-slate-400">({stats.scissorsUsed})</span>
                  </span>
                  <span className="text-pink-400">{scissorsPct}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${scissorsPct}%` }}
                    transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-pink-600 to-pink-400 neon-glow-pink"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tactical Insights Bento */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-[10px] font-bold font-orbitron text-slate-400">MOST USED MOVE</div>
              <div className="text-sm font-black font-orbitron text-slate-100 mt-1">{mostUsedMove}</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-[10px] font-bold font-orbitron text-slate-400">AI PREDICTION READS</div>
              <div className="text-sm font-black font-orbitron text-emerald-400 mt-1">{stats.mindReaderCount} times</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-[10px] font-bold font-orbitron text-slate-400">LONGEST WIN STREAK</div>
              <div className="text-sm font-black font-orbitron text-amber-400 mt-1">{stats.bestWinStreak} in a row</div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
