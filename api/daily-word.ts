import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateDailyWord, loadUsedWords, saveDailyWord, loadTodayWord } from '../server/services/gemini-vercel';
import { storage } from '../server/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if we have today's word
    let todayWord = await loadTodayWord();
    
    if (!todayWord || todayWord.date !== today) {
      // Generate new word for today
      const usedWords = await loadUsedWords();
      todayWord = await generateDailyWord(usedWords);
      await saveDailyWord(todayWord);
      
      // Store in memory storage
      await storage.createDailyWord({
        date: todayWord.date,
        word: todayWord.word,
        category: todayWord.category
      });
    }
    
    res.json(todayWord);
  } catch (error) {
    console.error('Error getting daily word:', error);
    res.status(500).json({ 
      message: "Failed to get daily word. Please try again later.",
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
}