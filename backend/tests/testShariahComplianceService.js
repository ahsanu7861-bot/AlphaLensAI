require("dotenv").config({ quiet: true });

const {
  getShariahCompliance,
} = require("../services/shariahComplianceService");

// ============================================================
// AzaLens - Shariah Compliance Service Test
// Compact Console Output
// ============================================================

async function run() {
  const symbol = process.argv[2] || "AAPL";

  console.log(
    `\nTesting AzaLens Shariah Compliance Service for ${symbol}...\n`
  );

  const result = await getShariahCompliance(symbol);

  const compactResult = {
    success: result.success,
    symbol: result.symbol,
    company: result.company?.name || null,
    status: result.summary?.status || "UNKNOWN",
    confidence: result.summary?.confidence || "UNKNOWN",
    headline: result.summary?.headline || null,
    explanation: result.summary?.explanation || null,
    purificationRate:
      result.summary?.purificationRateFormatted || null,
    methodologies: Array.isArray(result.methodologies)
      ? result.methodologies.map((item) => ({
          name: item.name,
          status: item.status,
          verified: item.verified,
          basis: item.basis,
        }))
      : [],
    businessScreen: {
      status: result.businessActivity?.status || "UNKNOWN",
      reason: result.businessActivity?.reason || null,
      combinedImpureRevenue:
        result.businessActivity?.revenueRatios
          ?.combinedImpureFormatted || null,
      exceedsFivePercent:
        result.businessActivity?.revenueRatios
          ?.exceedsFivePercent ?? null,
    },
    financialScreen: {
      status: result.financialScreen?.status || "UNKNOWN",
      debtToAssets:
        result.financialScreen?.ratios
          ?.debtToAssetsFormatted || null,
      debtToMarketCap:
        result.financialScreen?.ratios
          ?.debtToMarketCapFormatted || null,
      interestIncomeToRevenue:
        result.financialScreen?.ratios
          ?.interestIncomeToRevenueFormatted || null,
    },
    verification: {
      lastCheckedAt:
        result.verification?.lastCheckedAt || null,
      isStale: result.verification?.isStale ?? null,
      provider: result.provider?.name || null,
      fromCache:
        result.metadata?.providerMetadata?.fromCache ?? null,
      responseTimeMs:
        result.metadata?.providerMetadata?.responseTimeMs ?? null,
    },
    disclaimer:
      result.disclaimers?.[0]?.text || null,
    error: result.providerError || null,
  };

  console.dir(compactResult, {
    depth: null,
    colors: true,
  });

  process.exit(result.success ? 0 : 1);
}

run().catch((error) => {
  console.error("\nUnexpected service test failure:");
  console.error(error);
  process.exit(1);
});