const axios = require("axios");
const { getCache, setCache } = require("../utils/cache");

// ============================================================
// AzaLens - Halal Terminal Provider
// Version: 0.4.0
// ============================================================

const PROVIDER_NAME = "Halal Terminal";
const PROVIDER_ID = "halal_terminal";
const DEFAULT_BASE_URL = "https://api.halalterminal.com";
const DEFAULT_TIMEOUT_MS = 5000;
const DEFAULT_CACHE_MINUTES = 1440;

const inFlightRequests = new Map();

function normalizeTicker(symbol) {
  if (typeof symbol !== "string") {
    return null;
  }

  const normalized = symbol.trim().toUpperCase();

  if (!normalized || !/^[A-Z0-9.\-]{1,20}$/.test(normalized)) {
    return null;
  }

  return normalized;
}

function parsePositiveInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function toNullableNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toNullableBoolean(value) {
  return typeof value === "boolean" ? value : null;
}

function toNullableString(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function normalizeDisclaimer(disclaimer) {
  if (!disclaimer || typeof disclaimer !== "object") {
    return null;
  }

  return {
    id: toNullableString(disclaimer.id),
    version: toNullableString(disclaimer.version),
    language: toNullableString(disclaimer.lang),
    severity: toNullableString(disclaimer.severity),
    text: toNullableString(disclaimer.text),
    url: toNullableString(disclaimer.url),
  };
}

function normalizeMethodology(name, methodology) {
  if (!methodology || typeof methodology !== "object") {
    return {
      name,
      isCompliant: null,
      disposition: null,
      verified: null,
      reason: null,
      basis: null,
      alternateBasis: null,
      basesDisagree: null,
    };
  }

  const alternate = methodology.alternate_basis;

  return {
    name,
    isCompliant: toNullableBoolean(methodology.is_compliant),
    disposition: toNullableString(methodology.disposition),
    verified: toNullableBoolean(methodology.verified),
    reason: toNullableString(methodology.reason),
    basis: toNullableString(methodology.basis),
    alternateBasis:
      alternate && typeof alternate === "object"
        ? {
            basis: toNullableString(alternate.basis),
            isCompliant: toNullableBoolean(alternate.is_compliant),
            reason: toNullableString(alternate.reason),
          }
        : null,
    basesDisagree: toNullableBoolean(methodology.bases_disagree),
  };
}

function normalizeBusinessIncome(businessIncome) {
  if (!businessIncome || typeof businessIncome !== "object") {
    return null;
  }

  const segments = Array.isArray(businessIncome.segments)
    ? businessIncome.segments.map((segment) => ({
        name: toNullableString(segment?.name),
        revenue: toNullableNumber(segment?.revenue),
        share: toNullableNumber(segment?.share),
        classification: toNullableString(segment?.classification),
        category: toNullableString(segment?.category),
      }))
    : [];

  return {
    advisory: toNullableBoolean(businessIncome.advisory),
    includedInVerdict: toNullableBoolean(businessIncome.in_verdict),
    fiscalYear: toNullableString(businessIncome.fiscal_year),
    sourceUrl: toNullableString(businessIncome.source_url),
    status: toNullableString(businessIncome.status),
    confidence: toNullableString(businessIncome.confidence),
    segments,
    impermissibleRevenueRatio: toNullableNumber(
      businessIncome.impermissible_revenue_ratio
    ),
    questionableRevenueRatio: toNullableNumber(
      businessIncome.questionable_revenue_ratio
    ),
    unknownRevenueRatio: toNullableNumber(
      businessIncome.unknown_revenue_ratio
    ),
    interestIncomeRatio: toNullableNumber(
      businessIncome.interest_income_ratio
    ),
    combinedImpureRatio: toNullableNumber(
      businessIncome.combined_impure_ratio
    ),
    combinedWithQuestionable: toNullableNumber(
      businessIncome.combined_with_questionable
    ),
    exceedsFivePercent: toNullableBoolean(businessIncome.exceeds_5pct),
    exceedsFivePercentWithQuestionable: toNullableBoolean(
      businessIncome.exceeds_5pct_with_questionable
    ),
    extractorVersion: toNullableString(businessIncome.extractor_version),
    classifierVersion: toNullableString(businessIncome.classifier_version),
  };
}

function determineOverallStatus(raw) {
  if (raw?.error || raw?.error_message) {
    return "UNKNOWN";
  }

  if (raw?.is_compliant === true) {
    return "COMPLIANT";
  }

  if (raw?.is_compliant === false) {
    return "NON_COMPLIANT";
  }

  const explicitStatus = toNullableString(raw?.shariah_compliance_status);
  return explicitStatus ? explicitStatus.toUpperCase() : "UNKNOWN";
}

function normalizeHalalTerminalResponse(raw, metadata = {}) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error("Halal Terminal returned an invalid response payload.");
  }

  const methodologySource =
    raw.by_methodology && typeof raw.by_methodology === "object"
      ? raw.by_methodology
      : {};

  const methodologyNames = ["AAOIFI", "DJIM", "FTSE", "MSCI", "SP"];
  const methodologies = methodologyNames.map((name) =>
    normalizeMethodology(name, methodologySource[name])
  );

  const disclaimers = Array.isArray(raw.disclaimers)
    ? raw.disclaimers.map(normalizeDisclaimer).filter(Boolean)
    : [];

  return {
    success: !raw.error,
    provider: {
      id: PROVIDER_ID,
      name: PROVIDER_NAME,
      endpoint: "/api/screen/{symbol}",
    },
    symbol: toNullableString(raw.symbol),
    canonicalSymbol: toNullableString(raw.canonical_symbol),
    company: {
      name: toNullableString(raw.name),
      assetType: toNullableString(raw.asset_type),
      sector: toNullableString(raw.sector),
      industry: toNullableString(raw.industry),
      country: toNullableString(raw.country),
      website: toNullableString(raw.website),
      businessSummary: toNullableString(raw.long_business_summary),
    },
    screening: {
      overallStatus: determineOverallStatus(raw),
      isCompliant: toNullableBoolean(raw.is_compliant),
      providerStatus: toNullableString(raw.shariah_compliance_status),
      disposition: toNullableString(raw.disposition),
      businessScreen: {
        passed: toNullableBoolean(raw.business_screen_pass),
        reason: toNullableString(raw.business_screen_reason),
        questionableBusiness: toNullableBoolean(raw.questionable_business),
        ifiExempt: toNullableBoolean(raw.ifi_exempt),
      },
      financialScreen: {
        passed: toNullableBoolean(raw.financial_screen_pass),
      },
      explanation: toNullableString(raw.compliance_explanation),
      purificationRatePercent: toNullableNumber(raw.purification_rate),
    },
    methodologies: {
      summary:
        raw.methodology_summary &&
        typeof raw.methodology_summary === "object"
          ? {
              AAOIFI: toNullableBoolean(raw.methodology_summary.AAOIFI),
              DJIM: toNullableBoolean(raw.methodology_summary.DJIM),
              FTSE: toNullableBoolean(raw.methodology_summary.FTSE),
              MSCI: toNullableBoolean(raw.methodology_summary.MSCI),
              SP: toNullableBoolean(raw.methodology_summary.SP),
            }
          : {
              AAOIFI: toNullableBoolean(raw.aaoifi_compliant),
              DJIM: toNullableBoolean(raw.djim_compliant),
              FTSE: toNullableBoolean(raw.ftse_compliant),
              MSCI: toNullableBoolean(raw.msci_compliant),
              SP: toNullableBoolean(raw.sp_compliant),
            },
      details: methodologies,
    },
    financials: {
      totalAssets: toNullableNumber(raw.total_assets),
      totalDebt: toNullableNumber(raw.total_debt),
      cashAndEquivalents: toNullableNumber(raw.cash_and_equivalents),
      accountsReceivable: toNullableNumber(raw.accounts_receivable),
      totalRevenue: toNullableNumber(raw.total_revenue),
      interestIncome: toNullableNumber(raw.interest_income),
      marketCap: toNullableNumber(raw.market_cap),
    },
    ratios: {
      debtToAssets: toNullableNumber(raw.debt_to_assets_ratio),
      cashToAssets: toNullableNumber(raw.cash_to_assets_ratio),
      receivablesToAssets: toNullableNumber(
        raw.accounts_receivable_to_assets_ratio
      ),
      interestIncomeToRevenue: toNullableNumber(
        raw.interest_income_to_revenue_ratio
      ),
      debtToMarketCap: toNullableNumber(raw.debt_to_market_cap_ratio),
      cashToMarketCap: toNullableNumber(raw.cash_to_market_cap_ratio),
      receivablesToMarketCap: toNullableNumber(
        raw.receivables_to_market_cap_ratio
      ),
      liquidityToMarketCap: toNullableNumber(
        raw.liquidity_to_market_cap_ratio
      ),
      liquidityToAssets: toNullableNumber(raw.liquidity_to_assets_ratio),
    },
    businessIncome: normalizeBusinessIncome(raw.business_income),
    fundamentals: {
      provenance:
        raw.fundamentals_provenance &&
        typeof raw.fundamentals_provenance === "object"
          ? raw.fundamentals_provenance
          : null,
      returnOnEquity: toNullableNumber(raw.return_on_equity),
      netProfitMargin: toNullableNumber(raw.net_profit_margin),
      revenueGrowth: toNullableNumber(raw.revenue_growth),
      peRatio: toNullableNumber(raw.pe_ratio),
      pbRatio: toNullableNumber(raw.pb_ratio),
      intrinsicValue: toNullableNumber(raw.intrinsic_value),
      dcfUpsidePercentage: toNullableNumber(raw.dcf_upside_percentage),
      currentRatio: toNullableNumber(raw.current_ratio),
      beta: toNullableNumber(raw.beta),
      dividendYield: toNullableNumber(raw.dividend_yield),
    },
    marketSignals: {
      momentumTrend: toNullableString(raw.momentum_trend),
      rsiStatus: toNullableString(raw.rsi_status),
    },
    verification: {
      lastCheckedAt: toNullableString(raw.last_checked_at),
      isStale: toNullableBoolean(raw.is_stale),
      dataQuality: raw.data_quality ?? null,
      scholarAttestations: raw.scholar_attestations ?? null,
    },
    disclaimers,
    providerError: raw.error
      ? {
          code: toNullableString(raw.error),
          message: toNullableString(raw.error_message),
        }
      : null,
    metadata: {
      fromCache: Boolean(metadata.fromCache),
      cacheKey: metadata.cacheKey || null,
      fetchedAt: metadata.fetchedAt || new Date().toISOString(),
      responseTimeMs: toNullableNumber(metadata.responseTimeMs),
    },
    raw,
  };
}

function buildFailureResult(symbol, error, metadata = {}) {
  return {
    success: false,
    provider: {
      id: PROVIDER_ID,
      name: PROVIDER_NAME,
      endpoint: "/api/screen/{symbol}",
    },
    symbol,
    screening: {
      overallStatus: "UNKNOWN",
      isCompliant: null,
      providerStatus: null,
      disposition: null,
      businessScreen: {
        passed: null,
        reason: null,
        questionableBusiness: null,
        ifiExempt: null,
      },
      financialScreen: {
        passed: null,
      },
      explanation: null,
      purificationRatePercent: null,
    },
    methodologies: {
      summary: {
        AAOIFI: null,
        DJIM: null,
        FTSE: null,
        MSCI: null,
        SP: null,
      },
      details: [],
    },
    disclaimers: [],
    error: {
      code: error.code || "HALAL_TERMINAL_ERROR",
      message: error.message || "Unable to complete Shariah screening.",
      httpStatus: error.httpStatus || null,
      retryable: Boolean(error.retryable),
    },
    metadata: {
      fromCache: false,
      cacheKey: metadata.cacheKey || null,
      fetchedAt: new Date().toISOString(),
      responseTimeMs: toNullableNumber(metadata.responseTimeMs),
    },
  };
}

function classifyAxiosError(error) {
  if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
    return {
      code: "HALAL_TERMINAL_TIMEOUT",
      message: "Halal Terminal request timed out.",
      httpStatus: null,
      retryable: true,
    };
  }

  if (!error.response) {
    return {
      code: "HALAL_TERMINAL_NETWORK_ERROR",
      message: "Could not reach Halal Terminal.",
      httpStatus: null,
      retryable: true,
    };
  }

  const status = error.response.status;
  const providerData = error.response.data || {};

  if (status === 401 || status === 403) {
    return {
      code: providerData.code || "HALAL_TERMINAL_AUTH_ERROR",
      message:
        providerData.message ||
        "Halal Terminal rejected the configured API key.",
      httpStatus: status,
      retryable: false,
    };
  }

  if (status === 404) {
    return {
      code: providerData.code || "HALAL_TERMINAL_SYMBOL_NOT_FOUND",
      message:
        providerData.message ||
        "The requested symbol was not found by Halal Terminal.",
      httpStatus: status,
      retryable: false,
    };
  }

  if (status === 429) {
    return {
      code: providerData.code || "HALAL_TERMINAL_QUOTA_EXCEEDED",
      message:
        providerData.message ||
        "Halal Terminal rate limit or monthly quota was exceeded.",
      httpStatus: status,
      retryable: true,
    };
  }

  return {
    code: providerData.code || "HALAL_TERMINAL_HTTP_ERROR",
    message:
      providerData.message ||
      `Halal Terminal returned HTTP ${status}.`,
    httpStatus: status,
    retryable: status >= 500,
  };
}

async function fetchScreening(symbol) {
  const normalizedSymbol = normalizeTicker(symbol);

  if (!normalizedSymbol) {
    return buildFailureResult(null, {
      code: "INVALID_SYMBOL",
      message: "A valid stock symbol is required.",
      retryable: false,
    });
  }

  const apiKey = process.env.HALAL_TERMINAL_API_KEY;
  const baseUrl =
    process.env.HALAL_TERMINAL_BASE_URL || DEFAULT_BASE_URL;
  const timeoutMs = parsePositiveInteger(
    process.env.HALAL_TERMINAL_TIMEOUT_MS,
    DEFAULT_TIMEOUT_MS
  );
  const cacheMinutes = parsePositiveInteger(
    process.env.HALAL_TERMINAL_CACHE_MINUTES,
    DEFAULT_CACHE_MINUTES
  );

  const cacheKey = `shariah:${normalizedSymbol}`;
  const cached = getCache(cacheKey);

  if (cached) {
    return {
      ...cached,
      metadata: {
        ...(cached.metadata || {}),
        fromCache: true,
        cacheKey,
      },
    };
  }

  if (!apiKey) {
    return buildFailureResult(
      normalizedSymbol,
      {
        code: "HALAL_TERMINAL_API_KEY_MISSING",
        message:
          "HALAL_TERMINAL_API_KEY is not configured in the environment.",
        retryable: false,
      },
      { cacheKey }
    );
  }

  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey);
  }

  const requestPromise = (async () => {
    const startedAt = Date.now();

    try {
      const response = await axios.post(
        `${baseUrl.replace(/\/+$/, "")}/api/screen/${encodeURIComponent(
          normalizedSymbol
        )}`,
        null,
        {
          headers: {
            "X-API-Key": apiKey,
            Accept: "application/json",
          },
          timeout: timeoutMs,
          validateStatus: (status) => status >= 200 && status < 300,
        }
      );

      const normalized = normalizeHalalTerminalResponse(response.data, {
        fromCache: false,
        cacheKey,
        fetchedAt: new Date().toISOString(),
        responseTimeMs: Date.now() - startedAt,
      });

      setCache(cacheKey, normalized, cacheMinutes);
      return normalized;
    } catch (error) {
      const classified = classifyAxiosError(error);

      return buildFailureResult(normalizedSymbol, classified, {
        cacheKey,
        responseTimeMs: Date.now() - startedAt,
      });
    } finally {
      inFlightRequests.delete(cacheKey);
    }
  })();

  inFlightRequests.set(cacheKey, requestPromise);
  return requestPromise;
}

module.exports = {
  fetchScreening,
  normalizeHalalTerminalResponse,
};