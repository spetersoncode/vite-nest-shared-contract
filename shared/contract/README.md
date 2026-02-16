# @emoji-battle/contract

The shared API contract package. This is the **single source of truth** for all API shapes, validation, and the typed client. Both the NestJS backend and React frontend depend on this package.

**Only dependency:** Zod.

## What's In Here

```
src/
├── schemas.ts   ← Zod schemas — the core of everything
├── routes.ts    ← Route map tying HTTP methods/paths to schemas
├── client.ts    ← Typed fetch wrapper (~70 lines)
└── index.ts     ← Barrel export
```

### `schemas.ts` — The Source of Truth

Every data shape is a Zod schema. Types are inferred, never hand-written:

```ts
export const FighterSchema = z.object({
  id: z.string(),
  emoji: z.string(),
  name: z.string(),
  category: CategorySchema,
  stats: FighterStatsSchema,
});

// Type is inferred — not duplicated
export type Fighter = z.infer<typeof FighterSchema>;
```

The backend uses `FighterSchema` in validation pipes (runtime). The frontend uses `Fighter` as a type (compile time). Same object, two uses.

Also exports constants like `CATEGORY_ADVANTAGE` (game logic) and `FIGHTER_ROSTER` (seed data) that both sides need.

### `routes.ts` — Route Map

A plain TypeScript object mapping route names to their HTTP contract:

```ts
export const routes = {
  listFighters: {
    method: "GET",
    path: "/fighters",
    output: z.array(FighterSchema),
  },
  battle: {
    method: "POST",
    path: "/battle",
    input: BattleRequestSchema,
    output: BattleResultSchema,
  },
  // ...
};
```

The backend doesn't consume this directly (NestJS has its own routing decorators), but it ensures the typed client matches what the backend actually serves. If you add a route here, the frontend client gets the new method automatically.

### `client.ts` — Typed Fetch Client

A generic `createApiClient(baseUrl)` that reads the route map and returns a fully typed object:

```ts
const api = createApiClient("http://localhost:3000");

// Fully typed — TS knows this returns Promise<Fighter[]>
const fighters = await api.listFighters();

// Fully typed — TS requires { attackerId, defenderId }
const result = await api.battle({ attackerId: "dragon", defenderId: "cactus" });

// Path params
const fighter = await api.getFighter({ pathParams: { id: "dragon" } });
```

This is ~70 lines of code. It uses `fetch`, has zero dependencies beyond Zod, and infers all input/output types from the route map. No code generation, no build step magic.

## How It's Built

The package compiles to **both CJS and ESM** because the two consumers need different module formats:

- **NestJS** (backend) → CommonJS (`require()`)
- **Vite** (frontend) → ESM (`import`)

```
dist/
├── cjs/    ← CommonJS output (tsconfig.json)
└── esm/    ← ESM output (tsconfig.esm.json)
```

The `package.json` uses conditional exports to serve the right format:

```json
"exports": {
  ".": {
    "import": {
      "types": "./dist/esm/index.d.ts",
      "default": "./dist/esm/index.js"
    },
    "require": {
      "types": "./dist/cjs/index.d.ts",
      "default": "./dist/cjs/index.js"
    }
  }
}
```

### Why Two Builds?

We tried alternatives:

- **Raw TypeScript source** (`"main": "./src/index.ts"`) — Works in dev with Vite (it bundles TS natively), but NestJS's `tsc` compilation doesn't re-compile workspace dependencies. At runtime, Node tries to import raw `.ts` files and fails.
- **ESM only** — NestJS compiles to CJS by default. When the compiled backend `require()`s an ESM-only package, Node throws `ERR_REQUIRE_ESM`.
- **CJS only** — Vite/Rollup can't tree-shake CJS and throws `"X" is not exported` errors on named exports.

Dual build is the boring answer that works everywhere.

### Import Extensions

Source files use **extensionless imports** (`from "./schemas"`, not `from "./schemas.js"`):

- `tsc` with `module: "commonjs"` + `moduleResolution: "node"` resolves them fine
- `tsc` with `module: "ESNext"` + `moduleResolution: "bundler"` resolves them fine
- ESM purists will object, but `.js` extensions break CJS resolution in this setup

## Usage

### Backend (NestJS)

```ts
// Validation pipe — runtime schema checking
import { BattleRequestSchema } from "@emoji-battle/contract";

@Post()
@UsePipes(new ZodValidationPipe(BattleRequestSchema))
fight(@Body() body: BattleRequest) { ... }

// Types for service logic
import { type Fighter, CATEGORY_ADVANTAGE } from "@emoji-battle/contract";
```

### Frontend (React)

```ts
// Typed API client
import { createApiClient } from "@emoji-battle/contract";
const api = createApiClient("http://localhost:3000");

// Types for components
import type { Fighter, BattleResult } from "@emoji-battle/contract";
```

## Commands

```bash
# Build both CJS and ESM
pnpm build

# Watch mode (CJS only, for backend dev)
pnpm dev
```

## Extending

To add a new endpoint:

1. Add Zod schemas to `schemas.ts`
2. Add the route to `routes.ts`
3. Rebuild: `pnpm --filter @emoji-battle/contract build`
4. Backend: add controller/service using the schema
5. Frontend: the typed client already has the new method
