import { useState, useEffect } from "react";
import { GameHeader } from "../components/game-header";
import { GameGrid } from "../components/game-grid";
import { VirtualKeyboard } from "../components/virtual-keyboard";
import { GameCompleteModal } from "../components/game-complete-modal";
import { UserSetupModal } from "../components/user-setup-modal";
import { StatsModal } from "../components/stats-modal";
import { RulesModal } from "../components/rules-modal";
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
  const [currentUser, setCurrentUser] = useState<{ id: string; username: string } | null>(null);
  const [showUserSetup, setShowUserSetup] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showRules, setShowRules] = useState(false);

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
  } = useGameState(dailyWord?.word || '', toast, currentUser);

  // Check for existing user on load
  useEffect(() => {
    const savedUser = localStorage.getItem('wordleUser');
    console.log('Checking for saved user:', savedUser);
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        console.log('Found saved user:', user);
        setCurrentUser(user);
      } catch (error) {
        console.log('Error parsing saved user, clearing localStorage');
        localStorage.removeItem('wordleUser');
        setShowUserSetup(true);
      }
    } else {
      console.log('No saved user found, showing user setup modal');
      setShowUserSetup(true);
    }
  }, []);

  const handleUserCreated = (user: { id: string; username: string }) => {
    setCurrentUser(user);
    localStorage.setItem('wordleUser', JSON.stringify(user));
    setShowUserSetup(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('wordleUser');
    setShowUserSetup(true);
  };

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-inter flex flex-col" data-testid="game-container">
      <GameHeader 
        category={dailyWord?.category || ''} 
        currentGuess={gameState.currentRow + 1}
        isLoading={isLoadingWord}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
      
      <main className="flex-1 flex flex-col items-center justify-center px-2 sm:px-4 py-4 sm:py-8">
        <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl">
          {isLoadingWord ? (
            <div className="space-y-6 sm:space-y-8">
              <div className="grid grid-cols-5 gap-1 sm:gap-2 md:gap-3 max-w-xs sm:max-w-sm md:max-w-lg mx-auto">
                {Array.from({ length: 25 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-md" />
                ))}
              </div>
              <div className="space-y-1 sm:space-y-2 max-w-lg mx-auto">
                <div className="flex justify-center gap-1 sm:gap-1.5">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 sm:h-12 w-6 sm:w-8 rounded" />
                  ))}
                </div>
                <div className="flex justify-center gap-1 sm:gap-1.5">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 sm:h-12 w-6 sm:w-8 rounded" />
                  ))}
                </div>
                <div className="flex justify-center gap-1 sm:gap-1.5">
                  <Skeleton className="h-10 sm:h-12 w-12 sm:w-16 rounded" />
                  {Array.from({ length: 7 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 sm:h-12 w-6 sm:w-8 rounded" />
                  ))}
                  <Skeleton className="h-10 sm:h-12 w-10 sm:w-12 rounded" />
                </div>
              </div>
            </div>
          ) : (
            <>
              <GameGrid tiles={tiles} />
              
              <div className="text-center mb-4 sm:mb-6 px-2" data-testid="game-message">
                {gameState.gameStatus === 'won' && (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg mb-4 shadow-md" data-testid="success-message">
                    <strong>Congratulations!</strong> You found the word!
                  </div>
                )}
                {gameState.gameStatus === 'lost' && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg mb-4 shadow-md" data-testid="game-over-message">
                    <strong>Game Over!</strong> The word was <strong>{dailyWord?.word}</strong>
                  </div>
                )}
                {gameState.gameStatus === 'playing' && (
                  <div className="text-gray-600 text-sm sm:text-base" data-testid="hint-message">
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

      <footer className="bg-white/90 backdrop-blur-sm border-t border-gray-200 px-2 sm:px-4 py-3 sm:py-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm text-gray-600">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-600 hover:text-gray-900 px-2 sm:px-3"
              onClick={() => setShowRules(true)}
              data-testid="button-rules"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span className="hidden sm:inline">How to Play</span>
              <span className="sm:hidden">Rules</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-600 hover:text-gray-900 px-2 sm:px-3"
              onClick={() => setShowStats(true)}
              data-testid="button-stats"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
              <span className="hidden sm:inline">Statistics</span>
              <span className="sm:hidden">Stats</span>
            </Button>
          </div>
          <div className="text-xs sm:text-sm text-gray-500">
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
      
      <UserSetupModal
        isOpen={showUserSetup}
        onUserCreated={handleUserCreated}
      />
      
      <StatsModal
        isOpen={showStats}
        onClose={() => setShowStats(false)}
        currentUser={currentUser}
      />
      
      <RulesModal
        isOpen={showRules}
        onClose={() => setShowRules(false)}
      />
    </div>
  );
}
