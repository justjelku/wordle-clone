import { Skeleton } from "@/components/ui/skeleton";

interface GameHeaderProps {
  category: string;
  currentGuess: number;
  isLoading?: boolean;
}

export function GameHeader({ category, currentGuess, isLoading }: GameHeaderProps) {
  const today = new Date().toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });

  if (isLoading) {
    return (
      <header className="bg-white border-b border-gray-200 px-4 py-4 md:py-6">
        <div className="max-w-lg mx-auto text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3" data-testid="game-title">
            Wordle Clone
          </h1>
          <Skeleton className="h-8 w-48 mx-auto mb-4" />
          <div className="flex justify-center space-x-6 text-sm">
            <Skeleton className="h-12 w-12" />
            <Skeleton className="h-12 w-12" />
            <Skeleton className="h-12 w-12" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-4 md:py-6" data-testid="game-header">
      <div className="max-w-lg mx-auto text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3" data-testid="game-title">
          Wordle Clone
        </h1>
        
        <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full" data-testid="category-badge">
          <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z"></path>
          </svg>
          <span className="text-sm font-medium text-blue-800" data-testid="category-text">
            Today's Category: {category}
          </span>
        </div>
        
        <div className="mt-4 flex justify-center space-x-6 text-sm text-gray-600" data-testid="game-stats">
          <div className="text-center">
            <div className="font-semibold text-gray-900" data-testid="current-guess">
              {currentGuess}
            </div>
            <div>Guess</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900">5</div>
            <div>Max</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900" data-testid="game-date">
              {today}
            </div>
            <div>Today</div>
          </div>
        </div>
      </div>
    </header>
  );
}
