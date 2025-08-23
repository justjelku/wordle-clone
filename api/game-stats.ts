
import { Request, Response } from 'express';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { gameStats } from '../shared/schema';
import { insertGameStatsSchema } from '../shared/schema';
import { loadTodayWord } from '../lib/gemini';
import { z } from 'zod';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const validatedData = insertGameStatsSchema.parse(req.body);
    
    if (!validatedData.category) {
      const todayWord = await loadTodayWord();
      if (todayWord) {
        validatedData.category = todayWord.category;
      }
    }
    
    const stats = await db.insert(gameStats).values(validatedData).returning();
    res.json(stats[0]);
  } catch (error) {
    console.error('Error saving game stats:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Invalid game data",
        errors: error.errors
      });
    }
    res.status(500).json({ 
      message: "Failed to save game stats. Please try again."
    });
  }
}
