
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from './lib/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, query } = req;
  
  try {
    const { userId, action } = query;
    
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    // GET /api/user-data?userId=123&action=stats - Get user stats
    if (method === 'GET' && action === 'stats') {
      const stats = await storage.getUserStats(parseInt(userId));
      return res.json(stats);
    }
    
    // GET /api/user-data?userId=123&action=completion - Check completion
    if (method === 'GET' && action === 'completion') {
      const today = new Date().toISOString().split('T')[0];
      const completed = await storage.checkUserCompletedToday(parseInt(userId), today);
      return res.json({ completed });
    }
    
    return res.status(405).json({ message: 'Method not allowed' });
    
  } catch (error) {
    console.error('Error in user data API:', error);
    res.status(500).json({ 
      message: "Internal server error"
    });
  }
}
