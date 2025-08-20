import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { BarChart3, Trophy, Target, Clock, Star, TrendingUp, User } from 'lucide-react';
import type { UserStats, LeaderboardEntry } from '@shared/schema';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: { id: string; username: string } | null;
}

export function StatsModal({ isOpen, onClose, currentUser }: StatsModalProps) {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && currentUser) {
      fetchStats();
    }
  }, [isOpen, currentUser]);

  const fetchStats = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      // Fetch user stats
      const statsResponse = await fetch(`/api/users/${currentUser.id}/stats`);
      if (statsResponse.ok) {
        const stats = await statsResponse.json();
        setUserStats(stats);
      }

      // Fetch leaderboard
      const leaderboardResponse = await fetch('/api/leaderboard?limit=10');
      if (leaderboardResponse.ok) {
        const leaderboard = await leaderboardResponse.json();
        setLeaderboard(leaderboard);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getWinRate = () => {
    if (!userStats || userStats.totalGames === 0) return 0;
    return Math.round((userStats.gamesWon / userStats.totalGames) * 100);
  };

  const getUserRank = () => {
    if (!currentUser) return null;
    const userIndex = leaderboard.findIndex(entry => entry.username === currentUser.username);
    return userIndex >= 0 ? userIndex + 1 : null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto" data-testid="stats-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Statistics & Leaderboard
          </DialogTitle>
          <DialogDescription>
            Track your progress and see how you rank against other players.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stats">Your Stats</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="space-y-4" data-testid="stats-tab">
            {!currentUser ? (
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Please create a username to view stats</p>
              </div>
            ) : isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : userStats ? (
              <div className="space-y-6">
                {/* User Header */}
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">
                      {currentUser.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{userStats.username}</h3>
                    <p className="text-sm text-muted-foreground">
                      Rank #{getUserRank() || '—'} • {getWinRate()}% win rate
                    </p>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <Trophy className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-700">{userStats.gamesWon}</div>
                    <div className="text-sm text-green-600">Games Won</div>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <Target className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-700">{userStats.totalGames}</div>
                    <div className="text-sm text-blue-600">Total Played</div>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <Clock className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-700">{userStats.averageGuesses}</div>
                    <div className="text-sm text-purple-600">Avg Guesses</div>
                  </div>
                  
                  <div className="bg-orange-50 p-4 rounded-lg text-center">
                    <Star className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-orange-700">{userStats.currentStreak}</div>
                    <div className="text-sm text-orange-600">Current Streak</div>
                  </div>
                </div>

                {/* Found Words */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Words Found ({userStats.foundWords.length})
                  </h4>
                  
                  {userStats.foundWords.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No words found yet. Keep playing!
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {userStats.foundWords.slice().reverse().map((word, index) => (
                        <div key={`${word.date}-${word.word}`} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="font-mono font-bold text-lg">{word.word}</div>
                            <Badge variant="secondary">{word.category}</Badge>
                          </div>
                          <div className="text-right text-sm text-muted-foreground">
                            <div>{word.guessCount}/5 guesses</div>
                            <div>{new Date(word.date).toLocaleDateString()}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No stats available yet. Play your first game!</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-4" data-testid="leaderboard-tab">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <h4 className="font-semibold">Top Players</h4>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No players on the leaderboard yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((entry, index) => (
                  <div
                    key={entry.username}
                    className={`flex items-center gap-3 p-4 rounded-lg transition-colors ${
                      currentUser?.username === entry.username
                        ? 'bg-blue-50 border-2 border-blue-200'
                        : 'bg-muted'
                    }`}
                    data-testid={`leaderboard-entry-${index}`}
                  >
                    <div className="flex items-center justify-center w-8 h-8">
                      {index < 3 ? (
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                          index === 0 ? 'bg-yellow-500' :
                          index === 1 ? 'bg-gray-400' :
                          'bg-orange-500'
                        }`}>
                          {index + 1}
                        </div>
                      ) : (
                        <span className="text-sm font-semibold text-muted-foreground">
                          {index + 1}
                        </span>
                      )}
                    </div>

                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gray-100 text-gray-700 font-bold">
                        {entry.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="font-semibold">{entry.username}</div>
                      <div className="text-sm text-muted-foreground">
                        {entry.gamesWon}/{entry.totalGames} games won
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-semibold">{entry.winRate}%</div>
                      <div className="text-sm text-muted-foreground">
                        {entry.averageGuesses} avg
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose} data-testid="button-close-stats">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}