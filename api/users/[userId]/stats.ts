
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { gameStats, users } from '../../../shared/schema';
import { eq, and, sql, desc } from 'drizzle-orm';

const dbSql = neon(process.env.DATABASE_URL!);
const db = drizzle(dbSql);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;
    
    const user = await db.select().from(users).where(eq(users.id, userId as string)).limit(1);
    if (user.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const userGames = await db.select().from(gameStats).where(eq(gameStats.userId, userId as string));
    
    const totalGames = userGames.length;
    const gamesWon = userGames.filter(game => game.completed === 'won').length;
    const winRate = totalGames > 0 ? (gamesWon / totalGames) * 100 : 0;
    
    const wonGames = userGames.filter(game => game.completed === 'won');
    const averageGuesses = wonGames.length > 0 
      ? wonGames.reduce((sum, game) => sum + game.guessCount, 0) / wonGames.length 
      : 0;
    
    const bestGuess = wonGames.length > 0 
      ? Math.min(...wonGames.map(game => game.guessCount))
      : 0;
    
    // Calculate current streak
    const sortedGames = userGames
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    let currentStreak = 0;
    for (const game of sortedGames) {
      if (game.completed === 'won') {
        currentStreak++;
      } else {
        break;
      }
    }
    
    // Calculate max streak
    let maxStreak = 0;
    let tempStreak = 0;
    for (const game of sortedGames.reverse()) {
      if (game.completed === 'won') {
        tempStreak++;
        maxStreak = Math.max(maxStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }
    
    const foundWords = wonGames.map(game => ({
      word: game.word,
      category: game.category,
      date: game.date,
      guessCount: game.guessCount
    }));
    
    const stats = {
      username: user[0].username,
      totalGames,
      gamesWon,
      winRate,
      averageGuesses,
      bestGuess,
      currentStreak,
      maxStreak,
      foundWords
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error getting user stats:', error);
    res.status(500).json({ 
      message: "Failed to get user stats. Please try again."
    });
  }
}
