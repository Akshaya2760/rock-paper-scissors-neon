import {
  Achievement,
  DailyChallenge,
  Difficulty,
  GameMode,
  GameSettings,
  LeaderboardEntry,
  Move,
  PlayerProfile,
  PlayerStats,
} from '../types';

const STORAGE_KEYS = {
  PROFILE: 'neon_rps_profile_v1',
  STATS: 'neon_rps_stats_v1',
  ACHIEVEMENTS: 'neon_rps_achievements_v1',
  LEADERBOARD: 'neon_rps_leaderboard_v1',
  SETTINGS: 'neon_rps_settings_v1',
  DAILY_CHALLENGE: 'neon_rps_daily_v1',
};

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_blood',
    title: 'First Blood',
    icon: '🥉',
    description: 'Win your first match in the Neon Arena.',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: 'on_fire',
    title: 'On Fire',
    icon: '🔥',
    description: 'Win 3 rounds consecutively.',
    unlocked: false,
    progress: 0,
    maxProgress: 3,
  },
  {
    id: 'unstoppable',
    title: 'Unstoppable',
    icon: '⚡',
    description: 'Win 5 rounds consecutively.',
    unlocked: false,
    progress: 0,
    maxProgress: 5,
  },
  {
    id: 'champion',
    title: 'Champion',
    icon: '🏆',
    description: 'Win 10 matches total.',
    unlocked: false,
    progress: 0,
    maxProgress: 10,
  },
  {
    id: 'master',
    title: 'Master Tactician',
    icon: '💎',
    description: 'Achieve a 90% or higher win rate (minimum 5 matches).',
    unlocked: false,
    progress: 0,
    maxProgress: 90,
  },
  {
    id: 'mind_reader',
    title: 'Mind Reader',
    icon: '🧠',
    description: 'Successfully counter and defeat the AI 10 times on Hard or Master difficulty.',
    unlocked: false,
    progress: 0,
    maxProgress: 10,
  },
  {
    id: 'perfect_match',
    title: 'Perfect Match',
    icon: '🎯',
    description: 'Win a Best-of-3 or Best-of-5 match without losing a single round.',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: 'arena_legend',
    title: 'Arena Legend',
    icon: '👑',
    description: 'Amass 10,000 total career points.',
    unlocked: false,
    progress: 0,
    maxProgress: 10000,
  },
];

export const INITIAL_PROFILE: PlayerProfile = {
  name: 'CYBER_WARRIOR',
  avatar: '⚡',
  level: 1,
  xp: 0,
  maxXp: 200,
  powerUps: {
    predict: 2,
    double_score: 2,
    shield: 1,
    reroll: 2,
  },
};

export const INITIAL_STATS: PlayerStats = {
  totalGames: 0,
  totalWins: 0,
  totalLosses: 0,
  totalDraws: 0,
  bestWinStreak: 0,
  highestCombo: 1,
  totalScore: 0,
  rockUsed: 0,
  paperUsed: 0,
  scissorsUsed: 0,
  mindReaderCount: 0,
};

export const INITIAL_SETTINGS: GameSettings = {
  soundEnabled: true,
  musicEnabled: false,
  volume: 0.5,
  animationsEnabled: true,
  reducedMotion: false,
  neonTheme: 'cyber',
  defaultDifficulty: 'normal',
};

export const SEED_LEADERBOARD: LeaderboardEntry[] = [
  {
    id: 'lead-1',
    playerName: 'K41_GLITCH',
    avatar: '👾',
    score: 4250,
    wins: 18,
    winRate: 85,
    bestStreak: 7,
    difficulty: 'master',
    gameMode: 'best_of_5',
    date: '2026-09-10',
  },
  {
    id: 'lead-2',
    playerName: 'NOVA_CORE',
    avatar: '🤖',
    score: 3100,
    wins: 14,
    winRate: 78,
    bestStreak: 6,
    difficulty: 'hard',
    gameMode: 'best_of_3',
    date: '2026-09-11',
  },
  {
    id: 'lead-3',
    playerName: 'SYNTH_PULSE',
    avatar: '🦊',
    score: 2200,
    wins: 10,
    winRate: 71,
    bestStreak: 4,
    difficulty: 'normal',
    gameMode: 'classic',
    date: '2026-09-12',
  },
];

export class StorageService {
  public static getProfile(): PlayerProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (data) {
        return { ...INITIAL_PROFILE, ...JSON.parse(data) };
      }
    } catch {}
    return { ...INITIAL_PROFILE };
  }

  public static saveProfile(profile: PlayerProfile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch {}
  }

  public static getStats(): PlayerStats {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STATS);
      if (data) {
        return { ...INITIAL_STATS, ...JSON.parse(data) };
      }
    } catch {}
    return { ...INITIAL_STATS };
  }

  public static saveStats(stats: PlayerStats): void {
    try {
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
    } catch {}
  }

  public static getAchievements(): Achievement[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
      if (data) {
        const saved: Achievement[] = JSON.parse(data);
        return INITIAL_ACHIEVEMENTS.map((item) => {
          const match = saved.find((s) => s.id === item.id);
          return match ? { ...item, ...match } : item;
        });
      }
    } catch {}
    return [...INITIAL_ACHIEVEMENTS];
  }

  public static saveAchievements(achievements: Achievement[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
    } catch {}
  }

  public static getLeaderboard(): LeaderboardEntry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LEADERBOARD);
      if (data) {
        return JSON.parse(data);
      }
    } catch {}
    return [...SEED_LEADERBOARD];
  }

  public static saveLeaderboard(leaderboard: LeaderboardEntry[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(leaderboard));
    } catch {}
  }

  public static addLeaderboardEntry(entry: Omit<LeaderboardEntry, 'id' | 'date'>): LeaderboardEntry[] {
    const current = StorageService.getLeaderboard();
    const newEntry: LeaderboardEntry = {
      ...entry,
      id: 'lb_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      date: new Date().toISOString().split('T')[0],
    };
    const updated = [newEntry, ...current].sort((a, b) => b.score - a.score).slice(0, 50);
    StorageService.saveLeaderboard(updated);
    return updated;
  }

  public static getSettings(): GameSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) {
        return { ...INITIAL_SETTINGS, ...JSON.parse(data) };
      }
    } catch {}
    return { ...INITIAL_SETTINGS };
  }

  public static saveSettings(settings: GameSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch {}
  }

  public static getDailyChallenge(): DailyChallenge {
    const todayStr = new Date().toISOString().split('T')[0];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DAILY_CHALLENGE);
      if (data) {
        const parsed: DailyChallenge = JSON.parse(data);
        if (parsed.date === todayStr) {
          return parsed;
        }
      }
    } catch {}

    // Generate deterministic daily challenge from today's date
    const daySeed = todayStr.split('-').reduce((acc, part) => acc + parseInt(part, 10), 0);
    const challengeTypes = [
      {
        id: `daily_${todayStr}_paper`,
        title: 'Paper Precision',
        description: 'Win 3 rounds using Paper today.',
        targetCount: 3,
        type: 'use_move' as const,
        targetMove: 'paper' as Move,
        rewardXP: 150,
        rewardPoints: 300,
      },
      {
        id: `daily_${todayStr}_streak`,
        title: 'Neon Velocity',
        description: 'Achieve a 4-round winning streak in any mode.',
        targetCount: 4,
        type: 'reach_streak' as const,
        rewardXP: 200,
        rewardPoints: 450,
      },
      {
        id: `daily_${todayStr}_score`,
        title: 'High Roller',
        description: 'Score at least 1,000 points in a single match.',
        targetCount: 1000,
        type: 'reach_score' as const,
        rewardXP: 250,
        rewardPoints: 500,
      },
      {
        id: `daily_${todayStr}_rockless`,
        title: 'Tactical Shift',
        description: 'Win 3 rounds without selecting Rock.',
        targetCount: 3,
        type: 'win_match_no_rock' as const,
        rewardXP: 180,
        rewardPoints: 350,
      },
    ];

    const selected = challengeTypes[daySeed % challengeTypes.length];
    const newChallenge: DailyChallenge = {
      ...selected,
      date: todayStr,
      currentCount: 0,
      completed: false,
      claimed: false,
    };
    StorageService.saveDailyChallenge(newChallenge);
    return newChallenge;
  }

  public static saveDailyChallenge(challenge: DailyChallenge): void {
    try {
      localStorage.setItem(STORAGE_KEYS.DAILY_CHALLENGE, JSON.stringify(challenge));
    } catch {}
  }

  public static resetLeaderboard(): void {
    localStorage.removeItem(STORAGE_KEYS.LEADERBOARD);
  }

  public static resetStats(): void {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(INITIAL_STATS));
  }

  public static resetAchievements(): void {
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(INITIAL_ACHIEVEMENTS));
  }

  public static resetAll(): void {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
  }
}
