import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trophy, CheckCircle2, Lock } from 'lucide-react';
import { Achievement } from '../types';
import { sound } from '../services/sound';

interface AchievementsModalProps {
  isOpen: boolean;
  achievements: Achievement[];
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  achievements,
  onClose,
}) => {
  if (!isOpen) return null;

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-xl my-6 rounded-3xl bg-slate-900 border border-amber-500/40 neon-glow-amber shadow-2xl p-6 sm:p-8 text-slate-100 max-h-[90vh] overflow-y-auto"
        >
          {/* Close button */}
          <button
            id="btn-close-achievements"
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
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-200">
                  ACHIEVEMENTS
                </h2>
                <p className="text-xs text-slate-400 font-medium">Honor medals and milestones</p>
              </div>
            </div>

            {/* Unlocked Counter Badge */}
            <div className="px-3.5 py-1.5 rounded-xl bg-slate-950/80 border border-amber-500/40 text-amber-300 text-xs font-bold font-orbitron">
              {unlockedCount} / {achievements.length} UNLOCKED
            </div>
          </div>

          {/* Achievements List */}
          <div className="space-y-3">
            {achievements.map((ach) => {
              return (
                <div
                  key={ach.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                    ach.unlocked
                      ? 'bg-amber-950/20 border-amber-500/50 neon-glow-amber shadow-md'
                      : 'bg-slate-950/60 border-slate-800/80 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
                        ach.unlocked
                          ? 'bg-amber-500/20 border border-amber-400/80 text-amber-300'
                          : 'bg-slate-900 border border-slate-800 text-slate-600'
                      }`}
                    >
                      {ach.unlocked ? ach.icon : <Lock className="w-5 h-5 text-slate-600" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-black font-orbitron tracking-wider ${
                            ach.unlocked ? 'text-amber-300' : 'text-slate-400'
                          }`}
                        >
                          {ach.title}
                        </span>
                        {ach.unlocked && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{ach.description}</p>
                    </div>
                  </div>

                  {/* Status / Date */}
                  <div className="text-right shrink-0">
                    {ach.unlocked ? (
                      <span className="text-[10px] font-bold font-orbitron text-emerald-400 block uppercase tracking-wider">
                        COMPLETED
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold font-orbitron text-slate-500 block uppercase tracking-wider">
                        LOCKED
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
