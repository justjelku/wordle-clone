import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Loader2, Sparkles, User, LogIn, UserPlus } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface UserSetupModalProps {
  isOpen: boolean;
  onUserCreated: (user: { id: string; username: string }) => void;
}

export function UserSetupModal({ isOpen, onUserCreated }: UserSetupModalProps) {
  const [username, setUsername] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [mode, setMode] = useState<'login' | 'create'>('login');
  const { toast } = useToast();

  const generateUsername = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-username', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to generate username');
      }

      const data = await response.json();
      setUsername(data.username);
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Could not generate username. Please try typing one manually.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const loginUser = async () => {
    if (!username.trim()) {
      toast({
        title: "Username Required",
        description: "Please enter your username to login.",
        variant: "destructive",
      });
      return;
    }

    setIsLoggingIn(true);
    try {
      const response = await fetch(`/api/users/${encodeURIComponent(username.trim())}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Username not found. Please check your username or create a new account.');
        }
        throw new Error('Failed to login. Please try again.');
      }

      const user = await response.json();
      onUserCreated(user);
      
      toast({
        title: "Welcome back!",
        description: `Successfully logged in as ${user.username}.`,
      });
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Could not login. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const createUser = async () => {
    if (!username.trim()) {
      toast({
        title: "Username Required",
        description: "Please enter a username or generate one.",
        variant: "destructive",
      });
      return;
    }

    if (username.length < 3 || username.length > 12) {
      toast({
        title: "Invalid Username",
        description: "Username must be between 3-12 characters.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username.trim() }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create user');
      }

      const user = await response.json();
      onUserCreated(user);
      
      toast({
        title: "Welcome!",
        description: `Your username ${user.username} has been created.`,
      });
    } catch (error) {
      toast({
        title: "Creation Failed",
        description: error instanceof Error ? error.message : "Could not create user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isCreating && !isGenerating && !isLoggingIn) {
      if (mode === 'login') {
        loginUser();
      } else {
        createUser();
      }
    }
  };

  const handleTabChange = (value: string) => {
    setMode(value as 'login' | 'create');
    setUsername('');
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md" data-testid="user-setup-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Welcome to Wordle!
          </DialogTitle>
          <DialogDescription>
            Login to your existing account or create a new one to track your stats.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={mode} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login" className="flex items-center gap-2" data-testid="tab-login">
              <LogIn className="h-4 w-4" />
              Login
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2" data-testid="tab-create">
              <UserPlus className="h-4 w-4" />
              Create Account
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username-login">Username</Label>
              <Input
                id="username-login"
                placeholder="Enter your existing username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={handleKeyPress}
                maxLength={12}
                data-testid="input-username-login"
                disabled={isLoggingIn}
              />
            </div>
            
            <Button
              onClick={loginUser}
              disabled={isLoggingIn || !username.trim()}
              className="w-full"
              data-testid="button-login"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </>
              )}
            </Button>
          </TabsContent>
          
          <TabsContent value="create" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username-create">Username</Label>
              <div className="flex gap-2">
                <Input
                  id="username-create"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyPress={handleKeyPress}
                  maxLength={12}
                  data-testid="input-username-create"
                  disabled={isCreating || isGenerating}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generateUsername}
                  disabled={isCreating || isGenerating}
                  data-testid="button-generate-username"
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                3-12 characters, letters and numbers only
              </p>
            </div>
            
            <Button
              onClick={createUser}
              disabled={isCreating || isGenerating || !username.trim()}
              className="w-full"
              data-testid="button-create-user"
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create Account
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}