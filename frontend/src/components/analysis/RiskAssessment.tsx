import { Badge, Card } from "../ui";
import type { AnalysisData } from "../../types/analysis";

type RiskAssessmentProps = {
  risk?: AnalysisData["risk"];
  currency?: string;
  isLoading?: boolean;
};

type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral";

function isFiniteNumber(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function getRiskVariant(
  riskLevel?: string,
  riskScore?: number,
): BadgeVariant {
  const normalizedLevel = riskLevel?.trim().toLowerCase() || "";

  if (normalizedLevel.includes("low")) {
    return "success";
  }

  if (
    normalizedLevel.includes("moderate") ||
    normalizedLevel.includes("medium")
  ) {
    return "warning";
  }

  if (
    normalizedLevel.includes("high") ||
    normalizedLevel.includes("severe")
  ) {
    return "danger";
  }

  if (isFiniteNumber(riskScore)) {
    if (riskScore <= 30) {
      return "success";
    }

    if (riskScore <= 60) {
      return "warning";
    }

    return "danger";
  }

  return "neutral";
}

function normalizeCurrency(currency?: string) {
  const normalizedCurrency = currency?.trim().toUpperCase();

  return normalizedCurrency && /^[A-Z]{3}$/.test(normalizedCurrency)
    ? normalizedCurrency
    : "USD";
}

function formatMoney(
  value: number | null | undefined,
  currency: string,
) {
  if (!isFiniteNumber(value)) {
    return "—";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercent(value: number | null | undefined) {
  return isFiniteNumber(value) ? `${value.toFixed(2)}%` : "—";
}

export default function RiskAssessment({
  risk,
  currency,
  isLoading = false,
}: RiskAssessmentProps) {
  const riskLevel = risk?.riskLevel?.trim() || "Unavailable";
  const riskVariant = getRiskVariant(risk?.riskLevel, risk?.riskScore);
  const displayCurrency = normalizeCurrency(currency);
  const referenceDistances = risk?.referenceDistances;
  const priceLevels = risk?.priceReferenceLevels;
  const overviewMetrics: Array<{
    label: string;
    value: string;
    badge: BadgeVariant;
    description: string;
  }> = [
    {
      label: "Overall Risk",
      value: riskLevel,
      badge: riskVariant,
      description:
        "The backend's combined technical-risk classification for this analysis.",
    },
    {
      label: "Risk Score",
      value: isFiniteNumber(risk?.riskScore)
        ? `${Math.round(risk.riskScore)}/100`
        : "—",
      badge: riskVariant,
      description:
        "Higher scores indicate a more demanding technical risk environment.",
    },
    {
      label: "Volatility",
      value: risk?.volatility?.trim() || "—",
      badge: riskVariant,
      description:
        isFiniteNumber(risk?.atr) && isFiniteNumber(risk?.atrPercent)
          ? `ATR is ${formatMoney(risk.atr, displayCurrency)}, or ${risk.atrPercent.toFixed(2)}% of the current price.`
          : "ATR-based volatility data is currently unavailable.",
    },
    {
      label: "Agreement Confidence",
      value: isFiniteNumber(risk?.agreementConfidence)
        ? `${Math.round(risk.agreementConfidence)}%`
        : "—",
      badge: "info",
      description:
        "The share of tracked indicators currently supporting the reported direction.",
    },
  ];
  const referenceRanges = [
    {
      label: "Tight Reference",
      distance: referenceDistances?.tight,
      below: priceLevels?.belowCurrentPrice?.tight,
      above: priceLevels?.aboveCurrentPrice?.tight,
    },
    {
      label: "Standard Reference",
      distance: referenceDistances?.standard,
      below: priceLevels?.belowCurrentPrice?.standard,
      above: priceLevels?.aboveCurrentPrice?.standard,
    },
    {
      label: "Wide Reference",
      distance: referenceDistances?.wide,
      below: priceLevels?.belowCurrentPrice?.wide,
      above: priceLevels?.aboveCurrentPrice?.wide,
    },
  ];

  return (
    <Card variant="glass" padding="lg">
      <div>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
              Risk Assessment
            </p>

            <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Understand the downside before taking action
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              Live technical risk, volatility and ATR-based educational price
              references from the AzaLens engine.
            </p>
          </div>

          <Badge variant={isLoading ? "neutral" : riskVariant}>
            {isLoading ? "Assessing risk" : `${riskLevel} Risk`}
          </Badge>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {overviewMetrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-2xl border border-white/5 bg-white/[0.025] p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <p className="text-sm font-medium text-slate-400">
                  {metric.label}
                </p>

                <Badge variant={isLoading ? "neutral" : metric.badge}>
                  {isLoading ? "—" : metric.value}
                </Badge>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-300">
                {isLoading
                  ? "Calculating from the latest market evidence."
                  : metric.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {referenceRanges.map((reference) => (
            <div
              key={reference.label}
              className="rounded-2xl border border-sky-400/10 bg-sky-400/[0.035] p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-slate-300">
                  {reference.label}
                </p>

                <Badge variant="info">
                  {isLoading ? "—" : formatPercent(reference.distance?.percent)}
                </Badge>
              </div>

              <p className="mt-4 text-lg font-semibold text-white">
                {isLoading
                  ? "Loading reference range…"
                  : `${formatMoney(reference.below, displayCurrency)} — ${formatMoney(
                      reference.above,
                      displayCurrency,
                    )}`}
              </p>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                {isLoading
                  ? "Using ATR-based distance from the current price."
                  : isFiniteNumber(reference.distance?.atrMultiplier) &&
                      isFiniteNumber(reference.distance?.distance)
                    ? `${reference.distance.atrMultiplier}× ATR · ${formatMoney(
                        reference.distance.distance,
                        displayCurrency,
                      )} on either side of the current price.`
                    : "Reference distance is currently unavailable."}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-amber-400/10 bg-amber-400/[0.04] p-5">
          <p className="text-sm font-medium text-amber-300">
            Risk interpretation
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-300">
            {isLoading
              ? "AzaLens is interpreting the latest volatility and confirmation evidence."
              : risk?.riskSummary ||
                "The backend did not return a risk interpretation for this analysis."}
          </p>
        </div>

        {!isLoading &&
          ((risk?.riskNotes?.length ?? 0) > 0 ||
            (risk?.supportiveFactors?.length ?? 0) > 0) && (
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {(risk?.riskNotes?.length ?? 0) > 0 && (
                <div className="rounded-2xl border border-rose-400/10 bg-rose-400/[0.025] p-5">
                  <p className="text-sm font-medium text-rose-300">
                    Risk notes
                  </p>

                  <ul className="mt-3 space-y-2">
                    {risk?.riskNotes?.map((note) => (
                      <li
                        key={note}
                        className="flex gap-3 text-sm leading-6 text-slate-400"
                      >
                        <span aria-hidden="true" className="text-rose-400">
                          •
                        </span>
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {(risk?.supportiveFactors?.length ?? 0) > 0 && (
                <div className="rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.025] p-5">
                  <p className="text-sm font-medium text-emerald-300">
                    Supportive factors
                  </p>

                  <ul className="mt-3 space-y-2">
                    {risk?.supportiveFactors?.map((factor) => (
                      <li
                        key={factor}
                        className="flex gap-3 text-sm leading-6 text-slate-400"
                      >
                        <span aria-hidden="true" className="text-emerald-400">
                          •
                        </span>
                        <span>{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

        <p className="mt-4 text-xs leading-5 text-slate-600">
          {risk?.disclaimer ||
            "These values are educational risk references only and are not personalized financial advice or trade instructions."}
        </p>
      </div>
    </Card>
  );
}
