# Emoji Battle Arena 🥊

A sample project demonstrating **shared API contracts between NestJS and React without any contract library**. No tRPC, no ts-rest, no oRPC — just Zod schemas in a shared package, consumed by both sides.

This exists because every "type-safe API" library we tried had problems:

- **tRPC** — doesn't work with NestJS's decorator-based architecture
- **ts-rest** — effectively abandoned
- **oRPC** — promising but `@orpc/nest` has zero production users

So we did it ourselves. ~200 lines of glue code, Zod as the only dependency, full type safety.

## What This Demonstrates

1. **Single source of truth** — Zod schemas defined once in `shared/contract/`
2. **Backend consumes them** — NestJS validation pipes, service types, seed data
3. **Frontend consumes them** — typed API client, TanStack Query hooks, component props
4. **Change a schema → both sides get type errors immediately**

## Architecture

```
emoji-battle/
├── shared/contract/     ← Zod schemas + route map + typed fetch client
│                          The ONLY place API shapes are defined
│
├── backend/             ← NestJS API server
│                          Imports schemas for validation & types
│
├── frontend/            ← Vite + React + TanStack Query
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
pnpm --filter @emoji-battle/contract build

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

All request/response shapes are defined in `shared/contract/src/schemas.ts` and validated at runtime with Zod on the backend.

## How the Shared Contract Works

See [`shared/contract/README.md`](shared/contract/README.md) for the full explanation.

The short version:

```
shared/contract/src/
├── schemas.ts   ← Zod schemas (Fighter, BattleRequest, BattleResult, etc.)
├── routes.ts    ← Route map: { method, path, input schema, output schema }
├── client.ts    ← ~70-line typed fetch wrapper that reads the route map
└── index.ts     ← Barrel export
```

The backend imports schemas for validation pipes and types. The frontend imports the typed client and types. Both point at the same Zod objects.

## Gotchas & Lessons Learned

We ran into real issues building this. These aren't theoretical — they'll bite you.

### 1. NestJS Cannot Use `tsx` for Dev Mode

**Problem:** `tsx` uses esbuild under the hood. esbuild does **not** support `emitDecoratorMetadata`, which NestJS's dependency injection requires. You'll get `Cannot read properties of undefined` errors on injected services.

**Solution:** Use `nest start --watch` (which uses `tsc`) instead of `tsx watch`. This means you need `@nestjs/cli` and `ts-node` as dev dependencies.

### 2. Shared Package Needs Dual CJS/ESM Builds

**Problem:** NestJS compiles to CommonJS. Vite uses ESM. If you only build the shared package as one format, the other consumer breaks:
- CJS only → Vite/Rollup: `"createApiClient" is not exported`
- ESM only → NestJS at runtime: `Cannot find module './schemas'`

**Solution:** The contract package compiles twice — once to CJS (`tsconfig.json`), once to ESM (`tsconfig.esm.json`) — and uses conditional exports in `package.json`:

```json
"exports": {
  ".": {
    "import": { "default": "./dist/esm/index.js" },
    "require": { "default": "./dist/cjs/index.js" }
  }
}
```

### 3. No `.js` Extensions in Shared Package Imports

**Problem:** ESM convention says use `.js` extensions in imports (`from "./schemas.js"`). But when NestJS compiles the consuming code and resolves through the CJS build, Node can't find `schemas.js` because the compiled output uses bare specifiers.

**Solution:** Use extensionless imports in the shared package (`from "./schemas"`). Both `tsc` (CJS mode, `moduleResolution: "node"`) and Vite's bundler resolve them fine.

### 4. Build the Contract Before Everything Else

**Problem:** Both backend and frontend depend on `@emoji-battle/contract`, which points at `dist/`. If you haven't built it, imports fail.

**Solution:** Run `pnpm --filter @emoji-battle/contract build` before the first `pnpm dev`. In CI, build order matters.

### 5. Jest Needs Mock Logger Providers for Pino

**Problem:** Services use `@InjectPinoLogger()` for structured logging. In tests, NestJS can't resolve the Pino logger token without the full `LoggerModule`.

**Solution:** A small test helper that creates mock logger providers:

```ts
import { getLoggerToken } from "nestjs-pino";

export function mockLoggerProvider(target: Function) {
  return {
    provide: getLoggerToken(target.name),
    useValue: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
  };
}
```

### 6. NestJS Uses Jest, Not Vitest

NestJS's testing utilities (`@nestjs/testing`) are built around Jest. The `Test.createTestingModule()` API, module compilation, and DI resolution all assume Jest. Don't fight it — use Jest for the backend.

The frontend uses Vitest (the Vite-native default). Two test runners in one monorepo is fine.

## Tech Stack

| Layer    | Tech                                      |
| -------- | ----------------------------------------- |
| Contract | Zod, TypeScript                           |
| Backend  | NestJS 11, nestjs-pino, Jest              |
| Frontend | Vite 7, React 19, TanStack Query, Vitest  |
| Styling  | Tailwind CSS 4                            |
| Monorepo | pnpm workspaces                           |

## License

MIT
