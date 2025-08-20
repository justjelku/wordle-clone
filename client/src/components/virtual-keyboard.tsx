import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";
import { Delete } from "lucide-react";

interface KeyboardState {
  [key: string]: 'unused' | 'correct' | 'wrong-position' | 'wrong';
}

interface VirtualKeyboardProps {
  keyboardState: KeyboardState;
  onKeyInput: (key: string) => void;
  onEnter: () => void;
  onBackspace: () => void;
  disabled?: boolean;
}

const keyboardRows = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
];

export function VirtualKeyboard({ 
  keyboardState, 
  onKeyInput, 
  onEnter, 
  onBackspace, 
  disabled = false 
}: VirtualKeyboardProps) {
  
  const getKeyClasses = (key: string) => {
    const baseClasses = "font-semibold rounded transition-colors select-none touch-manipulation " +
      "text-xs sm:text-sm md:text-base " +
      "py-2 px-1 sm:py-3 sm:px-2 md:py-3 md:px-3 " +
      "min-w-[1.75rem] sm:min-w-[2rem] md:min-w-[2.5rem] " +
      "h-10 sm:h-12 md:h-12 " +
      "flex items-center justify-center";
    
    if (disabled) {
      return cn(baseClasses, "bg-gray-200 text-gray-400 cursor-not-allowed");
    }
    
    switch (keyboardState[key]) {
      case 'correct':
        return cn(baseClasses, "bg-green-500 text-white active:bg-green-600");
      case 'wrong-position':
        return cn(baseClasses, "bg-yellow-500 text-white active:bg-yellow-600");
      case 'wrong':
        return cn(baseClasses, "bg-gray-500 text-white active:bg-gray-600");
      default:
        return cn(baseClasses, "bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-900");
    }
  };

  const getActionKeyClasses = (isEnter = false) => {
    const baseClasses = "font-semibold rounded transition-colors select-none touch-manipulation " +
      "text-xs sm:text-sm md:text-base " +
      "py-2 sm:py-3 md:py-3 " +
      "h-10 sm:h-12 md:h-12 " +
      "flex items-center justify-center " +
      (isEnter 
        ? "px-2 sm:px-3 md:px-4 min-w-[3rem] sm:min-w-[4rem] md:min-w-[5rem]" 
        : "px-2 sm:px-3 md:px-4 min-w-[2.5rem] sm:min-w-[3rem] md:min-w-[3.5rem]");
    
    if (disabled) {
      return cn(baseClasses, "bg-gray-300 text-gray-400 cursor-not-allowed");
    }
    
    return cn(baseClasses, "bg-gray-400 hover:bg-gray-500 active:bg-gray-600 text-white");
  };

  return (
    <div className="space-y-1 sm:space-y-2 w-full max-w-lg mx-auto" data-testid="virtual-keyboard">
      {/* First row */}
      <div className="flex justify-center gap-1 sm:gap-1.5 px-2">
        {keyboardRows[0].map(key => (
          <Button
            key={key}
            className={getKeyClasses(key)}
            onClick={() => onKeyInput(key)}
            disabled={disabled}
            data-testid={`key-${key}`}
            data-key-status={keyboardState[key]}
          >
            {key}
          </Button>
        ))}
      </div>
      
      {/* Second row */}
      <div className="flex justify-center gap-1 sm:gap-1.5 px-2">
        <div className="w-4 sm:w-6 flex-shrink-0" /> {/* Spacer for centering */}
        {keyboardRows[1].map(key => (
          <Button
            key={key}
            className={getKeyClasses(key)}
            onClick={() => onKeyInput(key)}
            disabled={disabled}
            data-testid={`key-${key}`}
            data-key-status={keyboardState[key]}
          >
            {key}
          </Button>
        ))}
        <div className="w-4 sm:w-6 flex-shrink-0" /> {/* Spacer for centering */}
      </div>
      
      {/* Third row */}
      <div className="flex justify-center gap-1 sm:gap-1.5 px-2">
        <Button
          className={getActionKeyClasses(true)}
          onClick={onEnter}
          disabled={disabled}
          data-testid="key-enter"
        >
          <span className="hidden sm:inline">ENTER</span>
          <span className="sm:hidden">ENT</span>
        </Button>
        
        {keyboardRows[2].map(key => (
          <Button
            key={key}
            className={getKeyClasses(key)}
            onClick={() => onKeyInput(key)}
            disabled={disabled}
            data-testid={`key-${key}`}
            data-key-status={keyboardState[key]}
          >
            {key}
          </Button>
        ))}
        
        <Button
          className={getActionKeyClasses(false)}
          onClick={onBackspace}
          disabled={disabled}
          data-testid="key-backspace"
        >
          <Delete className="w-3 h-3 sm:w-4 sm:h-4" />
        </Button>
      </div>
    </div>
  );
}
