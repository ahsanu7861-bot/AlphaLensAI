import type { Stock } from '../types/stock';
import { stocks } from '../data/search/stock';

export function searchStocks(query: string) {
  if (!query.trim()) return [];

  const term = query.toLowerCase();

  return stocks.filter((stock: Stock) => {
    return (
      stock.ticker.toLowerCase().includes(term) ||
      stock.company.toLowerCase().includes(term) ||
      stock.exchange.toLowerCase().includes(term) ||
      stock.sector.toLowerCase().includes(term) ||
      stock.industry.toLowerCase().includes(term) ||
      stock.keywords.some((k: string) =>
        k.toLowerCase().includes(term)
      )
    );
  });
}