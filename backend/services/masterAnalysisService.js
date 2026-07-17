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
  analyzeTrend
} = require("../analysis/trend/trendEngine");

const {
  analyzeAgreement
} = require("../analysis/agreement/agreementEngine");

const {
  analyzeExplanation
} = require("../analysis/explanation/explanationEngine");

const {
  analyzeRisk
} = require("../analysis/risk/riskEngine");

// ============================
// API Configuration
// ============================

const API_VERSION =
  process.env.API_VERSION ||
  "1.0.0";

// ============================
// Symbol Validation
// ============================

function normalizeSymbol(symbol) {
  return String(symbol || "")
    .trim()
    .toUpperCase();
}

// ============================
// Request ID
// ============================

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

// ============================
// Shared History Summary
// ============================

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

  let latestHistoricalClose =
    null;

  if (bars.length > 0) {
    latestHistoricalClose =
      Number(
        bars[bars.length - 1]
          ?.close
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

// ============================
// Price Context
// ============================

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

    note:
      "Live price may differ from the latest completed daily historical close during an active market session."
  };
}

// ============================
// Shared-OHLCV Status
// ============================

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
      "Candlestick"
    ],

    pendingSharedOHLCVConsumers: []
  };
}

// ============================
// Data Quality
// ============================

function buildDataQuality({
  market,
  history,
  indicators,
  failedIndicators = []
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

  let status = "Good";

  if (
    !historicalDataAvailable ||
    successfulIndicators === 0
  ) {
    status = "Unavailable";
  } else if (
    warnings.length > 0 ||
    successfulIndicators <
      totalIndicators
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

    providers: {
      live:
        market?.provider ||
        "Finnhub",

      historical:
        history?.provider ||
        "AlphaVantage"
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

// ============================
// Response Meta
// ============================

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

// ============================
// Error Response
// ============================

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

// ============================
// Master Analysis Service
// ============================

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
    // ============================
    // Live Market Data
    // ============================

    const marketStartedAt =
      Date.now();

    const market =
      await getMarketData(
        normalizedSymbol
      );

    const marketDurationMs =
      Date.now() -
      marketStartedAt;

    // ============================
    // Shared Historical OHLCV
    // ============================

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

        indicatorMs:
          0,

        analysisMs:
          0,

        cacheHit:
          false
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

    // ============================
    // Indicator Calculations
    // ============================

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

    // ============================
    // Failed Indicators
    // ============================

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

    const dataQuality =
      buildDataQuality({
        market,
        history,
        indicators,
        failedIndicators
      });

    if (
      failedIndicators.length >
      0
    ) {
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

        analysisMs:
          0,

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

    // ============================
    // Higher-Level Analysis
    // ============================

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
     * This internal structure is used by the
     * Explanation and Risk engines.
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

    // ============================
    // Performance
    // ============================

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

      analysisMs:
        analysisDurationMs,

      cacheHit:
        history?.performance
          ?.cacheHit === true,

      bottleneck:
        marketDurationMs >=
        historyDurationMs
          ? "Live Market Data"
          : "Historical Data"
    };

    // ============================
    // Final API Contract
    // ============================

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

// ============================
// Export Service
// ============================

module.exports = {
  getMasterAnalysis
};