# Emoji Battle Arena 🥊

A sample project demonstrating **shared API contracts between NestJS and React without any contract library**. No tRPC, no ts-rest, no oRPC — just Zod schemas in a shared package, consumed by both sides.

This exists because every "type-safe API" library we tried had problems:

- **tRPC** — doesn't work with NestJS's decorator-based architecture
- **ts-rest** — effectively abandoned
- **oRPC** — promising but `@orpc/nest` has zero production users

So we did it ourselves. ~200 lines of glue code, Zod as the only dependency, full type safety.

## What This Demonstrates

1. **Single source of truth** — Zod schemas defined once in `shared/api-contract/`
2. **Backend consumes them** — NestJS validation pipes, service types, seed data
3. **Frontend consumes them** — typed API client, TanStack Query hooks, component props
4. **Change a schema → both sides get type errors immediately**

## Architecture

```
emoji-battle/
├── shared/api-contract/     ← Zod schemas + route map + typed fetch client
│                          ESM-only package, single tsc build
│
├── backend/             ← NestJS API server (CJS)
│                          Imports schemas for validation & types
│
├── frontend/            ← Vite + React + TanStack Query (ESM)
│                          Imports typed client + types
│
├── pnpm-workspace.yaml  ← connects everything
└── package.json          ← root scripts: dev, test, build
```

## Quick Start

```bash
# Install dependencies
pnpm install

# Build the shared contract (required before first run)
pnpm --filter @emoji-battle/api-contract build

# Start both backend and frontend
pnpm dev

# Run all tests (17 total)
pnpm test
```

- **Backend** runs on `http://localhost:3000`
- **Frontend** runs on `http://localhost:5173`

## The Game

Pick emoji fighters from 3 categories and battle them:

- 🐾 **Animals** (🐉 🦈 🐺 🦅) beat 🌱 **Plants**
- 🌱 **Plants** (🌵 🌻 🍄 🌿) beat ⚡ **Elements**
- ⚡ **Elements** (🔥 💧 ⚡ 🪨) beat 🐾 **Animals**

Same category matchups are weighted coin flips based on win history. Stats persist in-memory for the session. Leaderboard tracks win rates.

## API Endpoints

| Method | Path              | Description         |
| ------ | ----------------- | ------------------- |
| GET    | `/fighters`       | List all fighters   |
| GET    | `/fighters/:id`   | Get single fighter  |
| POST   | `/battle`         | Fight two fighters  |
| GET    | `/battle/history` | Recent battles      |
| GET    | `/leaderboard`    | Rankings by win rate|

All request/response shapes are defined in `shared/api-contract/src/schemas.ts` and validated at runtime with Zod on the backend.

## How the Shared Contract Works

See [`shared/api-contract/README.md`](shared/api-contract/README.md) for the full explanation.

The short version:

```
shared/api-contract/src/
├── schemas.ts   ← Zod schemas (Fighter, BattleRequest, BattleResult, etc.)
├── routes.ts    ← Route map: { method, path, input schema, output schema }
├── client.ts    ← ~70-line typed fetch wrapper that reads the route map
└── index.ts     ← Barrel export
```

The backend imports schemas for validation pipes and types. The frontend imports the typed client and types. Both point at the same Zod objects.

## ESM + Vitest: How It All Fits Together

This monorepo runs a **CJS backend** (NestJS) and **ESM frontend** (Vite/React) that share an **ESM-only contract package**, with **Vitest as the unified test runner** across both.

### Why ESM-only for the contract?

Earlier, the contract compiled twice — once to CJS and once to ESM — because the two consumers used different module systems. We eliminated the dual build by making the contract ESM-only:

- **Frontend (Vite)** — natively ESM, imports the contract directly.
- **Backend (NestJS)** — compiles to CJS, but Node 22+ supports `require()` of ESM packages natively. No dual build needed.

This means the contract has a single `tsc` pass and a single `dist/` output.

### Why Vitest everywhere?

NestJS scaffolds with Jest by default, which creates the impression it's required. It's not — `@nestjs/testing` is test-runner-agnostic. We switched to Vitest for both packages because:

- **Unified tooling** — one test runner, one config pattern, `vitest` as a single root devDependency
- **Native ESM** — Vitest handles ESM imports without `transformIgnorePatterns` hacks. Jest chokes on ESM `node_modules` by default and needs `ts-jest` configuration to transform them.
- **Speed** — Vitest is significantly faster for both startup and execution

### The `emitDecoratorMetadata` problem

NestJS's dependency injection relies on TypeScript's `emitDecoratorMetadata` compiler option to resolve constructor parameter types at runtime. Vitest uses **esbuild** for transpilation, and esbuild deliberately doesn't support `emitDecoratorMetadata`.

The fix is `unplugin-swc` — a Vitest plugin that replaces esbuild with **SWC** (a Rust-based TypeScript compiler that does support decorator metadata). This is the [officially recommended approach](https://docs.nestjs.com/recipes/swc#vitest) in the NestJS docs:

```ts
// backend/vitest.config.ts
import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: { globals: true },
  plugins: [swc.vite({ module: { type: "es6" } })],
});
```

### The module resolution chain

```
                    ┌─────────────────────────┐
                    │  shared/api-contract (ESM)   │
                    │  "type": "module"        │
                    │  single tsc → dist/      │
                    └────────┬────────┬────────┘
                             │        │
              require(ESM)   │        │   import (ESM)
              Node 22+       │        │   native
                             │        │
                    ┌────────▼──┐  ┌──▼────────┐
                    │  backend  │  │  frontend  │
                    │  CJS      │  │  ESM       │
                    │  NestJS   │  │  Vite      │
                    │  Vitest   │  │  Vitest    │
                    │  + SWC    │  │            │
                    └───────────┘  └────────────┘
```

### Key dependency roles

| Package         | Why                                                  |
| --------------- | ---------------------------------------------------- |
| `vitest`        | Test runner for both backend and frontend (root dep)  |
| `unplugin-swc`  | Vitest plugin replacing esbuild with SWC (root dep)   |
| `@swc/core`     | SWC compiler for `emitDecoratorMetadata` (root dep)   |

## Gotchas & Lessons Learned

We ran into real issues building this. These aren't theoretical — they'll bite you.

### 1. NestJS Cannot Use `tsx` or esbuild for Dev Mode

**Problem:** `tsx` and esbuild do **not** support `emitDecoratorMetadata`, which NestJS's dependency injection requires. You'll get `Cannot read properties of undefined` errors on injected services.

**Solution:** Use `nest start --watch` (which uses `tsc`) for dev mode. For testing, use `unplugin-swc` to swap in SWC (which does support decorator metadata).

### 2. ESM Contract + CJS Backend Works on Node 22+

**Problem (old):** The contract package used to compile twice — once to CJS, once to ESM — because NestJS compiled to CJS and Vite used ESM.

**Solution:** Node 22+ supports `require()` of ESM modules natively. The contract is now ESM-only with a single `tsc` build. The CJS backend `require()`s it without issues. No dual build, no conditional exports.

### 3. ESM Requires `.js` Extensions in Imports

**Problem:** Node's ESM resolver requires explicit `.js` extensions in relative imports (`from "./schemas.js"`, not `from "./schemas"`). TypeScript with `"module": "nodenext"` enforces this.

**Solution:** The contract package uses `.js` extensions in all its source imports. The backend stays CJS with `"moduleResolution": "node"`, so its own source files use extensionless imports as usual.

### 4. Build the Contract Before Everything Else

**Problem:** Both backend and frontend depend on `@emoji-battle/api-contract`, which points at `dist/`. If you haven't built it, imports fail.

**Solution:** Run `pnpm --filter @emoji-battle/api-contract build` before the first `pnpm dev`. In CI, build order matters.

### 5. Tests Need Mock Logger Providers for Pino

**Problem:** Services use `@InjectPinoLogger()` for structured logging. In tests, NestJS can't resolve the Pino logger token without the full `LoggerModule`.

**Solution:** A small test helper that creates mock logger providers:

```ts
import { vi } from "vitest";
import { getLoggerToken } from "nestjs-pino";

export function mockLoggerProvider(target: Function) {
  return {
    provide: getLoggerToken(target.name),
    useValue: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
  };
}
```

### 6. Jest ESM Pain Was the Catalyst

We originally used Jest for the backend (NestJS's default). When we switched the contract to ESM-only, Jest couldn't import it — `SyntaxError: Unexpected token 'export'`. Fixing it required `transformIgnorePatterns`, `allowJs` in ts-jest, and fighting pnpm's symlink structure. Switching to Vitest eliminated all of this — it handles ESM natively with zero configuration.

## Tech Stack

| Layer    | Tech                                      |
| -------- | ----------------------------------------- |
| Contract | Zod, TypeScript (ESM)                     |
| Backend  | NestJS 11, nestjs-pino, SWC               |
| Frontend | Vite 7, React 19, TanStack Query          |
| Testing  | Vitest (both packages)                    |
| Styling  | Tailwind CSS 4                            |
| Monorepo | pnpm workspaces                           |

## License

MIT
