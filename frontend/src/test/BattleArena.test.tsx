import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import { BattleArena } from "../pages/BattleArena";

vi.mock("../api/client", () => ({
  api: {
    battle: vi.fn(() =>
      Promise.resolve({
        id: "test-1",
        attacker: {
          id: "dragon",
          emoji: "🐉",
          name: "Dragon",
          category: "animal",
          stats: { wins: 1, losses: 0, draws: 0 },
        },
        defender: {
          id: "cactus",
          emoji: "🌵",
          name: "Cactus",
          category: "plant",
          stats: { wins: 0, losses: 1, draws: 0 },
        },
        winner: "attacker",
        timestamp: new Date().toISOString(),
      }),
    ),
  },
}));

function renderWithProviders(ui: React.ReactElement, route: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("BattleArena", () => {
  it("shows 'no fighters selected' without query params", () => {
    renderWithProviders(<BattleArena />, "/battle");
    expect(screen.getByText(/no fighters selected/i)).toBeInTheDocument();
  });

  it("shows battle result with valid params", async () => {
    renderWithProviders(
      <BattleArena />,
      "/battle?attacker=dragon&defender=cactus",
    );
    expect(await screen.findByText(/Dragon wins/i)).toBeInTheDocument();
    expect(await screen.findByText(/battle again/i)).toBeInTheDocument();
  });
});
