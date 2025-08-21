import { sql } from "drizzle-orm";
import { pgTable, text, varchar, json, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const dailyWords = pgTable("daily_words", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: varchar("date").notNull().unique(),
  word: varchar("word", { length: 5 }).notNull(),
  category: varchar("category").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const gameStats = pgTable("game_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  date: varchar("date").notNull(),
  word: varchar("word").notNull(),
  category: varchar("category").notNull(),
  guesses: json("guesses").$type<string[]>().notNull(),
  completed: varchar("completed").notNull(), // 'won' | 'lost' | 'in_progress'
  guessCount: integer("guess_count").notNull(),
  completedAt: timestamp("completed_at").defaultNow(),
});

export const insertDailyWordSchema = createInsertSchema(dailyWords).omit({
  id: true,
  createdAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertGameStatsSchema = createInsertSchema(gameStats).omit({
  id: true,
});

export type InsertDailyWord = z.infer<typeof insertDailyWordSchema>;
export type DailyWord = typeof dailyWords.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertGameStats = z.infer<typeof insertGameStatsSchema>;
export type GameStats = typeof gameStats.$inferSelect;

// Additional types for the game
export const categories = [
  'Animals', 'Food', 'Technology', 'Nature', 'Emotions',
  'Sports', 'Music', 'Travel', 'Science', 'Colors',
  'Weather', 'Clothing', 'Transportation', 'Home', 'School'
] as const;
export type Category = typeof categories[number];

export interface TileState {
  letter: string;
  status: 'empty' | 'filled' | 'correct' | 'wrong-position' | 'wrong';
}

export interface GameState {
  currentGuess: string;
  guesses: string[];
  gameStatus: 'playing' | 'won' | 'lost';
  currentRow: number;
}

export interface UserStats {
  username: string;
  totalGames: number;
  gamesWon: number;
  averageGuesses: number;
  bestGuess: number;
  currentStreak: number;
  maxStreak: number;
  foundWords: Array<{
    word: string;
    category: string;
    date: string;
    guessCount: number;
  }>;
}

export interface LeaderboardEntry {
  username: string;
  totalGames: number;
  gamesWon: number;
  winRate: number;
  averageGuesses: number;
  currentStreak: number;
}

export interface WordResponse {
  date: string;
  word: string;
  category: Category;
}

export interface UsedWordsData {
  words: Array<{
    date: string;
    word: string;
    category: Category;
  }>;
}
