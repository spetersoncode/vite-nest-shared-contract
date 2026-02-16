import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";

export function useBattle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { attackerId: string; defenderId: string }) =>
      api.battle(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fighters"] });
      queryClient.invalidateQueries({ queryKey: ["battleHistory"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    },
  });
}

export function useBattleHistory() {
  return useQuery({
    queryKey: ["battleHistory"],
    queryFn: () => api.battleHistory(),
  });
}
