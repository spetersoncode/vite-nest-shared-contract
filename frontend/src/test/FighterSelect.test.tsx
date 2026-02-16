import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { FighterSelect } from "../pages/FighterSelect";
import type { Fighter } from "@emoji-battle/contract";

const mockFighters: Fighter[] = [
  {
    id: "dragon",
    emoji: "🐉",
    name: "Dragon",
    category: "animal",
    stats: { wins: 3, losses: 1, draws: 0 },
  },
  {
    id: "fire",
    emoji: "🔥",
    name: "Fire",
    category: "element",
    stats: { wins: 0, losses: 0, draws: 0 },
  },
];

vi.mock("../api/client", () => ({
  api: {
    listFighters: vi.fn(() => Promise.resolve(mockFighters)),
  },
}));

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("FighterSelect", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the page heading", async () => {
    renderWithProviders(<FighterSelect />);
    expect(
      await screen.findByText(/choose your fighters/i),
    ).toBeInTheDocument();
  });

  it("renders fighter cards after loading", async () => {
    renderWithProviders(<FighterSelect />);
    expect(await screen.findByText("Dragon")).toBeInTheDocument();
    expect(await screen.findByText("Fire")).toBeInTheDocument();
  });

  it("shows the random button", async () => {
    renderWithProviders(<FighterSelect />);
    expect(await screen.findByText(/random/i)).toBeInTheDocument();
  });
});
