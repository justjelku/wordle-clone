
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from './lib/storage';
import { generateDailyWord, loadUsedWords, saveDailyWord, loadTodayWord } from './lib/gemini-vercel';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, query } = req;
  
  try {
    // GET /api/game-api?action=daily-word - Get daily word
    if (method === 'GET' && query.action === 'daily-word') {
      const today = new Date().toISOString().split('T')[0];
      
      let todayWord = await loadTodayWord();
      
      if (!todayWord || todayWord.date !== today) {
        const usedWords = await loadUsedWords();
        todayWord = await generateDailyWord(usedWords);
        await saveDailyWord(todayWord);
        
        await storage.createDailyWord({
          date: todayWord.date,
          word: todayWord.word,
          category: todayWord.category
        });
      }
      
      return res.json(todayWord);
    }
    
    // POST /api/game-api?action=generate-word - Generate new word
    if (method === 'POST' && query.action === 'generate-word') {
      const usedWords = await loadUsedWords();
      const newWord = await generateDailyWord(usedWords);
      await saveDailyWord(newWord);

      await storage.createDailyWord({
        date: newWord.date,
        word: newWord.word,
        category: newWord.category,
      });

      return res.json(newWord);
    }
    
    // POST /api/game-api?action=submit-stats - Submit game stats
    if (method === 'POST' && query.action === 'submit-stats') {
      const gameResult = req.body;
      await storage.createGameResult(gameResult);
      return res.json({ success: true });
    }
    
    // GET /api/game-api?action=leaderboard - Get leaderboard
    if (method === 'GET' && query.action === 'leaderboard') {
      const limit = query.limit ? parseInt(query.limit as string) : 10;
      const leaderboard = await storage.getLeaderboard(limit);
      return res.json(leaderboard);
    }
    
    // GET /api/game-api?action=top-patterns&date=2024-01-01 - Get top patterns
    if (method === 'GET' && query.action === 'top-patterns') {
      const { date } = query;
      
      if (!date || typeof date !== 'string') {
        return res.status(400).json({ message: 'Date is required' });
      }
      
      const patterns = await storage.getTodayTopPatterns(date);
      return res.json(patterns);
    }
    
    return res.status(405).json({ message: 'Method not allowed' });
    
  } catch (error) {
    console.error('Error in game API:', error);
    res.status(500).json({ 
      message: "Internal server error"
    });
  }
}
