
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { generateAIUsername } from '../lib/gemini';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const username = await generateAIUsername();
    res.json({ username });
  } catch (error) {
    console.error('Error generating username:', error);
    res.status(500).json({ 
      message: "Failed to generate username. Please try again."
    });
  }
}
