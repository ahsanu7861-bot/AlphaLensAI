import type{ Stock } from '../../types/stock';

export const stocks: Stock[] = [
  {
    id: "aapl",
    ticker: "AAPL",
    company: "Apple Inc.",
    exchange: "NASDAQ",
    sector: "Technology",
    industry: "Consumer Electronics",
    price: 212.43,
    change: 1.04,
    aiScore: 92,
    verdict: "BUY",
    shariah: true,
    keywords: [
      "apple",
      "iphone",
      "ios",
      "mac",
      "consumer electronics",
    ],
  },

  {
    id: "nvda",
    ticker: "NVDA",
    company: "NVIDIA Corporation",
    exchange: "NASDAQ",
    sector: "Technology",
    industry: "Semiconductors",
    price: 171.38,
    change: 2.74,
    aiScore: 95,
    verdict: "BUY",
    shariah: true,
    keywords: [
      "nvidia",
      "gpu",
      "cuda",
      "ai",
      "chip",
      "semiconductor",
    ],
  },

  // Continue with:
  // MSFT
  // META
  // AMZN
  // GOOGL
  // TSLA
  // AMD
  // AVGO
  // ORCL
  // NFLX
  // COST
  // JPM
  // V
  // MA
  // LLY
  // MRK
  // ABBV
  // NVO
  // KO
  // PG
  // XOM
  // CVX
  // CAT
  // GE
];