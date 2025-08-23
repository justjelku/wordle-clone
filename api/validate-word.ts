import { Request, Response } from 'express';
import { loadUsedWords } from '../lib/gemini';

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { word } = req.body;

    if (!word || word.length !== 5) {
      return res.status(400).json({
        valid: false,
        message: "Word must be exactly 5 letters long"
      });
    }

    const usedWords = await loadUsedWords();
    const isUsed = usedWords.includes(word.toUpperCase());

    if (isUsed) {
      return res.status(400).json({
        valid: false,
        message: "This word has already been used"
      });
    }

    res.json({ valid: true });
  } catch (error) {
    console.error('Error validating word:', error);
    res.status(500).json({
      message: "Failed to validate word. Please try again."
    });
  }
}