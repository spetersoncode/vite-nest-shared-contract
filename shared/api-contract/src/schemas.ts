import * as z from "zod";

// ── Categories & Triangle ──────────────────────────────────────────
export const CategorySchema = z.enum(["animal", "plant", "element"]);
export type Category = z.infer<typeof CategorySchema>;

/** category triangle: key beats value */
export const CATEGORY_ADVANTAGE: Record<Category, Category> = {
  animal: "plant",
  plant: "element",
  element: "animal",
};

// ── Fighter ────────────────────────────────────────────────────────
export const FighterStatsSchema = z.object({
  wins: z.number().int().min(0),
  losses: z.number().int().min(0),
  draws: z.number().int().min(0),
});

export const FighterSchema = z.object({
  id: z.string(),
  emoji: z.string(),
  name: z.string(),
  category: CategorySchema,
  stats: FighterStatsSchema,
});

export type Fighter = z.infer<typeof FighterSchema>;
export type FighterStats = z.infer<typeof FighterStatsSchema>;

// ── Battle ─────────────────────────────────────────────────────────
export const BattleRequestSchema = z.object({
  attackerId: z.string(),
  defenderId: z.string(),
});

export const BattleOutcomeSchema = z.enum(["attacker", "defender", "draw"]);

export const BattleResultSchema = z.object({
  id: z.string(),
  attacker: FighterSchema,
  defender: FighterSchema,
  winner: BattleOutcomeSchema,
  timestamp: z.string(),
});

export type BattleRequest = z.infer<typeof BattleRequestSchema>;
export type BattleResult = z.infer<typeof BattleResultSchema>;

// ── Leaderboard ────────────────────────────────────────────────────
export const LeaderboardEntrySchema = z.object({
  fighter: FighterSchema,
  winRate: z.number().min(0).max(1),
  totalBattles: z.number().int().min(0),
});

export type LeaderboardEntry = z.infer<typeof LeaderboardEntrySchema>;

// ── Fighter Roster (seed data) ─────────────────────────────────────
export const FIGHTER_ROSTER: Omit<Fighter, "stats">[] = [
  { id: "dragon", emoji: "🐉", name: "Dragon", category: "animal" },
  { id: "shark", emoji: "🦈", name: "Shark", category: "animal" },
  { id: "wolf", emoji: "🐺", name: "Wolf", category: "animal" },
  { id: "eagle", emoji: "🦅", name: "Eagle", category: "animal" },
  { id: "cactus", emoji: "🌵", name: "Cactus", category: "plant" },
  { id: "sunflower", emoji: "🌻", name: "Sunflower", category: "plant" },
  { id: "mushroom", emoji: "🍄", name: "Mushroom", category: "plant" },
  { id: "fern", emoji: "🌿", name: "Fern", category: "plant" },
  { id: "fire", emoji: "🔥", name: "Fire", category: "element" },
  { id: "water", emoji: "💧", name: "Water", category: "element" },
  { id: "lightning", emoji: "⚡", name: "Lightning", category: "element" },
  { id: "rock", emoji: "🪨", name: "Rock", category: "element" },
];
