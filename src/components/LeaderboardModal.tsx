import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trophy, Medal, ArrowUpDown } from 'lucide-react';
import { LeaderboardEntry } from '../types';
import { sound } from '../services/sound';

interface LeaderboardModalProps {
  isOpen: boolean;
  entries: LeaderboardEntry[];
  onClose: () => void;
}

type SortField = 'score' | 'wins' | 'winRate' | 'bestStreak';

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ isOpen, entries, onClose }) => {
  const [sortBy, setSortBy] = useState<SortField>('score');

  if (!isOpen) return null;

  const sortedEntries = [...entries].sort((a, b) => {
    return b[sortBy] - a[sortBy];
  });

  const getRankBadge = (idx: number) => {
    if (idx === 0) return <span className="text-amber-400 font-black font-orbitron">🥇 #1</span>;
    if (idx === 1) return <span className="text-slate-300 font-black font-orbitron">🥈 #2</span>;
    if (idx === 2) return <span className="text-amber-600 font-black font-orbitron">🥉 #3</span>;
    return <span className="text-slate-500 font-bold font-orbitron">#{idx + 1}</span>;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl my-6 rounded-3xl bg-slate-900 border border-cyan-500/40 neon-glow-cyan shadow-2xl p-6 sm:p-8 text-slate-100 max-h-[90vh] overflow-y-auto"
        >
          {/* Close button */}
          <button
            id="btn-close-leaderboard"
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
            <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                HALL OF CHAMPIONS
              </h2>
              <p className="text-xs text-slate-400 font-medium">Top arena warriors and high score records</p>
            </div>
          </div>

          {/* Sort Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4">
            <span className="text-xs font-bold font-orbitron text-slate-400 mr-2 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" /> SORT:
            </span>
            {[
              { id: 'score', label: 'Highest Score' },
              { id: 'wins', label: 'Most Wins' },
              { id: 'winRate', label: 'Best Win Rate' },
              { id: 'bestStreak', label: 'Longest Streak' },
            ].map((tab) => {
              const active = sortBy === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`btn-sort-${tab.id}`}
                  onClick={() => {
                    sound.playButtonClick();
                    setSortBy(tab.id as SortField);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold font-orbitron whitespace-nowrap transition-all cursor-pointer ${
                    active
                      ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300 neon-glow-cyan'
                      : 'bg-slate-950/60 border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Leaderboard Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/70">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-black font-orbitron text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Player</th>
                  <th className="py-3 px-4 text-right">Score</th>
                  <th className="py-3 px-4 text-right">Wins</th>
                  <th className="py-3 px-4 text-right">Win Rate</th>
                  <th className="py-3 px-4 text-right">Streak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs font-medium">
                {sortedEntries.map((entry, idx) => (
                  <tr
                    key={entry.id}
                    className={`hover:bg-slate-900/60 transition-colors ${
                      idx === 0 ? 'bg-amber-500/5' : ''
                    }`}
                  >
                    <td className="py-3 px-4">{getRankBadge(idx)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{entry.avatar}</span>
                        <div>
                          <div className="font-bold font-orbitron text-slate-200">{entry.playerName}</div>
                          <div className="text-[10px] text-slate-500 uppercase">{entry.difficulty} • {entry.gameMode.replace('_', ' ')}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-black font-orbitron text-amber-400">
                      {entry.score.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-bold font-orbitron text-cyan-300">
                      {entry.wins}
                    </td>
                    <td className="py-3 px-4 text-right font-bold font-orbitron text-slate-300">
                      {entry.winRate}%
                    </td>
                    <td className="py-3 px-4 text-right font-bold font-orbitron text-pink-400">
                      {entry.bestStreak}🔥
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
