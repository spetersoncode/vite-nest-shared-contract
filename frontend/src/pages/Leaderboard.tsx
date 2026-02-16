import { useLeaderboard } from "../hooks/useLeaderboard";
import { StatsBar } from "../components/StatsBar";

export function Leaderboard() {
  const { data: entries, isLoading, error } = useLeaderboard();

  if (isLoading) {
    return (
      <div className="text-center text-gray-400 text-xl py-20">
        Loading leaderboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-400 text-xl py-20">
        Failed to load leaderboard.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-black text-white text-center">
        🏆 Leaderboard
      </h1>

      <div className="max-w-2xl mx-auto space-y-2">
        {entries?.map((entry, i) => {
          const medal =
            i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`;

          return (
            <div
              key={entry.fighter.id}
              className={`
                flex items-center gap-4 rounded-lg border border-gray-800 bg-gray-900/50 p-4
                ${i < 3 ? "border-yellow-800/50" : ""}
              `}
            >
              <div className="w-10 text-center text-lg font-bold text-gray-400">
                {medal}
              </div>
              <div className="text-3xl">{entry.fighter.emoji}</div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-white">
                    {entry.fighter.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {entry.fighter.category}
                  </span>
                </div>
                <div className="mt-1">
                  <StatsBar
                    wins={entry.fighter.stats.wins}
                    losses={entry.fighter.stats.losses}
                    draws={entry.fighter.stats.draws}
                  />
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-white">
                  {entry.totalBattles > 0
                    ? `${Math.round(entry.winRate * 100)}%`
                    : "-"}
                </div>
                <div className="text-xs text-gray-500">
                  {entry.totalBattles} battles
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
