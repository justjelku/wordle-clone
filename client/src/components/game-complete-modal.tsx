import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { GuessPatternsDisplay } from "./guess-patterns-display";

interface GameCompleteModalProps {
  isOpen: boolean;
  gameStatus: 'won' | 'lost';
  word: string;
  category: string;
  guessCount: number;
  onClose: () => void;
  onPlayAgain: () => void;
  currentUser?: { id: string; username: string } | null;
  userGuesses?: string[];
}

// Calculate percentage score based on guess count
function calculateScore(guessCount: number): number {
  if (guessCount === 1) return 100;
  if (guessCount === 2) return 80;
  if (guessCount === 3) return 60;
  if (guessCount === 4) return 40;
  if (guessCount === 5) return 20;
  return 0;
}

export function GameCompleteModal({
  isOpen,
  gameStatus,
  word,
  category,
  guessCount,
  onClose,
  onPlayAgain,
  currentUser,
  userGuesses = []
}: GameCompleteModalProps) {
  
  const handleShare = async () => {
    const result = gameStatus === 'won' ? `${guessCount}/5` : 'X/5';
    const shareText = `Wordle Clone ${result}\nCategory: ${category}\n\n🟩⬜🟨⬜🟩\n\nPlay at ${window.location.origin}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Wordle Clone',
          text: shareText,
          url: window.location.origin,
        });
      } catch (err) {
        // Fall back to clipboard
        navigator.clipboard.writeText(shareText);
      }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareText);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto" data-testid="game-complete-modal">
        <DialogHeader className="text-center">
          <div className="mb-4">
            <div className="text-6xl mb-2">
              {gameStatus === 'won' ? '🎉' : '😔'}
            </div>
            <DialogTitle className="text-2xl font-bold text-gray-900 mb-2" data-testid="modal-title">
              {gameStatus === 'won' ? 'Congratulations!' : 'Better luck next time!'}
            </DialogTitle>
            <p className="text-gray-600" data-testid="modal-subtitle">
              {gameStatus === 'won' 
                ? `You found today's word in ${guessCount} guess${guessCount !== 1 ? 'es' : ''}!`
                : "Better luck next time tomorrow!"
              }
            </p>
            {gameStatus === 'won' && (
              <div className="mt-2">
                <div className="text-3xl font-bold text-green-600" data-testid="score-percentage">
                  {calculateScore(guessCount)}%
                </div>
                <div className="text-sm text-gray-500">Performance Score</div>
              </div>
            )}
          </div>
        </DialogHeader>
        
        {gameStatus === 'won' && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
            <div className="text-sm text-gray-600 mb-1">Today's word was:</div>
            <div className="text-2xl font-bold text-gray-900" data-testid="revealed-word">
              {word}
            </div>
            <div className="text-sm text-blue-600 mt-1" data-testid="word-category">
              Category: {category}
            </div>
          </div>
        )}
        
        {gameStatus === 'lost' && (
          <div className="mb-6 p-4 bg-orange-50 rounded-lg text-center">
            <div className="text-lg font-medium text-orange-800 mb-2">
              Today's challenge was tough!
            </div>
            <div className="text-sm text-orange-600">
              Come back tomorrow for a new word from the <strong>{category}</strong> category.
            </div>
          </div>
        )}
        
        {/* Show guess patterns for completed games */}
        {(gameStatus === 'won' || gameStatus === 'lost') && (
          <div className="mb-6">
            <GuessPatternsDisplay
              targetWord={word}
              date={today}
              currentUserPattern={gameStatus === 'won' && currentUser && userGuesses.length > 0 ? {
                username: currentUser.username,
                guesses: userGuesses,
                guessCount: guessCount
              } : undefined}
            />
          </div>
        )}
        
        <div className="flex space-x-3">
          <Button 
            className="flex-1" 
            onClick={handleShare}
            data-testid="button-share"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button 
            variant="outline" 
            className="flex-1" 
            onClick={onClose}
            data-testid="button-close"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
