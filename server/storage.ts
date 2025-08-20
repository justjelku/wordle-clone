import { type DailyWord, type InsertDailyWord, type GameStats, type InsertGameStats } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getDailyWord(date: string): Promise<DailyWord | undefined>;
  createDailyWord(word: InsertDailyWord): Promise<DailyWord>;
  getAllDailyWords(): Promise<DailyWord[]>;
  getGameStats(date: string): Promise<GameStats | undefined>;
  createGameStats(stats: InsertGameStats): Promise<GameStats>;
}

export class MemStorage implements IStorage {
  private dailyWords: Map<string, DailyWord>;
  private gameStats: Map<string, GameStats>;

  constructor() {
    this.dailyWords = new Map();
    this.gameStats = new Map();
  }

  async getDailyWord(date: string): Promise<DailyWord | undefined> {
    return this.dailyWords.get(date);
  }

  async createDailyWord(insertWord: InsertDailyWord): Promise<DailyWord> {
    const id = randomUUID();
    const word: DailyWord = { 
      ...insertWord, 
      id,
      createdAt: new Date()
    };
    this.dailyWords.set(insertWord.date, word);
    return word;
  }

  async getAllDailyWords(): Promise<DailyWord[]> {
    return Array.from(this.dailyWords.values());
  }

  async getGameStats(date: string): Promise<GameStats | undefined> {
    return this.gameStats.get(date);
  }

  async createGameStats(insertStats: InsertGameStats): Promise<GameStats> {
    const id = randomUUID();
    const stats: GameStats = { 
      ...insertStats, 
      id,
      guesses: insertStats.guesses as string[]
    };
    this.gameStats.set(insertStats.date, stats);
    return stats;
  }
}

export const storage = new MemStorage();
