# @emoji-battle/backend

NestJS API server for Emoji Battle Arena. Imports Zod schemas and types from `@emoji-battle/contract` — no local schema definitions, no DTOs.

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
import { BattleRequestSchema } from "@emoji-battle/contract";

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
import { type Fighter, CATEGORY_ADVANTAGE, FIGHTER_ROSTER } from "@emoji-battle/contract";
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

## Commands

```bash
# Dev with watch mode
pnpm dev

# Build
pnpm build

# Run tests (Jest, 12 tests)
pnpm test

# Start production build
pnpm start
```

## NestJS-Specific Gotchas

### Don't Use `tsx` for Dev

`tsx` uses esbuild, which doesn't support `emitDecoratorMetadata`. NestJS DI will silently fail — injected services are `undefined`. Use `nest start --watch` instead.

### Jest, Not Vitest

NestJS's `@nestjs/testing` module is designed for Jest. `Test.createTestingModule()`, DI compilation, and module overrides all assume Jest. The frontend uses Vitest (Vite's native test runner). Two test runners in one monorepo is normal.

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
