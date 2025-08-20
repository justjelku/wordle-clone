import { GoogleGenAI } from "@google/genai";
import { categories, type Category, type WordResponse } from "@shared/schema";
import * as fs from "fs";
import * as path from "path";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const DATA_DIR = path.join(process.cwd(), 'data');

export async function generateDailyWord(usedWords: string[] = []): Promise<WordResponse> {
  try {
    // Randomly select a category
    const category = categories[Math.floor(Math.random() * categories.length)];
    
    const systemPrompt = `You are a word generator for a Wordle-style game. 
Generate a single 5-letter English word related to the category "${category}".
The word must:
- Be exactly 5 letters long
- Be a common English word suitable for word games
- Be related to the category: ${category}
- NOT be any of these previously used words: ${usedWords.join(', ')}
- Be appropriate for all ages

Respond with JSON in this exact format:
{
  "date": "${new Date().toISOString().split('T')[0]}",
  "category": "${category}",
  "word": "WORD"
}

The word should be in uppercase letters.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            date: { type: "string" },
            category: { type: "string" },
            word: { type: "string" }
          },
          required: ["date", "category", "word"]
        }
      },
      contents: `Generate a 5-letter word for category: ${category}`,
    });

    const rawJson = response.text;
    
    if (!rawJson) {
      throw new Error("Empty response from Gemini");
    }

    const wordData: WordResponse = JSON.parse(rawJson);
    
    // Validate the word is 5 letters
    if (wordData.word.length !== 5) {
      throw new Error(`Generated word "${wordData.word}" is not 5 letters long`);
    }

    // Validate it's not already used
    if (usedWords.includes(wordData.word.toUpperCase())) {
      throw new Error(`Word "${wordData.word}" has already been used`);
    }

    return {
      date: wordData.date,
      category: wordData.category as Category,
      word: wordData.word.toUpperCase()
    };

  } catch (error) {
    console.error('Error generating word with Gemini:', error);
    throw new Error(`Failed to generate daily word: ${error}`);
  }
}

export async function loadUsedWords(): Promise<string[]> {
  try {
    const filePath = path.join(DATA_DIR, 'used_words.json');
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      return data.words.map((w: any) => w.word.toUpperCase());
    }
    return [];
  } catch (error) {
    console.error('Error loading used words:', error);
    return [];
  }
}

export async function saveDailyWord(wordData: WordResponse): Promise<void> {
  try {
    // Ensure data directory exists
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    // Save to today_word.json
    const todayPath = path.join(DATA_DIR, 'today_word.json');
    fs.writeFileSync(todayPath, JSON.stringify(wordData, null, 2));

    // Update used_words.json
    const usedWordsPath = path.join(DATA_DIR, 'used_words.json');
    let usedWordsData: { words: any[] } = { words: [] };
    
    if (fs.existsSync(usedWordsPath)) {
      usedWordsData = JSON.parse(fs.readFileSync(usedWordsPath, 'utf-8'));
    }

    usedWordsData.words.push({
      date: wordData.date,
      word: wordData.word,
      category: wordData.category
    });

    fs.writeFileSync(usedWordsPath, JSON.stringify(usedWordsData, null, 2));
  } catch (error) {
    console.error('Error saving daily word:', error);
    throw error;
  }
}

export async function loadTodayWord(): Promise<WordResponse | null> {
  try {
    const filePath = path.join(DATA_DIR, 'today_word.json');
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
    return null;
  } catch (error) {
    console.error('Error loading today word:', error);
    return null;
  }
}
