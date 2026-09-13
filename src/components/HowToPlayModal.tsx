import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, HelpCircle, Flame, Eye, Zap, Shield, Keyboard } from 'lucide-react';
import { sound } from '../services/sound';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-xl my-6 rounded-3xl bg-slate-900 border border-cyan-500/40 neon-glow-cyan shadow-2xl p-6 sm:p-8 text-slate-100 max-h-[90vh] overflow-y-auto"
        >
          {/* Close button */}
          <button
            id="btn-close-howtoplay"
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
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                ARENA COMBAT MANUAL
              </h2>
              <p className="text-xs text-slate-400 font-medium">Rules of engagement & tactical systems</p>
            </div>
          </div>

          {/* Triad Rules Diagram */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800 mb-6">
            <h3 className="text-xs font-bold font-orbitron text-cyan-400 uppercase tracking-wider mb-3">
              THE TRIAD COMBAT MATRIX
            </h3>

            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="p-3 rounded-xl bg-slate-900/90 border border-cyan-500/40">
                <div className="text-3xl mb-1">🪨</div>
                <div className="text-xs font-black font-orbitron text-cyan-300">ROCK</div>
                <div className="text-[11px] text-slate-400 mt-1">Crushes ✂️ Scissors</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-purple-500/40">
                <div className="text-3xl mb-1">📄</div>
                <div className="text-xs font-black font-orbitron text-purple-300">PAPER</div>
                <div className="text-[11px] text-slate-400 mt-1">Covers 🪨 Rock</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-pink-500/40">
                <div className="text-3xl mb-1">✂️</div>
                <div className="text-xs font-black font-orbitron text-pink-300">SCISSORS</div>
                <div className="text-[11px] text-slate-400 mt-1">Cuts 📄 Paper</div>
              </div>
            </div>
          </div>

          {/* Systems Overview */}
          <div className="space-y-4 mb-6 text-xs text-slate-300 leading-relaxed">
            {/* Combo System */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold font-orbitron text-amber-300 text-sm mb-0.5">COMBO MULTIPLIER</h4>
                <p className="text-slate-400">
                  Winning consecutive rounds ramps your multiplier up to <strong className="text-amber-300">x5</strong> (e.g. +100 → +200 → +300 → +400 → +500 PTS). A round loss breaks your streak unless protected by a Shield.
                </p>
              </div>
            </div>

            {/* AI Opponent Mechanics */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 shrink-0">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold font-orbitron text-purple-300 text-sm mb-0.5">ADAPTIVE AI ENGINE</h4>
                <p className="text-slate-400">
                  On <strong className="text-rose-400">Hard</strong> and <strong className="text-purple-400">Master</strong>, the AI analyses your move history using 1st-order Markov transitions and psychological win-stay/lose-shift heuristics. Vary your strategy to avoid being read!
                </p>
              </div>
            </div>

            {/* Keyboard Shortcuts */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 shrink-0">
                <Keyboard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold font-orbitron text-cyan-300 text-sm mb-0.5">TACTICAL SHORTCUTS</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 font-mono text-[11px]">
                  <span className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-slate-200">
                    <kbd className="text-cyan-400 font-bold">R</kbd> = Rock
                  </span>
                  <span className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-slate-200">
                    <kbd className="text-purple-400 font-bold">P</kbd> = Paper
                  </span>
                  <span className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-slate-200">
                    <kbd className="text-pink-400 font-bold">S</kbd> = Scissors
                  </span>
                  <span className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-slate-200">
                    <kbd className="text-amber-400 font-bold">ESC</kbd> = Pause
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Understood button */}
          <button
            id="btn-confirm-howtoplay"
            onClick={() => {
              sound.playButtonClick();
              onClose();
            }}
            className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black font-orbitron text-sm tracking-wider neon-glow-cyan transition-all cursor-pointer"
          >
            I AM READY FOR BATTLE
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
