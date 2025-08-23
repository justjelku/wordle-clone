
import { NextApiRequest, NextApiResponse } from 'next';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { gameStats, users } from '../shared/schema';
import { eq, sql, desc } from 'drizzle-orm';

const dbSql = neon(process.env.DATABASE_URL!);
const db = drizzle(dbSql);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    
    const leaderboardData = await db
      .select({
        username: users.username,
        totalGames: sql<number>`count(${gameStats.id})`,
        gamesWon: sql<number>`count(case when ${gameStats.completed} = 'won' then 1 end)`,
        winRate: sql<number>`(count(case when ${gameStats.completed} = 'won' then 1 end) * 100.0 / count(${gameStats.id}))`,
        averageGuesses: sql<number>`avg(case when ${gameStats.completed} = 'won' then ${gameStats.guessCount} end)`
      })
      .from(gameStats)
      .innerJoin(users, eq(gameStats.userId, users.id))
      .groupBy(users.id, users.username)
      .orderBy(desc(sql`count(case when ${gameStats.completed} = 'won' then 1 end)`))
      .limit(limit);
    
    res.json(leaderboardData);
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    res.status(500).json({ 
      message: "Failed to get leaderboard. Please try again."
    });
  }
}
