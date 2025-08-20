import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
    const baseClasses = "font-semibold py-3 px-3 rounded text-sm min-w-[2.5rem] transition-colors";
    
    if (disabled) {
      return cn(baseClasses, "bg-gray-200 text-gray-400 cursor-not-allowed");
    }
    
    switch (keyboardState[key]) {
      case 'correct':
        return cn(baseClasses, "bg-green-500 text-white");
      case 'wrong-position':
        return cn(baseClasses, "bg-yellow-500 text-white");
      case 'wrong':
        return cn(baseClasses, "bg-gray-500 text-white");
      default:
        return cn(baseClasses, "bg-gray-200 hover:bg-gray-300 text-gray-900");
    }
  };

  const getActionKeyClasses = () => {
    const baseClasses = "font-semibold py-3 px-4 rounded text-sm transition-colors";
    
    if (disabled) {
      return cn(baseClasses, "bg-gray-300 text-gray-400 cursor-not-allowed");
    }
    
    return cn(baseClasses, "bg-gray-400 hover:bg-gray-500 text-white");
  };

  return (
    <div className="space-y-2" data-testid="virtual-keyboard">
      {/* First row */}
      <div className="flex justify-center space-x-1">
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
      <div className="flex justify-center space-x-1">
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
      </div>
      
      {/* Third row */}
      <div className="flex justify-center space-x-1">
        <Button
          className={getActionKeyClasses()}
          onClick={onEnter}
          disabled={disabled}
          data-testid="key-enter"
        >
          ENTER
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
          className={getActionKeyClasses()}
          onClick={onBackspace}
          disabled={disabled}
          data-testid="key-backspace"
        >
          <Delete className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
