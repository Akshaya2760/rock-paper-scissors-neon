import { LeaderboardEntry, MatchSummary, PlayerProfile, PlayerStats } from '../types';

export interface MongoStatus {
  connected: boolean;
  uriConfigured: boolean;
  dbName: string;
  counts: {
    players: number;
    leaderboard: number;
    matches: number;
  };
  error: string | null;
  mode: 'mongodb' | 'in-memory-fallback';
}

export interface RemoteMatch {
  playerName: string;
  avatar: string;
  gameMode: string;
  difficulty: string;
  playerWins: number;
  aiWins: number;
  draws: number;
  totalRounds: number;
  finalScore: number;
  bestStreak: number;
  highestCombo: number;
  isVictory: boolean;
  xpGained: number;
  createdAt: string;
}

export class MongoApiService {
  public static async getStatus(): Promise<MongoStatus> {
    try {
      const res = await fetch('/api/status');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err: any) {
      return {
        connected: false,
        uriConfigured: false,
        dbName: 'neon_arena',
        counts: { players: 0, leaderboard: 0, matches: 0 },
        error: err.message || 'API unreachable',
        mode: 'in-memory-fallback',
      };
    }
  }

  public static async retryConnection(): Promise<{ connected: boolean; status: MongoStatus }> {
    try {
      const res = await fetch('/api/reconnect', { method: 'POST' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err: any) {
      return {
        connected: false,
        status: {
          connected: false,
          uriConfigured: false,
          dbName: 'neon_arena',
          counts: { players: 0, leaderboard: 0, matches: 0 },
          error: err.message || 'Connection retry failed',
          mode: 'in-memory-fallback',
        },
      };
    }
  }

  public static async getLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
    try {
      const res = await fetch(`/api/leaderboard?limit=${limit}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.map((d: any, idx: number) => ({
        id: d._id || d.id || `remote_${idx}`,
        playerName: d.playerName,
        avatar: d.avatar,
        score: d.score,
        wins: d.wins,
        winRate: d.winRate,
        bestStreak: d.bestStreak,
        difficulty: d.difficulty,
        gameMode: d.gameMode,
        date: d.date || new Date(d.createdAt || Date.now()).toLocaleDateString(),
      }));
    } catch (err) {
      console.warn('Failed to fetch MongoDB leaderboard, using local fallback:', err);
      return [];
    }
  }

  public static async submitLeaderboardEntry(entry: Omit<LeaderboardEntry, 'id'>): Promise<boolean> {
    try {
      const res = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
      return res.ok;
    } catch (err) {
      console.warn('Failed to submit score to MongoDB:', err);
      return false;
    }
  }

  public static async syncProfile(profile: PlayerProfile, stats?: PlayerStats): Promise<boolean> {
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile.name,
          avatar: profile.avatar,
          level: profile.level,
          xp: profile.xp,
          maxXp: profile.maxXp,
          powerUps: profile.powerUps,
          stats,
        }),
      });
      return res.ok;
    } catch (err) {
      console.warn('Failed to sync profile to MongoDB:', err);
      return false;
    }
  }

  public static async recordMatch(summary: MatchSummary): Promise<boolean> {
    try {
      const res = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName: summary.playerName,
          avatar: summary.avatar,
          gameMode: summary.gameMode,
          difficulty: summary.difficulty,
          playerWins: summary.playerWins,
          aiWins: summary.aiWins,
          draws: summary.draws,
          totalRounds: summary.totalRounds,
          finalScore: summary.finalScore,
          bestStreak: summary.bestStreak,
          highestCombo: summary.highestCombo,
          isVictory: summary.isVictory,
          xpGained: summary.xpGained,
        }),
      });
      return res.ok;
    } catch (err) {
      console.warn('Failed to record match to MongoDB:', err);
      return false;
    }
  }

  public static async getRecentMatches(limit = 10): Promise<RemoteMatch[]> {
    try {
      const res = await fetch(`/api/matches?limit=${limit}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Failed to fetch recent matches from MongoDB:', err);
      return [];
    }
  }
}
