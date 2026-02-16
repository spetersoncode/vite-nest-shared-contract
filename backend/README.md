# @emoji-battle/backend

NestJS API server for Emoji Battle Arena. Imports Zod schemas and types from `@emoji-battle/api-contract` — no local schema definitions, no DTOs.

## Structure

```
src/
├── main.ts                          ← Bootstrap, CORS, Pino logger
├── app.module.ts                    ← Root module with LoggerModule
├── validation/
│   └── zod.pipe.ts                  ← Generic ZodValidationPipe
├── fighters/
│   ├── fighters.module.ts
│   ├── fighters.controller.ts       ← GET /fighters, GET /fighters/:id
│   └── fighters.service.ts          ← In-memory fighter roster + stats
├── battle/
│   ├── battle.module.ts
│   ├── battle.controller.ts         ← POST /battle, GET /battle/history
│   └── battle.service.ts            ← Battle logic (category triangle)
└── leaderboard/
    ├── leaderboard.module.ts
    ├── leaderboard.controller.ts    ← GET /leaderboard
    └── leaderboard.service.ts       ← Sorted rankings
```

## How the Contract Is Used

### Validation

The `ZodValidationPipe` accepts any Zod schema and validates incoming request bodies:

```ts
import { BattleRequestSchema } from "@emoji-battle/api-contract";

@Post()
@UsePipes(new ZodValidationPipe(BattleRequestSchema))
fight(@Body() body: BattleRequest) {
  return this.battleService.fight(body.attackerId, body.defenderId);
}
```

If validation fails, it returns a 400 with structured Zod error issues. The same schema the frontend uses to build the request is the one the backend uses to validate it.

### Types and Constants

Services import types and game constants directly:

```ts
import { type Fighter, CATEGORY_ADVANTAGE, FIGHTER_ROSTER } from "@emoji-battle/api-contract";
```

No local type definitions. If a field changes in the contract, the backend gets a type error.

## Logging

Structured logging via `nestjs-pino` + `pino-http`:

- **HTTP requests** — automatic (method, url, statusCode, responseTime)
- **Battle outcomes** — attacker, defender, winner, category advantage
- **Leaderboard** — active fighter count, top fighter stats
- **Fighter lookups** — warnings on not-found

In dev mode, `pino-pretty` formats logs as colorized single-line output. In production (`NODE_ENV=production`), raw JSON for log aggregators.

### Testing with Pino

Services inject `PinoLogger` via `@InjectPinoLogger()`. Tests need a mock provider — see `test/helpers.ts`:

```ts
import { mockLoggerProvider } from "./helpers";

const module = await Test.createTestingModule({
  providers: [
    BattleService,
    FightersService,
    mockLoggerProvider(BattleService),
    mockLoggerProvider(FightersService),
  ],
}).compile();
```

## Data Storage

Everything is in-memory. No database. Restart the server and stats reset. This is a demo project.

## Testing

Tests use **Vitest** with `unplugin-swc` for decorator metadata support. NestJS's `@nestjs/testing` module is test-runner-agnostic — despite NestJS scaffolding with Jest by default, `Test.createTestingModule()` works identically under Vitest.

The SWC plugin is needed because Vitest uses esbuild by default, which doesn't support `emitDecoratorMetadata`. SWC does, so NestJS's constructor-based dependency injection resolves correctly in tests:

```ts
// vitest.config.ts
import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: { globals: true },
  plugins: [swc.vite({ module: { type: "es6" } })],
});
```

The `globals: true` option provides `describe`, `it`, and `expect` without imports — matching Jest's API, so test files work without modification.

## Commands

```bash
# Dev with watch mode
pnpm dev

# Build
pnpm build

# Run tests (Vitest, 12 tests)
pnpm test

# Start production build
pnpm start
```

## NestJS-Specific Gotchas

### Don't Use `tsx` or esbuild for Dev

`tsx` and esbuild do **not** support `emitDecoratorMetadata`. NestJS DI will silently fail — injected services are `undefined`. Use `nest start --watch` (which uses `tsc`) for dev mode.

### The `ZodValidationPipe`

This is a 15-line generic pipe in `src/validation/zod.pipe.ts`. It's intentionally minimal:

```ts
@Injectable()
export class ZodValidationPipe<T extends z.ZodTypeAny> implements PipeTransform {
  constructor(private schema: T) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException({
        message: "Validation failed",
        errors: result.error.issues,
      });
    }
    return result.data;
  }
}
```

NestJS has its own `ValidationPipe` using `class-validator`, but that requires decorator-based DTOs — a second schema definition. Using Zod directly means the contract schemas are the only schema definition.
