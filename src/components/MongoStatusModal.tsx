import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Database, RefreshCw, CheckCircle2, AlertCircle, Users, Trophy, Swords, Server, ExternalLink, ShieldAlert } from 'lucide-react';
import { MongoApiService, MongoStatus, RemoteMatch } from '../services/mongoApi';
import { PlayerProfile, PlayerStats, LeaderboardEntry } from '../types';
import { sound } from '../services/sound';

interface MongoStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PlayerProfile;
  stats: PlayerStats;
  leaderboard: LeaderboardEntry[];
  onSyncComplete?: () => void;
}

export const MongoStatusModal: React.FC<MongoStatusModalProps> = ({
  isOpen,
  onClose,
  profile,
  stats,
  leaderboard,
  onSyncComplete,
}) => {
  const [status, setStatus] = useState<MongoStatus | null>(null);
  const [recentMatches, setRecentMatches] = useState<RemoteMatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const fetchStatusAndMatches = async () => {
    setIsLoading(true);
    try {
      const [st, matches] = await Promise.all([
        MongoApiService.getStatus(),
        MongoApiService.getRecentMatches(6),
      ]);
      setStatus(st);
      setRecentMatches(matches);
    } catch {
      // handled in service
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatusAndMatches();
    }
  }, [isOpen]);

  const handleRetryConnection = async () => {
    sound.playButtonClick();
    setIsLoading(true);
    setSyncFeedback(null);
    try {
      const res = await MongoApiService.retryConnection();
      setStatus(res.status);
      const matches = await MongoApiService.getRecentMatches(6);
      setRecentMatches(matches);
      if (res.connected) {
        sound.playAchievement();
        setSyncFeedback('Successfully connected to MongoDB Cluster!');
      } else {
        setSyncFeedback('Could not connect. Check MONGODB_URI in .env');
      }
    } catch (err: any) {
      setSyncFeedback(err.message || 'Retry failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncAll = async () => {
    sound.playButtonClick();
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      // 1. Sync Profile & Stats
      await MongoApiService.syncProfile(profile, stats);

      // 2. Sync Top local scores to MongoDB
      for (const entry of leaderboard.slice(0, 5)) {
        await MongoApiService.submitLeaderboardEntry(entry);
      }

      await fetchStatusAndMatches();
      sound.playWin();
      setSyncFeedback('Profile, stats, and leaderboard synced to MongoDB!');
      if (onSyncComplete) onSyncComplete();
    } catch (err: any) {
      setSyncFeedback(err.message || 'Sync failed');
    } finally {
      setIsSyncing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl my-6 rounded-3xl bg-slate-900 border border-emerald-500/40 neon-glow-cyan shadow-2xl p-6 sm:p-8 text-slate-100 max-h-[90vh] overflow-y-auto"
        >
          {/* Close button */}
          <button
            id="btn-close-mongo-status"
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
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                  MONGODB CLOUD DATABASE
                </h2>
                {status?.connected ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-[10px] font-bold font-orbitron text-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> ONLINE
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-[10px] font-bold font-orbitron text-amber-300 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> LOCAL FALLBACK
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-medium">Full-stack persistence for arena players, combat logs, and global leaderboards</p>
            </div>
          </div>

          {/* Feedback banner */}
          {syncFeedback && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-xl bg-slate-950/90 border border-emerald-500/50 text-xs font-bold font-orbitron text-emerald-300 flex items-center justify-between"
            >
              <span>{syncFeedback}</span>
              <button onClick={() => setSyncFeedback(null)} className="text-slate-400 hover:text-white">✕</button>
            </motion.div>
          )}

          {/* Connection Status Bento */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="text-[10px] font-bold font-orbitron text-slate-400 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-cyan-400" />
                DATABASE STATUS
              </div>
              <div className="text-base font-black font-orbitron text-slate-100 mt-1">
                {status?.connected ? 'Cluster Connected' : 'In-Memory Emulation'}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                DB: <span className="font-mono text-cyan-300">{status?.dbName || 'neon_arena'}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="text-[10px] font-bold font-orbitron text-slate-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-purple-400" />
                STORED PLAYERS
              </div>
              <div className="text-2xl font-black font-orbitron text-purple-300 mt-1">
                {status?.counts?.players ?? 0}
              </div>
              <div className="text-[10px] text-slate-500">Profiles in collection</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="text-[10px] font-bold font-orbitron text-slate-400 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                GLOBAL SCORES
              </div>
              <div className="text-2xl font-black font-orbitron text-amber-300 mt-1">
                {status?.counts?.leaderboard ?? 0}
              </div>
              <div className="text-[10px] text-slate-500">Combat records logged</div>
            </div>
          </div>

          {/* MongoDB Cluster URI Info or Setup Guide */}
          {!status?.connected && (
            <div className="mb-6 p-4 rounded-2xl bg-slate-950/90 border border-amber-500/30">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 space-y-1.5">
                  <div className="font-bold font-orbitron text-amber-300">
                    How to connect your MongoDB Atlas / self-hosted cluster:
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    Set <code className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300 font-mono">MONGODB_URI</code> in your environment or <code className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300 font-mono">.env</code>:
                  </p>
                  <pre className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto">
                    MONGODB_URI="mongodb+srv://&lt;username&gt;:&lt;password&gt;@cluster0.mongodb.net/?retryWrites=true&w=majority"
                  </pre>
                  <p className="text-[11px] text-slate-400">
                    The backend automatically connects to the cluster and creates the <code className="text-purple-300">players</code>, <code className="text-amber-300">leaderboard</code>, and <code className="text-pink-300">matches</code> collections.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Live Recent Combat Log from MongoDB */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-bold font-orbitron text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Swords className="w-3.5 h-3.5" />
                LIVE MONGODB COMBAT LOGS ({recentMatches.length})
              </h3>
              <button
                id="btn-refresh-mongo-matches"
                onClick={fetchStatusAndMatches}
                disabled={isLoading}
                className="text-[11px] text-slate-400 hover:text-cyan-300 flex items-center gap-1 font-orbitron cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                REFRESH
              </button>
            </div>

            {recentMatches.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-500 font-orbitron">
                NO RECENT MATCHES LOGGED YET. COMPLETE AN ARENA COMBAT ROUND TO RECORD HERE!
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {recentMatches.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{m.avatar}</span>
                      <div>
                        <div className="font-bold font-orbitron text-slate-200">
                          {m.playerName}
                          <span className={`ml-2 text-[10px] font-black uppercase ${m.isVictory ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {m.isVictory ? 'VICTORY' : 'DEFEAT'}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {m.playerWins}W - {m.aiWins}L • {m.difficulty.toUpperCase()} • {m.gameMode.replace('_', ' ').toUpperCase()}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-black font-orbitron text-amber-400">+{m.finalScore} PTS</div>
                      <div className="text-[10px] text-cyan-400 font-orbitron">+{m.xpGained} XP</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              id="btn-sync-all-mongo"
              onClick={handleSyncAll}
              disabled={isSyncing}
              className="py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 text-slate-950 font-black font-orbitron text-xs tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:brightness-110 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'SYNCING TO CLOUD...' : 'SYNC LOCAL DATA TO MONGODB'}</span>
            </button>

            <button
              id="btn-retry-mongo-conn"
              onClick={handleRetryConnection}
              disabled={isLoading}
              className="py-3 px-4 rounded-xl bg-slate-950/80 border border-slate-700 hover:border-emerald-400 text-slate-200 font-bold font-orbitron text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Database className="w-4 h-4 text-emerald-400" />
              <span>TEST / RECONNECT CLUSTER</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
