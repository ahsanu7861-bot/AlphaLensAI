import { api } from "./api";
import type { AnalysisData, AnalysisResponse } from "../types/analysis";

export async function getStockAnalysis(
  symbol: string,
): Promise<AnalysisData> {
  const normalizedSymbol = symbol.trim().toUpperCase();

  const response = await api.get<AnalysisResponse>(
    `/api/analyze/${normalizedSymbol}`,
  );

  return response.data.data;
}
