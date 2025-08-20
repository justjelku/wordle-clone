import type { InsertDailyWord, DailyWord, InsertGameStats, GameStats, InsertUser, User, UserStats, LeaderboardEntry } from "@shared/schema";
import { dailyWords, users, gameStats } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // Daily words
  createDailyWord(data: InsertDailyWord): Promise<DailyWord>;
  getDailyWordByDate(date: string): Promise<DailyWord | null>;
  
  // Users
  createUser(data: InsertUser): Promise<User>;
  getUserByUsername(username: string): Promise<User | null>;
  getUserById(id: string): Promise<User | null>;
  
  // Game stats
  createGameStats(data: InsertGameStats): Promise<GameStats>;
  getGameStatsByDate(date: string): Promise<GameStats[]>;
  getUserStats(userId: string): Promise<UserStats>;
  getLeaderboard(limit?: number): Promise<LeaderboardEntry[]>;
  getTodayTopPatterns(date: string): Promise<Array<{ username: string; guesses: string[]; guessCount: number; }>>;
}

export class MemStorage implements IStorage {
  private dailyWords: DailyWord[] = [];
  private users: User[] = [];
  private gameStats: GameStats[] = [];
  private nextId = 1;

  async createDailyWord(data: InsertDailyWord): Promise<DailyWord> {
    const word: DailyWord = {
      id: String(this.nextId++),
      createdAt: new Date(),
      ...data
    };
    this.dailyWords.push(word);
    return word;
  }

  async getDailyWordByDate(date: string): Promise<DailyWord | null> {
    return this.dailyWords.find(word => word.date === date) || null;
  }

  async createUser(data: InsertUser): Promise<User> {
    const user: User = {
      id: String(this.nextId++),
      createdAt: new Date(),
      ...data
    };
    this.users.push(user);
    return user;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    return this.users.find(user => user.username === username) || null;
  }

  async getUserById(id: string): Promise<User | null> {
    return this.users.find(user => user.id === id) || null;
  }

  async createGameStats(data: InsertGameStats): Promise<GameStats> {
    const gameStats: GameStats = {
      id: String(this.nextId++),
      date: data.date,
      word: data.word,
      category: data.category,
      userId: data.userId || null,
      guesses: data.guesses as string[],
      completed: data.completed,
      guessCount: data.guessCount,
      completedAt: new Date()
    };
    this.gameStats.push(gameStats);
    return gameStats;
  }

  async getGameStatsByDate(date: string): Promise<GameStats[]> {
    return this.gameStats.filter(stats => stats.date === date);
  }

  async getUserStats(userId: string): Promise<UserStats> {
    const userGames = this.gameStats.filter(stats => stats.userId === userId);
    const user = await this.getUserById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    const gamesWon = userGames.filter(game => game.completed === 'won');
    const totalGames = userGames.length;
    const averageGuesses = gamesWon.length > 0 ? 
      gamesWon.reduce((sum, game) => sum + game.guessCount, 0) / gamesWon.length : 0;
    const bestGuess = gamesWon.length > 0 ? 
      Math.min(...gamesWon.map(game => game.guessCount)) : 0;

    // Calculate streaks
    const sortedGames = userGames.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;

    for (const game of sortedGames) {
      if (game.completed === 'won') {
        tempStreak++;
        maxStreak = Math.max(maxStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    // Current streak from the end
    for (let i = sortedGames.length - 1; i >= 0; i--) {
      if (sortedGames[i].completed === 'won') {
        currentStreak++;
      } else {
        break;
      }
    }

    const foundWords = gamesWon.map(game => ({
      word: game.word,
      category: game.category,
      date: game.date,
      guessCount: game.guessCount
    }));

    return {
      username: user.username,
      totalGames,
      gamesWon: gamesWon.length,
      averageGuesses: Math.round(averageGuesses * 10) / 10,
      bestGuess,
      currentStreak,
      maxStreak,
      foundWords
    };
  }

  async getLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
    const userStatsMap = new Map<string, any>();
    
    // Group games by user
    for (const game of this.gameStats) {
      if (!game.userId) continue;
      
      if (!userStatsMap.has(game.userId)) {
        const user = await this.getUserById(game.userId);
        if (!user) continue;
        
        userStatsMap.set(game.userId, {
          username: user.username,
          totalGames: 0,
          gamesWon: 0,
          totalGuesses: 0,
          currentStreak: 0
        });
      }
      
      const stats = userStatsMap.get(game.userId);
      stats.totalGames++;
      if (game.completed === 'won') {
        stats.gamesWon++;
        stats.totalGuesses += game.guessCount;
      }
    }
    
    // Calculate stats and sort
    const leaderboard: LeaderboardEntry[] = Array.from(userStatsMap.values())
      .map(stats => ({
        username: stats.username,
        totalGames: stats.totalGames,
        gamesWon: stats.gamesWon,
        winRate: stats.totalGames > 0 ? Math.round((stats.gamesWon / stats.totalGames) * 100) : 0,
        averageGuesses: stats.gamesWon > 0 ? Math.round((stats.totalGuesses / stats.gamesWon) * 10) / 10 : 0,
        currentStreak: stats.currentStreak
      }))
      .sort((a, b) => {
        // Sort by win rate first, then by average guesses (lower is better)
        if (b.winRate !== a.winRate) return b.winRate - a.winRate;
        if (a.averageGuesses !== b.averageGuesses) return a.averageGuesses - b.averageGuesses;
        return b.totalGames - a.totalGames;
      })
      .slice(0, limit);
    
    return leaderboard;
  }

  async getTodayTopPatterns(date: string): Promise<Array<{ username: string; guesses: string[]; guessCount: number; }>> {
    // Get all games for today
    const todayGames = this.gameStats.filter(game => game.date === date && game.completed === 'won');
    
    // Sort by guess count (ascending) and take top 3
    const topGames = todayGames
      .sort((a, b) => a.guessCount - b.guessCount)
      .slice(0, 3);
    
    // Get usernames for the top games
    const patterns = [];
    for (const game of topGames) {
      const user = this.users.find(u => u.id === game.userId);
      if (user) {
        patterns.push({
          username: user.username,
          guesses: game.guesses,
          guessCount: game.guessCount
        });
      }
    }
    
    return patterns;
  }
}

export class DatabaseStorage implements IStorage {
  async createDailyWord(data: InsertDailyWord): Promise<DailyWord> {
    const [word] = await db.insert(dailyWords).values(data).returning();
    return word;
  }

  async getDailyWordByDate(date: string): Promise<DailyWord | null> {
    const [word] = await db.select().from(dailyWords).where(eq(dailyWords.date, date));
    return word || null;
  }

  async createUser(data: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || null;
  }

  async getUserById(id: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || null;
  }

  async createGameStats(data: InsertGameStats): Promise<GameStats> {
    const gameData = {
      ...data,
      guesses: data.guesses as string[]
    };
    const [stats] = await db.insert(gameStats).values(gameData).returning();
    return stats;
  }

  async getGameStatsByDate(date: string): Promise<GameStats[]> {
    return await db.select().from(gameStats).where(eq(gameStats.date, date));
  }

  async getUserStats(userId: string): Promise<UserStats> {
    const user = await this.getUserById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    const userGames = await db.select().from(gameStats).where(eq(gameStats.userId, userId));
    const gamesWon = userGames.filter(game => game.completed === 'won');
    const totalGames = userGames.length;
    const averageGuesses = gamesWon.length > 0 ? 
      gamesWon.reduce((sum, game) => sum + game.guessCount, 0) / gamesWon.length : 0;
    const bestGuess = gamesWon.length > 0 ? 
      Math.min(...gamesWon.map(game => game.guessCount)) : 0;

    // Calculate streaks
    const sortedGames = userGames.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;

    for (const game of sortedGames) {
      if (game.completed === 'won') {
        tempStreak++;
        maxStreak = Math.max(maxStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    // Current streak from the end
    for (let i = sortedGames.length - 1; i >= 0; i--) {
      if (sortedGames[i].completed === 'won') {
        currentStreak++;
      } else {
        break;
      }
    }

    const foundWords = gamesWon.map(game => ({
      word: game.word,
      category: game.category,
      date: game.date,
      guessCount: game.guessCount
    }));

    return {
      username: user.username,
      totalGames,
      gamesWon: gamesWon.length,
      averageGuesses: Math.round(averageGuesses * 10) / 10,
      bestGuess,
      currentStreak,
      maxStreak,
      foundWords
    };
  }

  async getLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
    // Get all users and their stats
    const allUsers = await db.select().from(users);
    const leaderboardData: LeaderboardEntry[] = [];
    
    for (const user of allUsers) {
      const userGames = await db.select().from(gameStats).where(eq(gameStats.userId, user.id));
      const gamesWon = userGames.filter(game => game.completed === 'won');
      const totalGames = userGames.length;
      
      if (totalGames > 0) {
        const winRate = Math.round((gamesWon.length / totalGames) * 100);
        const averageGuesses = gamesWon.length > 0 ? 
          Math.round((gamesWon.reduce((sum, game) => sum + game.guessCount, 0) / gamesWon.length) * 10) / 10 : 0;
        
        leaderboardData.push({
          username: user.username,
          totalGames,
          gamesWon: gamesWon.length,
          winRate,
          averageGuesses,
          currentStreak: 0 // TODO: Calculate current streak
        });
      }
    }
    
    return leaderboardData
      .sort((a, b) => {
        // Sort by win rate first, then by average guesses (lower is better)
        if (b.winRate !== a.winRate) return b.winRate - a.winRate;
        if (a.averageGuesses !== b.averageGuesses) return a.averageGuesses - b.averageGuesses;
        return b.totalGames - a.totalGames;
      })
      .slice(0, limit);
  }

  async getTodayTopPatterns(date: string): Promise<Array<{ username: string; guesses: string[]; guessCount: number; }>> {
    // Get all completed won games for today with user info
    const todayGames = await db
      .select({
        username: users.username,
        guesses: gameStats.guesses,
        guessCount: gameStats.guessCount,
        userId: gameStats.userId
      })
      .from(gameStats)
      .innerJoin(users, eq(gameStats.userId, users.id))
      .where(and(eq(gameStats.date, date), eq(gameStats.completed, 'won')))
      .orderBy(gameStats.guessCount)
      .limit(3);
    
    return todayGames.map(game => ({
      username: game.username,
      guesses: game.guesses as string[],
      guessCount: game.guessCount
    }));
  }
}

export const storage = new DatabaseStorage();
