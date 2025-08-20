import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Trophy, Medal } from 'lucide-react';

interface GuessPattern {
  username: string;
  guesses: string[];
  guessCount: number;
}

interface GuessPatternDisplayProps {
  targetWord: string;
  date: string;
  currentUserPattern?: {
    username: string;
    guesses: string[];
    guessCount: number;
  };
}

function getTileStatus(letter: string, position: number, targetWord: string): string {
  if (targetWord[position] === letter) {
    return 'correct';
  } else if (targetWord.includes(letter)) {
    return 'wrong-position';
  } else {
    return 'wrong';
  }
}

function TileRow({ guess, targetWord }: { guess: string; targetWord: string }) {
  return (
    <div className="flex gap-1 justify-center">
      {Array.from({ length: 5 }, (_, i) => {
        const letter = guess[i] || '';
        const status = letter ? getTileStatus(letter, i, targetWord) : 'empty';
        
        return (
          <div
            key={i}
            className={`
              w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-xs sm:text-sm font-bold rounded
              ${status === 'correct' ? 'bg-green-500 text-white' :
                status === 'wrong-position' ? 'bg-yellow-500 text-white' :
                status === 'wrong' ? 'bg-gray-400 text-white' :
                'bg-gray-200 border border-gray-300'}
            `}
          >
            {letter}
          </div>
        );
      })}
    </div>
  );
}

function PatternCard({ 
  pattern, 
  targetWord, 
  rank, 
  isCurrentUser = false 
}: { 
  pattern: GuessPattern; 
  targetWord: string; 
  rank?: number;
  isCurrentUser?: boolean;
}) {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-4 h-4 text-yellow-500" />;
    if (rank === 2) return <Trophy className="w-4 h-4 text-gray-400" />;
    if (rank === 3) return <Medal className="w-4 h-4 text-orange-500" />;
    return null;
  };

  const getPercentageScore = (guessCount: number) => {
    if (guessCount === 1) return 100;
    if (guessCount === 2) return 80;
    if (guessCount === 3) return 60;
    if (guessCount === 4) return 40;
    if (guessCount === 5) return 20;
    return 0;
  };

  return (
    <Card className={`${isCurrentUser ? 'border-blue-500 border-2' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {rank && getRankIcon(rank)}
            <Avatar className="h-6 w-6">
              <AvatarFallback className="bg-blue-100 text-blue-700 font-bold text-xs">
                {pattern.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-sm">{pattern.username}</CardTitle>
              {isCurrentUser && (
                <CardDescription className="text-xs">Your attempt</CardDescription>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-green-600">
              {getPercentageScore(pattern.guessCount)}%
            </div>
            <div className="text-xs text-gray-500">{pattern.guessCount}/5</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-1">
          {pattern.guesses.map((guess, index) => (
            <TileRow key={index} guess={guess} targetWord={targetWord} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function GuessPatternsDisplay({ 
  targetWord, 
  date, 
  currentUserPattern 
}: GuessPatternDisplayProps) {
  const [topPatterns, setTopPatterns] = useState<GuessPattern[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTopPatterns = async () => {
      try {
        const response = await fetch(`/api/today-top-patterns/${date}`);
        if (response.ok) {
          const patterns = await response.json();
          setTopPatterns(patterns);
        }
      } catch (error) {
        console.error('Error fetching top patterns:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopPatterns();
  }, [date]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Today's Top Solvers</h3>
          <p className="text-sm text-gray-600">Loading patterns...</p>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="guess-patterns-display">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Today's Top Solvers</h3>
        <p className="text-sm text-gray-600">See how the best players solved today's puzzle</p>
      </div>
      
      <div className="space-y-3">
        {topPatterns.map((pattern, index) => (
          <PatternCard
            key={pattern.username}
            pattern={pattern}
            targetWord={targetWord}
            rank={index + 1}
          />
        ))}
        
        {topPatterns.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No completed games yet today.</p>
            <p className="text-sm">Be the first to solve it!</p>
          </div>
        )}
      </div>
      
      {currentUserPattern && (
        <div className="border-t pt-4">
          <h4 className="text-md font-medium mb-3 text-center">Your Solution</h4>
          <PatternCard
            pattern={currentUserPattern}
            targetWord={targetWord}
            isCurrentUser={true}
          />
        </div>
      )}
    </div>
  );
}