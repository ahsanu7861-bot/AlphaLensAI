import { Badge, Card } from "../ui";

type MarketCardProps = {
  name: string;
  symbol: string;
  value: string;
  change: string;
  positive: boolean;
};

export default function MarketCard({
  name,
  symbol,
  value,
  change,
  positive,
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

        <Badge variant={positive ? "success" : "danger"}>
          {change}
        </Badge>
      </div>

      <p className="mt-8 text-3xl font-bold tracking-tight text-white">
        {value}
      </p>
    </Card>
  );
}