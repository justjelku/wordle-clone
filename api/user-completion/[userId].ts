import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../server/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;
    
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    const today = new Date().toISOString().split('T')[0];
    const completedGame = await storage.hasUserCompletedToday(userId, today);
    res.json({ 
      completed: !!completedGame,
      game: completedGame 
    });
  } catch (error) {
    console.error('Error checking if user completed today:', error);
    res.status(500).json({ 
      message: "Failed to check completion status. Please try again."
    });
  }
}