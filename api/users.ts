import type { VercelRequest, VercelResponse } from '@vercel/node';
import { insertUserSchema } from '../shared/schema';
import { storage } from '../server/storage';
import { z } from 'zod';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ 
          message: "Username already exists"
        });
      }
      
      const user = await storage.createUser(validatedData);
      res.json(user);
    } catch (error) {
      console.error('Error creating user:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid user data",
          errors: error.errors
        });
      }
      res.status(500).json({ 
        message: "Failed to create user. Please try again."
      });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}