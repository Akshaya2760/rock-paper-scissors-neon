import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Achievement,
  DailyChallenge,
  Difficulty,
  GameMode,
  GameSettings,
  LeaderboardEntry,
  MatchSummary,
  Move,
  PlayerProfile,
  PlayerStats,
  PowerUpType,
  RoundHistoryItem,
  RoundOutcome,
  SpecialEventType,
} from './types';
import { sound } from './services/sound';
import { StorageService } from './services/storage';
import { AIEngine, resolveRoundOutcome } from './services/ai';
import { NeonBackground } from './components/NeonBackground';
import { ConfettiCanvas, ConfettiTrigger } from './components/ConfettiCanvas';
import { StartScreen } from './components/StartScreen';
import { PlayerSetupModal } from './components/PlayerSetupModal';
import { GameArena } from './components/GameArena';
import { RoundResultOverlay } from './components/RoundResultOverlay';
import { MatchResultModal } from './components/MatchResultModal';
import { StatisticsModal } from './components/StatisticsModal';
import { AchievementsModal } from './components/AchievementsModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { ProfileModal } from './components/ProfileModal';
import { DailyChallengeModal } from './components/DailyChallengeModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { SettingsModal } from './components/SettingsModal';
import { PauseModal } from './components/PauseModal';

export default function App() {
  // Persistence states
  const [profile, setProfile] = useState<PlayerProfile>(() => StorageService.getProfile());
  const [stats, setStats] = useState<PlayerStats>(() => StorageService.getStats());
  const [achievements, setAchievements] = useState<Achievement[]>(() => StorageService.getAchievements());
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => StorageService.getLeaderboard());
  const [settings, setSettings] = useState<GameSettings>(() => StorageService.getSettings());
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge>(() => StorageService.getDailyChallenge());

  // View state
  const [currentScreen, setCurrentScreen] = useState<'start' | 'playing'>('start');

  // Modal open states
  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [achievementsModalOpen, setAchievementsModalOpen] = useState(false);
  const [leaderboardModalOpen, setLeaderboardModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [dailyModalOpen, setDailyModalOpen] = useState(false);
  const [howToPlayModalOpen, setHowToPlayModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [pauseModalOpen, setPauseModalOpen] = useState(false);

  // Match configurations
  const [matchConfig, setMatchConfig] = useState({
    playerName: profile.name,
    avatar: profile.avatar,
    difficulty: settings.defaultDifficulty,
    gameMode: 'best_of_5' as GameMode,
  });

  // Active game state
  const [currentRound, setCurrentRound] = useState(1);
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [playerWins, setPlayerWins] = useState(0);
  const [aiWins, setAiWins] = useState(0);
  const [draws, setDraws] = useState(0);
  const [winStreak, setWinStreak] = useState(0);
  const [bestMatchStreak, setBestMatchStreak] = useState(0);
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [highestMatchCombo, setHighestMatchCombo] = useState(1);
  const [endlessLives, setEndlessLives] = useState(3);
  const [matchHistory, setMatchHistory] = useState<RoundHistoryItem[]>([]);

  // Round modifiers
  const [activeSpecialEvent, setActiveSpecialEvent] = useState<SpecialEventType | null>(null);
  const [activePowerUp, setActivePowerUp] = useState<PowerUpType | null>(null);
  const [predictedMoveHint, setPredictedMoveHint] = useState<Move | null>(null);
  const [aiStatusMessage, setAiStatusMessage] = useState('AI is analyzing neural telemetry...');
  const [isControlsLocked, setIsControlsLocked] = useState(false);

  // Round result overlay state
  const [roundOverlay, setRoundOverlay] = useState<{
    playerMove: Move;
    aiMove: Move;
    outcome: RoundOutcome;
    pointsEarned: number;
    comboMultiplier: number;
    aiCommentary: string;
    shieldUsed?: boolean;
  } | null>(null);

  // Match result modal
  const [matchSummary, setMatchSummary] = useState<MatchSummary | null>(null);

  // Celebration effects
  const [confettiTrigger, setConfettiTrigger] = useState<ConfettiTrigger | null>(null);

  // AI engine reference
  const aiEngineRef = useRef<AIEngine>(new AIEngine());

  // Initialize sound settings
  useEffect(() => {
    sound.setSettings(settings.soundEnabled, settings.musicEnabled, settings.volume);
  }, [settings]);

  // Max rounds calculation based on mode
  const getMaxRounds = (mode: GameMode): number | null => {
    if (mode === 'best_of_3') return 3;
    if (mode === 'best_of_5') return 5;
    return null;
  };

  // Launch a new match
  const handleLaunchMatch = (config: {
    playerName: string;
    avatar: string;
    difficulty: Difficulty;
    gameMode: GameMode;
  }) => {
    // Update profile with selected name/avatar
    const updatedProfile = { ...profile, name: config.playerName, avatar: config.avatar };
    setProfile(updatedProfile);
    StorageService.saveProfile(updatedProfile);

    setMatchConfig(config);
    setSetupModalOpen(false);
    aiEngineRef.current.reset();

    // Reset match state
    setCurrentRound(1);
    setPlayerScore(0);
    setAiScore(0);
    setPlayerWins(0);
    setAiWins(0);
    setDraws(0);
    setWinStreak(0);
    setBestMatchStreak(0);
    setComboMultiplier(1);
    setHighestMatchCombo(1);
    setEndlessLives(3);
    setMatchHistory([]);
    setActiveSpecialEvent(null);
    setActivePowerUp(null);
    setPredictedMoveHint(null);
    setIsControlsLocked(false);
    setRoundOverlay(null);
    setMatchSummary(null);
    setAiStatusMessage('AI ready for neural clash...');

    setCurrentScreen('playing');
  };

  // Activate a power-up
  const handleActivatePowerUp = (powerUp: PowerUpType) => {
    if (profile.powerUps[powerUp] <= 0 || activePowerUp) return;

    // Deduct charge
    const updatedInventory = {
      ...profile.powerUps,
      [powerUp]: profile.powerUps[powerUp] - 1,
    };
    const updatedProfile = { ...profile, powerUps: updatedInventory };
    setProfile(updatedProfile);
    StorageService.saveProfile(updatedProfile);

    setActivePowerUp(powerUp);

    if (powerUp === 'predict') {
      // Generate hint from AI engine
      const aiPlan = aiEngineRef.current.getAIMove(matchConfig.difficulty);
      setPredictedMoveHint(aiPlan.move);
    }
  };

  // Process player's move selection
  const handleSelectMove = useCallback(
    (playerMove: Move) => {
      setIsControlsLocked(true);

      // Determine active difficulty (Challenge mode escalates every 5 rounds)
      let effectiveDifficulty = matchConfig.difficulty;
      if (matchConfig.gameMode === 'challenge') {
        if (currentRound >= 15) effectiveDifficulty = 'master';
        else if (currentRound >= 10) effectiveDifficulty = 'hard';
        else if (currentRound >= 5) effectiveDifficulty = 'normal';
      }

      // Query AI move
      const aiResult = aiEngineRef.current.getAIMove(effectiveDifficulty);
      const aiMove = aiResult.move;
      setAiStatusMessage(aiResult.statusMessage);

      // Resolve round outcome
      const outcome = resolveRoundOutcome(playerMove, aiMove);

      // Calculate score and combo
      let earnedPoints = 0;
      let newCombo = comboMultiplier;
      let newStreak = winStreak;
      let shieldConsumed = false;

      if (outcome === 'win') {
        newStreak += 1;
        newCombo = Math.min(5, Math.max(1, newStreak));

        earnedPoints = 100 * newCombo;

        // Apply Power-ups & Special events
        if (activePowerUp === 'double_score') {
          earnedPoints *= 2;
        }
        if (activeSpecialEvent === 'double_points') {
          earnedPoints *= 2;
        }
        if (activeSpecialEvent === 'fury_round') {
          newCombo = Math.min(5, newCombo * 2);
          earnedPoints += 150;
        }
        if (activeSpecialEvent === 'bonus_round') {
          earnedPoints += 500;
        }

        sound.playWin();
        sound.playCombo(newCombo);
        setConfettiTrigger({ id: Date.now(), type: newCombo >= 3 ? 'combo' : 'win' });
      } else if (outcome === 'loss') {
        if (activePowerUp === 'shield') {
          shieldConsumed = true;
          // Shield saves the streak!
        } else {
          newStreak = 0;
          newCombo = 1;
        }

        if (matchConfig.gameMode === 'endless') {
          setEndlessLives((l) => Math.max(0, l - 1));
        }

        sound.playLoss();
      } else {
        // Draw
        earnedPoints = 25;
        sound.playDraw();
      }

      const updatedPlayerScore = playerScore + earnedPoints;
      const updatedAiScore = outcome === 'loss' ? aiScore + 100 : aiScore;
      const updatedPlayerWins = outcome === 'win' ? playerWins + 1 : playerWins;
      const updatedAiWins = outcome === 'loss' ? aiWins + 1 : aiWins;
      const updatedDraws = outcome === 'draw' ? draws + 1 : draws;

      setPlayerScore(updatedPlayerScore);
      setAiScore(updatedAiScore);
      setPlayerWins(updatedPlayerWins);
      setAiWins(updatedAiWins);
      setDraws(updatedDraws);
      setWinStreak(newStreak);
      setComboMultiplier(newCombo);
      setBestMatchStreak((prev) => Math.max(prev, newStreak));
      setHighestMatchCombo((prev) => Math.max(prev, newCombo));

      // Record round in AI engine
      aiEngineRef.current.recordRound(playerMove, aiMove, outcome);

      // Record in match history
      const historyItem: RoundHistoryItem = {
        roundNumber: currentRound,
        playerMove,
        aiMove,
        outcome,
        pointsEarned: earnedPoints,
        comboMultiplier: newCombo,
        specialEvent: activeSpecialEvent,
      };
      const newHistory = [...matchHistory, historyItem];
      setMatchHistory(newHistory);

      // Update Move Statistics
      const updatedStats: PlayerStats = {
        ...stats,
        totalScore: stats.totalScore + earnedPoints,
        rockUsed: playerMove === 'rock' ? stats.rockUsed + 1 : stats.rockUsed,
        paperUsed: playerMove === 'paper' ? stats.paperUsed + 1 : stats.paperUsed,
        scissorsUsed: playerMove === 'scissors' ? stats.scissorsUsed + 1 : stats.scissorsUsed,
        bestWinStreak: Math.max(stats.bestWinStreak, newStreak),
        highestCombo: Math.max(stats.highestCombo, newCombo),
        mindReaderCount:
          outcome === 'win' && (effectiveDifficulty === 'hard' || effectiveDifficulty === 'master')
            ? stats.mindReaderCount + 1
            : stats.mindReaderCount,
      };
      setStats(updatedStats);
      StorageService.saveStats(updatedStats);

      // Update Daily Challenge progress if applicable
      if (!dailyChallenge.completed) {
        let countDelta = 0;
        if (dailyChallenge.type === 'use_move' && outcome === 'win' && playerMove === dailyChallenge.targetMove) {
          countDelta = 1;
        } else if (dailyChallenge.type === 'reach_streak' && newStreak >= dailyChallenge.targetCount) {
          countDelta = dailyChallenge.targetCount;
        } else if (dailyChallenge.type === 'reach_score') {
          countDelta = earnedPoints;
        } else if (dailyChallenge.type === 'win_match_no_rock' && outcome === 'win' && playerMove !== 'rock') {
          countDelta = 1;
        }

        if (countDelta > 0) {
          const newCount = dailyChallenge.currentCount + countDelta;
          const isDone = newCount >= dailyChallenge.targetCount;
          const updatedChallenge = {
            ...dailyChallenge,
            currentCount: newCount,
            completed: isDone,
          };
          setDailyChallenge(updatedChallenge);
          StorageService.saveDailyChallenge(updatedChallenge);
          if (isDone) {
            sound.playAchievement();
          }
        }
      }

      // Check In-Round Achievements
      const updatedAchievements = [...achievements];
      let hasNewAchievement = false;

      // On Fire (3 streak)
      const onFire = updatedAchievements.find((a) => a.id === 'on_fire');
      if (onFire && !onFire.unlocked && newStreak >= 3) {
        onFire.unlocked = true;
        onFire.unlockedAt = new Date().toISOString();
        hasNewAchievement = true;
      }

      // Unstoppable (5 streak)
      const unstoppable = updatedAchievements.find((a) => a.id === 'unstoppable');
      if (unstoppable && !unstoppable.unlocked && newStreak >= 5) {
        unstoppable.unlocked = true;
        unstoppable.unlockedAt = new Date().toISOString();
        hasNewAchievement = true;
      }

      // Mind Reader (10 counters on hard/master)
      const mindReader = updatedAchievements.find((a) => a.id === 'mind_reader');
      if (mindReader && !mindReader.unlocked && updatedStats.mindReaderCount >= 10) {
        mindReader.unlocked = true;
        mindReader.unlockedAt = new Date().toISOString();
        hasNewAchievement = true;
      }

      // Arena Legend (10,000 career points)
      const arenaLegend = updatedAchievements.find((a) => a.id === 'arena_legend');
      if (arenaLegend && !arenaLegend.unlocked && updatedStats.totalScore >= 10000) {
        arenaLegend.unlocked = true;
        arenaLegend.unlockedAt = new Date().toISOString();
        hasNewAchievement = true;
      }

      if (hasNewAchievement) {
        setAchievements(updatedAchievements);
        StorageService.saveAchievements(updatedAchievements);
        sound.playAchievement();
        setConfettiTrigger({ id: Date.now(), type: 'achievement' });
      }

      // AI Commentary
      const aiCommentary = AIEngine.getCommentary(effectiveDifficulty, outcome);

      // Trigger reveal overlay
      setRoundOverlay({
        playerMove,
        aiMove,
        outcome,
        pointsEarned: earnedPoints,
        comboMultiplier: newCombo,
        aiCommentary,
        shieldUsed: shieldConsumed,
      });

      // Clear one-time power-up
      setActivePowerUp(null);
      setPredictedMoveHint(null);
    },
    [
      matchConfig,
      currentRound,
      playerScore,
      aiScore,
      playerWins,
      aiWins,
      draws,
      winStreak,
      comboMultiplier,
      activeSpecialEvent,
      activePowerUp,
      matchHistory,
      stats,
      dailyChallenge,
      achievements,
    ]
  );

  // Proceed to next round or end match
  const handleOverlayFinished = () => {
    setRoundOverlay(null);

    // Check match completion conditions:
    const mode = matchConfig.gameMode;
    let isMatchComplete = false;
    let isVictory = false;

    if (mode === 'best_of_3') {
      if (playerWins >= 2) {
        isMatchComplete = true;
        isVictory = true;
      } else if (aiWins >= 2) {
        isMatchComplete = true;
        isVictory = false;
      }
    } else if (mode === 'best_of_5') {
      if (playerWins >= 3) {
        isMatchComplete = true;
        isVictory = true;
      } else if (aiWins >= 3) {
        isMatchComplete = true;
        isVictory = false;
      }
    } else if (mode === 'endless') {
      if (endlessLives <= 0) {
        isMatchComplete = true;
        isVictory = playerWins > aiWins;
      }
    }

    if (isMatchComplete) {
      finalizeMatch(isVictory);
    } else {
      // Advance to next round
      setCurrentRound((r) => r + 1);
      setIsControlsLocked(false);

      // Trigger random Special Event occasionally (every ~3-4 rounds, 30% chance)
      if (Math.random() < 0.3) {
        const events: SpecialEventType[] = ['double_points', 'fury_round', 'ai_boost', 'bonus_round'];
        const chosen = events[Math.floor(Math.random() * events.length)];
        setActiveSpecialEvent(chosen);
        sound.playSpecialEvent();
      } else {
        setActiveSpecialEvent(null);
      }
    }
  };

  // Finalize match, calculate XP, grant rewards & show summary
  const finalizeMatch = (isVictory: boolean) => {
    sound.playWin();

    // XP calculation: 100 for win, 40 for loss, + streak bonus
    const xpGained = (isVictory ? 120 : 40) + bestMatchStreak * 20 + Math.round(playerScore / 10);
    const newXp = profile.xp + xpGained;
    let newLevel = profile.level;
    let newMaxXp = profile.maxXp;

    if (newXp >= newMaxXp) {
      newLevel = Math.min(6, profile.level + 1);
      newMaxXp = Math.round(newMaxXp * 1.6);
      sound.playAchievement();
    }

    // Award random power-up drop on victory
    const updatedPowerUps = { ...profile.powerUps };
    if (isVictory) {
      const keys: PowerUpType[] = ['predict', 'double_score', 'shield', 'reroll'];
      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      updatedPowerUps[randomKey] += 1;
    }

    const updatedProfile: PlayerProfile = {
      ...profile,
      level: newLevel,
      xp: newXp,
      maxXp: newMaxXp,
      powerUps: updatedPowerUps,
    };
    setProfile(updatedProfile);
    StorageService.saveProfile(updatedProfile);

    // Update match stats
    const updatedStats: PlayerStats = {
      ...stats,
      totalGames: stats.totalGames + 1,
      totalWins: isVictory ? stats.totalWins + 1 : stats.totalWins,
      totalLosses: !isVictory ? stats.totalLosses + 1 : stats.totalLosses,
      totalDraws: stats.totalDraws + draws,
      bestWinStreak: Math.max(stats.bestWinStreak, bestMatchStreak),
      highestCombo: Math.max(stats.highestCombo, highestMatchCombo),
    };
    setStats(updatedStats);
    StorageService.saveStats(updatedStats);

    // Check Match End Achievements
    const updatedAchievements = [...achievements];
    let hasNewAch = false;

    // First Blood
    const firstBlood = updatedAchievements.find((a) => a.id === 'first_blood');
    if (firstBlood && !firstBlood.unlocked && isVictory) {
      firstBlood.unlocked = true;
      firstBlood.unlockedAt = new Date().toISOString();
      hasNewAch = true;
    }

    // Champion (10 matches won)
    const champ = updatedAchievements.find((a) => a.id === 'champion');
    if (champ && !champ.unlocked && updatedStats.totalWins >= 10) {
      champ.unlocked = true;
      champ.unlockedAt = new Date().toISOString();
      hasNewAch = true;
    }

    // Perfect Match (won Best of 3/5 with 0 round losses)
    const perfectMatch = updatedAchievements.find((a) => a.id === 'perfect_match');
    if (
      perfectMatch &&
      !perfectMatch.unlocked &&
      isVictory &&
      (matchConfig.gameMode === 'best_of_3' || matchConfig.gameMode === 'best_of_5') &&
      aiWins === 0
    ) {
      perfectMatch.unlocked = true;
      perfectMatch.unlockedAt = new Date().toISOString();
      hasNewAch = true;
    }

    // Master Tactician (90% win rate with min 5 matches)
    const masterAch = updatedAchievements.find((a) => a.id === 'master');
    if (masterAch && !masterAch.unlocked && updatedStats.totalGames >= 5) {
      const rate = (updatedStats.totalWins / updatedStats.totalGames) * 100;
      if (rate >= 90) {
        masterAch.unlocked = true;
        masterAch.unlockedAt = new Date().toISOString();
        hasNewAch = true;
      }
    }

    if (hasNewAch) {
      setAchievements(updatedAchievements);
      StorageService.saveAchievements(updatedAchievements);
    }

    // Save to Leaderboard
    const winRate = currentRound > 0 ? Math.round((playerWins / currentRound) * 100) : 0;
    const newLeaderboard = StorageService.addLeaderboardEntry({
      playerName: matchConfig.playerName,
      avatar: matchConfig.avatar,
      score: playerScore,
      wins: playerWins,
      winRate,
      bestStreak: bestMatchStreak,
      difficulty: matchConfig.difficulty,
      gameMode: matchConfig.gameMode,
    });
    setLeaderboard(newLeaderboard);

    // Populate summary modal
    setMatchSummary({
      playerName: matchConfig.playerName,
      avatar: matchConfig.avatar,
      gameMode: matchConfig.gameMode,
      difficulty: matchConfig.difficulty,
      playerWins,
      aiWins,
      draws,
      totalRounds: currentRound,
      finalScore: playerScore,
      bestStreak: bestMatchStreak,
      highestCombo: highestMatchCombo,
      isVictory,
      history: matchHistory,
      xpGained,
    });
  };

  // Claim Daily Mission Reward
  const handleClaimDailyReward = () => {
    if (dailyChallenge.claimed || !dailyChallenge.completed) return;

    const updated = { ...dailyChallenge, claimed: true };
    setDailyChallenge(updated);
    StorageService.saveDailyChallenge(updated);

    const updatedProfile = {
      ...profile,
      xp: profile.xp + dailyChallenge.rewardXP,
    };
    setProfile(updatedProfile);
    StorageService.saveProfile(updatedProfile);

    const updatedStats = {
      ...stats,
      totalScore: stats.totalScore + dailyChallenge.rewardPoints,
    };
    setStats(updatedStats);
    StorageService.saveStats(updatedStats);

    setConfettiTrigger({ id: Date.now(), type: 'achievement' });
  };

  // Profile name update
  const handleUpdateName = (newName: string) => {
    const updated = { ...profile, name: newName };
    setProfile(updated);
    StorageService.saveProfile(updated);
  };

  // Destructive reset handlers
  const handleResetStats = () => {
    StorageService.resetStats();
    setStats(StorageService.getStats());
  };

  const handleResetAchievements = () => {
    StorageService.resetAchievements();
    setAchievements(StorageService.getAchievements());
  };

  const handleClearLeaderboard = () => {
    StorageService.resetLeaderboard();
    setLeaderboard(StorageService.getLeaderboard());
  };

  const handleResetAll = () => {
    StorageService.resetAll();
    setProfile(StorageService.getProfile());
    setStats(StorageService.getStats());
    setAchievements(StorageService.getAchievements());
    setLeaderboard(StorageService.getLeaderboard());
    setSettings(StorageService.getSettings());
    setDailyChallenge(StorageService.getDailyChallenge());
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 font-rajdhani overflow-x-hidden">
      {/* Dynamic Animated Canvas Background */}
      <NeonBackground
        theme={settings.neonTheme}
        enabled={settings.animationsEnabled}
        reducedMotion={settings.reducedMotion}
      />

      {/* Confetti celebration canvas */}
      <ConfettiCanvas trigger={confettiTrigger} />

      {/* Main Screens */}
      {currentScreen === 'start' ? (
        <StartScreen
          profile={profile}
          settings={settings}
          onStartMatch={() => setSetupModalOpen(true)}
          onOpenLeaderboard={() => setLeaderboardModalOpen(true)}
          onOpenStatistics={() => setStatsModalOpen(true)}
          onOpenSettings={() => setSettingsModalOpen(true)}
          onOpenHowToPlay={() => setHowToPlayModalOpen(true)}
          onOpenProfile={() => setProfileModalOpen(true)}
          onOpenDaily={() => setDailyModalOpen(true)}
          onToggleSound={() => {
            const updated = { ...settings, soundEnabled: !settings.soundEnabled };
            setSettings(updated);
            StorageService.saveSettings(updated);
            sound.setSettings(updated.soundEnabled, updated.musicEnabled, updated.volume);
          }}
          onToggleMusic={() => {
            const updated = { ...settings, musicEnabled: !settings.musicEnabled };
            setSettings(updated);
            StorageService.saveSettings(updated);
            sound.setSettings(updated.soundEnabled, updated.musicEnabled, updated.volume);
          }}
        />
      ) : (
        <GameArena
          playerName={matchConfig.playerName}
          avatar={matchConfig.avatar}
          profile={profile}
          difficulty={matchConfig.difficulty}
          gameMode={matchConfig.gameMode}
          currentRound={currentRound}
          maxRounds={getMaxRounds(matchConfig.gameMode)}
          playerScore={playerScore}
          aiScore={aiScore}
          playerWins={playerWins}
          aiWins={aiWins}
          winStreak={winStreak}
          comboMultiplier={comboMultiplier}
          endlessLives={endlessLives}
          activeSpecialEvent={activeSpecialEvent}
          activePowerUp={activePowerUp}
          aiStatusMessage={aiStatusMessage}
          isControlsLocked={isControlsLocked}
          predictedMoveHint={predictedMoveHint}
          onSelectMove={handleSelectMove}
          onActivatePowerUp={handleActivatePowerUp}
          onPause={() => setPauseModalOpen(true)}
        />
      )}

      {/* Round Clash & Result Overlay */}
      {roundOverlay && (
        <RoundResultOverlay
          playerMove={roundOverlay.playerMove}
          aiMove={roundOverlay.aiMove}
          outcome={roundOverlay.outcome}
          pointsEarned={roundOverlay.pointsEarned}
          comboMultiplier={roundOverlay.comboMultiplier}
          aiCommentary={roundOverlay.aiCommentary}
          shieldUsed={roundOverlay.shieldUsed}
          onFinished={handleOverlayFinished}
        />
      )}

      {/* Match Result Summary Modal */}
      <MatchResultModal
        summary={matchSummary}
        onPlayAgain={() => handleLaunchMatch(matchConfig)}
        onChangeMode={() => {
          setMatchSummary(null);
          setSetupModalOpen(true);
        }}
        onMainMenu={() => {
          setMatchSummary(null);
          setCurrentScreen('start');
        }}
      />

      {/* Match Configuration Modal */}
      <PlayerSetupModal
        isOpen={setupModalOpen}
        profile={profile}
        initialDifficulty={matchConfig.difficulty}
        onClose={() => setSetupModalOpen(false)}
        onLaunchMatch={handleLaunchMatch}
      />

      {/* Statistics Modal */}
      <StatisticsModal
        isOpen={statsModalOpen}
        stats={stats}
        onClose={() => setStatsModalOpen(false)}
      />

      {/* Achievements Modal */}
      <AchievementsModal
        isOpen={achievementsModalOpen}
        achievements={achievements}
        onClose={() => setAchievementsModalOpen(false)}
      />

      {/* Leaderboard Modal */}
      <LeaderboardModal
        isOpen={leaderboardModalOpen}
        entries={leaderboard}
        onClose={() => setLeaderboardModalOpen(false)}
      />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={profileModalOpen}
        profile={profile}
        stats={stats}
        onClose={() => setProfileModalOpen(false)}
        onUpdateName={handleUpdateName}
      />

      {/* Daily Challenge Modal */}
      <DailyChallengeModal
        isOpen={dailyModalOpen}
        challenge={dailyChallenge}
        onClose={() => setDailyModalOpen(false)}
        onClaimReward={handleClaimDailyReward}
      />

      {/* How To Play Modal */}
      <HowToPlayModal
        isOpen={howToPlayModalOpen}
        onClose={() => setHowToPlayModalOpen(false)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsModalOpen}
        settings={settings}
        onClose={() => setSettingsModalOpen(false)}
        onUpdateSettings={(newSettings) => {
          setSettings(newSettings);
          StorageService.saveSettings(newSettings);
        }}
        onResetStats={handleResetStats}
        onResetAchievements={handleResetAchievements}
        onClearLeaderboard={handleClearLeaderboard}
        onResetAll={handleResetAll}
      />

      {/* In-Game Pause Modal */}
      <PauseModal
        isOpen={pauseModalOpen}
        onResume={() => setPauseModalOpen(false)}
        onRestart={() => {
          setPauseModalOpen(false);
          handleLaunchMatch(matchConfig);
        }}
        onOpenSettings={() => {
          setPauseModalOpen(false);
          setSettingsModalOpen(true);
        }}
        onMainMenu={() => {
          setPauseModalOpen(false);
          setCurrentScreen('start');
        }}
      />
    </div>
  );
}
