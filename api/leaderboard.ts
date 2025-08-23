
import { Request, Response } from 'express';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { gameStats, users } from '../shared/schema';
import { eq, desc, sql } from 'drizzle-orm';

const dbSql = neon(process.env.DATABASE_URL!);
const db = drizzle(dbSql);

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const leaderboard = await db.select({
      username: users.username,
      totalGames: sql<number>`count(*)`,
      gamesWon: sql<number>`sum(case when ${gameStats.completed} = 'won' then 1 else 0 end)`,
      winRate: sql<number>`round(sum(case when ${gameStats.completed} = 'won' then 1 else 0 end) * 100.0 / count(*), 2)`
    })
    .from(gameStats)
    .innerJoin(users, eq(gameStats.userId, users.id))
    .groupBy(users.username)
    .orderBy(desc(sql`win_rate`))
    .limit(10);

    res.json(leaderboard);
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    res.status(500).json({ 
      message: "Failed to get leaderboard. Please try again."
    });
  }
}
