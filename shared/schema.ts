import { sql } from "drizzle-orm";
import { pgTable, text, varchar, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const dailyWords = pgTable("daily_words", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: varchar("date").notNull().unique(),
  word: varchar("word", { length: 5 }).notNull(),
  category: varchar("category").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const gameStats = pgTable("game_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: varchar("date").notNull(),
  guesses: json("guesses").$type<string[]>().notNull(),
  completed: varchar("completed").notNull(), // 'won' | 'lost' | 'in_progress'
  guessCount: varchar("guess_count").notNull(),
});

export const insertDailyWordSchema = createInsertSchema(dailyWords).omit({
  id: true,
  createdAt: true,
});

export const insertGameStatsSchema = createInsertSchema(gameStats).omit({
  id: true,
});

export type InsertDailyWord = z.infer<typeof insertDailyWordSchema>;
export type DailyWord = typeof dailyWords.$inferSelect;
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
