import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";

interface GameCompleteModalProps {
  isOpen: boolean;
  gameStatus: 'won' | 'lost';
  word: string;
  category: string;
  guessCount: number;
  onClose: () => void;
  onPlayAgain: () => void;
}

export function GameCompleteModal({
  isOpen,
  gameStatus,
  word,
  category,
  guessCount,
  onClose,
  onPlayAgain
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-testid="game-complete-modal">
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
                : "You'll get it next time!"
              }
            </p>
          </div>
        </DialogHeader>
        
        <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
          <div className="text-sm text-gray-600 mb-1">Today's word was:</div>
          <div className="text-2xl font-bold text-gray-900" data-testid="revealed-word">
            {word}
          </div>
          <div className="text-sm text-blue-600 mt-1" data-testid="word-category">
            Category: {category}
          </div>
        </div>
        
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
