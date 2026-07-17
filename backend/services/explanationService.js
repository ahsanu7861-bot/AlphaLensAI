const {
  getMasterAnalysis
} = require("./masterAnalysisService");

async function getExplanation(symbol) {
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
        ?.explanation || {
        success: false,

        symbol:
          normalizedSymbol,

        error:
          "Explanation data was not available."
      }
    );
  } catch (error) {
    console.error(
      "Explanation Service Error:",
      error
    );

    return {
      success: false,

      symbol:
        normalizedSymbol,

      error:
        "Unable to generate explanation.",

      details:
        error.message
    };
  }
}

module.exports = {
  getExplanation
};