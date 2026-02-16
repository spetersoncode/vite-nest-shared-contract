import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FighterSelect } from "./pages/FighterSelect";
import { BattleArena } from "./pages/BattleArena";
import { Leaderboard } from "./pages/Leaderboard";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5_000,
      retry: 1,
    },
  },
});

function Nav() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-4 py-2 rounded-lg font-bold transition-colors ${
      isActive
        ? "bg-purple-600 text-white"
        : "text-gray-400 hover:text-white hover:bg-gray-800"
    }`;

  return (
    <nav className="flex justify-center gap-2 mb-8">
      <NavLink to="/" end className={linkClass}>
        ⚔️ Fight
      </NavLink>
      <NavLink to="/leaderboard" className={linkClass}>
        🏆 Leaderboard
      </NavLink>
    </nav>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-950 text-white">
          <div className="mx-auto max-w-4xl px-4 py-8">
            <Nav />
            <Routes>
              <Route path="/" element={<FighterSelect />} />
              <Route path="/battle" element={<BattleArena />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
