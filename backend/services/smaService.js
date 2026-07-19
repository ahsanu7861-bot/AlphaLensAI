const { getHistory } = require("./marketEngine");
const { calculateSMA } = require("../analysis/sma");

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
// SMA Service
// ============================

async function getSMA(symbol, sharedHistory = null) {
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
          "TwelveData",
        symbol: normalizedSymbol,
        error:
          history?.error ||
          "Unable to fetch historical market data."
      };
    }

    const closePrices = getClosePrices(history);

    if (closePrices.length < 50) {
      return {
        success: false,
        provider:
          history.provider ||
          "TwelveData",
        symbol: normalizedSymbol,
        error:
          "Insufficient historical closing prices to calculate SMA50."
      };
    }

    const smaValues = calculateSMA(
      closePrices,
      50
    );

    if (
      !Array.isArray(smaValues) ||
      smaValues.length === 0
    ) {
      return {
        success: false,
        provider:
          history.provider ||
          "TwelveData",
        symbol: normalizedSymbol,
        error: "Unable to calculate SMA50."
      };
    }

    const latestSMA =
      Number(smaValues[smaValues.length - 1]);

    const latestPrice =
      Number(closePrices[closePrices.length - 1]);

    if (
      !Number.isFinite(latestSMA) ||
      !Number.isFinite(latestPrice)
    ) {
      return {
        success: false,
        provider:
          history.provider ||
          "TwelveData",
        symbol: normalizedSymbol,
        error:
          "SMA calculation returned an invalid value."
      };
    }

    let signal = "Price Near SMA";

    if (latestPrice > latestSMA) {
      signal = "Price Above SMA";
    } else if (latestPrice < latestSMA) {
      signal = "Price Below SMA";
    }

    return {
      success: true,
      provider:
        history.provider ||
        "TwelveData",
      symbol: normalizedSymbol,
      sma50: Number(latestSMA.toFixed(2)),
      currentPrice: Number(latestPrice.toFixed(2)),
      signal,
      dataSource:
        sharedHistory
          ? "Shared OHLCV"
          : "Market Engine"
    };
  } catch (error) {
    console.error("SMA Service Error:", error);

    return {
      success: false,
      symbol: normalizedSymbol,
      error: "Unable to calculate SMA50.",
      details: error.message
    };
  }
}

module.exports = {
  getSMA
};