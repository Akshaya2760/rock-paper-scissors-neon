import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Shield, Sparkles, Check, Edit3, Award } from 'lucide-react';
import { PlayerProfile, PlayerStats } from '../types';
import { sound } from '../services/sound';

interface ProfileModalProps {
  isOpen: boolean;
  profile: PlayerProfile;
  stats: PlayerStats;
  onClose: () => void;
  onUpdateName: (newName: string) => void;
}

const LEVEL_TITLES: Record<number, string> = {
  1: 'Rookie',
  2: 'Fighter',
  3: 'Challenger',
  4: 'Expert',
  5: 'Master',
  6: 'Legend',
};

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  profile,
  stats,
  onClose,
  onUpdateName,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profile.name);

  if (!isOpen) return null;

  const levelTitle = LEVEL_TITLES[profile.level] || 'Champion';
  const xpPct = Math.min(100, Math.round((profile.xp / profile.maxXp) * 100));
  const winRate = stats.totalGames > 0 ? Math.round((stats.totalWins / stats.totalGames) * 100) : 0;

  const handleSaveName = () => {
    if (nameInput.trim()) {
      onUpdateName(nameInput.trim());
      setIsEditingName(false);
      sound.playButtonClick();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg my-6 rounded-3xl bg-slate-900 border border-cyan-500/40 neon-glow-cyan shadow-2xl p-6 sm:p-8 text-slate-100 max-h-[90vh] overflow-y-auto"
        >
          {/* Close button */}
          <button
            id="btn-close-profile"
            onClick={() => {
              sound.playButtonClick();
              onClose();
            }}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Profile Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-cyan-900/50 via-slate-900 to-purple-900/50 border-2 border-cyan-400 flex items-center justify-center text-5xl neon-glow-cyan shadow-xl mb-3">
              {profile.avatar}
            </div>

            {/* Editable Name */}
            {isEditingName ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  maxLength={18}
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-slate-950 border border-cyan-400 text-slate-100 font-orbitron font-bold text-base focus:outline-none"
                  autoFocus
                />
                <button
                  id="btn-save-profile-name"
                  onClick={handleSaveName}
                  className="p-2 rounded-lg bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-1">
                <h2 className="text-2xl font-black font-orbitron text-slate-100">{profile.name}</h2>
                <button
                  id="btn-edit-profile-name"
                  onClick={() => setIsEditingName(true)}
                  className="p-1 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
                  title="Rename"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Level & Title */}
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 font-bold font-orbitron text-xs uppercase tracking-widest">
              <span>LVL {profile.level}</span>
              <span>•</span>
              <span>{levelTitle}</span>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="mb-6 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="flex justify-between items-center text-xs font-bold font-orbitron mb-2">
              <span className="text-cyan-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                COMBAT EXPERIENCE (XP)
              </span>
              <span className="text-slate-300">
                {profile.xp} / {profile.maxXp} XP ({xpPct}%)
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpPct}%` }}
                transition={{ duration: 0.8 }}
                className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 neon-glow-cyan"
              />
            </div>
          </div>

          {/* Player Combat Record Bento */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
              <div className="text-[10px] font-bold font-orbitron text-slate-400">TOTAL SCORE</div>
              <div className="text-lg font-black font-orbitron text-amber-400">{stats.totalScore}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
              <div className="text-[10px] font-bold font-orbitron text-slate-400">WINS</div>
              <div className="text-lg font-black font-orbitron text-cyan-300">{stats.totalWins}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
              <div className="text-[10px] font-bold font-orbitron text-slate-400">WIN RATE</div>
              <div className="text-lg font-black font-orbitron text-purple-400">{winRate}%</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
              <div className="text-[10px] font-bold font-orbitron text-slate-400">BEST STREAK</div>
              <div className="text-lg font-black font-orbitron text-pink-400">{stats.bestWinStreak}🔥</div>
            </div>
          </div>

          {/* Power-up Inventory Status */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
            <h3 className="text-xs font-bold font-orbitron text-cyan-400 uppercase tracking-wider mb-3">
              POWER-UP ARSENAL
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg bg-slate-900 border border-purple-500/30">
                <div className="text-lg">🔮</div>
                <div className="font-bold font-orbitron text-purple-300 mt-0.5">PREDICT</div>
                <div className="text-[10px] text-slate-400">x{profile.powerUps.predict} charges</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-amber-500/30">
                <div className="text-lg">⚡</div>
                <div className="font-bold font-orbitron text-amber-300 mt-0.5">2X SCORE</div>
                <div className="text-[10px] text-slate-400">x{profile.powerUps.double_score} charges</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-cyan-500/30">
                <div className="text-lg">🛡</div>
                <div className="font-bold font-orbitron text-cyan-300 mt-0.5">SHIELD</div>
                <div className="text-[10px] text-slate-400">x{profile.powerUps.shield} charges</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-pink-500/30">
                <div className="text-lg">🎲</div>
                <div className="font-bold font-orbitron text-pink-300 mt-0.5">REROLL</div>
                <div className="text-[10px] text-slate-400">x{profile.powerUps.reroll} charges</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
