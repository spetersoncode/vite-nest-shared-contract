import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useBattle } from "../hooks/useBattle";
import { BattleResult } from "../components/BattleResult";

export function BattleArena() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const attackerId = searchParams.get("attacker");
  const defenderId = searchParams.get("defender");

  const battle = useBattle();

  useEffect(() => {
    if (attackerId && defenderId && !battle.data && !battle.isPending) {
      battle.mutate({ attackerId, defenderId });
    }
  }, [attackerId, defenderId]);

  if (!attackerId || !defenderId) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 text-xl mb-4">
          No fighters selected!
        </p>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="rounded-lg bg-purple-600 hover:bg-purple-500 px-6 py-3 font-bold text-white transition-colors cursor-pointer"
        >
          Pick Fighters
        </button>
      </div>
    );
  }

  if (battle.isPending) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl animate-bounce mb-4">⚔️</div>
        <p className="text-gray-400 text-xl">Battle in progress...</p>
      </div>
    );
  }

  if (battle.error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400 text-xl mb-4">Battle failed!</p>
        <p className="text-gray-500 text-sm mb-4">
          {battle.error.message}
        </p>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="rounded-lg bg-purple-600 hover:bg-purple-500 px-6 py-3 font-bold text-white transition-colors cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (battle.data) {
    return (
      <div className="py-10">
        <BattleResult
          result={battle.data}
          onPlayAgain={() => navigate("/")}
        />
      </div>
    );
  }

  return null;
}
