import type * as z from "zod";
import {
  FighterSchema,
  BattleRequestSchema,
  BattleResultSchema,
  LeaderboardEntrySchema,
} from "./schemas.js";

// ── Route definition type ──────────────────────────────────────────
export interface RouteDefinition<
  TInput extends z.ZodTypeAny | undefined = undefined,
  TOutput extends z.ZodTypeAny = z.ZodTypeAny,
> {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  input?: TInput;
  output: TOutput;
}

// ── Route map ──────────────────────────────────────────────────────
import * as z_runtime from "zod";

export const routes = {
  listFighters: {
    method: "GET" as const,
    path: "/fighters",
    output: z_runtime.array(FighterSchema),
  },
  getFighter: {
    method: "GET" as const,
    path: "/fighters/:id",
    output: FighterSchema,
  },
  battle: {
    method: "POST" as const,
    path: "/battle",
    input: BattleRequestSchema,
    output: BattleResultSchema,
  },
  battleHistory: {
    method: "GET" as const,
    path: "/battle/history",
    output: z_runtime.array(BattleResultSchema),
  },
  leaderboard: {
    method: "GET" as const,
    path: "/leaderboard",
    output: z_runtime.array(LeaderboardEntrySchema),
  },
} as const satisfies Record<string, RouteDefinition<any, any>>;

// ── Type helpers ───────────────────────────────────────────────────
export type Routes = typeof routes;
export type RouteName = keyof Routes;
