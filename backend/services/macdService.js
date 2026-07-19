const { getHistory } = require("./marketEngine");
const { calculateMACD } = require("../analysis/macd");

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
// MACD Service
// ============================

async function getMACD(symbol, sharedHistory = null) {
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

    if (closePrices.length < 35) {
      return {
        success: false,
        provider:
          history.provider ||
          "TwelveData",
        symbol: normalizedSymbol,
        error:
          "Insufficient historical closing prices to calculate MACD."
      };
    }

    const macdValues =
      calculateMACD(closePrices);

    if (
      !Array.isArray(macdValues) ||
      macdValues.length === 0
    ) {
      return {
        success: false,
        provider:
          history.provider ||
          "TwelveData",
        symbol: normalizedSymbol,
        error: "Unable to calculate MACD."
      };
    }

    const latest =
      macdValues[macdValues.length - 1];

    const macdValue = Number(latest?.MACD);
    const signalValue = Number(latest?.signal);
    const histogramValue = Number(
      latest?.histogram
    );

    if (
      !Number.isFinite(macdValue) ||
      !Number.isFinite(signalValue) ||
      !Number.isFinite(histogramValue)
    ) {
      return {
        success: false,
        provider:
          history.provider ||
          "TwelveData",
        symbol: normalizedSymbol,
        error:
          "MACD calculation returned invalid values."
      };
    }

    let signal = "Neutral";

    if (macdValue > signalValue) {
      signal = "Bullish Crossover";
    } else if (macdValue < signalValue) {
      signal = "Bearish Crossover";
    }

    return {
      success: true,
      provider:
        history.provider ||
        "TwelveData",
      symbol: normalizedSymbol,
      macd: Number(macdValue.toFixed(4)),
      signalLine: Number(
        signalValue.toFixed(4)
      ),
      histogram: Number(
        histogramValue.toFixed(4)
      ),
      signal,
      dataSource:
        sharedHistory
          ? "Shared OHLCV"
          : "Market Engine"
    };
  } catch (error) {
    console.error("MACD Service Error:", error);

    return {
      success: false,
      symbol: normalizedSymbol,
      error: "Unable to calculate MACD.",
      details: error.message
    };
  }
}

module.exports = {
  getMACD
};