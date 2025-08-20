import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, User } from "lucide-react";

interface GameHeaderProps {
  category: string;
  currentGuess: number;
  isLoading?: boolean;
  currentUser?: { id: string; username: string } | null;
  onLogout?: () => void;
}

export function GameHeader({ category, currentGuess, isLoading, currentUser, onLogout }: GameHeaderProps) {
  const today = new Date().toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });

  if (isLoading) {
    return (
      <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 px-2 sm:px-4 py-3 sm:py-4 md:py-6 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-3" data-testid="game-title">
            Wordle Clone
          </h1>
          <Skeleton className="h-6 sm:h-8 w-32 sm:w-48 mx-auto mb-3 sm:mb-4 rounded-full" />
          <div className="flex justify-center space-x-3 sm:space-x-6 text-sm">
            <Skeleton className="h-8 sm:h-12 w-8 sm:w-12 rounded-lg" />
            <Skeleton className="h-8 sm:h-12 w-8 sm:w-12 rounded-lg" />
            <Skeleton className="h-8 sm:h-12 w-8 sm:w-12 rounded-lg" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 px-2 sm:px-4 py-3 sm:py-4 md:py-6 sticky top-0 z-10 shadow-sm" data-testid="game-header">
      <div className="max-w-4xl mx-auto">
        {/* Top bar with title and user profile */}
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div></div> {/* Spacer */}
          
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900" data-testid="game-title">
            Wordle Clone
          </h1>
          
          {currentUser && (
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                <AvatarFallback className="bg-blue-100 text-blue-700 font-bold text-sm">
                  {currentUser.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
                <div className="text-sm font-medium text-gray-900">{currentUser.username}</div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="text-gray-600 hover:text-gray-900 p-1"
                data-testid="button-logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        
        {/* Center content */}
        <div className="text-center">
          <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full shadow-sm" data-testid="category-badge">
            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z"></path>
            </svg>
            <span className="text-xs sm:text-sm font-medium text-blue-800" data-testid="category-text">
              <span className="hidden sm:inline">Today's Category: </span>{category}
            </span>
          </div>
          
          <div className="mt-3 sm:mt-4 flex justify-center space-x-4 sm:space-x-6 text-xs sm:text-sm text-gray-600" data-testid="game-stats">
            <div className="text-center bg-gray-50 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2">
              <div className="font-semibold text-gray-900 text-sm sm:text-base" data-testid="current-guess">
                {currentGuess}
              </div>
              <div className="text-xs">Guess</div>
            </div>
            <div className="text-center bg-gray-50 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2">
              <div className="font-semibold text-gray-900 text-sm sm:text-base">5</div>
              <div className="text-xs">Max</div>
            </div>
            <div className="text-center bg-gray-50 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2">
              <div className="font-semibold text-gray-900 text-sm sm:text-base" data-testid="game-date">
                {today}
              </div>
              <div className="text-xs">Today</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
