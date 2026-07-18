const {
  fetchScreening,
} = require("../providers/halalTerminalProvider");

// ============================================================
// AlphaLens AI - Shariah Compliance Service
// Version: 0.4.1
// ============================================================

const STATUS = Object.freeze({
  COMPLIANT: "COMPLIANT",
  NON_COMPLIANT: "NON_COMPLIANT",
  UNKNOWN: "UNKNOWN",
});

const CONFIDENCE = Object.freeze({
  HIGH: "HIGH",
  MEDIUM: "MEDIUM",
  LOW: "LOW",
  UNKNOWN: "UNKNOWN",
});

function toNullableNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatPercent(value, digits = 2) {
  const number = toNullableNumber(value);

  if (number === null) {
    return null;
  }

  return `${number.toFixed(digits)}%`;
}

function formatRatioAsPercent(value, digits = 2) {
  const number = toNullableNumber(value);

  if (number === null) {
    return null;
  }

  return `${(number * 100).toFixed(digits)}%`;
}

function countMethodologyResults(details = []) {
  return details.reduce(
    (summary, methodology) => {
      if (methodology?.isCompliant === true) {
        summary.compliant += 1;
      } else if (methodology?.isCompliant === false) {
        summary.nonCompliant += 1;
      } else {
        summary.unknown += 1;
      }

      if (methodology?.verified === true) {
        summary.verified += 1;
      }

      summary.total += 1;
      return summary;
    },
    {
      total: 0,
      compliant: 0,
      nonCompliant: 0,
      unknown: 0,
      verified: 0,
    }
  );
}

function determineConfidence(providerResult, methodologyCounts) {
  if (!providerResult?.success) {
    return CONFIDENCE.UNKNOWN;
  }

  const lastCheckedAt = providerResult?.verification?.lastCheckedAt;
  const isStale = providerResult?.verification?.isStale;

  if (isStale === true) {
    return CONFIDENCE.LOW;
  }

  if (
    methodologyCounts.total > 0 &&
    methodologyCounts.verified === methodologyCounts.total &&
    methodologyCounts.unknown === 0 &&
    lastCheckedAt
  ) {
    return CONFIDENCE.HIGH;
  }

  if (
    methodologyCounts.total > 0 &&
    methodologyCounts.unknown < methodologyCounts.total
  ) {
    return CONFIDENCE.MEDIUM;
  }

  return CONFIDENCE.LOW;
}

function buildHeadline(companyName, status, methodologyCounts) {
  const company = companyName || "This instrument";

  if (status === STATUS.COMPLIANT) {
    if (
      methodologyCounts.total > 0 &&
      methodologyCounts.compliant === methodologyCounts.total
    ) {
      return `${company} passes all available Shariah screening methodologies.`;
    }

    return `${company} is reported as Shariah compliant by the screening provider.`;
  }

  if (status === STATUS.NON_COMPLIANT) {
    if (methodologyCounts.nonCompliant > 0) {
      return `${company} fails one or more Shariah screening methodologies.`;
    }

    return `${company} is reported as non-compliant by the screening provider.`;
  }

  return `Shariah compliance could not be verified for ${company}.`;
}

function buildSummary(providerResult, methodologyCounts, confidence) {
  const status =
    providerResult?.screening?.overallStatus || STATUS.UNKNOWN;

  return {
    headline: buildHeadline(
      providerResult?.company?.name,
      status,
      methodologyCounts
    ),
    status,
    confidence,
    explanation:
      providerResult?.screening?.explanation ||
      providerResult?.screening?.businessScreen?.reason ||
      null,
    purificationRatePercent:
      providerResult?.screening?.purificationRatePercent ?? null,
    purificationRateFormatted: formatPercent(
      providerResult?.screening?.purificationRatePercent
    ),
    methodologiesPassed: methodologyCounts.compliant,
    methodologiesFailed: methodologyCounts.nonCompliant,
    methodologiesUnknown: methodologyCounts.unknown,
    methodologiesTotal: methodologyCounts.total,
  };
}

function buildMethodologies(providerResult) {
  const details = Array.isArray(providerResult?.methodologies?.details)
    ? providerResult.methodologies.details
    : [];

  return details.map((methodology) => ({
    name: methodology?.name || null,
    status:
      methodology?.isCompliant === true
        ? STATUS.COMPLIANT
        : methodology?.isCompliant === false
          ? STATUS.NON_COMPLIANT
          : STATUS.UNKNOWN,
    isCompliant:
      typeof methodology?.isCompliant === "boolean"
        ? methodology.isCompliant
        : null,
    verified:
      typeof methodology?.verified === "boolean"
        ? methodology.verified
        : null,
    disposition: methodology?.disposition || null,
    basis: methodology?.basis || null,
    alternateBasis: methodology?.alternateBasis || null,
    basesDisagree:
      typeof methodology?.basesDisagree === "boolean"
        ? methodology.basesDisagree
        : null,
    reason: methodology?.reason || null,
  }));
}

function buildBusinessActivity(providerResult) {
  const businessScreen = providerResult?.screening?.businessScreen || {};
  const businessIncome = providerResult?.businessIncome;

  return {
    status:
      businessScreen.passed === true
        ? "PASS"
        : businessScreen.passed === false
          ? "FAIL"
          : "UNKNOWN",
    passed:
      typeof businessScreen.passed === "boolean"
        ? businessScreen.passed
        : null,
    reason: businessScreen.reason || null,
    questionableBusiness:
      typeof businessScreen.questionableBusiness === "boolean"
        ? businessScreen.questionableBusiness
        : null,
    ifiExempt:
      typeof businessScreen.ifiExempt === "boolean"
        ? businessScreen.ifiExempt
        : null,
    advisory: businessIncome?.advisory ?? null,
    includedInVerdict: businessIncome?.includedInVerdict ?? null,
    fiscalYear: businessIncome?.fiscalYear || null,
    confidence: businessIncome?.confidence || null,
    segments: Array.isArray(businessIncome?.segments)
      ? businessIncome.segments
      : [],
    revenueRatios: businessIncome
      ? {
          impermissible:
            businessIncome.impermissibleRevenueRatio ?? null,
          impermissibleFormatted: formatRatioAsPercent(
            businessIncome.impermissibleRevenueRatio
          ),
          questionable:
            businessIncome.questionableRevenueRatio ?? null,
          questionableFormatted: formatRatioAsPercent(
            businessIncome.questionableRevenueRatio
          ),
          unknown: businessIncome.unknownRevenueRatio ?? null,
          unknownFormatted: formatRatioAsPercent(
            businessIncome.unknownRevenueRatio
          ),
          interestIncome: businessIncome.interestIncomeRatio ?? null,
          interestIncomeFormatted: formatRatioAsPercent(
            businessIncome.interestIncomeRatio
          ),
          combinedImpure: businessIncome.combinedImpureRatio ?? null,
          combinedImpureFormatted: formatRatioAsPercent(
            businessIncome.combinedImpureRatio
          ),
          exceedsFivePercent:
            businessIncome.exceedsFivePercent ?? null,
          exceedsFivePercentWithQuestionable:
            businessIncome.exceedsFivePercentWithQuestionable ?? null,
        }
      : null,
    sourceUrl: businessIncome?.sourceUrl || null,
  };
}

function buildFinancialScreen(providerResult) {
  const screening = providerResult?.screening?.financialScreen || {};
  const ratios = providerResult?.ratios || {};

  return {
    status:
      screening.passed === true
        ? "PASS"
        : screening.passed === false
          ? "FAIL"
          : "UNKNOWN",
    passed:
      typeof screening.passed === "boolean"
        ? screening.passed
        : null,
    ratios: {
      debtToAssets: ratios.debtToAssets ?? null,
      debtToAssetsFormatted: formatRatioAsPercent(
        ratios.debtToAssets
      ),
      cashToAssets: ratios.cashToAssets ?? null,
      cashToAssetsFormatted: formatRatioAsPercent(
        ratios.cashToAssets
      ),
      receivablesToAssets: ratios.receivablesToAssets ?? null,
      receivablesToAssetsFormatted: formatRatioAsPercent(
        ratios.receivablesToAssets
      ),
      interestIncomeToRevenue:
        ratios.interestIncomeToRevenue ?? null,
      interestIncomeToRevenueFormatted: formatRatioAsPercent(
        ratios.interestIncomeToRevenue
      ),
      debtToMarketCap: ratios.debtToMarketCap ?? null,
      debtToMarketCapFormatted: formatRatioAsPercent(
        ratios.debtToMarketCap
      ),
      cashToMarketCap: ratios.cashToMarketCap ?? null,
      cashToMarketCapFormatted: formatRatioAsPercent(
        ratios.cashToMarketCap
      ),
      receivablesToMarketCap:
        ratios.receivablesToMarketCap ?? null,
      receivablesToMarketCapFormatted: formatRatioAsPercent(
        ratios.receivablesToMarketCap
      ),
      liquidityToMarketCap:
        ratios.liquidityToMarketCap ?? null,
      liquidityToMarketCapFormatted: formatRatioAsPercent(
        ratios.liquidityToMarketCap
      ),
      liquidityToAssets: ratios.liquidityToAssets ?? null,
      liquidityToAssetsFormatted: formatRatioAsPercent(
        ratios.liquidityToAssets
      ),
    },
    financials: providerResult?.financials || null,
  };
}

function buildDisclaimers(providerResult) {
  if (
    !Array.isArray(providerResult?.disclaimers) ||
    providerResult.disclaimers.length === 0
  ) {
    return [
      {
        id: "alphalens-shariah",
        severity: "religious",
        text:
          "AlphaLens AI reports automated screening data and does not issue a fatwa or scholarly attestation.",
        url: null,
      },
    ];
  }

  return providerResult.disclaimers;
}

function buildUnknownResult(symbol, providerResult) {
  return {
    success: false,
    symbol: symbol || providerResult?.symbol || null,
    module: {
      id: "shariah_compliance",
      name: "Shariah Compliance",
      version: "0.4.1",
    },
    summary: {
      headline: `Shariah compliance could not be verified${
        symbol ? ` for ${symbol}` : ""
      }.`,
      status: STATUS.UNKNOWN,
      confidence: CONFIDENCE.UNKNOWN,
      explanation:
        providerResult?.error?.message ||
        "The screening provider did not return a verified result.",
      purificationRatePercent: null,
      purificationRateFormatted: null,
      methodologiesPassed: 0,
      methodologiesFailed: 0,
      methodologiesUnknown: 0,
      methodologiesTotal: 0,
    },
    company: providerResult?.company || null,
    methodologies: [],
    businessActivity: {
      status: "UNKNOWN",
      passed: null,
      reason: null,
      questionableBusiness: null,
      ifiExempt: null,
      advisory: null,
      includedInVerdict: null,
      fiscalYear: null,
      confidence: null,
      segments: [],
      revenueRatios: null,
      sourceUrl: null,
    },
    financialScreen: {
      status: "UNKNOWN",
      passed: null,
      ratios: {},
      financials: null,
    },
    verification: providerResult?.verification || null,
    disclaimers: buildDisclaimers(providerResult),
    provider: providerResult?.provider || null,
    providerError: providerResult?.error || null,
    metadata: {
      generatedAt: new Date().toISOString(),
      providerMetadata: providerResult?.metadata || null,
    },
  };
}

function transformProviderResult(providerResult) {
  if (!providerResult?.success) {
    return buildUnknownResult(providerResult?.symbol, providerResult);
  }

  const methodologyCounts = countMethodologyResults(
    providerResult?.methodologies?.details
  );

  const confidence = determineConfidence(
    providerResult,
    methodologyCounts
  );

  return {
    success: true,
    symbol: providerResult.symbol || null,
    module: {
      id: "shariah_compliance",
      name: "Shariah Compliance",
      version: "0.4.1",
    },
    summary: buildSummary(
      providerResult,
      methodologyCounts,
      confidence
    ),
    company: providerResult.company || null,
    methodologies: buildMethodologies(providerResult),
    businessActivity: buildBusinessActivity(providerResult),
    financialScreen: buildFinancialScreen(providerResult),
    verification: providerResult.verification || null,
    disclaimers: buildDisclaimers(providerResult),
    provider: providerResult.provider || null,
    providerError: providerResult.providerError || null,
    metadata: {
      generatedAt: new Date().toISOString(),
      providerMetadata: providerResult.metadata || null,
    },
  };
}

async function getShariahCompliance(symbol) {
  const providerResult = await fetchScreening(symbol);
  return transformProviderResult(providerResult);
}

module.exports = {
  getShariahCompliance,
  transformProviderResult,
  STATUS,
  CONFIDENCE,
};