import { Badge, Card } from "../ui";

type MarketCardProps = {
  name: string;
  symbol: string;
  exchange: string;
  market: string;
};

export default function MarketCard({
  name,
  symbol,
  exchange,
  market,
}: MarketCardProps) {
  return (
    <Card variant="glass" interactive className="h-full">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-wide text-slate-500">
            {symbol}
          </p>

          <h3 className="mt-1 text-lg font-semibold text-white">
            {name}
          </h3>
        </div>

        <Badge variant="info">{exchange}</Badge>
      </div>

      <p className="mt-8 text-sm font-medium text-slate-300">
        {market}
      </p>

      <p className="mt-2 text-xs leading-5 text-slate-500">
        Listed cash equity
      </p>
    </Card>
  );
}
