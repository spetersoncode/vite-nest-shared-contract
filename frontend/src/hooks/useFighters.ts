import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";

export function useFighters() {
  return useQuery({
    queryKey: ["fighters"],
    queryFn: () => api.listFighters(),
  });
}

export function useFighter(id: string) {
  return useQuery({
    queryKey: ["fighters", id],
    queryFn: () => api.getFighter({ pathParams: { id } }),
    enabled: !!id,
  });
}
