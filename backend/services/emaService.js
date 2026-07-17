const { getHistory } = require("./marketEngine");
const { calculateEMA } = require("../analysis/ema");

// ============================
// Helpers
// ============================

function normalizeSymbol(symbol) {
  return String(symbol || "")
    .trim()
    .toUpperCase();
}

function getClosePrices(history) {
  if (
    history &&
    Array.isArray(history.bars) &&
    history.bars.length > 0
  ) {
    return history.bars
      .map((bar) => Number(bar.close))
      .filter(Number.isFinite);
  }

  if (
    history &&
    history.data &&
    Array.isArray(history.data.c)
  ) {
    return history.data.c
      .map(Number)
      .filter(Number.isFinite);
  }

  return [];
}

// ============================
// EMA Service
// ============================

async function getEMA(symbol, sharedHistory = null) {
  const normalizedSymbol = normalizeSymbol(symbol);

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

    const closePrices = getClosePrices(history);

    if (closePrices.length < 20) {
      return {
        success: false,
        provider:
          history.provider ||
          "AlphaVantage",
        symbol: normalizedSymbol,
        error:
          "Insufficient historical closing prices to calculate EMA20."
      };
    }

    const emaValues = calculateEMA(
      closePrices,
      20
    );

    if (
      !Array.isArray(emaValues) ||
      emaValues.length === 0
    ) {
      return {
        success: false,
        provider:
          history.provider ||
          "AlphaVantage",
        symbol: normalizedSymbol,
        error: "Unable to calculate EMA20."
      };
    }

    const latestEMA =
      Number(emaValues[emaValues.length - 1]);

    const latestPrice =
      Number(closePrices[closePrices.length - 1]);

    if (
      !Number.isFinite(latestEMA) ||
      !Number.isFinite(latestPrice)
    ) {
      return {
        success: false,
        provider:
          history.provider ||
          "AlphaVantage",
        symbol: normalizedSymbol,
        error:
          "EMA calculation returned an invalid value."
      };
    }

    let signal = "Price Near EMA";

    if (latestPrice > latestEMA) {
      signal = "Price Above EMA";
    } else if (latestPrice < latestEMA) {
      signal = "Price Below EMA";
    }

    return {
      success: true,
      provider:
        history.provider ||
        "AlphaVantage",
      symbol: normalizedSymbol,
      ema20: Number(latestEMA.toFixed(2)),
      currentPrice: Number(latestPrice.toFixed(2)),
      signal,
      dataSource:
        sharedHistory
          ? "Shared OHLCV"
          : "Market Engine"
    };
  } catch (error) {
    console.error("EMA Service Error:", error);

    return {
      success: false,
      symbol: normalizedSymbol,
      error: "Unable to calculate EMA20.",
      details: error.message
    };
  }
}

module.exports = {
  getEMA
};