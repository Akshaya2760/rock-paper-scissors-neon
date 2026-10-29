import { MongoClient, Db, Collection } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

export interface PlayerDoc {
  name: string;
  avatar: string;
  level: number;
  xp: number;
  maxXp: number;
  powerUps: {
    predict: number;
    double_score: number;
    shield: number;
    reroll: number;
  };
  stats?: Record<string, any>;
  updatedAt: Date;
}

export interface LeaderboardDoc {
  id?: string;
  playerName: string;
  avatar: string;
  score: number;
  wins: number;
  winRate: number;
  bestStreak: number;
  difficulty: string;
  gameMode: string;
  date: string;
  createdAt?: Date;
}

export interface MatchDoc {
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
  createdAt: Date;
}

// In-memory fallback storage when MONGODB_URI is not yet provided or cluster is unavailable
const memoryStorage = {
  players: new Map<string, PlayerDoc>(),
  leaderboard: [
    {
      id: 'mock_1',
      playerName: 'CYBER_NEXUS',
      avatar: '🤖',
      score: 1850,
      wins: 12,
      winRate: 85,
      bestStreak: 7,
      difficulty: 'master',
      gameMode: 'best_of_5',
      date: new Date().toLocaleDateString(),
    },
    {
      id: 'mock_2',
      playerName: 'NEON_SHADOW',
      avatar: '🥷',
      score: 1420,
      wins: 9,
      winRate: 78,
      bestStreak: 5,
      difficulty: 'hard',
      gameMode: 'best_of_5',
      date: new Date().toLocaleDateString(),
    },
    {
      id: 'mock_3',
      playerName: 'VOID_WALKER',
      avatar: '👾',
      score: 980,
      wins: 6,
      winRate: 67,
      bestStreak: 4,
      difficulty: 'normal',
      gameMode: 'best_of_3',
      date: new Date().toLocaleDateString(),
    },
  ] as LeaderboardDoc[],
  matches: [] as MatchDoc[],
};

class MongoDatabase {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private isConnected = false;
  private connectionError: string | null = null;
  private dbName = process.env.MONGODB_DB_NAME || 'neon_arena';

  constructor() {
    this.connect();
  }

  public async connect(): Promise<boolean> {
    const uri = process.env.MONGODB_URI;
    if (!uri || uri.includes('username:password')) {
      this.isConnected = false;
      this.connectionError = 'MONGODB_URI not configured in environment. Using in-memory fallback.';
      return false;
    }

    try {
      this.client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
      });

      await this.client.connect();
      this.db = this.client.db(this.dbName);
      this.isConnected = true;
      this.connectionError = null;

      // Ensure indexes
      await this.db.collection('players').createIndex({ name: 1 }, { unique: true }).catch(() => {});
      await this.db.collection('leaderboard').createIndex({ score: -1 }).catch(() => {});
      await this.db.collection('matches').createIndex({ createdAt: -1 }).catch(() => {});

      console.log(`[MongoDB] Successfully connected to database: ${this.dbName}`);
      return true;
    } catch (err: any) {
      this.isConnected = false;
      this.connectionError = err.message || 'Failed to connect to MongoDB cluster';
      console.warn(`[MongoDB Warning] Could not connect to cluster: ${this.connectionError}. In-memory fallback active.`);
      return false;
    }
  }

  public async getStatus() {
    const uriConfigured = Boolean(process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('username:password'));
    let counts = {
      players: memoryStorage.players.size,
      leaderboard: memoryStorage.leaderboard.length,
      matches: memoryStorage.matches.length,
    };

    if (this.isConnected && this.db) {
      try {
        counts = {
          players: await this.db.collection('players').countDocuments(),
          leaderboard: await this.db.collection('leaderboard').countDocuments(),
          matches: await this.db.collection('matches').countDocuments(),
        };
      } catch {
        // use fallback count
      }
    }

    return {
      connected: this.isConnected,
      uriConfigured,
      dbName: this.dbName,
      counts,
      error: this.connectionError,
      mode: this.isConnected ? 'mongodb' : 'in-memory-fallback',
    };
  }

  // Players
  public async getPlayer(name: string): Promise<PlayerDoc | null> {
    if (this.isConnected && this.db) {
      try {
        const doc = await this.db.collection<PlayerDoc>('players').findOne({ name });
        return doc;
      } catch (e) {
        console.error('MongoDB getPlayer error:', e);
      }
    }
    return memoryStorage.players.get(name) || null;
  }

  public async savePlayer(player: PlayerDoc): Promise<boolean> {
    if (this.isConnected && this.db) {
      try {
        await this.db.collection('players').updateOne(
          { name: player.name },
          { $set: { ...player, updatedAt: new Date() } },
          { upsert: true }
        );
        return true;
      } catch (e) {
        console.error('MongoDB savePlayer error:', e);
      }
    }
    memoryStorage.players.set(player.name, { ...player, updatedAt: new Date() });
    return true;
  }

  // Leaderboard
  public async getLeaderboard(limit = 50): Promise<LeaderboardDoc[]> {
    if (this.isConnected && this.db) {
      try {
        const list = await this.db
          .collection<LeaderboardDoc>('leaderboard')
          .find({})
          .sort({ score: -1 })
          .limit(limit)
          .toArray();
        return list;
      } catch (e) {
        console.error('MongoDB getLeaderboard error:', e);
      }
    }
    return [...memoryStorage.leaderboard].sort((a, b) => b.score - a.score).slice(0, limit);
  }

  public async addLeaderboardEntry(entry: LeaderboardDoc): Promise<LeaderboardDoc> {
    const enriched = {
      ...entry,
      createdAt: new Date(),
    };

    if (this.isConnected && this.db) {
      try {
        await this.db.collection('leaderboard').insertOne(enriched);
        return enriched;
      } catch (e) {
        console.error('MongoDB addLeaderboardEntry error:', e);
      }
    }

    memoryStorage.leaderboard.unshift(enriched);
    memoryStorage.leaderboard = memoryStorage.leaderboard.sort((a, b) => b.score - a.score).slice(0, 100);
    return enriched;
  }

  // Matches
  public async recordMatch(match: MatchDoc): Promise<boolean> {
    const doc = { ...match, createdAt: new Date() };
    if (this.isConnected && this.db) {
      try {
        await this.db.collection('matches').insertOne(doc);
        return true;
      } catch (e) {
        console.error('MongoDB recordMatch error:', e);
      }
    }
    memoryStorage.matches.unshift(doc);
    return true;
  }

  public async getRecentMatches(limit = 15): Promise<MatchDoc[]> {
    if (this.isConnected && this.db) {
      try {
        return await this.db
          .collection<MatchDoc>('matches')
          .find({})
          .sort({ createdAt: -1 })
          .limit(limit)
          .toArray();
      } catch (e) {
        console.error('MongoDB getRecentMatches error:', e);
      }
    }
    return memoryStorage.matches.slice(0, limit);
  }
}

export const dbService = new MongoDatabase();
