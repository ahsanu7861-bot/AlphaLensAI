const {
  getRVOL
} = require("./rvolService");

const {
  detectVolumeSpike
} = require("../analysis/volumeSpike");

// ============================
// Helpers
// ============================

function normalizeSymbol(symbol) {
  return String(symbol || "")
    .trim()
    .toUpperCase();
}

// ============================
// Volume Spike Service
// ============================

async function getVolumeSpike(
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
    /*
     * getRVOL receives the same shared history.
     * This prevents Volume Spike from triggering
     * another historical-data lookup.
     */

    const rvolResult =
      await getRVOL(
        normalizedSymbol,
        sharedHistory
      );

    if (
      !rvolResult ||
      rvolResult.success !== true
    ) {
      return {
        success: false,

        provider:
          rvolResult?.provider ||
          "TwelveData",

        symbol:
          normalizedSymbol,

        error:
          rvolResult?.error ||
          "Unable to calculate relative volume."
      };
    }

    const spike =
      detectVolumeSpike(
        rvolResult.rvol
      );

    if (!spike) {
      return {
        success: false,

        provider:
          rvolResult.provider ||
          "TwelveData",

        symbol:
          normalizedSymbol,

        error:
          "Unable to calculate volume spike status."
      };
    }

    return {
      success: true,

      provider:
        rvolResult.provider ||
        "TwelveData",

      symbol:
        normalizedSymbol,

      todayVolume:
        rvolResult.todayVolume,

      averageVolume30:
        rvolResult.averageVolume30,

      rvol:
        rvolResult.rvol,

      volumeSpikeDetected:
        Boolean(spike.detected),

      level:
        spike.level ||
        "Normal",

      signal:
        spike.signal ||
        "No Volume Spike",

      explanation:
        spike.explanation ||
        "Trading volume is within the normal historical range.",

      dataSource:
        sharedHistory
          ? "Shared OHLCV"
          : rvolResult.dataSource ||
            "Market Engine"
    };
  } catch (error) {
    console.error(
      "Volume Spike Service Error:",
      error
    );

    return {
      success: false,

      symbol:
        normalizedSymbol,

      error:
        "Unable to calculate volume spike.",

      details:
        error.message
    };
  }
}

module.exports = {
  getVolumeSpike
};