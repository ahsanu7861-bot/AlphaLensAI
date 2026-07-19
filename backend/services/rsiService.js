const { getHistory } = require("./marketEngine");
const { calculateRSI } = require("../analysis/rsi");

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
// RSI Service
// ============================

async function getRSI(symbol, sharedHistory = null) {
  const normalizedSymbol = normalizeSymbol(symbol);

  if (!normalizedSymbol) {
    return {
      success: false,
      error: "A valid ticker symbol is required."
    };
  }

  try {
    /*
     * Use shared history when Master Analysis provides it.
     * Otherwise fetch history normally for the standalone
     * /rsi/:symbol endpoint.
     */

    const history =
      sharedHistory || await getHistory(normalizedSymbol);

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

    if (closePrices.length < 15) {
      return {
        success: false,
        provider:
          history.provider ||
          "TwelveData",
        symbol: normalizedSymbol,
        error:
          "Insufficient historical closing prices to calculate RSI."
      };
    }

    const rsiValues = calculateRSI(closePrices);

    if (
      !Array.isArray(rsiValues) ||
      rsiValues.length === 0
    ) {
      return {
        success: false,
        provider:
          history.provider ||
          "TwelveData",
        symbol: normalizedSymbol,
        error: "Unable to calculate RSI."
      };
    }

    const latestRSI =
      Number(rsiValues[rsiValues.length - 1]);

    if (!Number.isFinite(latestRSI)) {
      return {
        success: false,
        provider:
          history.provider ||
          "TwelveData",
        symbol: normalizedSymbol,
        error:
          "RSI calculation returned an invalid value."
      };
    }

    let signal = "Neutral";

    if (latestRSI >= 70) {
      signal = "Overbought";
    } else if (latestRSI <= 30) {
      signal = "Oversold";
    }

    return {
      success: true,
      provider:
        history.provider ||
        "TwelveData",
      symbol: normalizedSymbol,
      rsi: Number(latestRSI.toFixed(2)),
      signal,

      dataSource:
        sharedHistory
          ? "Shared OHLCV"
          : "Market Engine"
    };
  } catch (error) {
    console.error("RSI Service Error:", error);

    return {
      success: false,
      symbol: normalizedSymbol,
      error: "Unable to calculate RSI.",
      details: error.message
    };
  }
}

module.exports = {
  getRSI
};