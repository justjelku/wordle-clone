
import { Request, Response } from 'express';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { dailyWords } from '../shared/schema';
import { generateDailyWord, loadUsedWords, saveDailyWord } from '../lib/gemini';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const usedWords = await loadUsedWords();
    const newWord = await generateDailyWord(usedWords);
    await saveDailyWord(newWord);
    
    await db.insert(dailyWords).values({
      date: newWord.date,
      word: newWord.word,
      category: newWord.category
    });
    
    res.json(newWord);
  } catch (error) {
    console.error('Error generating new word:', error);
    res.status(500).json({ 
      message: "Failed to generate new word. Please check your Gemini API key.",
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
}
