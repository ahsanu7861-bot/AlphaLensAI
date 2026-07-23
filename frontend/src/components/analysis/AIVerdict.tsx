import { Badge, Card } from "../ui";

type AIVerdictProps = {
  direction?: string;
  trend?: string;
  confidence?: number;
  summary?: string;
  isLoading?: boolean;
};

type VerdictTone = {
  accent: string;
  badge: "success" | "warning" | "danger" | "neutral";
  bar: string;
};

function getVerdictTone(value: string): VerdictTone {
  const normalizedValue = value.toLowerCase();

  if (
    normalizedValue.includes("bullish") ||
    normalizedValue.includes("positive")
  ) {
    return {
      accent: "text-emerald-400",
      badge: "success",
      bar: "bg-emerald-400",
    };
  }

  if (
    normalizedValue.includes("bearish") ||
    normalizedValue.includes("negative")
  ) {
    return {
      accent: "text-rose-400",
      badge: "danger",
      bar: "bg-rose-400",
    };
  }

  if (normalizedValue.includes("neutral") || normalizedValue.includes("mixed")) {
    return {
      accent: "text-amber-400",
      badge: "warning",
      bar: "bg-amber-400",
    };
  }

  return {
    accent: "text-slate-300",
    badge: "neutral",
    bar: "bg-slate-400",
  };
}

export default function AIVerdict({
  direction,
  trend,
  confidence,
  summary,
  isLoading = false,
}: AIVerdictProps) {
  const verdict = direction?.trim() || trend?.trim() || "Unavailable";
  const safeConfidence =
    typeof confidence === "number"
      ? Math.min(100, Math.max(0, confidence))
      : 0;
  const confidenceLabel =
    safeConfidence >= 75
      ? "High confidence"
      : safeConfidence >= 50
        ? "Moderate confidence"
        : safeConfidence > 0
          ? "Low confidence"
          : "Awaiting confidence";
  const tone = getVerdictTone(verdict);

  return (
    <Card variant="brand" padding="lg">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
            AI Verdict
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <h2
              className={`text-4xl font-bold tracking-tight sm:text-5xl ${tone.accent}`}
            >
              {isLoading ? "ANALYZING" : verdict.toUpperCase()}
            </h2>

            <Badge variant={isLoading ? "neutral" : tone.badge}>
              {isLoading ? "Live analysis loading" : trend || "Trend unavailable"}
            </Badge>
          </div>

          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
            {isLoading
              ? "AzaLens is evaluating the latest technical evidence and market structure."
              : summary ||
                "The backend did not return an explanation for this analysis."}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                AI Confidence
              </p>

              <p className="mt-2 text-4xl font-bold text-white">
                {isLoading ? "--" : `${safeConfidence}%`}
              </p>
            </div>

            <span className={`text-sm font-medium ${tone.accent}`}>
              {isLoading ? "Calculating" : confidenceLabel}
            </span>
          </div>

          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full rounded-full transition-[width] duration-500 ${tone.bar}`}
              style={{ width: `${isLoading ? 0 : safeConfidence}%` }}
            />
          </div>

          <p className="mt-3 text-xs leading-5 text-slate-500">
            Confidence is the backend&apos;s indicator-agreement score, not a
            guarantee of future performance.
          </p>
        </div>
      </div>
    </Card>
  );
}
