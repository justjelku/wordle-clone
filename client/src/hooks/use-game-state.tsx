import { useState, useCallback, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { GameState, TileState } from "@shared/schema";
import { validateWord } from "../lib/word-validation";

interface KeyboardState {
  [key: string]: 'unused' | 'correct' | 'wrong-position' | 'wrong';
}

export function useGameState(targetWord: string, toast: any) {
  const [gameState, setGameState] = useState<GameState>({
    currentGuess: '',
    guesses: [],
    gameStatus: 'playing',
    currentRow: 0,
  });

  const [tiles, setTiles] = useState<TileState[][]>(() => 
    Array.from({ length: 5 }, () => 
      Array.from({ length: 5 }, () => ({
        letter: '',
        status: 'empty' as const,
      }))
    )
  );

  const [keyboardState, setKeyboardState] = useState<KeyboardState>({});
  const [gameComplete, setGameComplete] = useState(false);

  const validateWordMutation = useMutation({
    mutationFn: async (word: string) => {
      const response = await apiRequest('POST', '/api/validate-word', { word });
      return response.json();
    },
  });

  const updateTiles = useCallback((guesses: string[], currentGuess: string, currentRow: number) => {
    const newTiles: TileState[][] = Array.from({ length: 5 }, () => 
      Array.from({ length: 5 }, () => ({
        letter: '',
        status: 'empty' as const,
      }))
    );

    // Fill in completed guesses
    guesses.forEach((guess, rowIndex) => {
      for (let i = 0; i < 5; i++) {
        const letter = guess[i] || '';
        let status: TileState['status'] = 'empty';

        if (letter) {
          if (targetWord[i] === letter) {
            status = 'correct';
          } else if (targetWord.includes(letter)) {
            status = 'wrong-position';
          } else {
            status = 'wrong';
          }
        }

        newTiles[rowIndex][i] = { letter, status };
      }
    });

    // Fill in current guess
    if (currentRow < 5 && currentGuess) {
      for (let i = 0; i < 5; i++) {
        const letter = currentGuess[i] || '';
        newTiles[currentRow][i] = {
          letter,
          status: letter ? 'filled' : 'empty',
        };
      }
    }

    setTiles(newTiles);
  }, [targetWord]);

  const updateKeyboardState = useCallback((guesses: string[]) => {
    const newKeyboardState: KeyboardState = {};

    guesses.forEach(guess => {
      for (let i = 0; i < guess.length; i++) {
        const letter = guess[i];
        if (!letter) continue;

        if (targetWord[i] === letter) {
          newKeyboardState[letter] = 'correct';
        } else if (targetWord.includes(letter) && newKeyboardState[letter] !== 'correct') {
          newKeyboardState[letter] = 'wrong-position';
        } else if (!targetWord.includes(letter)) {
          newKeyboardState[letter] = 'wrong';
        }
      }
    });

    setKeyboardState(newKeyboardState);
  }, [targetWord]);

  const handleKeyInput = useCallback((key: string) => {
    if (gameState.gameStatus !== 'playing' || gameState.currentGuess.length >= 5) {
      return;
    }

    setGameState(prev => ({
      ...prev,
      currentGuess: prev.currentGuess + key,
    }));
  }, [gameState.gameStatus, gameState.currentGuess.length]);

  const handleBackspace = useCallback(() => {
    if (gameState.gameStatus !== 'playing' || gameState.currentGuess.length === 0) {
      return;
    }

    setGameState(prev => ({
      ...prev,
      currentGuess: prev.currentGuess.slice(0, -1),
    }));
  }, [gameState.gameStatus, gameState.currentGuess.length]);

  const handleEnter = useCallback(async () => {
    if (gameState.gameStatus !== 'playing' || gameState.currentGuess.length !== 5) {
      if (gameState.currentGuess.length < 5) {
        toast({
          title: "Not enough letters",
          description: "Please enter a 5-letter word.",
          variant: "destructive",
        });
      }
      return;
    }

    try {
      const validation = await validateWordMutation.mutateAsync(gameState.currentGuess);
      
      if (!validation.valid) {
        toast({
          title: "Invalid word",
          description: "Not a valid word. Please try again.",
          variant: "destructive",
        });
        return;
      }

      const newGuesses = [...gameState.guesses, gameState.currentGuess];
      const won = gameState.currentGuess.toUpperCase() === targetWord.toUpperCase();
      const lost = newGuesses.length >= 5 && !won;

      setGameState(prev => ({
        currentGuess: '',
        guesses: newGuesses,
        gameStatus: won ? 'won' : lost ? 'lost' : 'playing',
        currentRow: prev.currentRow + 1,
      }));

      if (won) {
        toast({
          title: "Congratulations! 🎉",
          description: `You found the word in ${newGuesses.length} guess${newGuesses.length !== 1 ? 'es' : ''}!`,
        });
        setGameComplete(true);
      } else if (lost) {
        toast({
          title: "Game Over",
          description: `The word was "${targetWord}". Better luck next time!`,
          variant: "destructive",
        });
        setGameComplete(true);
      }

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to validate word. Please try again.",
        variant: "destructive",
      });
    }
  }, [gameState, targetWord, validateWordMutation, toast]);

  const resetGame = useCallback(() => {
    setGameState({
      currentGuess: '',
      guesses: [],
      gameStatus: 'playing',
      currentRow: 0,
    });
    setKeyboardState({});
    setGameComplete(false);
  }, []);

  const closeModal = useCallback(() => {
    setGameComplete(false);
  }, []);

  // Update tiles when game state changes
  useEffect(() => {
    if (targetWord) {
      updateTiles(gameState.guesses, gameState.currentGuess, gameState.currentRow);
      updateKeyboardState(gameState.guesses);
    }
  }, [gameState, targetWord, updateTiles, updateKeyboardState]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (gameState.gameStatus !== 'playing') return;

      const key = event.key.toUpperCase();
      
      if (key.match(/^[A-Z]$/)) {
        handleKeyInput(key);
      } else if (key === 'ENTER') {
        event.preventDefault();
        handleEnter();
      } else if (key === 'BACKSPACE') {
        handleBackspace();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [gameState.gameStatus, handleKeyInput, handleEnter, handleBackspace]);

  return {
    gameState,
    tiles,
    keyboardState,
    gameComplete,
    handleKeyInput,
    handleEnter,
    handleBackspace,
    resetGame,
    closeModal,
  };
}
