import type { TileState } from "api/lib/schema";
import { cn } from "../lib/utils";

interface GameGridProps {
  tiles: TileState[][];
}

export function GameGrid({ tiles }: GameGridProps) {
  const getTileClasses = (tile: TileState, isCurrentRow: boolean, currentCol: number, colIndex: number) => {
    const baseClasses = "aspect-square flex items-center justify-center font-bold transition-all duration-200 select-none " +
      "text-lg sm:text-xl md:text-2xl lg:text-3xl " +
      "border-2 rounded-md";
    
    switch (tile.status) {
      case 'correct':
        return cn(baseClasses, "bg-green-500 border-green-500 text-white shadow-lg transform scale-105");
      case 'wrong-position':
        return cn(baseClasses, "bg-yellow-500 border-yellow-500 text-white shadow-lg transform scale-105");
      case 'wrong':
        return cn(baseClasses, "bg-gray-500 border-gray-500 text-white shadow-lg");
      case 'filled':
        return cn(
          baseClasses, 
          "bg-white text-gray-900 shadow-md",
          isCurrentRow && colIndex === currentCol 
            ? "border-blue-400 animate-pulse shadow-lg" 
            : "border-gray-300 hover:border-gray-400 hover:shadow-md"
        );
      default:
        return cn(baseClasses, "bg-white border-gray-200 text-gray-400 hover:border-gray-300");
    }
  };

  return (
    <div className="grid grid-cols-5 gap-1 sm:gap-2 md:gap-3 mb-6 sm:mb-8 w-full max-w-xs sm:max-w-sm md:max-w-lg mx-auto" data-testid="game-grid">
      {tiles.map((row, rowIndex) =>
        row.map((tile, colIndex) => {
          const isCurrentRow = rowIndex === tiles.findIndex(row => 
            row.some(tile => tile.status === 'filled') || 
            row.every(tile => tile.status === 'empty')
          );
          const currentCol = isCurrentRow ? row.findIndex(tile => tile.status === 'empty') : -1;
          
          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={getTileClasses(tile, isCurrentRow, currentCol, colIndex)}
              data-testid={`tile-${rowIndex}-${colIndex}`}
              data-tile-status={tile.status}
            >
              {tile.letter}
            </div>
          );
        })
      )}
    </div>
  );
}
