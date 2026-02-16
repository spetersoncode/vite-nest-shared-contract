import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFighters } from "../hooks/useFighters";
import { FighterCard } from "../components/FighterCard";
import type { Fighter } from "@emoji-battle/contract";

export function FighterSelect() {
  const { data: fighters, isLoading, error } = useFighters();
  const [attacker, setAttacker] = useState<Fighter | null>(null);
  const [defender, setDefender] = useState<Fighter | null>(null);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="text-center text-gray-400 text-xl py-20">
        Loading fighters...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-400 text-xl py-20">
        Failed to load fighters. Is the backend running?
      </div>
    );
  }

  const selectingFor = !attacker ? "attacker" : !defender ? "defender" : null;

  const handleSelect = (fighter: Fighter) => {
    if (!attacker) {
      setAttacker(fighter);
    } else if (!defender && fighter.id !== attacker.id) {
      setDefender(fighter);
    }
  };

  const handleBattle = () => {
    if (attacker && defender) {
      navigate(`/battle?attacker=${attacker.id}&defender=${defender.id}`);
    }
  };

  const handleReset = () => {
    setAttacker(null);
    setDefender(null);
  };

  const handleRandom = () => {
    if (!fighters || fighters.length < 2) return;
    const shuffled = [...fighters].sort(() => Math.random() - 0.5);
    setAttacker(shuffled[0]);
    setDefender(shuffled[1]);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-black text-white mb-2">
          ⚔️ Choose Your Fighters
        </h1>
        <p className="text-gray-400">
          {selectingFor === "attacker"
            ? "Pick your attacker"
            : selectingFor === "defender"
              ? "Now pick a defender to fight"
              : "Ready to battle!"}
        </p>
      </div>

      {/* Selected fighters display */}
      <div className="flex items-center justify-center gap-6 min-h-24">
        <div className="w-32 text-center">
          {attacker ? (
            <div>
              <div className="text-4xl">{attacker.emoji}</div>
              <div className="text-sm font-bold text-white mt-1">
                {attacker.name}
              </div>
              <div className="text-xs text-gray-500">Attacker</div>
            </div>
          ) : (
            <div className="text-gray-700 text-4xl">?</div>
          )}
        </div>

        <div className="text-2xl font-black text-gray-600">VS</div>

        <div className="w-32 text-center">
          {defender ? (
            <div>
              <div className="text-4xl">{defender.emoji}</div>
              <div className="text-sm font-bold text-white mt-1">
                {defender.name}
              </div>
              <div className="text-xs text-gray-500">Defender</div>
            </div>
          ) : (
            <div className="text-gray-700 text-4xl">?</div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-center gap-3">
        <button
          type="button"
          onClick={handleRandom}
          className="rounded-lg bg-gray-700 hover:bg-gray-600 px-4 py-2 text-sm font-bold text-white transition-colors cursor-pointer"
        >
          🎲 Random
        </button>
        {(attacker || defender) && (
          <button
            type="button"
            onClick={handleReset}
            className="rounded-lg bg-gray-700 hover:bg-gray-600 px-4 py-2 text-sm font-bold text-white transition-colors cursor-pointer"
          >
            ↩️ Reset
          </button>
        )}
        {attacker && defender && (
          <button
            type="button"
            onClick={handleBattle}
            className="rounded-lg bg-red-600 hover:bg-red-500 px-6 py-2 text-sm font-bold text-white transition-colors animate-pulse cursor-pointer"
          >
            ⚔️ FIGHT!
          </button>
        )}
      </div>

      {/* Category legend */}
      <div className="flex justify-center gap-6 text-xs text-gray-500">
        <span>🐾 Animals beat 🌱 Plants</span>
        <span>🌱 Plants beat ⚡ Elements</span>
        <span>⚡ Elements beat 🐾 Animals</span>
      </div>

      {/* Fighter grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {fighters?.map((fighter) => (
          <FighterCard
            key={fighter.id}
            fighter={fighter}
            selected={
              fighter.id === attacker?.id || fighter.id === defender?.id
            }
            onClick={() => handleSelect(fighter)}
          />
        ))}
      </div>
    </div>
  );
}
