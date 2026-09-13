import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, CheckCircle2, Gift, Sparkles, Trophy } from 'lucide-react';
import { DailyChallenge } from '../types';
import { sound } from '../services/sound';

interface DailyChallengeModalProps {
  isOpen: boolean;
  challenge: DailyChallenge;
  onClose: () => void;
  onClaimReward: () => void;
}

export const DailyChallengeModal: React.FC<DailyChallengeModalProps> = ({
  isOpen,
  challenge,
  onClose,
  onClaimReward,
}) => {
  if (!isOpen) return null;

  const pct = Math.min(100, Math.round((challenge.currentCount / challenge.targetCount) * 100));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md my-6 rounded-3xl bg-slate-900 border border-amber-500/40 neon-glow-amber shadow-2xl p-6 sm:p-8 text-slate-100 max-h-[90vh] overflow-y-auto"
        >
          {/* Close button */}
          <button
            id="btn-close-daily"
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
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-200">
                DAILY MISSION
              </h2>
              <p className="text-xs text-slate-400 font-medium">Refreshes every 24 hours ({challenge.date})</p>
            </div>
          </div>

          {/* Mission Card */}
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-black font-orbitron text-amber-300">
                {challenge.title}
              </span>
              {challenge.completed && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold font-orbitron flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> READY
                </span>
              )}
            </div>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed">{challenge.description}</p>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold font-orbitron">
                <span className="text-slate-400">PROGRESS</span>
                <span className="text-amber-400">
                  {challenge.currentCount} / {challenge.targetCount} ({pct}%)
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6 }}
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 neon-glow-amber"
                />
              </div>
            </div>

            {/* Rewards Overview */}
            <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-around text-center">
              <div>
                <div className="text-[10px] text-slate-400 font-bold font-orbitron">EXPERIENCE</div>
                <div className="text-base font-black font-orbitron text-cyan-300">+{challenge.rewardXP} XP</div>
              </div>
              <div className="h-6 w-px bg-slate-800" />
              <div>
                <div className="text-[10px] text-slate-400 font-bold font-orbitron">BONUS POINTS</div>
                <div className="text-base font-black font-orbitron text-amber-400">+{challenge.rewardPoints} PTS</div>
              </div>
            </div>
          </div>

          {/* Action button */}
          {challenge.claimed ? (
            <div className="w-full py-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center text-slate-500 font-bold font-orbitron text-sm">
              REWARD CLAIMED TODAY
            </div>
          ) : challenge.completed ? (
            <button
              id="btn-claim-daily-reward"
              onClick={() => {
                sound.playAchievement();
                onClaimReward();
              }}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black font-orbitron text-base tracking-wider neon-glow-amber flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:brightness-110 transition-all"
            >
              <Gift className="w-5 h-5 text-slate-950" />
              <span>CLAIM REWARD</span>
            </button>
          ) : (
            <div className="w-full py-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center text-slate-400 font-bold font-orbitron text-xs">
              PLAY MATCHES TO COMPLETE THIS MISSION
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
