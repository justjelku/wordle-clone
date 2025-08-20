#!/usr/bin/env node

/**
 * Daily Word Generation Script for Wordle Clone
 * 
 * This script generates a new 5-letter word using Google's Gemini AI
 * based on a randomly selected category and saves it to JSON files.
 * 
 * Usage: node scripts/generate_word.js
 * 
 * Environment Variables Required:
 * - GEMINI_API_KEY: Your Google Gemini API key
 */

import { GoogleGenAI } from "@google/genai";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const categories = ['Animals', 'Food', 'Technology', 'Nature', 'Emotions'];
const DATA_DIR = path.join(__dirname, '..', 'data');
const USED_WORDS_FILE = path.join(DATA_DIR, 'used_words.json');
const TODAY_WORD_FILE = path.join(DATA_DIR, 'today_word.json');

// Initialize Gemini AI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

/**
 * Load previously used words to avoid duplicates
 */
function loadUsedWords() {
  try {
    if (fs.existsSync(USED_WORDS_FILE)) {
      const data = JSON.parse(fs.readFileSync(USED_WORDS_FILE, 'utf-8'));
      return data.words.map(w => w.word.toUpperCase());
    }
    return [];
  } catch (error) {
    console.error('Error loading used words:', error.message);
    return [];
  }
}

/**
 * Generate a new word using Gemini AI
 */
async function generateWordWithAI(category, usedWords) {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const systemPrompt = `You are a word generator for a Wordle-style game. 
Generate a single 5-letter English word related to the category "${category}".
The word must:
- Be exactly 5 letters long
- Be a common English word suitable for word games
- Be related to the category: ${category}
- NOT be any of these previously used words: ${usedWords.join(', ')}
- Be appropriate for all ages
- Be a noun when possible

Respond with JSON in this exact format:
{
  "date": "${today}",
  "category": "${category}",
  "word": "WORD"
}

The word should be in uppercase letters.`;

    console.log(`🤖 Generating word for category: ${category}`);
    console.log(`📝 Avoiding ${usedWords.length} previously used words`);

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

    const wordData = JSON.parse(rawJson);
    
    // Validate the generated word
    if (wordData.word.length !== 5) {
      throw new Error(`Generated word "${wordData.word}" is not 5 letters long`);
    }

    if (usedWords.includes(wordData.word.toUpperCase())) {
      throw new Error(`Word "${wordData.word}" has already been used`);
    }

    console.log(`✅ Generated word: ${wordData.word}`);
    return {
      date: wordData.date,
      category: wordData.category,
      word: wordData.word.toUpperCase()
    };

  } catch (error) {
    console.error('❌ Error generating word with Gemini:', error.message);
    throw error;
  }
}

/**
 * Save the generated word to JSON files
 */
function saveWordData(wordData) {
  try {
    // Ensure data directory exists
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      console.log(`📁 Created data directory: ${DATA_DIR}`);
    }

    // Save today's word
    fs.writeFileSync(TODAY_WORD_FILE, JSON.stringify(wordData, null, 2));
    console.log(`💾 Saved today's word to: ${TODAY_WORD_FILE}`);

    // Update used words list
    let usedWordsData = { words: [] };
    
    if (fs.existsSync(USED_WORDS_FILE)) {
      usedWordsData = JSON.parse(fs.readFileSync(USED_WORDS_FILE, 'utf-8'));
    }

    usedWordsData.words.push({
      date: wordData.date,
      word: wordData.word,
      category: wordData.category
    });

    fs.writeFileSync(USED_WORDS_FILE, JSON.stringify(usedWordsData, null, 2));
    console.log(`📋 Updated used words list with ${usedWordsData.words.length} total words`);

  } catch (error) {
    console.error('❌ Error saving word data:', error.message);
    throw error;
  }
}

/**
 * Main function to generate daily word
 */
async function generateDailyWord() {
  try {
    console.log('🎯 Starting daily word generation...');
    
    // Check if API key is provided
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }

    // Load used words
    const usedWords = loadUsedWords();
    console.log(`📚 Loaded ${usedWords.length} previously used words`);

    // Select random category
    const category = categories[Math.floor(Math.random() * categories.length)];
    console.log(`🎲 Selected category: ${category}`);

    // Generate word with retry logic
    let wordData;
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        wordData = await generateWordWithAI(category, usedWords);
        break;
      } catch (error) {
        console.log(`⚠️  Attempt ${attempt} failed: ${error.message}`);
        
        if (attempt === maxRetries) {
          throw new Error(`Failed to generate word after ${maxRetries} attempts`);
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Save the generated word
    saveWordData(wordData);
    
    console.log('🎉 Daily word generation completed successfully!');
    console.log(`📅 Date: ${wordData.date}`);
    console.log(`🏷️  Category: ${wordData.category}`);
    console.log(`🔤 Word: ${wordData.word}`);
    
    return wordData;

  } catch (error) {
    console.error('💥 Fatal error in daily word generation:', error.message);
    process.exit(1);
  }
}

// Run the script if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateDailyWord();
}

export default generateDailyWord;