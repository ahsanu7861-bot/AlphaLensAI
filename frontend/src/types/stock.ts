export type Stock = {
  id: string;
  ticker: string;
  company: string;
  exchange: string;
  sector: string;
  industry: string;
  price: number;
  change: number;
  aiScore: number;
  verdict: "BUY" | "WATCH" | "SELL";
  shariah: boolean;
  keywords: string[];
};