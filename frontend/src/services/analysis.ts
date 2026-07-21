import { api } from "./api";

export async function getStockAnalysis(symbol: string) {
  const normalizedSymbol = symbol.trim().toUpperCase();

  const response = await api.get(`/api/analyze/${normalizedSymbol}`);

  return response.data.data;
}
