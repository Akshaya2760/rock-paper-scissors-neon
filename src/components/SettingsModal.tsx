import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Settings, Volume2, VolumeX, Music, Eye, Palette, AlertTriangle, Check, Trash2 } from 'lucide-react';
import { Difficulty, GameSettings } from '../types';
import { sound } from '../services/sound';

interface SettingsModalProps {
  isOpen: boolean;
  settings: GameSettings;
  onClose: () => void;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onResetStats: () => void;
  onResetAchievements: () => void;
  onClearLeaderboard: () => void;
  onResetAll: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  onClose,
  onUpdateSettings,
  onResetStats,
  onResetAchievements,
  onClearLeaderboard,
  onResetAll,
}) => {
  const [confirmAction, setConfirmAction] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleToggleSound = () => {
    const updated = { ...settings, soundEnabled: !settings.soundEnabled };
    onUpdateSettings(updated);
    sound.setSettings(updated.soundEnabled, updated.musicEnabled, updated.volume);
    sound.playButtonClick();
  };

  const handleToggleMusic = () => {
    const updated = { ...settings, musicEnabled: !settings.musicEnabled };
    onUpdateSettings(updated);
    sound.setSettings(updated.soundEnabled, updated.musicEnabled, updated.volume);
    sound.playButtonClick();
  };

  const handleVolumeChange = (vol: number) => {
    const updated = { ...settings, volume: vol };
    onUpdateSettings(updated);
    sound.setSettings(updated.soundEnabled, updated.musicEnabled, updated.volume);
  };

  const handleThemeChange = (theme: 'cyber' | 'synthwave' | 'matrix' | 'solar') => {
    onUpdateSettings({ ...settings, neonTheme: theme });
    sound.playButtonClick();
  };

  const executeConfirmAction = () => {
    sound.playButtonClick();
    if (confirmAction === 'stats') {
      onResetStats();
    } else if (confirmAction === 'achievements') {
      onResetAchievements();
    } else if (confirmAction === 'leaderboard') {
      onClearLeaderboard();
    } else if (confirmAction === 'all') {
      onResetAll();
    }
    setConfirmAction(null);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg my-6 rounded-3xl bg-slate-900 border border-slate-700 neon-glow-cyan shadow-2xl p-6 sm:p-8 text-slate-100 max-h-[90vh] overflow-y-auto"
        >
          {/* Close button */}
          <button
            id="btn-close-settings"
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
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-400">
                ARENA SETTINGS
              </h2>
              <p className="text-xs text-slate-400 font-medium">Audio, visual ergonomics, and storage management</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Audio Settings Section */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold font-orbitron text-cyan-400 uppercase tracking-wider">
                AUDIO CONTROLS
              </h3>

              {/* Sound FX Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400">
                    {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                  </div>
                  <div>
                    <div className="text-sm font-bold font-orbitron text-slate-200">SOUND EFFECTS</div>
                    <div className="text-[11px] text-slate-400">Action impacts, clashing, and countdown beeps</div>
                  </div>
                </div>
                <button
                  id="toggle-sound-effects"
                  onClick={handleToggleSound}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    settings.soundEnabled ? 'bg-cyan-500 neon-glow-cyan' : 'bg-slate-800'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      settings.soundEnabled ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Music Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-purple-400">
                    <Music className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold font-orbitron text-slate-200">AMBIENT SYNTH MUSIC</div>
                    <div className="text-[11px] text-slate-400">Procedural cyber arcade soundtrack</div>
                  </div>
                </div>
                <button
                  id="toggle-music"
                  onClick={handleToggleMusic}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    settings.musicEnabled ? 'bg-purple-500 neon-glow-purple' : 'bg-slate-800'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      settings.musicEnabled ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Volume Slider */}
              <div className="pt-2">
                <div className="flex justify-between text-xs font-bold font-orbitron mb-1.5">
                  <span className="text-slate-300">MASTER VOLUME</span>
                  <span className="text-cyan-400">{Math.round(settings.volume * 100)}%</span>
                </div>
                <input
                  id="slider-volume"
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* Visuals & Theme */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold font-orbitron text-pink-400 uppercase tracking-wider flex items-center gap-2">
                <Palette className="w-4 h-4" /> NEON PALETTE
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'cyber', label: 'CYBER', color: 'border-cyan-400 bg-cyan-950/40 text-cyan-300' },
                  { id: 'synthwave', label: 'SYNTH', color: 'border-pink-400 bg-pink-950/40 text-pink-300' },
                  { id: 'matrix', label: 'MATRIX', color: 'border-emerald-400 bg-emerald-950/40 text-emerald-300' },
                  { id: 'solar', label: 'SOLAR', color: 'border-amber-400 bg-amber-950/40 text-amber-300' },
                ].map((t) => {
                  const isSelected = settings.neonTheme === t.id;
                  return (
                    <button
                      key={t.id}
                      id={`theme-${t.id}`}
                      onClick={() => handleThemeChange(t.id as any)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold font-orbitron transition-all cursor-pointer ${
                        isSelected ? `${t.color} neon-glow-cyan shadow-md` : 'border-slate-800 bg-slate-900/60 text-slate-400'
                      }`}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>

              {/* Reduced Motion */}
              <div className="flex items-center justify-between pt-2">
                <div>
                  <div className="text-xs font-bold font-orbitron text-slate-200">REDUCED MOTION</div>
                  <div className="text-[10px] text-slate-400">Softens particles and screen shakes</div>
                </div>
                <button
                  id="toggle-reduced-motion"
                  onClick={() => {
                    onUpdateSettings({ ...settings, reducedMotion: !settings.reducedMotion });
                    sound.playButtonClick();
                  }}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    settings.reducedMotion ? 'bg-cyan-500' : 'bg-slate-800'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      settings.reducedMotion ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Storage & Reset Section */}
            <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/40 space-y-3">
              <h3 className="text-xs font-bold font-orbitron text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> DANGER ZONE & MEMORY RESET
              </h3>

              {confirmAction ? (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/60 text-center space-y-2">
                  <p className="text-xs text-rose-200 font-bold font-orbitron">
                    CONFIRM {confirmAction.toUpperCase()} RESET?
                  </p>
                  <div className="flex justify-center gap-2">
                    <button
                      id="btn-confirm-destructive-action"
                      onClick={executeConfirmAction}
                      className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold font-orbitron cursor-pointer"
                    >
                      CONFIRM
                    </button>
                    <button
                      id="btn-cancel-destructive-action"
                      onClick={() => setConfirmAction(null)}
                      className="px-4 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold font-orbitron cursor-pointer"
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    id="btn-trigger-reset-stats"
                    onClick={() => setConfirmAction('stats')}
                    className="py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-rose-500/60 text-slate-300 hover:text-rose-300 font-bold font-orbitron transition-all cursor-pointer"
                  >
                    Reset Statistics
                  </button>

                  <button
                    id="btn-trigger-clear-leaderboard"
                    onClick={() => setConfirmAction('leaderboard')}
                    className="py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-rose-500/60 text-slate-300 hover:text-rose-300 font-bold font-orbitron transition-all cursor-pointer"
                  >
                    Clear Leaderboard
                  </button>

                  <button
                    id="btn-trigger-reset-achievements"
                    onClick={() => setConfirmAction('achievements')}
                    className="py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-rose-500/60 text-slate-300 hover:text-rose-300 font-bold font-orbitron transition-all cursor-pointer"
                  >
                    Reset Medals
                  </button>

                  <button
                    id="btn-trigger-reset-all"
                    onClick={() => setConfirmAction('all')}
                    className="py-2 px-3 rounded-xl bg-rose-950/40 border border-rose-800 hover:border-rose-500 text-rose-300 font-bold font-orbitron transition-all cursor-pointer"
                  >
                    Reset Everything
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
