# @emoji-battle/api-contract

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

The package is **ESM-only** with a single `tsc` build:

```json
{
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    }
  }
}
```

One `tsconfig.json`, one `dist/` directory, one compilation step.

### Why ESM-only works

Both consumers handle ESM without issues:

- **Frontend (Vite)** — natively ESM, imports the contract directly.
- **Backend (NestJS)** — compiles to CJS, but Node 22+ supports `require()` of ESM packages natively. No wrapper, no flag, just works.

Previously the contract compiled twice (CJS + ESM) with conditional exports. The dual build was eliminated once we confirmed Node 22+ `require(ESM)` support.

### Import extensions

Source files use `.js` extensions in relative imports (`from "./schemas.js"`), as required by Node's ESM resolver and TypeScript's `"module": "nodenext"`. This is the ESM standard — the `.js` extension refers to the compiled output file that will exist at runtime.

## Usage

### Backend (NestJS)

```ts
// Validation pipe — runtime schema checking
import { BattleRequestSchema } from "@emoji-battle/api-contract";

@Post()
@UsePipes(new ZodValidationPipe(BattleRequestSchema))
fight(@Body() body: BattleRequest) { ... }

// Types for service logic
import { type Fighter, CATEGORY_ADVANTAGE, FIGHTER_ROSTER } from "@emoji-battle/api-contract";
```

### Frontend (React)

```ts
// Typed API client
import { createApiClient } from "@emoji-battle/api-contract";
const api = createApiClient("http://localhost:3000");

// Types for components
import type { Fighter, BattleResult } from "@emoji-battle/api-contract";
```

## Commands

```bash
# Build
pnpm build

# Watch mode (for dev)
pnpm dev
```

## Extending

To add a new endpoint:

1. Add Zod schemas to `schemas.ts`
2. Add the route to `routes.ts`
3. Rebuild: `pnpm --filter @emoji-battle/api-contract build`
4. Backend: add controller/service using the schema
5. Frontend: the typed client already has the new method
