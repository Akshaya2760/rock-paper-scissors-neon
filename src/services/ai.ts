import { Difficulty, Move, RoundOutcome } from '../types';

export interface AIMoveResult {
  move: Move;
  statusMessage: string;
  predictedPlayerMove?: Move;
}

const ALL_MOVES: Move[] = ['rock', 'paper', 'scissors'];

// Helper to determine what beats what
export const getWinningMoveAgainst = (move: Move): Move => {
  if (move === 'rock') return 'paper';
  if (move === 'paper') return 'scissors';
  return 'rock';
};

export const getLosingMoveAgainst = (move: Move): Move => {
  if (move === 'rock') return 'scissors';
  if (move === 'paper') return 'rock';
  return 'paper';
};

export const resolveRoundOutcome = (playerMove: Move, aiMove: Move): RoundOutcome => {
  if (playerMove === aiMove) return 'draw';
  if (
    (playerMove === 'rock' && aiMove === 'scissors') ||
    (playerMove === 'paper' && aiMove === 'rock') ||
    (playerMove === 'scissors' && aiMove === 'paper')
  ) {
    return 'win';
  }
  return 'loss';
};

export class AIEngine {
  private playerHistory: Move[] = [];
  private roundOutcomes: RoundOutcome[] = [];
  private aiHistory: Move[] = [];

  public reset() {
    this.playerHistory = [];
    this.roundOutcomes = [];
    this.aiHistory = [];
  }

  public recordRound(playerMove: Move, aiMove: Move, outcome: RoundOutcome) {
    this.playerHistory.push(playerMove);
    this.aiHistory.push(aiMove);
    this.roundOutcomes.push(outcome);
  }

  public getAIMove(difficulty: Difficulty): AIMoveResult {
    const randomMove = ALL_MOVES[Math.floor(Math.random() * ALL_MOVES.length)];

    if (this.playerHistory.length === 0 || difficulty === 'easy') {
      const easyStatuses = [
        'AI is warming up...',
        'AI is selecting randomized subroutines...',
        'AI: "Let\'s see what you\'ve got!"',
      ];
      return {
        move: randomMove,
        statusMessage: easyStatuses[Math.floor(Math.random() * easyStatuses.length)],
      };
    }

    if (difficulty === 'normal') {
      // 35% chance to counter most frequent move, otherwise random
      if (Math.random() < 0.35) {
        const mostFreq = this.getMostFrequentMove();
        const counter = getWinningMoveAgainst(mostFreq);
        return {
          move: counter,
          statusMessage: 'AI is analyzing basic tendencies...',
          predictedPlayerMove: mostFreq,
        };
      }
      return {
        move: randomMove,
        statusMessage: 'AI is calculating probabilities...',
      };
    }

    if (difficulty === 'hard') {
      // Markov 1st order transition prediction (e.g. what player did after their previous move)
      const predictedPlayerMove = this.predictNextPlayerMoveMarkov();
      const statusMsgs = [
        'AI detected your transition pattern!',
        'AI is analyzing your sequence...',
        'AI: "I think I know your strategy."',
      ];

      // 65% counter predicted, 35% random for fairness
      if (Math.random() < 0.65) {
        return {
          move: getWinningMoveAgainst(predictedPlayerMove),
          statusMessage: statusMsgs[Math.floor(Math.random() * statusMsgs.length)],
          predictedPlayerMove,
        };
      }
      return {
        move: randomMove,
        statusMessage: 'AI injecting tactical variance...',
      };
    }

    // MASTER DIFFICULTY: Advanced psychological heuristic & pattern model
    const prediction = this.predictMaster();
    const masterMsgs = [
      'AI detected your neural cadence!',
      'AI pattern synthesis: 92% confidence.',
      'AI: "You keep repeating that pattern."',
      'AI predicted counter-strat!',
    ];

    // 75% counter predicted move, 25% curveball
    if (Math.random() < 0.75) {
      return {
        move: getWinningMoveAgainst(prediction),
        statusMessage: masterMsgs[Math.floor(Math.random() * masterMsgs.length)],
        predictedPlayerMove: prediction,
      };
    } else {
      return {
        move: randomMove,
        statusMessage: 'AI simulating non-linear counter-play...',
      };
    }
  }

  private getMostFrequentMove(): Move {
    const counts: Record<Move, number> = { rock: 0, paper: 0, scissors: 0 };
    this.playerHistory.forEach((m) => counts[m]++);
    if (counts.rock >= counts.paper && counts.rock >= counts.scissors) return 'rock';
    if (counts.paper >= counts.scissors) return 'paper';
    return 'scissors';
  }

  // 1st order Markov transition: if player just played X, what do they play next?
  private predictNextPlayerMoveMarkov(): Move {
    if (this.playerHistory.length < 2) {
      return this.getMostFrequentMove();
    }
    const lastMove = this.playerHistory[this.playerHistory.length - 1];
    const transitions: Record<Move, number> = { rock: 0, paper: 0, scissors: 0 };

    for (let i = 0; i < this.playerHistory.length - 1; i++) {
      if (this.playerHistory[i] === lastMove) {
        const next = this.playerHistory[i + 1];
        transitions[next]++;
      }
    }

    const total = transitions.rock + transitions.paper + transitions.scissors;
    if (total === 0) return this.getMostFrequentMove();

    let maxMove: Move = 'rock';
    let maxCount = -1;
    (Object.keys(transitions) as Move[]).forEach((m) => {
      if (transitions[m] > maxCount) {
        maxCount = transitions[m];
        maxMove = m;
      }
    });

    return maxMove;
  }

  // Master prediction incorporates:
  // 1. Win-Stay / Lose-Shift rule of human psychology (Wang et al. Zhejiang University empirical study)
  //    - Winners tend to repeat their winning move
  //    - Losers tend to shift to what beats the move that beat them
  // 2. Repetition fatigue: 2 of same move -> shift to opposite
  // 3. Markov chain transitions
  private predictMaster(): Move {
    const len = this.playerHistory.length;
    if (len === 0) return ALL_MOVES[Math.floor(Math.random() * ALL_MOVES.length)];

    const lastPlayerMove = this.playerHistory[len - 1];
    const lastAI = this.aiHistory[len - 1];
    const lastOutcome = this.roundOutcomes[len - 1];

    // Check for double repeat
    if (len >= 2 && this.playerHistory[len - 1] === this.playerHistory[len - 2]) {
      // Player repeated twice. Humans rarely repeat 3 times unless deliberate.
      // Often switch to whatever beats what AI used to counter them.
      return getWinningMoveAgainst(lastAI);
    }

    // Win-stay / Lose-shift heuristic
    if (lastOutcome === 'win') {
      // Player won -> high probability they repeat winning hand
      return lastPlayerMove;
    } else if (lastOutcome === 'loss') {
      // Player lost -> usually shifts to the move that would beat what AI played
      return getWinningMoveAgainst(lastAI);
    }

    // Otherwise use Markov transition
    return this.predictNextPlayerMoveMarkov();
  }

  // Quotes based on AI personality and state
  public static getCommentary(difficulty: Difficulty, outcome: RoundOutcome, isMatchEnd = false): string {
    const easyQuotes = {
      win: ['"Beginner\'s luck!"', '"Hey, good move!"', '"You got me this time!"'],
      loss: ['"Gotcha!"', '"Practice makes perfect!"', '"Nice try!"'],
      draw: ['"Jinx! Same wavelength."', '"Great minds think alike!"'],
    };

    const normalQuotes = {
      win: ['"Interesting tactic..."', '"You caught me off guard."', '"Clean execution."'],
      loss: ['"Calculated response."', '"I saw that coming."', '"Defense held up."'],
      draw: ['"Symmetrical output."', '"We mirrored calculations."'],
    };

    const hardQuotes = {
      win: ['"Anomaly detected. Recalibrating..."', '"Unexpected sequence choice."', '"Impressive timing."'],
      loss: ['"Your frequencies are transparent."', '"Telemetry predicted that move."', '"Optimal counter applied."'],
      draw: ['"Parity in neural pathways."', '"Calculated standoff."'],
    };

    const masterQuotes = {
      win: ['"Fascinating... an unquantified variable."', '"System adaptation threshold exceeded."', '"Well played, human."'],
      loss: ['"I predicted you 3 cycles ago."', '"Your subconscious gave it away."', '"Neural pattern fully mapped."'],
      draw: ['"Harmonic resonance detected."', '"Zero-sum convergence."'],
    };

    const quoteMap = {
      easy: easyQuotes,
      normal: normalQuotes,
      hard: hardQuotes,
      master: masterQuotes,
    };

    // Note: Outcome is from player's perspective:
    // When player wins (outcome === 'win'), AI lost!
    const key = outcome === 'win' ? 'win' : outcome === 'loss' ? 'loss' : 'draw';
    const list = quoteMap[difficulty][key];
    return list[Math.floor(Math.random() * list.length)];
  }
}
