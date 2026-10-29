import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trophy, Medal, ArrowUpDown, Database, RefreshCw, Globe, Smartphone } from 'lucide-react';
import { LeaderboardEntry } from '../types';
import { sound } from '../services/sound';
import { MongoApiService } from '../services/mongoApi';

interface LeaderboardModalProps {
  isOpen: boolean;
  entries: LeaderboardEntry[];
  onClose: () => void;
}

type SortField = 'score' | 'wins' | 'winRate' | 'bestStreak';
type ViewSource = 'all' | 'mongodb' | 'local';

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ isOpen, entries, onClose }) => {
  const [sortBy, setSortBy] = useState<SortField>('score');
  const [source, setSource] = useState<ViewSource>('all');
  const [mongoEntries, setMongoEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoadingMongo, setIsLoadingMongo] = useState(false);

  const fetchMongoScores = async () => {
    setIsLoadingMongo(true);
    try {
      const remote = await MongoApiService.getLeaderboard(50);
      setMongoEntries(remote);
    } catch {
      // handled
    } finally {
      setIsLoadingMongo(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMongoScores();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Determine active entries based on source
  let combined: LeaderboardEntry[] = [];
  if (source === 'mongodb') {
    combined = mongoEntries;
  } else if (source === 'local') {
    combined = entries;
  } else {
    // Merge deduplicating by id
    const map = new Map<string, LeaderboardEntry>();
    entries.forEach((e) => map.set(e.id || `${e.playerName}_${e.score}`, e));
    mongoEntries.forEach((e) => map.set(e.id || `${e.playerName}_${e.score}`, e));
    combined = Array.from(map.values());
  }

  const sortedEntries = [...combined].sort((a, b) => {
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
          <div className="flex items-center justify-between mb-6 pr-8">
            <div className="flex items-center gap-3">
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

            {/* MongoDB Sync indicator */}
            <button
              id="btn-refresh-mongo-leaderboard"
              onClick={fetchMongoScores}
              disabled={isLoadingMongo}
              title="Refresh from MongoDB"
              className="p-2 rounded-xl bg-slate-950/80 border border-emerald-500/40 text-emerald-300 hover:text-white text-xs font-orbitron flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingMongo ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">MongoDB Sync</span>
            </button>
          </div>

          {/* Source Filter (All / MongoDB / Local) */}
          <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-orbitron">
              <button
                id="filter-source-all"
                onClick={() => {
                  sound.playButtonClick();
                  setSource('all');
                }}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                  source === 'all' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40' : 'text-slate-400'
                }`}
              >
                <Globe className="w-3 h-3" />
                <span>COMBINED</span>
              </button>
              <button
                id="filter-source-mongodb"
                onClick={() => {
                  sound.playButtonClick();
                  setSource('mongodb');
                }}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                  source === 'mongodb' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40' : 'text-slate-400'
                }`}
              >
                <Database className="w-3 h-3 text-emerald-400" />
                <span>MONGODB CLOUD</span>
              </button>
              <button
                id="filter-source-local"
                onClick={() => {
                  sound.playButtonClick();
                  setSource('local');
                }}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                  source === 'local' ? 'bg-purple-500/20 text-purple-300 border border-purple-400/40' : 'text-slate-400'
                }`}
              >
                <Smartphone className="w-3 h-3 text-purple-400" />
                <span>LOCAL DEVICE</span>
              </button>
            </div>

            {/* Sort Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <span className="text-[11px] font-bold font-orbitron text-slate-500 mr-1 flex items-center gap-1">
                <ArrowUpDown className="w-3 h-3" /> SORT:
              </span>
              {[
                { id: 'score', label: 'Score' },
                { id: 'wins', label: 'Wins' },
                { id: 'winRate', label: 'Win Rate' },
                { id: 'bestStreak', label: 'Streak' },
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
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold font-orbitron whitespace-nowrap transition-all cursor-pointer ${
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
          </div>

          {/* Leaderboard Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/70">
            {sortedEntries.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500 font-orbitron">
                NO LEADERBOARD SCORES FOUND FOR SELECTED SOURCE.
              </div>
            ) : (
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
                      key={entry.id || idx}
                      className={`hover:bg-slate-900/60 transition-colors ${
                        idx === 0 ? 'bg-amber-500/5' : ''
                      }`}
                    >
                      <td className="py-3 px-4">{getRankBadge(idx)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{entry.avatar}</span>
                          <div>
                            <div className="font-bold font-orbitron text-slate-200 flex items-center gap-1.5">
                              <span>{entry.playerName}</span>
                              {entry.id?.startsWith('mock_') || entry.id?.startsWith('remote_') ? (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 font-mono">
                                  CLOUD
                                </span>
                              ) : null}
                            </div>
                            <div className="text-[10px] text-slate-500 uppercase">
                              {entry.difficulty} • {entry.gameMode?.replace('_', ' ')}
                            </div>
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
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
