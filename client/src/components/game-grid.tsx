import type { TileState } from "@shared/schema";
import { cn } from "@/lib/utils";

interface GameGridProps {
  tiles: TileState[][];
}

export function GameGrid({ tiles }: GameGridProps) {
  const getTileClasses = (tile: TileState, isCurrentRow: boolean, currentCol: number, colIndex: number) => {
    const baseClasses = "aspect-square flex items-center justify-center text-2xl font-bold transition-all duration-200";
    
    switch (tile.status) {
      case 'correct':
        return cn(baseClasses, "bg-green-500 border-2 border-green-500 text-white");
      case 'wrong-position':
        return cn(baseClasses, "bg-yellow-500 border-2 border-yellow-500 text-white");
      case 'wrong':
        return cn(baseClasses, "bg-gray-500 border-2 border-gray-500 text-white");
      case 'filled':
        return cn(
          baseClasses, 
          "bg-white border-2 text-gray-900",
          isCurrentRow && colIndex === currentCol 
            ? "border-blue-400 animate-pulse" 
            : "border-gray-300 hover:border-gray-400"
        );
      default:
        return cn(baseClasses, "bg-white border-2 border-gray-200 text-gray-400 hover:border-gray-300");
    }
  };

  return (
    <div className="grid grid-cols-5 gap-2 mb-8" data-testid="game-grid">
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
