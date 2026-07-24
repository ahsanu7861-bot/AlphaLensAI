import type {
  ShariahComplianceData,
  ShariahStatus,
} from "../../types/analysis";
import { Badge, Card } from "../ui";

type IslamicComplianceProps = {
  data?: ShariahComplianceData;
  isLoading?: boolean;
};

type BadgeVariant =
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "info";

function formatStatus(status?: ShariahStatus) {
  if (status === "COMPLIANT") {
    return "Compliant";
  }

  if (status === "NON_COMPLIANT") {
    return "Non-compliant";
  }

  return "Review required";
}

function statusVariant(status?: ShariahStatus): BadgeVariant {
  if (status === "COMPLIANT") {
    return "success";
  }

  if (status === "NON_COMPLIANT") {
    return "danger";
  }

  return "warning";
}

function screenLabel(status?: string) {
  if (status === "PASS") {
    return "Pass";
  }

  if (status === "FAIL") {
    return "Fail";
  }

  return "Review required";
}

function screenVariant(status?: string): BadgeVariant {
  if (status === "PASS") {
    return "success";
  }

  if (status === "FAIL") {
    return "danger";
  }

  return "warning";
}

function formatCheckedAt(value?: string | null) {
  if (!value) {
    return "Not verified";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(date);
}

export default function IslamicCompliance({
  data,
  isLoading = false,
}: IslamicComplianceProps) {
  const primary =
    data?.primaryMethodology ??
    data?.methodologies?.results?.AAOIFI;
  const status =
    data?.summary?.status ??
    primary?.status ??
    "UNKNOWN";
  const financialRatios = data?.financialScreen?.ratios;
  const revenueRatios = data?.businessActivity?.revenueRatios;
  const statusLabel = isLoading
    ? "Screening..."
    : formatStatus(status);
  const metrics = [
    {
      label: "Business activity",
      value: screenLabel(data?.businessActivity?.status),
      badge: screenVariant(data?.businessActivity?.status),
      description:
        data?.businessActivity?.reason ||
        "The company’s activities are checked against AAOIFI exclusions.",
    },
    {
      label: "Financial screen",
      value: screenLabel(data?.financialScreen?.status),
      badge: screenVariant(data?.financialScreen?.status),
      description:
        "Financial ratios are evaluated using the AAOIFI screening result.",
    },
    {
      label: "Debt to assets",
      value:
        financialRatios?.debtToAssetsFormatted ||
        "Unavailable",
      badge: financialRatios?.debtToAssetsFormatted
        ? "info"
        : "neutral",
      description:
        "Provider-reported debt ratio from the latest available financial data.",
    },
    {
      label: "Interest income",
      value:
        financialRatios?.interestIncomeToRevenueFormatted ||
        revenueRatios?.interestIncomeFormatted ||
        "Unavailable",
      badge:
        financialRatios?.interestIncomeToRevenueFormatted ||
        revenueRatios?.interestIncomeFormatted
          ? "info"
          : "neutral",
      description:
        "Interest income as a share of reported revenue, when available.",
    },
    {
      label: "Impure revenue",
      value:
        revenueRatios?.combinedImpureFormatted ||
        revenueRatios?.impermissibleFormatted ||
        "Unavailable",
      badge:
        revenueRatios?.combinedImpureFormatted ||
        revenueRatios?.impermissibleFormatted
          ? "info"
          : "neutral",
      description:
        "Estimated non-permissible revenue captured by the business screen.",
    },
    {
      label: "Dividend purification",
      value:
        data?.summary?.purificationRateFormatted ||
        "Unavailable",
      badge: data?.summary?.purificationRateFormatted
        ? "info"
        : "neutral",
      description:
        "Estimated dividend portion requiring purification, when applicable.",
    },
  ] satisfies Array<{
    label: string;
    value: string;
    badge: BadgeVariant;
    description: string;
  }>;

  return (
    <Card variant="brand" padding="lg">
      <div>
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
                Islamic Compliance
              </p>
              <Badge variant="neutral">AAOIFI</Badge>
            </div>

            <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              AAOIFI Shariah screening
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              One clear verdict based exclusively on AAOIFI business-activity
              and financial-ratio screening.
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] p-5 lg:min-w-64">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              AAOIFI Status
            </p>

            <div className="mt-3">
              <Badge
                dot
                variant={isLoading ? "neutral" : statusVariant(status)}
              >
                {statusLabel}
              </Badge>
            </div>

            <p className="mt-3 text-xs leading-5 text-slate-500">
              Confidence: {data?.summary?.confidence || "Unknown"}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-2xl border border-white/5 bg-slate-950/30 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <p className="text-sm font-medium text-slate-400">
                  {metric.label}
                </p>

                <Badge variant={metric.badge}>
                  {isLoading ? "Loading" : metric.value}
                </Badge>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-300">
                {metric.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-white/5 bg-slate-950/30 p-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-white">
                Why this status
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                {data?.summary?.explanation ||
                  primary?.reason ||
                  "The AAOIFI result is not currently available. AzaLens will not infer a compliant status without verified screening data."}
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-white">
                Verification
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Last checked:{" "}
                {formatCheckedAt(data?.verification?.lastCheckedAt)}
                {data?.verification?.isStale === true
                  ? " · Data may be stale"
                  : ""}
              </p>
            </div>
          </div>
        </div>

        <p className="mt-4 text-xs leading-5 text-slate-500">
          AAOIFI is the sole methodology used for the displayed AzaLens
          verdict. This automated screen is for research and is not a fatwa,
          religious ruling, or personal investment advice.
        </p>
      </div>
    </Card>
  );
}
