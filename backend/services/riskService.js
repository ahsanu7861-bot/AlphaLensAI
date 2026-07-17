const {
  getMasterAnalysis
} = require("./masterAnalysisService");

async function getRiskAnalysis(symbol) {
  const normalizedSymbol =
    String(symbol || "")
      .trim()
      .toUpperCase();

  if (!normalizedSymbol) {
    return {
      success: false,
      error:
        "A valid ticker symbol is required."
    };
  }

  try {
    const masterResponse =
      await getMasterAnalysis(
        normalizedSymbol
      );

    if (
      !masterResponse ||
      masterResponse.success !== true
    ) {
      return {
        success: false,

        symbol:
          normalizedSymbol,

        error:
          masterResponse?.error ||
          "Unable to generate master analysis."
      };
    }

    return (
      masterResponse
        ?.data
        ?.risk || {
        success: false,

        symbol:
          normalizedSymbol,

        error:
          "Risk analysis was not available."
      }
    );
  } catch (error) {
    console.error(
      "Risk Service Error:",
      error
    );

    return {
      success: false,

      symbol:
        normalizedSymbol,

      error:
        "Unable to generate risk analysis.",

      details:
        error.message
    };
  }
}

module.exports = {
  getRiskAnalysis
};