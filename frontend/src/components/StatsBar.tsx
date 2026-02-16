interface StatsBarProps {
  wins: number;
  losses: number;
  draws: number;
}

export function StatsBar({ wins, losses, draws }: StatsBarProps) {
  const total = wins + losses + draws;
  if (total === 0) return null;

  const winPct = (wins / total) * 100;
  const lossPct = (losses / total) * 100;
  const drawPct = (draws / total) * 100;

  return (
    <div className="w-full">
      <div className="flex h-2 rounded-full overflow-hidden bg-gray-800">
        {winPct > 0 && (
          <div
            className="bg-green-500 transition-all duration-500"
            style={{ width: `${winPct}%` }}
          />
        )}
        {drawPct > 0 && (
          <div
            className="bg-gray-500 transition-all duration-500"
            style={{ width: `${drawPct}%` }}
          />
        )}
        {lossPct > 0 && (
          <div
            className="bg-red-500 transition-all duration-500"
            style={{ width: `${lossPct}%` }}
          />
        )}
      </div>
    </div>
  );
}
