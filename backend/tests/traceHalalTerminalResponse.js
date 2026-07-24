"use strict";

require("dotenv").config({ quiet: true });

const {
  fetchScreening,
} = require("../providers/halalTerminalProvider");
const {
  transformProviderResult,
} = require("../services/shariahComplianceService");

async function run() {
  const symbol = String(process.argv[2] || "AAPL")
    .trim()
    .toUpperCase();
  const providerResult = await fetchScreening(symbol);
  const transformed = transformProviderResult(providerResult);
  const raw = providerResult.raw || null;

  console.dir(
    {
      symbol,
      transport: {
        success: providerResult.success,
        error: providerResult.error || providerResult.providerError || null,
        fromCache: providerResult.metadata?.fromCache ?? null,
        responseTimeMs: providerResult.metadata?.responseTimeMs ?? null,
      },
      rawContract: raw
        ? {
            overall_status: raw.overall_status ?? null,
            shariah_compliance_status:
              raw.shariah_compliance_status ?? null,
            is_compliant: raw.is_compliant ?? null,
            methodologies: raw.methodologies ?? null,
            by_methodology: raw.by_methodology ?? null,
            methodology_summary: raw.methodology_summary ?? null,
            compliance_explanation: raw.compliance_explanation ?? null,
            last_checked_at: raw.last_checked_at ?? null,
            is_stale: raw.is_stale ?? null,
          }
        : null,
      normalizedAAOIFI: {
        status: transformed.summary?.status ?? "UNKNOWN",
        confidence: transformed.summary?.confidence ?? "UNKNOWN",
        verified: transformed.primaryMethodology?.verified ?? null,
        reason: transformed.primaryMethodology?.reason ?? null,
        explanation: transformed.summary?.explanation ?? null,
        providerError: transformed.providerError || null,
      },
    },
    {
      depth: null,
      colors: true,
    }
  );

  process.exit(providerResult.success ? 0 : 1);
}

run().catch((error) => {
  console.error("Halal Terminal trace failed:");
  console.error(error);
  process.exit(1);
});
