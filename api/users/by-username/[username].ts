
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { users } from '../../../shared/schema';
import { eq } from 'drizzle-orm';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { username } = req.query;
    const user = await db.select().from(users).where(eq(users.username, username as string)).limit(1);
    
    if (user.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(user[0]);
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ 
      message: "Failed to get user. Please try again."
    });
  }
}
