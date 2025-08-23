import { GoogleGenAI } from "@google/genai";
import { categories, type Category, type WordResponse } from "../shared/schema";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { dailyWords } from "../shared/schema";
import { eq } from "drizzle-orm";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

export async function generateDailyWord(usedWords: string[] = []): Promise<WordResponse> {
  try {
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

    const category = categories[Math.floor(Math.random() * categories.length)];
    const usedWordsStr = usedWords.length > 0 ? usedWords.join(', ') : 'none';

    const prompt = `Generate a single 5-letter word in the category "${category}". 
    The word must be:
    - Exactly 5 letters long
    - A common English word
    - Related to the category "${category}"
    - Not one of these already used words: ${usedWordsStr}

    Respond with ONLY the word in uppercase, nothing else.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const word = response.text().trim().toUpperCase();

    if (!word || word.length !== 5 || !/^[A-Z]+$/.test(word)) {
      throw new Error(`Invalid word generated: ${word}`);
    }

    if (usedWords.includes(word)) {
      return generateDailyWord(usedWords);
    }

    const today = new Date().toISOString().split('T')[0];

    return {
      date: today,
      word,
      category
    };
  } catch (error) {
    console.error('Error generating word with Gemini:', error);
    throw new Error('Failed to generate word with AI');
  }
}

export async function generateAIUsername(): Promise<string> {
  try {
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Generate a creative, unique username for a word game player. 
    The username should be:
    - 8-15 characters long
    - Fun and memorable
    - Can include letters, numbers, and underscores
    - Word/language related if possible

    Respond with ONLY the username, nothing else.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const username = response.text().trim();

    if (!username || username.length < 3 || username.length > 20) {
      throw new Error('Invalid username generated');
    }

    return username;
  } catch (error) {
    console.error('Error generating username with Gemini:', error);
    const fallbackUsernames = [
      'WordWizard', 'LetterLover', 'GuessGuru', 'WordSmith', 'PuzzlePro',
      'LetterLegend', 'WordWarrior', 'GuessGenius', 'VocabVirtuoso', 'WordWise'
    ];
    return fallbackUsernames[Math.floor(Math.random() * fallbackUsernames.length)] + Math.floor(Math.random() * 1000);
  }
}

export async function loadUsedWords(): Promise<string[]> {
  try {
    const words = await db.select({ word: dailyWords.word }).from(dailyWords);
    return words.map(w => w.word);
  } catch (error) {
    console.error('Error loading used words from database:', error);
    return [];
  }
}

export async function saveDailyWord(wordData: WordResponse): Promise<void> {
  // This function is kept for compatibility but actual saving is done in the API routes
  console.log('Word data prepared for saving:', wordData);
}

export async function loadTodayWord(): Promise<WordResponse | null> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const result = await db.select().from(dailyWords).where(eq(dailyWords.date, today)).limit(1);

    if (result.length === 0) {
      return null;
    }

    return {
      date: result[0].date,
      word: result[0].word,
      category: result[0].category as Category
    };
  } catch (error) {
    console.error('Error loading today\'s word from database:', error);
    return null;
  }
}