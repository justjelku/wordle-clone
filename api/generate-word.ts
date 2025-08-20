import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateDailyWord, loadUsedWords, saveDailyWord } from '../server/services/gemini';
import { storage } from '../server/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const usedWords = await loadUsedWords();
    const newWord = await generateDailyWord(usedWords);
    await saveDailyWord(newWord);
    
    await storage.createDailyWord({
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