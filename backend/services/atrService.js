const { getHistory } = require("./marketEngine");
const {
  calculateATR
} = require("../analysis/atr");

// ============================
// Helpers
// ============================

function normalizeSymbol(symbol) {
  return String(symbol || "")
    .trim()
    .toUpperCase();
}

function getOHLC(history) {
  if (
    Array.isArray(history?.bars) &&
    history.bars.length > 0
  ) {
    return {
      highs: history.bars
        .map((bar) => Number(bar.high))
        .filter(Number.isFinite),

      lows: history.bars
        .map((bar) => Number(bar.low))
        .filter(Number.isFinite),

      closes: history.bars
        .map((bar) => Number(bar.close))
        .filter(Number.isFinite)
    };
  }

  return {
    highs: Array.isArray(history?.data?.h)
      ? history.data.h
          .map(Number)
          .filter(Number.isFinite)
      : [],

    lows: Array.isArray(history?.data?.l)
      ? history.data.l
          .map(Number)
          .filter(Number.isFinite)
      : [],

    closes: Array.isArray(history?.data?.c)
      ? history.data.c
          .map(Number)
          .filter(Number.isFinite)
      : []
  };
}

// ============================
// ATR Service
// ============================

async function getATR(
  symbol,
  sharedHistory = null
) {
  const normalizedSymbol =
    normalizeSymbol(symbol);

  if (!normalizedSymbol) {
    return {
      success: false,
      error: "A valid ticker symbol is required."
    };
  }

  try {
    const history =
      sharedHistory ||
      await getHistory(normalizedSymbol);

    if (!history || history.success !== true) {
      return {
        success: false,
        provider:
          history?.provider ||
          "TwelveData",
        symbol: normalizedSymbol,
        error:
          history?.error ||
          "Unable to fetch historical market data."
      };
    }

    const {
      highs,
      lows,
      closes
    } = getOHLC(history);

    if (
      highs.length < 15 ||
      lows.length < 15 ||
      closes.length < 15
    ) {
      return {
        success: false,
        provider:
          history.provider ||
          "TwelveData",
        symbol: normalizedSymbol,
        error:
          "Insufficient historical OHLC data to calculate ATR."
      };
    }

    if (
      highs.length !== lows.length ||
      highs.length !== closes.length
    ) {
      return {
        success: false,
        provider:
          history.provider ||
          "TwelveData",
        symbol: normalizedSymbol,
        error:
          "Historical high, low and close arrays have inconsistent lengths."
      };
    }

    const atrValues = calculateATR(
      highs,
      lows,
      closes
    );

    if (
      !Array.isArray(atrValues) ||
      atrValues.length === 0
    ) {
      return {
        success: false,
        provider:
          history.provider ||
          "TwelveData",
        symbol: normalizedSymbol,
        error: "Unable to calculate ATR."
      };
    }

    const latestATR = Number(
      atrValues[atrValues.length - 1]
    );

    if (!Number.isFinite(latestATR)) {
      return {
        success: false,
        provider:
          history.provider ||
          "TwelveData",
        symbol: normalizedSymbol,
        error:
          "ATR calculation returned an invalid value."
      };
    }

    let signal = "Medium Volatility";

    if (latestATR < 2) {
      signal = "Low Volatility";
    } else if (latestATR > 5) {
      signal = "High Volatility";
    }

    return {
      success: true,
      provider:
        history.provider ||
        "TwelveData",
      symbol: normalizedSymbol,

      atr: Number(latestATR.toFixed(2)),
      signal,

      dataSource:
        sharedHistory
          ? "Shared OHLCV"
          : "Market Engine"
    };
  } catch (error) {
    console.error(
      "ATR Service Error:",
      error
    );

    return {
      success: false,
      symbol: normalizedSymbol,
      error: "Unable to calculate ATR.",
      details: error.message
    };
  }
}

module.exports = {
  getATR
};