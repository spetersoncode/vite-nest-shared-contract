import type { Fighter } from "@emoji-battle/contract";

const categoryColors: Record<string, string> = {
  animal: "border-amber-400 bg-amber-950/40",
  plant: "border-green-400 bg-green-950/40",
  element: "border-blue-400 bg-blue-950/40",
};

const categoryLabels: Record<string, string> = {
  animal: "🐾 Animal",
  plant: "🌱 Plant",
  element: "⚡ Element",
};

interface FighterCardProps {
  fighter: Fighter;
  onClick?: () => void;
  selected?: boolean;
  compact?: boolean;
}

export function FighterCard({
  fighter,
  onClick,
  selected,
  compact,
}: FighterCardProps) {
  const total =
    fighter.stats.wins + fighter.stats.losses + fighter.stats.draws;
  const winRate = total > 0 ? Math.round((fighter.stats.wins / total) * 100) : 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        rounded-xl border-2 p-3 text-center transition-all duration-200
        ${categoryColors[fighter.category]}
        ${selected ? "ring-2 ring-white scale-105 shadow-lg shadow-white/20" : "hover:scale-105"}
        ${onClick ? "cursor-pointer" : "cursor-default"}
        ${compact ? "p-2" : "p-3"}
      `}
    >
      <div className={compact ? "text-3xl" : "text-5xl mb-2"}>
        {fighter.emoji}
      </div>
      <div className="font-bold text-white">{fighter.name}</div>
      {!compact && (
        <>
          <div className="text-xs text-gray-400 mt-1">
            {categoryLabels[fighter.category]}
          </div>
          <div className="text-xs text-gray-500 mt-2">
            {total > 0 ? (
              <>
                <span className="text-green-400">{fighter.stats.wins}W</span>{" "}
                <span className="text-red-400">{fighter.stats.losses}L</span>{" "}
                <span className="text-gray-400">{fighter.stats.draws}D</span>
                <span className="ml-1 text-white">({winRate}%)</span>
              </>
            ) : (
              <span className="text-gray-600">No battles yet</span>
            )}
          </div>
        </>
      )}
    </button>
  );
}
