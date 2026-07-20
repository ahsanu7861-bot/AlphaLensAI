import { api } from "./api";

export async function getStockAnalysis(symbol: string) {
  const response = await api.get(
    `/api/analyze/${symbol.trim().toUpperCase()}`
  );

  return response.data;
}