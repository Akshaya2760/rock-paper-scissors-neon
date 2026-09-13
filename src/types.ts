export type Move = 'rock' | 'paper' | 'scissors';

export type GameMode = 'classic' | 'best_of_3' | 'best_of_5' | 'endless' | 'challenge';

export type Difficulty = 'easy' | 'normal' | 'hard' | 'master';

export type RoundOutcome = 'win' | 'loss' | 'draw';

export type PowerUpType = 'predict' | 'double_score' | 'shield' | 'reroll';

export type SpecialEventType = 'double_points' | 'fury_round' | 'ai_boost' | 'bonus_round';

export interface PowerUpInventory {
  predict: number;
  double_score: number;
  shield: number;
  reroll: number;
}

export interface MoveStats {
  rock: number;
  paper: number;
  scissors: number;
}

export interface PlayerStats {
  totalGames: number;
  totalWins: number;
  totalLosses: number;
  totalDraws: number;
  bestWinStreak: number;
  highestCombo: number;
  totalScore: number;
  rockUsed: number;
  paperUsed: number;
  scissorsUsed: number;
  mindReaderCount: number;
}

export interface Achievement {
  id: string;
  title: string;
  icon: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
}

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  avatar: string;
  score: number;
  wins: number;
  winRate: number; // percentage, e.g. 75
  bestStreak: number;
  difficulty: Difficulty;
  gameMode: GameMode;
  date: string;
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  volume: number; // 0 to 1
  animationsEnabled: boolean;
  reducedMotion: boolean;
  neonTheme: 'cyber' | 'synthwave' | 'matrix' | 'solar';
  defaultDifficulty: Difficulty;
}

export interface DailyChallenge {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  description: string;
  targetCount: number;
  currentCount: number;
  type: 'use_move' | 'reach_streak' | 'reach_score' | 'win_match_no_rock';
  targetMove?: Move;
  rewardXP: number;
  rewardPoints: number;
  completed: boolean;
  claimed: boolean;
}

export interface PlayerProfile {
  name: string;
  avatar: string;
  level: number;
  xp: number;
  maxXp: number;
  powerUps: PowerUpInventory;
}

export interface RoundHistoryItem {
  roundNumber: number;
  playerMove: Move;
  aiMove: Move;
  outcome: RoundOutcome;
  pointsEarned: number;
  comboMultiplier: number;
  specialEvent?: SpecialEventType | null;
}

export interface MatchSummary {
  playerName: string;
  avatar: string;
  gameMode: GameMode;
  difficulty: Difficulty;
  playerWins: number;
  aiWins: number;
  draws: number;
  totalRounds: number;
  finalScore: number;
  bestStreak: number;
  highestCombo: number;
  isVictory: boolean;
  history: RoundHistoryItem[];
  xpGained: number;
}
