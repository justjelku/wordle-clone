import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from './lib/storage';
import { generateAIUsername } from './lib/gemini-vercel';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, query } = req;

  try {
    // GET /api/users-api?username=xyz - Get user by username
    if (method === 'GET' && query.username) {
      const { username } = query;

      if (typeof username !== 'string') {
        return res.status(400).json({ message: 'Username is required' });
      }

      const user = await storage.getUserByUsername(username);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.json(user);
    }

    // POST /api/users-api - Create user
    if (method === 'POST') {
      const { username, email } = req.body;

      if (!username) {
        return res.status(400).json({ message: "Username is required" });
      }

      const newUser = await storage.createUser({
        username: username
      });
      return res.json(newUser);
    }

    // POST /api/users-api?action=generate-username - Generate AI username
    if (method === 'POST' && query.action === 'generate-username') {
      const username = await generateAIUsername();
      return res.json({ username });
    }

    return res.status(405).json({ message: 'Method not allowed' });

  } catch (error) {
    console.error('Error in users API:', error);
    res.status(500).json({ 
      message: "Internal server error"
    });
  }
}