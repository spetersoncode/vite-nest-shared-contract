import type { BattleResult as BattleResultType } from "@emoji-battle/api-contract";

interface BattleResultProps {
  result: BattleResultType;
  onPlayAgain: () => void;
}

export function BattleResult({ result, onPlayAgain }: BattleResultProps) {
  const winnerFighter =
    result.winner === "attacker"
      ? result.attacker
      : result.winner === "defender"
        ? result.defender
        : null;

  return (
    <div className="flex flex-col items-center gap-6 animate-fade-in">
      {/* Battle matchup */}
      <div className="flex items-center gap-8">
        <div
          className={`text-center ${result.winner === "attacker" ? "scale-125" : "opacity-60"} transition-all duration-500`}
        >
          <div className="text-6xl mb-2">{result.attacker.emoji}</div>
          <div className="font-bold text-white">{result.attacker.name}</div>
          {result.winner === "attacker" && (
            <div className="text-yellow-400 text-sm mt-1">👑 Winner!</div>
          )}
        </div>

        <div className="text-4xl font-black text-gray-500">VS</div>

        <div
          className={`text-center ${result.winner === "defender" ? "scale-125" : "opacity-60"} transition-all duration-500`}
        >
          <div className="text-6xl mb-2">{result.defender.emoji}</div>
          <div className="font-bold text-white">{result.defender.name}</div>
          {result.winner === "defender" && (
            <div className="text-yellow-400 text-sm mt-1">👑 Winner!</div>
          )}
        </div>
      </div>

      {/* Result text */}
      <div className="text-2xl font-bold text-center">
        {winnerFighter ? (
          <span className="text-yellow-400">
            {winnerFighter.emoji} {winnerFighter.name} wins!
          </span>
        ) : (
          <span className="text-gray-400">🤝 It's a draw!</span>
        )}
      </div>

      {/* Category info */}
      <div className="text-sm text-gray-500">
        {result.attacker.category} vs {result.defender.category}
      </div>

      <button
        type="button"
        onClick={onPlayAgain}
        className="mt-4 rounded-lg bg-purple-600 hover:bg-purple-500 px-6 py-3 font-bold text-white transition-colors cursor-pointer"
      >
        ⚔️ Battle Again
      </button>
    </div>
  );
}
