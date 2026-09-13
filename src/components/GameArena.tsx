import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Pause, Flame, Zap, Shield, Sparkles, HelpCircle, RefreshCw, Eye } from 'lucide-react';
import { Difficulty, GameMode, Move, PowerUpType, SpecialEventType, PlayerProfile } from '../types';
import { sound } from '../services/sound';

interface GameArenaProps {
  playerName: string;
  avatar: string;
  profile: PlayerProfile;
  difficulty: Difficulty;
  gameMode: GameMode;
  currentRound: number;
  maxRounds: number | null; // null for endless/classic
  playerScore: number;
  aiScore: number;
  playerWins: number;
  aiWins: number;
  winStreak: number;
  comboMultiplier: number;
  endlessLives?: number;
  activeSpecialEvent: SpecialEventType | null;
  activePowerUp: PowerUpType | null;
  aiStatusMessage: string;
  isControlsLocked: boolean;
  predictedMoveHint?: Move | null;
  onSelectMove: (move: Move) => void;
  onActivatePowerUp: (powerUp: PowerUpType) => void;
  onPause: () => void;
}

const MOVE_BUTTONS: { id: Move; label: string; emoji: string; shortcut: string; glowClass: string; borderClass: string }[] = [
  {
    id: 'rock',
    label: 'ROCK',
    emoji: '🪨',
    shortcut: 'R',
    glowClass: 'hover:neon-glow-cyan group-hover:neon-glow-cyan',
    borderClass: 'border-cyan-500/50 hover:border-cyan-400',
  },
  {
    id: 'paper',
    label: 'PAPER',
    emoji: '📄',
    shortcut: 'P',
    glowClass: 'hover:neon-glow-purple group-hover:neon-glow-purple',
    borderClass: 'border-purple-500/50 hover:border-purple-400',
  },
  {
    id: 'scissors',
    label: 'SCISSORS',
    emoji: '✂️',
    shortcut: 'S',
    glowClass: 'hover:neon-glow-pink group-hover:neon-glow-pink',
    borderClass: 'border-pink-500/50 hover:border-pink-400',
  },
];

export const GameArena: React.FC<GameArenaProps> = ({
  playerName,
  avatar,
  profile,
  difficulty,
  gameMode,
  currentRound,
  maxRounds,
  playerScore,
  aiScore,
  playerWins,
  aiWins,
  winStreak,
  comboMultiplier,
  endlessLives = 3,
  activeSpecialEvent,
  activePowerUp,
  aiStatusMessage,
  isControlsLocked,
  predictedMoveHint,
  onSelectMove,
  onActivatePowerUp,
  onPause,
}) => {
  const [countdown, setCountdown] = useState<'3' | '2' | '1' | 'GO!' | null>('3');
  const [selectedMove, setSelectedMove] = useState<Move | null>(null);

  // Round countdown animation sequence (3 -> 2 -> 1 -> GO!)
  useEffect(() => {
    setSelectedMove(null);
    setCountdown('3');
    sound.playCountdownBeep(false);

    const t1 = setTimeout(() => {
      setCountdown('2');
      sound.playCountdownBeep(false);
    }, 450);

    const t2 = setTimeout(() => {
      setCountdown('1');
      sound.playCountdownBeep(false);
    }, 900);

    const t3 = setTimeout(() => {
      setCountdown('GO!');
      sound.playGoSound();
    }, 1350);

    const t4 = setTimeout(() => {
      setCountdown(null);
    }, 1800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [currentRound]);

  const handleMoveClick = useCallback(
    (move: Move) => {
      if (isControlsLocked || countdown !== null || selectedMove !== null) return;
      setSelectedMove(move);

      if (move === 'rock') sound.playRockSelect();
      else if (move === 'paper') sound.playPaperSelect();
      else sound.playScissorsSelect();

      onSelectMove(move);
    },
    [isControlsLocked, countdown, selectedMove, onSelectMove]
  );

  // Keyboard controls: R = Rock, P = Paper, S = Scissors, Esc = Pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const key = e.key.toLowerCase();
      if (key === 'escape') {
        onPause();
      } else if (key === 'r') {
        handleMoveClick('rock');
      } else if (key === 'p') {
        handleMoveClick('paper');
      } else if (key === 's') {
        handleMoveClick('scissors');
      } else if (key === '1') {
        if (profile.powerUps.predict > 0 && !activePowerUp) onActivatePowerUp('predict');
      } else if (key === '2') {
        if (profile.powerUps.double_score > 0 && !activePowerUp) onActivatePowerUp('double_score');
      } else if (key === '3') {
        if (profile.powerUps.shield > 0 && !activePowerUp) onActivatePowerUp('shield');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleMoveClick, onPause, onActivatePowerUp, profile.powerUps, activePowerUp]);

  const canPlay = !isControlsLocked && countdown === null && selectedMove === null;

  return (
    <div className="relative min-h-screen flex flex-col justify-between items-center px-4 py-4 sm:py-6 z-10 select-none max-w-5xl mx-auto w-full">
      {/* Top HUD */}
      <header className="w-full flex flex-col gap-3">
        <div className="flex items-center justify-between">
          {/* Pause & Round info */}
          <div className="flex items-center gap-3">
            <button
              id="btn-pause-game"
              onClick={() => {
                sound.playButtonClick();
                onPause();
              }}
              className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/70 hover:border-cyan-400 hover:text-cyan-400 text-slate-300 backdrop-blur-md transition-all cursor-pointer"
              title="Pause Game (Esc)"
            >
              <Pause className="w-5 h-5" />
            </button>

            {/* Round display */}
            <div className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/60 backdrop-blur-md">
              <span className="text-[11px] font-bold text-slate-400 font-orbitron uppercase tracking-wider block">
                ROUND
              </span>
              <span className="text-sm sm:text-base font-black font-orbitron text-slate-100">
                {currentRound} {maxRounds ? `/ ${maxRounds}` : ''}
              </span>
            </div>

            {/* Difficulty Badge */}
            <div className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/60 backdrop-blur-md">
              <span className="text-xs font-bold font-orbitron text-purple-400 uppercase tracking-wider">
                {difficulty}
              </span>
            </div>
          </div>

          {/* Win Streak & Combo Tracker */}
          <div className="flex items-center gap-2">
            {winStreak > 0 && (
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-300 font-orbitron font-bold text-xs sm:text-sm backdrop-blur-md shadow-sm"
              >
                <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-bounce" />
                <span>STREAK {winStreak}</span>
              </motion.div>
            )}

            {comboMultiplier > 1 && (
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.6, repeat: Infinity }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-pink-500/20 border border-pink-500/60 text-pink-300 font-orbitron font-black text-xs sm:text-sm neon-glow-pink backdrop-blur-md"
              >
                <span>COMBO x{comboMultiplier}</span>
              </motion.div>
            )}

            {/* Endless Lives */}
            {gameMode === 'endless' && (
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-300 font-orbitron font-bold text-xs backdrop-blur-md">
                <span>❤️ {endlessLives}</span>
              </div>
            )}
          </div>
        </div>

        {/* Special Event Active Banner */}
        <AnimatePresence>
          {activeSpecialEvent && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full py-2 px-4 rounded-xl bg-gradient-to-r from-cyan-950/80 via-purple-950/80 to-pink-950/80 border border-amber-400/80 neon-glow-amber text-center backdrop-blur-md flex items-center justify-center gap-2 text-amber-300 font-black font-orbitron text-xs sm:text-sm tracking-wider"
            >
              <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>
                {activeSpecialEvent === 'double_points' && 'SPECIAL EVENT: DOUBLE POINTS ACTIVATED! (x2)'}
                {activeSpecialEvent === 'fury_round' && 'SPECIAL EVENT: FURY ROUND! (3x COMBO BOOST)'}
                {activeSpecialEvent === 'ai_boost' && 'SPECIAL EVENT: AI OVERCLOCK ENGAGED!'}
                {activeSpecialEvent === 'bonus_round' && 'SPECIAL EVENT: +500 BONUS POINTS FOR A WIN!'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Arena Stage: Player vs AI */}
      <main className="w-full flex flex-col items-center justify-center my-auto py-2">
        {/* Opponents Matchup Banner */}
        <div className="w-full max-w-2xl grid grid-cols-3 items-center text-center p-4 sm:p-6 rounded-3xl bg-slate-900/70 border border-cyan-500/30 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          {/* Subtle Cyber scanline background effect */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent" />

          {/* Left: Player Card */}
          <div className="flex flex-col items-center z-10">
            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-cyan-900/60 to-slate-950 border-2 border-cyan-400/60 flex items-center justify-center text-3xl sm:text-5xl neon-glow-cyan shadow-lg mb-2">
              {avatar}
            </div>
            <div className="text-xs sm:text-sm font-black font-orbitron text-slate-100 max-w-[110px] sm:max-w-[140px] truncate">
              {playerName}
            </div>
            <div className="text-[11px] text-cyan-400 font-bold font-orbitron">
              WINS: {playerWins}
            </div>
          </div>

          {/* Center: Score & VS Clash */}
          <div className="flex flex-col items-center justify-center z-10">
            <div className="text-xs font-extrabold font-orbitron text-slate-400 tracking-widest mb-1">
              SCORE
            </div>
            <div className="flex items-center justify-center gap-2 sm:gap-4 text-2xl sm:text-4xl font-black font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-pink-400">
              <span>{playerScore}</span>
              <span className="text-slate-600 text-lg sm:text-2xl">-</span>
              <span>{aiScore}</span>
            </div>

            <div className="mt-2 text-[10px] sm:text-xs font-bold font-orbitron text-slate-400 tracking-wider">
              VS
            </div>

            {/* AI Status readout */}
            <div className="mt-2 px-2.5 py-1 rounded-full bg-slate-950/80 border border-slate-700/70 text-[10px] text-slate-300 font-mono tracking-tight flex items-center gap-1.5 max-w-[150px] sm:max-w-[200px] truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse shrink-0" />
              <span className="truncate">{aiStatusMessage}</span>
            </div>
          </div>

          {/* Right: AI Card */}
          <div className="flex flex-col items-center z-10">
            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-purple-900/60 to-slate-950 border-2 border-purple-400/60 flex items-center justify-center text-3xl sm:text-5xl neon-glow-purple shadow-lg mb-2">
              🤖
            </div>
            <div className="text-xs sm:text-sm font-black font-orbitron text-slate-100 max-w-[110px] sm:max-w-[140px] truncate">
              AI OPPONENT
            </div>
            <div className="text-[11px] text-purple-400 font-bold font-orbitron">
              WINS: {aiWins}
            </div>
          </div>
        </div>

        {/* Big Animated Countdown Overlay */}
        <AnimatePresence>
          {countdown !== null && (
            <motion.div
              key={countdown}
              initial={{ scale: 2.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="my-6 text-center"
            >
              <div
                className={`text-6xl sm:text-8xl font-black font-orbitron tracking-widest ${
                  countdown === 'GO!'
                    ? 'text-emerald-400 neon-text-cyan drop-shadow-[0_0_35px_rgba(34,197,94,0.9)]'
                    : 'text-cyan-300 drop-shadow-[0_0_25px_rgba(6,182,212,0.8)]'
                }`}
              >
                {countdown}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Predict Hint Display if power-up was activated */}
        {predictedMoveHint && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="my-2 px-4 py-2 rounded-xl bg-purple-950/60 border border-purple-400/80 neon-glow-purple flex items-center gap-2 text-purple-200 text-xs sm:text-sm font-bold font-orbitron"
          >
            <Eye className="w-4 h-4 text-purple-400 animate-pulse" />
            <span>AI SCAN FORECAST: AI Likely Selecting {predictedMoveHint.toUpperCase()}!</span>
          </motion.div>
        )}

        {/* Combo Hot Streak Banner */}
        {comboMultiplier >= 2 && (
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="my-1 text-sm sm:text-base font-black font-orbitron text-amber-400 tracking-widest flex items-center gap-2"
          >
            <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
            <span>HOT STREAK! x{comboMultiplier} POINTS MULTIPLIER</span>
            <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
          </motion.div>
        )}
      </main>

      {/* Bottom Section: Power-ups & Large Action Buttons */}
      <footer className="w-full flex flex-col items-center gap-4">
        {/* Power-up Quick Bar */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Predict Power-up */}
          <button
            id="powerup-predict"
            onClick={() => {
              if (profile.powerUps.predict > 0 && !activePowerUp && canPlay) {
                sound.playPowerUp();
                onActivatePowerUp('predict');
              }
            }}
            disabled={profile.powerUps.predict <= 0 || !!activePowerUp || !canPlay}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold font-orbitron flex items-center gap-1.5 transition-all ${
              profile.powerUps.predict > 0 && !activePowerUp && canPlay
                ? 'bg-purple-950/60 border-purple-500/70 text-purple-300 hover:border-purple-400 hover:neon-glow-purple cursor-pointer'
                : 'bg-slate-950/50 border-slate-800 text-slate-600 opacity-60 cursor-not-allowed'
            }`}
            title="Shows AI predicted move (Key: 1)"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>PREDICT ({profile.powerUps.predict})</span>
          </button>

          {/* Double Score */}
          <button
            id="powerup-double-score"
            onClick={() => {
              if (profile.powerUps.double_score > 0 && !activePowerUp && canPlay) {
                sound.playPowerUp();
                onActivatePowerUp('double_score');
              }
            }}
            disabled={profile.powerUps.double_score <= 0 || !!activePowerUp || !canPlay}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold font-orbitron flex items-center gap-1.5 transition-all ${
              profile.powerUps.double_score > 0 && !activePowerUp && canPlay
                ? 'bg-amber-950/60 border-amber-500/70 text-amber-300 hover:border-amber-400 hover:neon-glow-amber cursor-pointer'
                : 'bg-slate-950/50 border-slate-800 text-slate-600 opacity-60 cursor-not-allowed'
            }`}
            title="Doubles points next win (Key: 2)"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>2X SCORE ({profile.powerUps.double_score})</span>
          </button>

          {/* Shield */}
          <button
            id="powerup-shield"
            onClick={() => {
              if (profile.powerUps.shield > 0 && !activePowerUp && canPlay) {
                sound.playPowerUp();
                onActivatePowerUp('shield');
              }
            }}
            disabled={profile.powerUps.shield <= 0 || !!activePowerUp || !canPlay}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold font-orbitron flex items-center gap-1.5 transition-all ${
              profile.powerUps.shield > 0 && !activePowerUp && canPlay
                ? 'bg-cyan-950/60 border-cyan-500/70 text-cyan-300 hover:border-cyan-400 hover:neon-glow-cyan cursor-pointer'
                : 'bg-slate-950/50 border-slate-800 text-slate-600 opacity-60 cursor-not-allowed'
            }`}
            title="Streak protected on loss (Key: 3)"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>SHIELD ({profile.powerUps.shield})</span>
          </button>
        </div>

        {/* Large 3 Animated Choice Buttons */}
        <div className="w-full max-w-2xl grid grid-cols-3 gap-3 sm:gap-6">
          {MOVE_BUTTONS.map((btn) => {
            const isSelected = selectedMove === btn.id;

            return (
              <motion.button
                key={btn.id}
                id={`btn-move-${btn.id}`}
                whileHover={canPlay ? { scale: 1.05, y: -4 } : {}}
                whileTap={canPlay ? { scale: 0.95 } : {}}
                onClick={() => handleMoveClick(btn.id)}
                disabled={!canPlay}
                className={`group relative h-28 sm:h-36 rounded-3xl border-2 flex flex-col items-center justify-center transition-all duration-200 select-none ${
                  isSelected
                    ? 'bg-cyan-500/30 border-cyan-300 neon-glow-cyan scale-105 shadow-2xl'
                    : canPlay
                    ? `bg-slate-900/80 ${btn.borderClass} ${btn.glowClass} shadow-lg cursor-pointer`
                    : 'bg-slate-950/60 border-slate-800/80 opacity-40 cursor-not-allowed'
                }`}
              >
                {/* Keyboard Shortcut badge */}
                <span className="absolute top-2 right-2.5 px-2 py-0.5 rounded-md bg-slate-950/80 border border-slate-700/70 text-[10px] font-bold font-mono text-slate-400">
                  {btn.shortcut}
                </span>

                {/* Animated Icon */}
                <motion.span
                  animate={canPlay ? { y: [0, -3, 0] } : {}}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="text-4xl sm:text-6xl transform group-hover:scale-115 transition-transform"
                >
                  {btn.emoji}
                </motion.span>

                {/* Label */}
                <span className="mt-1 sm:mt-2 text-xs sm:text-sm font-black font-orbitron tracking-widest text-slate-200 group-hover:text-white transition-colors">
                  {btn.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </footer>
    </div>
  );
};
