import type { VercelRequest, VercelResponse } from '@vercel/node';
import { insertGameStatsSchema } from '../shared/schema';
import { storage } from '../server/storage';
import { loadTodayWord } from '../server/services/gemini-vercel';
import { z } from 'zod';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const validatedData = insertGameStatsSchema.parse(req.body);
    
    // Get today's word to fill in the category if missing
    if (!validatedData.category) {
      const todayWord = await loadTodayWord();
      if (todayWord) {
        validatedData.category = todayWord.category;
      }
    }
    
    const stats = await storage.createGameStats(validatedData);
    res.json(stats);
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