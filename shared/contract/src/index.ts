export {
  CategorySchema,
  FighterStatsSchema,
  FighterSchema,
  BattleRequestSchema,
  BattleOutcomeSchema,
  BattleResultSchema,
  LeaderboardEntrySchema,
  CATEGORY_ADVANTAGE,
  FIGHTER_ROSTER,
} from "./schemas";

export type {
  Category,
  Fighter,
  FighterStats,
  BattleRequest,
  BattleResult,
  LeaderboardEntry,
} from "./schemas";

export { routes } from "./routes";
export type { Routes, RouteName, RouteDefinition } from "./routes";

export { createApiClient } from "./client";
