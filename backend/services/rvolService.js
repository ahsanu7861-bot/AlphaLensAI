const { getHistory } = require("./marketEngine");
const { calculateRVOL } = require("../analysis/rvol");

// ============================
// Helpers
// ============================

function normalizeSymbol(symbol) {
  return String(symbol || "")
    .trim()
    .toUpperCase();
}

function getVolumes(history) {
  if (
    Array.isArray(history?.bars) &&
    history.bars.length > 0
  ) {
    return history.bars
      .map((bar) =>
        Number(bar.volume)
      )
      .filter(Number.isFinite);
  }

  if (
    Array.isArray(
      history?.data?.v
    )
  ) {
    return history.data.v
      .map(Number)
      .filter(Number.isFinite);
  }

  return [];
}

// ============================
// RVOL Service
// ============================

async function getRVOL(
  symbol,
  sharedHistory = null
) {
  const normalizedSymbol =
    normalizeSymbol(symbol);

  if (!normalizedSymbol) {
    return {
      success: false,
      error:
        "A valid ticker symbol is required."
    };
  }

  try {
    const history =
      sharedHistory ||
      await getHistory(
        normalizedSymbol
      );

    if (
      !history ||
      history.success !== true
    ) {
      return {
        success: false,

        provider:
          history?.provider ||
          "AlphaVantage",

        symbol:
          normalizedSymbol,

        error:
          history?.error ||
          "Unable to fetch historical market data."
      };
    }

    const volumePrices =
      getVolumes(history);

    if (
      volumePrices.length < 31
    ) {
      return {
        success: false,

        provider:
          history.provider ||
          "AlphaVantage",

        symbol:
          normalizedSymbol,

        error:
          "Insufficient historical volume data to calculate 30-day RVOL."
      };
    }

    const result =
      calculateRVOL(
        volumePrices
      );

    if (!result) {
      return {
        success: false,

        provider:
          history.provider ||
          "AlphaVantage",

        symbol:
          normalizedSymbol,

        error:
          "Unable to calculate RVOL."
      };
    }

    const todayVolume =
      Number(
        result.todayVolume
      );

    const averageVolume =
      Number(
        result.averageVolume
      );

    const rvol =
      Number(result.rvol);

    if (
      !Number.isFinite(
        todayVolume
      ) ||
      !Number.isFinite(
        averageVolume
      ) ||
      !Number.isFinite(rvol)
    ) {
      return {
        success: false,

        provider:
          history.provider ||
          "AlphaVantage",

        symbol:
          normalizedSymbol,

        error:
          "RVOL calculation returned invalid values."
      };
    }

    let signal =
      "Normal Volume";

    if (rvol >= 3) {
      signal =
        "Exceptional Volume";
    } else if (rvol >= 2) {
      signal =
        "High Volume";
    } else if (rvol >= 1.2) {
      signal =
        "Above Average Volume";
    } else if (rvol < 0.8) {
      signal =
        "Low Volume";
    }

    let explanation =
      "Trading activity is near its normal average.";

    if (
      signal ===
      "Exceptional Volume"
    ) {
      explanation =
        "Trading activity is exceptionally high compared to the recent average.";
    } else if (
      signal ===
      "High Volume"
    ) {
      explanation =
        "Trading activity is well above normal levels.";
    } else if (
      signal ===
      "Above Average Volume"
    ) {
      explanation =
        "Trading activity is slightly above its recent average.";
    } else if (
      signal ===
      "Low Volume"
    ) {
      explanation =
        "Trading activity is below its recent average.";
    }

    return {
      success: true,

      provider:
        history.provider ||
        "AlphaVantage",

      symbol:
        normalizedSymbol,

      todayVolume,

      averageVolume30:
        Math.round(
          averageVolume
        ),

      rvol:
        Number(
          rvol.toFixed(2)
        ),

      signal,

      explanation,

      dataSource:
        sharedHistory
          ? "Shared OHLCV"
          : "Market Engine"
    };
  } catch (error) {
    console.error(
      "RVOL Service Error:",
      error
    );

    return {
      success: false,

      symbol:
        normalizedSymbol,

      error:
        "Unable to calculate RVOL.",

      details:
        error.message
    };
  }
}

module.exports = {
  getRVOL
};