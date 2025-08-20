import { GoogleGenAI } from "@google/genai";
import { categories, type Category, type WordResponse } from "@shared/schema";
import { storage } from "../storage";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateDailyWord(
  usedWords: string[] = [],
): Promise<WordResponse> {
  try {
    // Randomly select a category
    const category = categories[Math.floor(Math.random() * categories.length)];

    const systemPrompt = `You are a word generator for a Wordle-style game. 
Generate a single 5-letter English word related to the category "${category}".
The word must:
- Be exactly 5 letters long
- Be a common English word suitable for word games
- Be related to the category: ${category}
- NOT be any of these previously used words: ${usedWords.join(", ")}
- Be appropriate for all ages

Respond with JSON in this exact format:
{
  "date": "${new Date().toISOString().split("T")[0]}",
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
            word: { type: "string" },
          },
          required: ["date", "category", "word"],
        },
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
      throw new Error(
        `Generated word "${wordData.word}" is not 5 letters long`,
      );
    }

    // Validate it's not already used
    if (usedWords.includes(wordData.word.toUpperCase())) {
      throw new Error(`Word "${wordData.word}" has already been used`);
    }

    return {
      date: wordData.date,
      category: wordData.category as Category,
      word: wordData.word.toUpperCase(),
    };
  } catch (error) {
    console.error("Error generating word with Gemini:", error);
    throw new Error(`Failed to generate daily word: ${error}`);
  }
}

// Vercel-compatible functions using database instead of file system
export async function loadUsedWords(): Promise<string[]> {
  try {
    // This would need to be implemented to load from database
    // For now, return empty array - consider storing used words in database
    return [];
  } catch (error) {
    console.error("Error loading used words:", error);
    return [];
  }
}

export async function saveDailyWord(wordData: WordResponse): Promise<void> {
  try {
    // Save to database instead of file system
    await storage.createDailyWord({
      date: wordData.date,
      word: wordData.word,
      category: wordData.category
    });
  } catch (error) {
    console.error("Error saving daily word:", error);
    throw error;
  }
}

export async function loadTodayWord(): Promise<WordResponse | null> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const todayWord = await storage.getDailyWordByDate(today);
    
    if (!todayWord) {
      return null;
    }
    
    return {
      date: todayWord.date,
      word: todayWord.word,
      category: todayWord.category as Category
    };
  } catch (error) {
    console.error("Error loading today word:", error);
    return null;
  }
}

export async function generateAIUsername(): Promise<string> {
  try {
    const prompt = `Generate a unique, fun, and creative username for a word puzzle game.  
The username must follow these rules:  
- Length: 4–12 characters  
- Style: playful, catchy, and easy to remember  
- No repetition of the same prefix or suffix (avoid patterns like LexiLoot, LexiLark, etc.)  
- Should not include numbers, underscores, or special characters  
- Should not be offensive or inappropriate  
- Can be inspired by wordplay, nature, fantasy, or whimsical vibes  

Give only ONE username as output. No explanations, no punctuation, just the username.

Examples of good style: WordWhiz, PuzzleFox, RiddleRay, CloudMint, NovaBloom, InkFable, JumbleBee.
    
    Return just the username, nothing else.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const username = response.text?.trim();
    if (!username) {
      throw new Error("Empty response from Gemini");
    }

    // Clean up the username (remove quotes, spaces, etc.)
    const cleanUsername = username.replace(/["'\s]/g, "").slice(0, 12);

    return cleanUsername;
  } catch (error) {
    console.error("Error generating username with Gemini:", error);
    // Fallback to random username
    const adjectives = [
      "Quick",
      "Smart",
      "Wise",
      "Bold",
      "Calm",
      "Cool",
      "Bright",
    ];
    const nouns = ["Wolf", "Star", "Bird", "Fish", "Cat", "Bear", "Fox"];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const num = Math.floor(Math.random() * 100);
    return `${adj}${noun}${num}`;
  }
}