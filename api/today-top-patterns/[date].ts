import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from './../lib/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { date } = req.query;
    
    if (!date || typeof date !== 'string') {
      return res.status(400).json({ message: 'Date is required' });
    }
    
    const patterns = await storage.getTodayTopPatterns(date);
    res.json(patterns);
  } catch (error) {
    console.error('Error fetching today\'s patterns:', error);
    res.status(500).json({ 
      message: "Failed to fetch today's patterns. Please try again."
    });
  }
}