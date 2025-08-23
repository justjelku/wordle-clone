
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { users, insertUserSchema } from '../shared/schema';
import { z } from 'zod';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const newUser = await db.insert(users).values(validatedData).returning();
      res.json(newUser[0]);
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
  } else if (req.method === 'GET') {
    try {
      const allUsers = await db.select().from(users);
      res.json(allUsers);
    } catch (error) {
      console.error('Error getting users:', error);
      res.status(500).json({ 
        message: "Failed to get users. Please try again."
      });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}
