
import { Request, Response } from 'express';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { dailyWords } from '../shared/schema';
import { eq } from 'drizzle-orm';
import { generateDailyWord, loadUsedWords, saveDailyWord, loadTodayWord } from '../lib/gemini';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if we have today's word in database
    const existingWord = await db.select().from(dailyWords).where(eq(dailyWords.date, today)).limit(1);
    
    if (existingWord.length > 0) {
      return res.json(existingWord[0]);
    }
    
    // Generate new word for today
    const usedWords = await loadUsedWords();
    const todayWord = await generateDailyWord(usedWords);
    await saveDailyWord(todayWord);
    
    // Store in database
    const newWord = await db.insert(dailyWords).values({
      date: todayWord.date,
      word: todayWord.word,
      category: todayWord.category
    }).returning();
    
    res.json(newWord[0]);
  } catch (error) {
    console.error('Error getting daily word:', error);
    res.status(500).json({ 
      message: "Failed to get daily word. Please try again later.",
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
}
