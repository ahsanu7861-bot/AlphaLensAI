const { getHistory } = require("./marketEngine");
const { calculateOBV } = require("../analysis/obv");

// ============================
// Helpers
// ============================

function normalizeSymbol(symbol) {
  return String(symbol || "")
    .trim()
    .toUpperCase();
}

function getCloseAndVolume(history) {
  if (
    Array.isArray(history?.bars) &&
    history.bars.length > 0
  ) {
    const closes = [];
    const volumes = [];

    history.bars.forEach((bar) => {
      const close = Number(bar.close);
      const volume = Number(bar.volume);

      if (
        Number.isFinite(close) &&
        Number.isFinite(volume)
      ) {
        closes.push(close);
        volumes.push(volume);
      }
    });

    return {
      closes,
      volumes
    };
  }

  const closes =
    Array.isArray(history?.data?.c)
      ? history.data.c
          .map(Number)
          .filter(Number.isFinite)
      : [];

  const volumes =
    Array.isArray(history?.data?.v)
      ? history.data.v
          .map(Number)
          .filter(Number.isFinite)
      : [];

  return {
    closes,
    volumes
  };
}

// ============================
// OBV Service
// ============================

async function getOBV(
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
          "TwelveData",

        symbol:
          normalizedSymbol,

        error:
          history?.error ||
          "Unable to fetch historical market data."
      };
    }

    const {
      closes,
      volumes
    } = getCloseAndVolume(history);

    if (
      closes.length < 2 ||
      volumes.length < 2
    ) {
      return {
        success: false,

        provider:
          history.provider ||
          "TwelveData",

        symbol:
          normalizedSymbol,

        error:
          "Insufficient historical close and volume data to calculate OBV."
      };
    }

    if (
      closes.length !==
      volumes.length
    ) {
      return {
        success: false,

        provider:
          history.provider ||
          "TwelveData",

        symbol:
          normalizedSymbol,

        error:
          "Historical close and volume arrays have inconsistent lengths."
      };
    }

    const obvValues =
      calculateOBV(
        closes,
        volumes
      );

    if (
      !Array.isArray(obvValues) ||
      obvValues.length < 2
    ) {
      return {
        success: false,

        provider:
          history.provider ||
          "TwelveData",

        symbol:
          normalizedSymbol,

        error:
          "Unable to calculate OBV."
      };
    }

    const latestOBV =
      Number(
        obvValues[
          obvValues.length - 1
        ]
      );

    const previousOBV =
      Number(
        obvValues[
          obvValues.length - 2
        ]
      );

    if (
      !Number.isFinite(
        latestOBV
      ) ||
      !Number.isFinite(
        previousOBV
      )
    ) {
      return {
        success: false,

        provider:
          history.provider ||
          "TwelveData",

        symbol:
          normalizedSymbol,

        error:
          "OBV calculation returned invalid values."
      };
    }

    let signal = "Neutral";

    if (
      latestOBV >
      previousOBV
    ) {
      signal = "Accumulation";
    } else if (
      latestOBV <
      previousOBV
    ) {
      signal = "Distribution";
    }

    let explanation =
      "OBV is relatively unchanged, suggesting balanced buying and selling pressure.";

    if (
      signal ===
      "Accumulation"
    ) {
      explanation =
        "OBV is increasing, indicating buying pressure is supporting the current price movement.";
    } else if (
      signal ===
      "Distribution"
    ) {
      explanation =
        "OBV is decreasing, indicating selling pressure is increasing.";
    }

    return {
      success: true,

      provider:
        history.provider ||
        "TwelveData",

      symbol:
        normalizedSymbol,

      obv:
        latestOBV,

      signal,

      explanation,

      dataSource:
        sharedHistory
          ? "Shared OHLCV"
          : "Market Engine"
    };
  } catch (error) {
    console.error(
      "OBV Service Error:",
      error
    );

    return {
      success: false,

      symbol:
        normalizedSymbol,

      error:
        "Unable to calculate OBV.",

      details:
        error.message
    };
  }
}

module.exports = {
  getOBV
};