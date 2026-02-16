# @emoji-battle/frontend

Vite + React + TanStack Query frontend for Emoji Battle Arena. Uses the typed API client and types from `@emoji-battle/api-contract` — no local API types, no manual fetch calls.

## Structure

```
src/
├── main.tsx                         ← Entry point
├── App.tsx                          ← Router + QueryClientProvider
├── index.css                        ← Tailwind import
├── api/
│   └── client.ts                    ← Instantiates typed client from contract
├── hooks/
│   ├── useFighters.ts               ← TanStack Query wrapper for fighters
│   ├── useBattle.ts                 ← Battle mutation + history query
│   └── useLeaderboard.ts            ← Leaderboard query
├── pages/
│   ├── FighterSelect.tsx            ← Pick your fighters grid
│   ├── BattleArena.tsx              ← Battle screen with results
│   └── Leaderboard.tsx              ← Rankings table
├── components/
│   ├── FighterCard.tsx              ← Fighter display with stats
│   ├── BattleResult.tsx             ← Win/loss/draw display
│   └── StatsBar.tsx                 ← Win/loss/draw bar chart
└── test/
    ├── setup.ts                     ← jest-dom matchers for Vitest
    ├── FighterSelect.test.tsx       ← Rendering + mock API tests
    └── BattleArena.test.tsx         ← Battle flow tests
```

## How the Contract Is Used

### Typed API Client

The entire API layer is two lines:

```ts
// src/api/client.ts
import { createApiClient } from "@emoji-battle/api-contract";
export const api = createApiClient("http://localhost:3000");
```

`api` is fully typed. Every method name, input shape, and return type is inferred from the shared route map. No manual type annotations needed.

### TanStack Query Hooks

Hooks wrap the typed client:

```ts
export function useFighters() {
  return useQuery({
    queryKey: ["fighters"],
    queryFn: () => api.listFighters(),  // ← return type is Fighter[]
  });
}

export function useBattle() {
  return useMutation({
    mutationFn: (input: { attackerId: string; defenderId: string }) =>
      api.battle(input),  // ← input and output fully typed
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fighters"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    },
  });
}
```

### Component Types

Components import types directly from the contract:

```ts
import type { Fighter } from "@emoji-battle/api-contract";

interface FighterCardProps {
  fighter: Fighter;  // ← same type the API returns
  onClick?: () => void;
}
```

## Pages

### Fighter Select (`/`)
- Grid of 12 emoji fighters across 3 categories
- Click to select attacker, then defender
- Random button for quick matchups
- Shows win/loss/draw stats per fighter
- Category advantage legend

### Battle Arena (`/battle?attacker=X&defender=Y`)
- Fires battle mutation on mount
- Shows animated result with winner highlight
- "Battle Again" returns to fighter select

### Leaderboard (`/leaderboard`)
- All fighters ranked by win rate
- Medal icons for top 3
- Visual win/loss/draw bar per fighter
- Battle count display

## Styling

Tailwind CSS 4 via `@tailwindcss/vite` plugin. No config file needed — Tailwind 4 uses CSS-based configuration. Dark theme with category-colored fighter cards:

- 🐾 Animals — amber border
- 🌱 Plants — green border
- ⚡ Elements — blue border

## Testing

Vitest + React Testing Library. Tests mock the API client and verify:

- Components render correctly with data
- Loading and error states work
- Battle mutation fires with correct params

Vitest is installed as a root workspace dependency shared with the backend.

```bash
pnpm test    # 5 tests
```

## Commands

```bash
# Dev server (port 5173)
pnpm dev

# Production build
pnpm build

# Preview production build
pnpm preview

# Run tests
pnpm test

# Lint
pnpm lint
```
