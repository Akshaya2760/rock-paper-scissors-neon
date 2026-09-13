import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play, ShieldAlert, Cpu, Swords, Flame, Sparkles } from 'lucide-react';
import { Difficulty, GameMode, PlayerProfile } from '../types';
import { sound } from '../services/sound';

interface PlayerSetupModalProps {
  isOpen: boolean;
  profile: PlayerProfile;
  initialDifficulty: Difficulty;
  onClose: () => void;
  onLaunchMatch: (config: {
    playerName: string;
    avatar: string;
    difficulty: Difficulty;
    gameMode: GameMode;
  }) => void;
}

const AVATARS = ['⚡', '🤖', '👾', '🦊', '🥷', '👑', '🚀', '🐉', '🔮', '💀'];

const DIFFICULTIES: { id: Difficulty; label: string; dotColor: string; description: string; badge: string }[] = [
  {
    id: 'easy',
    label: 'EASY',
    dotColor: 'bg-emerald-400',
    description: 'Mostly random selections. Perfect for warm-up.',
    badge: '🟢 CASUAL',
  },
  {
    id: 'normal',
    label: 'NORMAL',
    dotColor: 'bg-yellow-400',
    description: 'Balanced opponent with occasional tactical counters.',
    badge: '🟡 BALANCED',
  },
  {
    id: 'hard',
    label: 'HARD',
    dotColor: 'bg-rose-500',
    description: 'Analyzes sequence transitions & historical patterns.',
    badge: '🔴 TACTICAL',
  },
  {
    id: 'master',
    label: 'MASTER',
    dotColor: 'bg-purple-500',
    description: 'Heuristic psychology engine: predicts win-stay/lose-shift.',
    badge: '🟣 ADAPTIVE',
  },
];

const GAME_MODES: { id: GameMode; label: string; icon: string; description: string; detail: string }[] = [
  {
    id: 'best_of_3',
    label: 'BEST OF 3',
    icon: '⚡',
    description: 'First to 2 wins',
    detail: 'Fast competitive showdown',
  },
  {
    id: 'best_of_5',
    label: 'BEST OF 5',
    icon: '🏆',
    description: 'First to 3 wins',
    detail: 'Tournament championship format',
  },
  {
    id: 'classic',
    label: 'CLASSIC',
    icon: '⚔️',
    description: 'Continuous rounds',
    detail: 'Play freely until you decide to exit',
  },
  {
    id: 'endless',
    label: 'ENDLESS',
    icon: '♾️',
    description: '3 Lives Survival',
    detail: 'How high can your score climb?',
  },
  {
    id: 'challenge',
    label: 'CHALLENGE',
    icon: '🔥',
    description: 'Escalating AI',
    detail: 'AI gets smarter every 5 rounds with modifiers',
  },
];

export const PlayerSetupModal: React.FC<PlayerSetupModalProps> = ({
  isOpen,
  profile,
  initialDifficulty,
  onClose,
  onLaunchMatch,
}) => {
  const [name, setName] = useState(profile.name || 'CYBER_WARRIOR');
  const [avatar, setAvatar] = useState(profile.avatar || '⚡');
  const [difficulty, setDifficulty] = useState<Difficulty>(initialDifficulty);
  const [gameMode, setGameMode] = useState<GameMode>('best_of_5');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = name.trim() || 'WARRIOR';
    sound.playGoSound();
    onLaunchMatch({
      playerName: finalName,
      avatar,
      difficulty,
      gameMode,
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-xl my-6 rounded-3xl bg-slate-900 border border-cyan-500/40 neon-glow-cyan shadow-2xl p-6 sm:p-8 text-slate-100 max-h-[90vh] overflow-y-auto"
        >
          {/* Close button */}
          <button
            id="btn-close-setup"
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
              <Swords className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                MATCH CONFIGURATION
              </h2>
              <p className="text-xs text-slate-400 font-medium">Equip your warrior and set arena parameters</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Player Name */}
            <div>
              <label htmlFor="input-player-name" className="block text-xs font-bold uppercase tracking-wider text-cyan-400 font-orbitron mb-2">
                Enter Player Name
              </label>
              <input
                id="input-player-name"
                type="text"
                maxLength={18}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="WARRIOR_NAME"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 text-slate-100 font-rajdhani text-lg font-bold tracking-wide transition-all"
              />
            </div>

            {/* Avatar Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-cyan-400 font-orbitron mb-2">
                Select Combat Avatar
              </label>
              <div className="grid grid-cols-5 gap-2.5">
                {AVATARS.map((av) => {
                  const isSelected = avatar === av;
                  return (
                    <button
                      key={av}
                      type="button"
                      id={`avatar-select-${av}`}
                      onClick={() => {
                        setAvatar(av);
                        sound.playButtonClick();
                      }}
                      className={`h-12 rounded-xl text-2xl flex items-center justify-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-500/20 border-2 border-cyan-400 neon-glow-cyan scale-105'
                          : 'bg-slate-950/70 border border-slate-800 hover:border-slate-600 hover:bg-slate-800/60'
                      }`}
                    >
                      {av}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Difficulty Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-purple-400 font-orbitron mb-2">
                Choose AI Difficulty
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {DIFFICULTIES.map((d) => {
                  const isSelected = difficulty === d.id;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      id={`difficulty-${d.id}`}
                      onClick={() => {
                        setDifficulty(d.id);
                        sound.playButtonClick();
                      }}
                      className={`p-3 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-purple-950/40 border-purple-400 neon-glow-purple shadow-lg'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold font-orbitron tracking-wider text-slate-100">
                          {d.label}
                        </span>
                        <span className={`w-2.5 h-2.5 rounded-full ${d.dotColor} ${isSelected ? 'animate-ping' : ''}`} />
                      </div>
                      <p className="text-[11px] text-slate-400 leading-tight">{d.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Game Mode Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-pink-400 font-orbitron mb-2">
                Choose Game Mode
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {GAME_MODES.slice(0, 3).map((m) => {
                  const isSelected = gameMode === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      id={`gamemode-${m.id}`}
                      onClick={() => {
                        setGameMode(m.id);
                        sound.playButtonClick();
                      }}
                      className={`p-3 rounded-xl text-center border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-pink-950/40 border-pink-400 neon-glow-pink'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-2xl mb-1">{m.icon}</div>
                      <div className="text-xs font-black font-orbitron text-slate-100">{m.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{m.description}</div>
                    </button>
                  );
                })}
              </div>

              {/* Endless & Challenge */}
              <div className="grid grid-cols-2 gap-2.5 mt-2.5">
                {GAME_MODES.slice(3).map((m) => {
                  const isSelected = gameMode === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      id={`gamemode-${m.id}`}
                      onClick={() => {
                        setGameMode(m.id);
                        sound.playButtonClick();
                      }}
                      className={`p-3 rounded-xl text-left border transition-all cursor-pointer flex items-center gap-3 ${
                        isSelected
                          ? 'bg-cyan-950/40 border-cyan-400 neon-glow-cyan'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-2xl">{m.icon}</div>
                      <div>
                        <div className="text-xs font-black font-orbitron text-slate-100">{m.label}</div>
                        <div className="text-[10px] text-slate-400 leading-tight">{m.description}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Launch Button */}
            <motion.button
              id="btn-launch-match"
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 text-slate-950 font-black font-orbitron text-lg tracking-widest shadow-xl hover:shadow-cyan-500/40 hover:neon-glow-cyan transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current text-slate-950" />
              <span>ENTER THE ARENA</span>
            </motion.button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
