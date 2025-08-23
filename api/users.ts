
import { NextApiRequest, NextApiResponse } from 'next';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { users } from '../shared/schema';
import { eq } from 'drizzle-orm';
import { insertUserSchema } from '../shared/schema';
import { z } from 'zod';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      const existingUser = await db.select().from(users).where(eq(users.username, validatedData.username)).limit(1);
      if (existingUser.length > 0) {
        return res.status(400).json({ 
          message: "Username already exists"
        });
      }
      
      const user = await db.insert(users).values(validatedData).returning();
      res.json(user[0]);
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
