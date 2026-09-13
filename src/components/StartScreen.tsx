import React from 'react';
import { motion } from 'motion/react';
import { Play, Trophy, BarChart3, Settings, HelpCircle, User, Calendar, Volume2, VolumeX, Music } from 'lucide-react';
import { sound } from '../services/sound';
import { GameSettings, PlayerProfile } from '../types';

interface StartScreenProps {
  profile: PlayerProfile;
  settings: GameSettings;
  onStartMatch: () => void;
  onOpenLeaderboard: () => void;
  onOpenStatistics: () => void;
  onOpenSettings: () => void;
  onOpenHowToPlay: () => void;
  onOpenProfile: () => void;
  onOpenDaily: () => void;
  onToggleSound: () => void;
  onToggleMusic: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  profile,
  settings,
  onStartMatch,
  onOpenLeaderboard,
  onOpenStatistics,
  onOpenSettings,
  onOpenHowToPlay,
  onOpenProfile,
  onOpenDaily,
  onToggleSound,
  onToggleMusic,
}) => {
  const handleHover = () => {
    sound.playButtonClick();
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between items-center px-4 py-6 z-10 select-none">
      {/* Top Header Bar */}
      <header className="w-full max-w-5xl flex justify-between items-center">
        {/* Profile Chip */}
        <button
          id="btn-open-profile-header"
          onClick={() => {
            sound.playButtonClick();
            onOpenProfile();
          }}
          onMouseEnter={handleHover}
          className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-900/80 border border-cyan-500/30 hover:border-cyan-400 hover:neon-glow-cyan transition-all group backdrop-blur-md cursor-pointer"
        >
          <span className="text-2xl transform group-hover:scale-110 transition-transform">{profile.avatar}</span>
          <div className="text-left">
            <div className="text-xs text-cyan-400 font-bold uppercase tracking-wider font-orbitron flex items-center gap-1.5">
              <span>LVL {profile.level}</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            </div>
            <div className="text-sm font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors">
              {profile.name}
            </div>
          </div>
        </button>

        {/* Action icons */}
        <div className="flex items-center gap-2">
          {/* Daily Challenge Pill */}
          <button
            id="btn-open-daily-header"
            onClick={() => {
              sound.playButtonClick();
              onOpenDaily();
            }}
            onMouseEnter={handleHover}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/80 border border-amber-500/30 hover:border-amber-400 hover:neon-glow-amber transition-all text-amber-300 text-sm font-semibold backdrop-blur-md cursor-pointer"
            title="Daily Mission"
          >
            <Calendar className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Daily Mission</span>
          </button>

          {/* Sound Toggle */}
          <button
            id="btn-toggle-sound-start"
            onClick={() => {
              onToggleSound();
              sound.playButtonClick();
            }}
            className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/60 hover:border-cyan-400 hover:text-cyan-400 text-slate-300 transition-all cursor-pointer"
            title={settings.soundEnabled ? 'Mute Sound Effects' : 'Enable Sound Effects'}
          >
            {settings.soundEnabled ? <Volume2 className="w-5 h-5 text-cyan-400" /> : <VolumeX className="w-5 h-5 text-slate-500" />}
          </button>

          {/* Music Toggle */}
          <button
            id="btn-toggle-music-start"
            onClick={() => {
              onToggleMusic();
              sound.playButtonClick();
            }}
            className={`p-2.5 rounded-xl bg-slate-900/80 border transition-all cursor-pointer ${
              settings.musicEnabled
                ? 'border-purple-500 text-purple-400 neon-glow-purple'
                : 'border-slate-700/60 text-slate-500 hover:border-purple-400 hover:text-purple-300'
            }`}
            title={settings.musicEnabled ? 'Stop Ambient Music' : 'Play Ambient Music'}
          >
            <Music className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Hero Branding */}
      <main className="flex flex-col items-center justify-center my-auto py-8 text-center max-w-2xl">
        {/* Floating Cyber Badges */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3 mb-6"
        >
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-semibold tracking-widest uppercase shadow-sm font-orbitron">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            TACTICAL AI ARCADE
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-pink-950/60 border border-pink-500/40 text-pink-300 text-xs font-semibold tracking-widest uppercase shadow-sm font-orbitron">
            ONLINE REACTION ENGINE
          </div>
        </motion.div>

        {/* Main Title */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative"
        >
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black font-orbitron tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400 drop-shadow-[0_0_25px_rgba(6,182,212,0.45)]">
            ROCK <span className="text-cyan-400">•</span> PAPER <span className="text-pink-400">•</span> SCISSORS
          </h1>

          <div className="mt-3 text-2xl sm:text-4xl font-extrabold font-orbitron tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 drop-shadow-[0_0_20px_rgba(236,72,153,0.5)]">
            NEON ARENA
          </div>
        </motion.div>

        {/* Animated 3 Move Icons Showcase */}
        <div className="flex items-center justify-center gap-6 my-8">
          <motion.div
            animate={{ y: [-4, 4, -4] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-cyan-900/60 to-slate-900/90 border-2 border-cyan-400/60 flex items-center justify-center text-3xl sm:text-4xl neon-glow-cyan shadow-lg"
          >
            🪨
          </motion.div>
          <motion.div
            animate={{ y: [4, -4, 4] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-purple-900/60 to-slate-900/90 border-2 border-purple-400/60 flex items-center justify-center text-3xl sm:text-4xl neon-glow-purple shadow-lg"
          >
            📄
          </motion.div>
          <motion.div
            animate={{ y: [-4, 4, -4] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-pink-900/60 to-slate-900/90 border-2 border-pink-400/60 flex items-center justify-center text-3xl sm:text-4xl neon-glow-pink shadow-lg"
          >
            ✂️
          </motion.div>
        </div>

        {/* Action Menu Buttons */}
        <div className="w-full max-w-sm flex flex-col gap-3">
          {/* PLAY BUTTON */}
          <motion.button
            id="btn-main-play"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              sound.playGoSound();
              onStartMatch();
            }}
            onMouseEnter={handleHover}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-500 text-slate-950 font-black font-orbitron text-xl tracking-wider shadow-lg hover:shadow-cyan-500/50 hover:neon-glow-cyan transition-all flex items-center justify-center gap-3 cursor-pointer relative overflow-hidden group"
          >
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            <Play className="w-6 h-6 fill-current text-slate-950" />
            <span>PLAY MATCH</span>
          </motion.button>

          {/* Secondary 2-Column Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              id="btn-main-leaderboard"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                sound.playButtonClick();
                onOpenLeaderboard();
              }}
              onMouseEnter={handleHover}
              className="py-3 px-4 rounded-xl bg-slate-900/80 border border-amber-500/40 hover:border-amber-400 hover:neon-glow-amber text-amber-300 font-bold font-orbitron text-sm flex items-center justify-center gap-2 backdrop-blur-sm cursor-pointer transition-all"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>LEADERBOARD</span>
            </motion.button>

            <motion.button
              id="btn-main-statistics"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                sound.playButtonClick();
                onOpenStatistics();
              }}
              onMouseEnter={handleHover}
              className="py-3 px-4 rounded-xl bg-slate-900/80 border border-purple-500/40 hover:border-purple-400 hover:neon-glow-purple text-purple-300 font-bold font-orbitron text-sm flex items-center justify-center gap-2 backdrop-blur-sm cursor-pointer transition-all"
            >
              <BarChart3 className="w-4 h-4 text-purple-400" />
              <span>STATISTICS</span>
            </motion.button>
          </div>

          {/* Tertiary Row */}
          <div className="grid grid-cols-3 gap-3">
            <motion.button
              id="btn-main-profile"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                sound.playButtonClick();
                onOpenProfile();
              }}
              onMouseEnter={handleHover}
              className="py-2.5 px-3 rounded-xl bg-slate-900/70 border border-slate-700/60 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 font-bold font-orbitron text-xs flex items-center justify-center gap-1.5 backdrop-blur-sm cursor-pointer transition-all"
            >
              <User className="w-3.5 h-3.5" />
              <span>PROFILE</span>
            </motion.button>

            <motion.button
              id="btn-main-howtoplay"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                sound.playButtonClick();
                onOpenHowToPlay();
              }}
              onMouseEnter={handleHover}
              className="py-2.5 px-3 rounded-xl bg-slate-900/70 border border-slate-700/60 hover:border-blue-400 text-slate-300 hover:text-blue-300 font-bold font-orbitron text-xs flex items-center justify-center gap-1.5 backdrop-blur-sm cursor-pointer transition-all"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>GUIDE</span>
            </motion.button>

            <motion.button
              id="btn-main-settings"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                sound.playButtonClick();
                onOpenSettings();
              }}
              onMouseEnter={handleHover}
              className="py-2.5 px-3 rounded-xl bg-slate-900/70 border border-slate-700/60 hover:border-pink-400 text-slate-300 hover:text-pink-300 font-bold font-orbitron text-xs flex items-center justify-center gap-1.5 backdrop-blur-sm cursor-pointer transition-all"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>SETTINGS</span>
            </motion.button>
          </div>
        </div>
      </main>

      {/* Footer Quote */}
      <footer className="w-full text-center text-xs sm:text-sm text-slate-400 font-medium tracking-wide py-2">
        <p className="text-slate-400">
          Challenge the AI. Build your streak. Become the Arena Champion.
        </p>
      </footer>
    </div>
  );
};
