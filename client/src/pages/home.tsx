import { GameHeader } from "../components/game-header";
import { GameGrid } from "../components/game-grid";
import { VirtualKeyboard } from "../components/virtual-keyboard";
import { GameCompleteModal } from "../components/game-complete-modal";
import { useGameState } from "../hooks/use-game-state";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { WordResponse } from "@shared/schema";

export default function Home() {
  const { toast } = useToast();

  const { 
    data: dailyWord, 
    isLoading: isLoadingWord, 
    error: wordError,
    refetch: refetchWord
  } = useQuery<WordResponse>({
    queryKey: ['/api/daily-word'],
    retry: 3,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  const {
    gameState,
    tiles,
    keyboardState,
    gameComplete,
    handleKeyInput,
    handleEnter,
    handleBackspace,
    resetGame,
    closeModal
  } = useGameState(dailyWord?.word || '', toast);

  if (wordError) {
    return (
      <div className="min-h-screen bg-gray-50 font-inter flex items-center justify-center p-4">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex flex-col gap-2">
            <span>Failed to load today's word. Please check your internet connection and try again.</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetchWord()}
              className="self-start"
              data-testid="button-retry"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-inter flex flex-col" data-testid="game-container">
      <GameHeader 
        category={dailyWord?.category || ''} 
        currentGuess={gameState.currentRow + 1}
        isLoading={isLoadingWord}
      />
      
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          {isLoadingWord ? (
            <div className="space-y-8">
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: 25 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-square" />
                ))}
              </div>
              <div className="space-y-2">
                <div className="flex justify-center space-x-1">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-8" />
                  ))}
                </div>
                <div className="flex justify-center space-x-1">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-8" />
                  ))}
                </div>
                <div className="flex justify-center space-x-1">
                  <Skeleton className="h-12 w-16" />
                  {Array.from({ length: 7 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-8" />
                  ))}
                  <Skeleton className="h-12 w-12" />
                </div>
              </div>
            </div>
          ) : (
            <>
              <GameGrid tiles={tiles} />
              
              <div className="text-center mb-6" data-testid="game-message">
                {gameState.gameStatus === 'won' && (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4" data-testid="success-message">
                    <strong>Congratulations!</strong> You found the word!
                  </div>
                )}
                {gameState.gameStatus === 'lost' && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" data-testid="game-over-message">
                    <strong>Game Over!</strong> The word was <strong>{dailyWord?.word}</strong>
                  </div>
                )}
                {gameState.gameStatus === 'playing' && (
                  <div className="text-gray-600 text-sm" data-testid="hint-message">
                    Guess the 5-letter word related to today's category
                  </div>
                )}
              </div>

              <VirtualKeyboard
                keyboardState={keyboardState}
                onKeyInput={handleKeyInput}
                onEnter={handleEnter}
                onBackspace={handleBackspace}
                disabled={gameState.gameStatus !== 'playing'}
              />
            </>
          )}
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 px-4 py-4">
        <div className="max-w-lg mx-auto flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-600 hover:text-gray-900"
              data-testid="button-rules"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              How to Play
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-600 hover:text-gray-900"
              data-testid="button-stats"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
              Statistics
            </Button>
          </div>
          <div className="text-sm text-gray-500">
            Next word in: <span className="font-semibold" data-testid="next-word-timer">Loading...</span>
          </div>
        </div>
      </footer>

      {gameComplete && dailyWord && (gameState.gameStatus === 'won' || gameState.gameStatus === 'lost') && (
        <GameCompleteModal
          isOpen={gameComplete}
          gameStatus={gameState.gameStatus}
          word={dailyWord.word}
          category={dailyWord.category}
          guessCount={gameState.guesses.length}
          onClose={closeModal}
          onPlayAgain={resetGame}
        />
      )}
    </div>
  );
}
