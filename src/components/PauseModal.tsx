import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RotateCcw, Settings, Home, Pause } from 'lucide-react';
import { sound } from '../services/sound';

interface PauseModalProps {
  isOpen: boolean;
  onResume: () => void;
  onRestart: () => void;
  onOpenSettings: () => void;
  onMainMenu: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  isOpen,
  onResume,
  onRestart,
  onOpenSettings,
  onMainMenu,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-cyan-500/40 neon-glow-cyan shadow-2xl p-6 sm:p-8 text-center text-slate-100"
        >
          {/* Pause Icon */}
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-cyan-500/15 border border-cyan-400 flex items-center justify-center text-cyan-400 neon-glow-cyan">
            <Pause className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-black font-orbitron text-slate-100 mb-1">
            BATTLE SUSPENDED
          </h2>
          <p className="text-xs text-slate-400 mb-6 font-medium">Neural arena timer frozen</p>

          <div className="space-y-3">
            {/* Resume Button */}
            <button
              id="btn-pause-resume"
              onClick={() => {
                sound.playButtonClick();
                onResume();
              }}
              className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black font-orbitron text-sm tracking-wider neon-glow-cyan transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current text-slate-950" />
              <span>RESUME COMBAT</span>
            </button>

            {/* Restart Match */}
            <button
              id="btn-pause-restart"
              onClick={() => {
                sound.playButtonClick();
                onRestart();
              }}
              className="w-full py-3 rounded-xl bg-slate-950/80 border border-slate-700 hover:border-cyan-400 text-slate-200 font-bold font-orbitron text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-cyan-400" />
              <span>RESTART MATCH</span>
            </button>

            {/* Settings */}
            <button
              id="btn-pause-settings"
              onClick={() => {
                sound.playButtonClick();
                onOpenSettings();
              }}
              className="w-full py-3 rounded-xl bg-slate-950/80 border border-slate-700 hover:border-purple-400 text-slate-200 font-bold font-orbitron text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Settings className="w-4 h-4 text-purple-400" />
              <span>SETTINGS</span>
            </button>

            {/* Main Menu */}
            <button
              id="btn-pause-main-menu"
              onClick={() => {
                sound.playButtonClick();
                onMainMenu();
              }}
              className="w-full py-3 rounded-xl bg-slate-950/80 border border-slate-700 hover:border-pink-400 text-slate-200 font-bold font-orbitron text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Home className="w-4 h-4 text-pink-400" />
              <span>EXIT TO MAIN MENU</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
