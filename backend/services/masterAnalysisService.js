const crypto = require("crypto");

const {
  getMarketData,
  getHistory
} = require("./marketEngine");

const { getRSI } = require("./rsiService");
const { getEMA } = require("./emaService");
const { getSMA } = require("./smaService");
const { getMACD } = require("./macdService");

const {
  getBollinger
} = require("./bollingerService");

const { getATR } = require("./atrService");
const { getADX } = require("./adxService");
const { getOBV } = require("./obvService");
const { getRVOL } = require("./rvolService");

const {
  getVolumeSpike
} = require("./volumeSpikeService");

const {
  getCandlestick
} = require("./candlestickService");

const {
  analyzeSupportResistance
} = require(
  "../analysis/structure/supportResistanceEngine"
);

const {
  analyzeTrend
} = require(
  "../analysis/trend/trendEngine"
);

const {
  analyzeAgreement
} = require(
  "../analysis/agreement/agreementEngine"
);

const {
  analyzeExplanation
} = require(
  "../analysis/explanation/explanationEngine"
);

const {
  analyzeRisk
} = require(
  "../analysis/risk/riskEngine"
);

// ==================================================
// API Configuration
// ==================================================

const API_VERSION =
  process.env.API_VERSION ||
  "1.0.0";

// ==================================================
// Symbol Validation
// ==================================================

function normalizeSymbol(symbol) {
  return String(symbol || "")
    .trim()
    .toUpperCase();
}

// ==================================================
// Numeric Helpers
// ==================================================

function toFiniteNumber(
  value,
  fallback = null
) {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
}

// ==================================================
// Request ID
// ==================================================

function createRequestId() {
  if (
    typeof crypto.randomUUID ===
    "function"
  ) {
    return crypto.randomUUID();
  }

  return crypto
    .randomBytes(16)
    .toString("hex");
}

// ==================================================
// Shared History Summary
// ==================================================

function buildSharedHistorySummary(
  history,
  normalizedSymbol
) {
  const bars =
    Array.isArray(history?.bars)
      ? history.bars
      : [];

  const closePrices =
    Array.isArray(history?.data?.c)
      ? history.data.c
      : [];

  let latestHistoricalClose = null;

  if (bars.length > 0) {
    latestHistoricalClose =
      Number(
        bars[
          bars.length - 1
        ]?.close
      );
  } else if (
    closePrices.length > 0
  ) {
    latestHistoricalClose =
      Number(
        closePrices[
          closePrices.length - 1
        ]
      );
  }

  return {
    success: true,

    provider:
      history?.provider ||
      "AlphaVantage",

    symbol:
      normalizedSymbol,

    cache:
      history?.cache ||
      null,

    barCount:
      bars.length > 0
        ? bars.length
        : closePrices.length,

    latestHistoricalClose:
      Number.isFinite(
        latestHistoricalClose
      )
        ? latestHistoricalClose
        : null,

    dataQuality:
      history?.dataQuality ||
      null,

    performance:
      history?.performance ||
      null
  };
}

// ==================================================
// Price Context
// ==================================================

function buildPriceContext(
  market,
  sharedHistory
) {
  const livePrice =
    Number(
      market?.data?.price
    );

  const historicalClose =
    Number(
      sharedHistory
        ?.latestHistoricalClose
    );

  return {
    livePrice:
      Number.isFinite(livePrice)
        ? livePrice
        : null,

    latestHistoricalClose:
      Number.isFinite(
        historicalClose
      )
        ? historicalClose
        : null,

    livePriceAvailable:
      Number.isFinite(livePrice),

    historicalCloseAvailable:
      Number.isFinite(
        historicalClose
      ),

    pricesMatch:
      Number.isFinite(livePrice) &&
      Number.isFinite(
        historicalClose
      )
        ? livePrice ===
          historicalClose
        : null,

    analysisPrice:
      Number.isFinite(livePrice)
        ? livePrice
        : Number.isFinite(
            historicalClose
          )
          ? historicalClose
          : null,

    analysisPriceSource:
      Number.isFinite(livePrice)
        ? "Live Market Price"
        : Number.isFinite(
            historicalClose
          )
          ? "Latest Historical Close"
          : null,

    note:
      "Live price may differ from the latest completed daily historical close during an active market session."
  };
}

// ==================================================
// Shared-OHLCV Status
// ==================================================

function buildRefactorStatus() {
  return {
    sharedOHLCVEnabled: true,

    sharedOHLCVComplete: true,

    sharedOHLCVConsumers: [
      "RSI",
      "EMA",
      "SMA",
      "MACD",
      "Bollinger Bands",
      "ATR",
      "ADX",
      "OBV",
      "RVOL",
      "Volume Spike",
      "Candlestick",
      "Support & Resistance"
    ],

    pendingSharedOHLCVConsumers: []
  };
}

// ==================================================
// Data Quality
// ==================================================

function buildDataQuality({
  market,
  history,
  indicators,
  failedIndicators = [],
  supportResistance = null
}) {
  const warnings = [];

  const liveDataAvailable =
    market?.success === true &&
    Number.isFinite(
      Number(
        market?.data?.price
      )
    );

  const historicalDataAvailable =
    history?.success === true &&
    (
      Array.isArray(
        history?.bars
      ) ||
      Array.isArray(
        history?.data?.c
      )
    );

  const historicalBars =
    Array.isArray(
      history?.bars
    )
      ? history.bars.length
      : Array.isArray(
          history?.data?.c
        )
        ? history.data.c.length
        : 0;

  const indicatorEntries =
    indicators &&
    typeof indicators ===
      "object"
      ? Object.values(
          indicators
        )
      : [];

  const successfulIndicators =
    indicatorEntries.filter(
      (indicator) =>
        indicator?.success ===
        true
    ).length;

  const totalIndicators =
    indicatorEntries.length;

  if (!liveDataAvailable) {
    warnings.push(
      "Live market data is unavailable. Historical data may be used as a fallback."
    );
  }

  if (!historicalDataAvailable) {
    warnings.push(
      "Historical OHLCV data is unavailable."
    );
  }

  if (
    historicalBars > 0 &&
    historicalBars < 50
  ) {
    warnings.push(
      "Historical data contains fewer than 50 bars."
    );
  }

  if (
    Array.isArray(
      history?.dataQuality
        ?.warnings
    )
  ) {
    warnings.push(
      ...history.dataQuality
        .warnings
    );
  }

  failedIndicators.forEach(
    (failure) => {
      warnings.push(
        `${failure.indicator}: ${failure.error}`
      );
    }
  );

  if (
    supportResistance &&
    supportResistance.success !==
      true
  ) {
    warnings.push(
      `Support & Resistance: ${
        supportResistance.error ||
        "Structural analysis failed."
      }`
    );
  }

  if (
    Array.isArray(
      supportResistance?.warnings
    )
  ) {
    warnings.push(
      ...supportResistance.warnings.map(
        (warning) =>
          `Support & Resistance: ${warning}`
      )
    );
  }

  let status = "Good";

  if (
    !historicalDataAvailable ||
    successfulIndicators === 0
  ) {
    status = "Unavailable";
  } else if (
    warnings.length > 0 ||
    successfulIndicators <
      totalIndicators ||
    (
      supportResistance &&
      supportResistance.success !==
        true
    )
  ) {
    status = "Degraded";
  }

  return {
    status,

    liveDataAvailable,

    historicalDataAvailable,

    historicalBars,

    latestHistoricalDate:
      history?.dataQuality
        ?.latestHistoricalDate ||
      null,

    oldestHistoricalDate:
      history?.dataQuality
        ?.oldestHistoricalDate ||
      null,

    indicators: {
      successful:
        successfulIndicators,

      failed:
        failedIndicators.length,

      total:
        totalIndicators
    },

    structure: {
      supportResistanceAvailable:
        supportResistance
          ?.success === true,

      supportZones:
        Array.isArray(
          supportResistance
            ?.support
        )
          ? supportResistance
              .support.length
          : 0,

      resistanceZones:
        Array.isArray(
          supportResistance
            ?.resistance
        )
          ? supportResistance
              .resistance.length
          : 0
    },

    providers: {
      live:
        market?.provider ||
        "Finnhub",

      historical:
        history?.provider ||
        "AlphaVantage",

      structure:
        supportResistance
          ?.provider ||
        "AlphaLens AI"
    },

    cache: {
      status:
        history?.cache ||
        null,

      hit:
        history?.performance
          ?.cacheHit === true
    },

    warnings:
      [...new Set(warnings)]
  };
}

// ==================================================
// Response Meta
// ==================================================

function buildMeta({
  requestId,
  symbol,
  generatedAt
}) {
  return {
    requestId,

    symbol,

    generatedAt,

    environment:
      process.env.NODE_ENV ||
      "development"
  };
}

// ==================================================
// Error Response
// ==================================================

function buildErrorResponse({
  requestId,
  symbol,
  generatedAt,
  error,
  details = null,
  dataQuality = null,
  performance = null,
  data = null
}) {
  return {
    success: false,

    apiVersion:
      API_VERSION,

    meta:
      buildMeta({
        requestId,
        symbol,
        generatedAt
      }),

    error,

    details,

    dataQuality:
      dataQuality || {
        status:
          "Unavailable",

        warnings: [
          error
        ]
      },

    performance:
      performance || {},

    data:
      data || null
  };
}

// ==================================================
// Performance Bottleneck
// ==================================================

function findPerformanceBottleneck({
  marketMs,
  historyMs,
  indicatorMs,
  structureMs,
  analysisMs
}) {
  const stages = [
    {
      name: "Live Market Data",
      durationMs:
        toFiniteNumber(
          marketMs,
          0
        )
    },
    {
      name: "Historical Data",
      durationMs:
        toFiniteNumber(
          historyMs,
          0
        )
    },
    {
      name: "Indicators",
      durationMs:
        toFiniteNumber(
          indicatorMs,
          0
        )
    },
    {
      name: "Market Structure",
      durationMs:
        toFiniteNumber(
          structureMs,
          0
        )
    },
    {
      name: "Higher-Level Analysis",
      durationMs:
        toFiniteNumber(
          analysisMs,
          0
        )
    }
  ];

  stages.sort(
    (first, second) =>
      second.durationMs -
      first.durationMs
  );

  return stages[0]?.name || null;
}

// ==================================================
// Master Analysis Service
// ==================================================

async function getMasterAnalysis(
  symbol
) {
  const normalizedSymbol =
    normalizeSymbol(symbol);

  const requestId =
    createRequestId();

  const generatedAt =
    new Date().toISOString();

  const startedAt =
    Date.now();

  if (!normalizedSymbol) {
    return buildErrorResponse({
      requestId,

      symbol:
        normalizedSymbol,

      generatedAt,

      error:
        "A valid ticker symbol is required.",

      performance: {
        totalMs:
          Date.now() -
          startedAt
      }
    });
  }

  try {
    // ==============================================
    // Live Market Data
    // ==============================================

    const marketStartedAt =
      Date.now();

    const market =
      await getMarketData(
        normalizedSymbol
      );

    const marketDurationMs =
      Date.now() -
      marketStartedAt;

    // ==============================================
    // Shared Historical OHLCV
    // ==============================================

    const historyStartedAt =
      Date.now();

    const history =
      await getHistory(
        normalizedSymbol
      );

    const historyDurationMs =
      Date.now() -
      historyStartedAt;

    if (
      !history ||
      history.success !== true
    ) {
      const performance = {
        totalMs:
          Date.now() -
          startedAt,

        marketMs:
          marketDurationMs,

        historyMs:
          historyDurationMs,

        indicatorMs: 0,

        structureMs: 0,

        analysisMs: 0,

        cacheHit: false
      };

      return buildErrorResponse({
        requestId,

        symbol:
          normalizedSymbol,

        generatedAt,

        error:
          "Unable to fetch shared historical OHLCV data.",

        details:
          history?.error ||
          null,

        performance,

        data: {
          market,

          history,

          refactorStatus:
            buildRefactorStatus()
        }
      });
    }

    const sharedHistory =
      buildSharedHistorySummary(
        history,
        normalizedSymbol
      );

    const priceContext =
      buildPriceContext(
        market,
        sharedHistory
      );

    // ==============================================
    // Indicator Calculations
    // ==============================================

    const indicatorsStartedAt =
      Date.now();

    const rsi =
      await getRSI(
        normalizedSymbol,
        history
      );

    const ema =
      await getEMA(
        normalizedSymbol,
        history
      );

    const sma =
      await getSMA(
        normalizedSymbol,
        history
      );

    const macd =
      await getMACD(
        normalizedSymbol,
        history
      );

    const bollinger =
      await getBollinger(
        normalizedSymbol,
        history
      );

    const atr =
      await getATR(
        normalizedSymbol,
        history
      );

    const adx =
      await getADX(
        normalizedSymbol,
        history
      );

    const obv =
      await getOBV(
        normalizedSymbol,
        history
      );

    const rvol =
      await getRVOL(
        normalizedSymbol,
        history
      );

    const volumeSpike =
      await getVolumeSpike(
        normalizedSymbol,
        history
      );

    const candlestick =
      await getCandlestick(
        normalizedSymbol,
        history
      );

    const indicatorDurationMs =
      Date.now() -
      indicatorsStartedAt;

    const indicators = {
      rsi,
      ema,
      sma,
      macd,
      bollinger,
      atr,
      adx,
      obv,
      rvol,
      volumeSpike,
      candlestick
    };

    // ==============================================
    // Failed Indicators
    // ==============================================

    const failedIndicators =
      Object.entries(indicators)
        .filter(
          ([, result]) =>
            !result ||
            result.success !==
              true
        )
        .map(
          ([name, result]) => ({
            indicator:
              name,

            error:
              result?.error ||
              "Indicator calculation failed."
          })
        );

    if (
      failedIndicators.length >
      0
    ) {
      const dataQuality =
        buildDataQuality({
          market,
          history,
          indicators,
          failedIndicators,
          supportResistance: null
        });

      const performance = {
        totalMs:
          Date.now() -
          startedAt,

        marketMs:
          marketDurationMs,

        historyMs:
          historyDurationMs,

        indicatorMs:
          indicatorDurationMs,

        structureMs: 0,

        analysisMs: 0,

        cacheHit:
          history?.performance
            ?.cacheHit === true
      };

      return buildErrorResponse({
        requestId,

        symbol:
          normalizedSymbol,

        generatedAt,

        error:
          "Unable to complete all indicator calculations.",

        details:
          failedIndicators,

        dataQuality,

        performance,

        data: {
          market,

          priceContext,

          sharedHistory,

          indicators,

          refactorStatus:
            buildRefactorStatus()
        }
      });
    }

    // ==============================================
    // Market Structure Analysis
    // ==============================================

    const structureStartedAt =
      Date.now();

    let supportResistance;

    try {
      supportResistance =
        analyzeSupportResistance({
          symbol:
            normalizedSymbol,

          bars:
            Array.isArray(
              history?.bars
            )
              ? history.bars
              : [],

          currentPrice:
            priceContext
              .analysisPrice,

          options: {
            pivotWindow: 5,
            mergeThresholdPercent: 1,
            maximumZonesPerSide: 5,
            minimumBars: 20,
            minimumTouches: 1
          }
        });
    } catch (structureError) {
      console.error(
        `[${requestId}] Support & Resistance Error:`,
        structureError
      );

      supportResistance = {
        success: false,

        provider:
          "AlphaLens AI",

        symbol:
          normalizedSymbol,

        error:
          "Unable to complete support and resistance analysis.",

        details:
          structureError.message,

        dataSource:
          "Shared OHLCV"
      };
    }

    const structureDurationMs =
      Date.now() -
      structureStartedAt;

    const marketStructure = {
      success:
        supportResistance
          ?.success === true,

      symbol:
        normalizedSymbol,

      provider:
        "AlphaLens AI",

      supportResistance
    };

    const dataQuality =
      buildDataQuality({
        market,
        history,
        indicators,
        failedIndicators,
        supportResistance
      });

    // ==============================================
    // Higher-Level Analysis
    // ==============================================

    const analysisStartedAt =
      Date.now();

    const trendResult =
      analyzeTrend(
        ema.signal,
        sma.signal,
        macd.signal,
        adx.signal
      );

    const trend = {
      success: true,

      provider:
        ema.provider ||
        "AlphaVantage",

      symbol:
        normalizedSymbol,

      ...trendResult
    };

    const agreementResult =
      analyzeAgreement(
        indicators
      );

    const agreement = {
      success: true,

      provider:
        ema.provider ||
        "AlphaVantage",

      symbol:
        normalizedSymbol,

      ...agreementResult
    };

    /*
     * This internal structure is consumed by
     * the Explanation and Risk engines.
     *
     * Support & Resistance is now included so
     * those engines can use structural levels
     * in future upgrades without changing the
     * orchestration contract again.
     */

    const internalAnalysis = {
      success: true,

      symbol:
        normalizedSymbol,

      provider:
        "AlphaLens AI",

      generatedAt,

      market,

      priceContext,

      sharedHistory,

      indicators,

      marketStructure,

      supportResistance,

      trend,

      agreement
    };

    const explanation =
      analyzeExplanation(
        internalAnalysis
      );

    const risk =
      analyzeRisk(
        internalAnalysis
      );

    const analysisDurationMs =
      Date.now() -
      analysisStartedAt;

    // ==============================================
    // Performance
    // ==============================================

    const performance = {
      totalMs:
        Date.now() -
        startedAt,

      marketMs:
        marketDurationMs,

      historyMs:
        historyDurationMs,

      indicatorMs:
        indicatorDurationMs,

      structureMs:
        structureDurationMs,

      analysisMs:
        analysisDurationMs,

      cacheHit:
        history?.performance
          ?.cacheHit === true,

      liveQuoteCacheHit:
        market?.performance
          ?.cacheHit === true,

      bottleneck:
        findPerformanceBottleneck({
          marketMs:
            marketDurationMs,

          historyMs:
            historyDurationMs,

          indicatorMs:
            indicatorDurationMs,

          structureMs:
            structureDurationMs,

          analysisMs:
            analysisDurationMs
        })
    };

    // ==============================================
    // Final API Contract
    // ==============================================

    return {
      success: true,

      apiVersion:
        API_VERSION,

      meta:
        buildMeta({
          requestId,

          symbol:
            normalizedSymbol,

          generatedAt
        }),

      dataQuality,

      performance,

      data: {
        market,

        priceContext,

        sharedHistory,

        indicators,

        marketStructure,

        supportResistance,

        trend,

        agreement,

        explanation,

        risk,

        refactorStatus:
          buildRefactorStatus()
      }
    };
  } catch (error) {
    console.error(
      `[${requestId}] Master Analysis Service Error:`,
      error
    );

    return buildErrorResponse({
      requestId,

      symbol:
        normalizedSymbol,

      generatedAt,

      error:
        "Unable to generate master analysis.",

      details:
        error.message,

      performance: {
        totalMs:
          Date.now() -
          startedAt
      }
    });
  }
}

// ==================================================
// Export Service
// ==================================================

module.exports = {
  getMasterAnalysis
};