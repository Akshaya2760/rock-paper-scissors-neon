import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { dbService } from './server/db';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Health and MongoDB Status
  app.get('/api/status', async (_req, res) => {
    try {
      const status = await dbService.getStatus();
      res.json(status);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Explicit Reconnect attempt (useful if user adds MONGODB_URI in runtime)
  app.post('/api/reconnect', async (_req, res) => {
    try {
      const connected = await dbService.connect();
      const status = await dbService.getStatus();
      res.json({ connected, status });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Global / MongoDB Leaderboard
  app.get('/api/leaderboard', async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const list = await dbService.getLeaderboard(limit);
      res.json(list);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/leaderboard', async (req, res) => {
    try {
      const entry = req.body;
      if (!entry || !entry.playerName || entry.score === undefined) {
        return res.status(400).json({ error: 'Missing required leaderboard entry fields' });
      }
      const saved = await dbService.addLeaderboardEntry(entry);
      res.json(saved);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Player Profile
  app.get('/api/profile/:name', async (req, res) => {
    try {
      const player = await dbService.getPlayer(req.params.name);
      if (!player) {
        return res.status(404).json({ error: 'Player not found' });
      }
      res.json(player);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/profile', async (req, res) => {
    try {
      const player = req.body;
      if (!player || !player.name) {
        return res.status(400).json({ error: 'Missing player name' });
      }
      await dbService.savePlayer(player);
      res.json({ success: true, player });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Combat Matches / Match History
  app.get('/api/matches', async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 15;
      const matches = await dbService.getRecentMatches(limit);
      res.json(matches);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/matches', async (req, res) => {
    try {
      const match = req.body;
      if (!match || !match.playerName) {
        return res.status(400).json({ error: 'Missing match details' });
      }
      await dbService.recordMatch(match);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Environment mode
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Neon Arena] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
