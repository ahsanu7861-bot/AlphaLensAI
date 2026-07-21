import { useQuery } from "@tanstack/react-query";
import { getStockAnalysis } from "../services/analysis";

export function useAnalysis(symbol: string) {
  return useQuery({
    queryKey: ["analysis", symbol],
    queryFn: () => getStockAnalysis(symbol),
    enabled: Boolean(symbol.trim()),
  });
}
