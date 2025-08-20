import { Button } from '../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { HelpCircle, Target, Calendar, Trophy } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RulesModal({ isOpen, onClose }: RulesModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto" data-testid="rules-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            How to Play
          </DialogTitle>
          <DialogDescription>
            Learn the rules and master the daily word puzzle!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Objective */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Objective
            </h4>
            <p className="text-sm text-muted-foreground">
              Guess the secret 5-letter word in 5 attempts or fewer. Each day features a new word from one of 15 categories.
            </p>
          </div>

          <Separator />

          {/* How to Play */}
          <div>
            <h4 className="font-semibold mb-3">How to Play</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Type a 5-letter word and press Enter to submit your guess</li>
              <li>• Use the virtual keyboard or your physical keyboard</li>
              <li>• You have 5 attempts to find the correct word</li>
              <li>• Each guess must be a valid English word</li>
            </ul>
          </div>

          <Separator />

          {/* Color Guide */}
          <div>
            <h4 className="font-semibold mb-3">Color Guide</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center text-white font-bold text-sm">
                  A
                </div>
                <div className="text-sm">
                  <div className="font-medium">Green</div>
                  <div className="text-muted-foreground">Letter is correct and in the right position</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-yellow-500 rounded flex items-center justify-center text-white font-bold text-sm">
                  B
                </div>
                <div className="text-sm">
                  <div className="font-medium">Yellow</div>
                  <div className="text-muted-foreground">Letter is in the word but in the wrong position</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-500 rounded flex items-center justify-center text-white font-bold text-sm">
                  C
                </div>
                <div className="text-sm">
                  <div className="font-medium">Gray</div>
                  <div className="text-muted-foreground">Letter is not in the word at all</div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Categories */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Daily Categories
            </h4>
            <p className="text-sm text-muted-foreground mb-3">
              Each day features a word from one of these categories:
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                'Animals', 'Food', 'Technology', 'Nature', 'Emotions',
                'Sports', 'Music', 'Travel', 'Science', 'Colors',
                'Weather', 'Clothing', 'Transportation', 'Home', 'School'
              ].map((category) => (
                <Badge key={category} variant="secondary" className="text-xs">
                  {category}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Stats & Leaderboard */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Stats & Competition
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Create a username to track your progress</li>
              <li>• Build win streaks by solving consecutive daily puzzles</li>
              <li>• Compete on the leaderboard with other players</li>
              <li>• View all the words you've successfully found</li>
              <li>• Rankings are based on win rate and average guesses</li>
            </ul>
          </div>

          <Separator />

          {/* Tips */}
          <div>
            <h4 className="font-semibold mb-3">Strategy Tips</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Start with words containing common vowels (A, E, I, O, U)</li>
              <li>• Use words with common consonants (R, S, T, L, N)</li>
              <li>• Pay attention to the daily category for hints</li>
              <li>• Eliminate letters systematically with each guess</li>
              <li>• Remember: each word is valid in English</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose} data-testid="button-close-rules">
            Got it!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}