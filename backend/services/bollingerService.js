const { getHistory } = require("./marketEngine");
const {
  calculateBollinger
} = require("../analysis/bollinger");

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
    Array.isArray(history?.bars) &&
    history.bars.length > 0
  ) {
    return history.bars
      .map((bar) => Number(bar.close))
      .filter(Number.isFinite);
  }

  if (Array.isArray(history?.data?.c)) {
    return history.data.c
      .map(Number)
      .filter(Number.isFinite);
  }

  return [];
}

// ============================
// Bollinger Service
// ============================

async function getBollinger(
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

    const closePrices =
      getClosePrices(history);

    if (closePrices.length < 20) {
      return {
        success: false,
        provider:
          history.provider ||
          "AlphaVantage",
        symbol: normalizedSymbol,
        error:
          "Insufficient historical closing prices to calculate Bollinger Bands."
      };
    }

    const bollinger =
      calculateBollinger(closePrices);

    if (
      !Array.isArray(bollinger) ||
      bollinger.length === 0
    ) {
      return {
        success: false,
        provider:
          history.provider ||
          "AlphaVantage",
        symbol: normalizedSymbol,
        error:
          "Unable to calculate Bollinger Bands."
      };
    }

    const latest =
      bollinger[bollinger.length - 1];

    const upper = Number(latest?.upper);
    const middle = Number(latest?.middle);
    const lower = Number(latest?.lower);

    const currentPrice = Number(
      closePrices[closePrices.length - 1]
    );

    if (
      !Number.isFinite(upper) ||
      !Number.isFinite(middle) ||
      !Number.isFinite(lower) ||
      !Number.isFinite(currentPrice)
    ) {
      return {
        success: false,
        provider:
          history.provider ||
          "AlphaVantage",
        symbol: normalizedSymbol,
        error:
          "Bollinger Bands calculation returned invalid values."
      };
    }

    let signal = "Price Near Middle Band";

    if (currentPrice > upper) {
      signal = "Above Upper Band";
    } else if (currentPrice >= middle) {
      signal = "Price Near Upper Band";
    } else if (currentPrice < lower) {
      signal = "Below Lower Band";
    } else {
      signal = "Price Near Lower Band";
    }

    return {
      success: true,
      provider:
        history.provider ||
        "AlphaVantage",
      symbol: normalizedSymbol,

      upperBand: Number(upper.toFixed(2)),
      middleBand: Number(middle.toFixed(2)),
      lowerBand: Number(lower.toFixed(2)),

      currentPrice: Number(
        currentPrice.toFixed(2)
      ),

      signal,

      dataSource:
        sharedHistory
          ? "Shared OHLCV"
          : "Market Engine"
    };
  } catch (error) {
    console.error(
      "Bollinger Service Error:",
      error
    );

    return {
      success: false,
      symbol: normalizedSymbol,
      error:
        "Unable to calculate Bollinger Bands.",
      details: error.message
    };
  }
}

module.exports = {
  getBollinger
};