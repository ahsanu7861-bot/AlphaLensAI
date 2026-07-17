const { getHistory } = require("./marketEngine");
const {
  calculateADX
} = require("../analysis/adx");

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
// ADX Service
// ============================

async function getADX(
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
          "AlphaVantage",
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
      highs.length < 30 ||
      lows.length < 30 ||
      closes.length < 30
    ) {
      return {
        success: false,
        provider:
          history.provider ||
          "AlphaVantage",
        symbol: normalizedSymbol,
        error:
          "Insufficient historical OHLC data to calculate ADX."
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
          "AlphaVantage",
        symbol: normalizedSymbol,
        error:
          "Historical high, low and close arrays have inconsistent lengths."
      };
    }

    const adxValues = calculateADX(
      highs,
      lows,
      closes
    );

    if (
      !Array.isArray(adxValues) ||
      adxValues.length === 0
    ) {
      return {
        success: false,
        provider:
          history.provider ||
          "AlphaVantage",
        symbol: normalizedSymbol,
        error: "Unable to calculate ADX."
      };
    }

    const latest =
      adxValues[adxValues.length - 1];

    const adx = Number(latest?.adx);
    const plusDI = Number(latest?.pdi);
    const minusDI = Number(latest?.mdi);

    if (
      !Number.isFinite(adx) ||
      !Number.isFinite(plusDI) ||
      !Number.isFinite(minusDI)
    ) {
      return {
        success: false,
        provider:
          history.provider ||
          "AlphaVantage",
        symbol: normalizedSymbol,
        error:
          "ADX calculation returned invalid values."
      };
    }

    let signal = "Weak Trend";

    if (adx >= 40) {
      signal = "Very Strong Trend";
    } else if (adx >= 25) {
      signal = "Strong Trend";
    } else if (adx >= 20) {
      signal = "Developing Trend";
    }

    return {
      success: true,
      provider:
        history.provider ||
        "AlphaVantage",
      symbol: normalizedSymbol,

      adx: Number(adx.toFixed(2)),
      plusDI: Number(plusDI.toFixed(2)),
      minusDI: Number(minusDI.toFixed(2)),

      signal,

      dataSource:
        sharedHistory
          ? "Shared OHLCV"
          : "Market Engine"
    };
  } catch (error) {
    console.error(
      "ADX Service Error:",
      error
    );

    return {
      success: false,
      symbol: normalizedSymbol,
      error: "Unable to calculate ADX.",
      details: error.message
    };
  }
}

module.exports = {
  getADX
};