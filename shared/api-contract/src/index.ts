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
} from "./schemas.js";

export type {
  Category,
  Fighter,
  FighterStats,
  BattleRequest,
  BattleResult,
  LeaderboardEntry,
} from "./schemas.js";

export { routes } from "./routes.js";
export type { Routes, RouteName, RouteDefinition } from "./routes.js";

export { createApiClient } from "./client.js";
