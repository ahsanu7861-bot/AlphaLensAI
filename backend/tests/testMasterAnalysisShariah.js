require("dotenv").config({ quiet: true });

const {
  getMasterAnalysis
} = require(
  "../services/masterAnalysisService"
);

async function run() {
  const symbol =
    process.argv[2] ||
    "AAPL";

  console.log(
    `\nTesting Master Analysis with Shariah integration for ${symbol}...\n`
  );

  const result =
    await getMasterAnalysis(symbol);

  const compact = {
    success:
      result?.success === true,

    symbol:
      result?.meta?.symbol ||
      symbol,

    dataQuality:
      result?.dataQuality?.status ||
      null,

    totalMs:
      result?.performance?.totalMs ??
      null,

    shariahMs:
      result?.performance?.shariahMs ??
      null,

    shariah: {
      success:
        result?.data?.shariah
          ?.success === true,

      status:
        result?.data?.shariah
          ?.summary?.status ||
        "UNKNOWN",

      confidence:
        result?.data?.shariah
          ?.summary?.confidence ||
        "UNKNOWN",

      headline:
        result?.data?.shariah
          ?.summary?.headline ||
        null,

      purificationRate:
        result?.data?.shariah
          ?.summary
          ?.purificationRateFormatted ||
        null,

      provider:
        result?.data?.shariah
          ?.provider?.name ||
        null,

      methodology: {
        id:
          result?.data?.shariah
            ?.primaryMethodology
            ?.id ||
          "AAOIFI",

        status:
          result?.data?.shariah
            ?.primaryMethodology
            ?.status ||
          "UNKNOWN"
      }
    },

    error:
      result?.error ||
      null,

    details:
      result?.details ||
      null
  };

  console.dir(compact, {
    depth: null,
    colors: true
  });

  process.exit(
    result?.success === true
      ? 0
      : 1
  );
}

run().catch((error) => {
  console.error(
    "Unexpected master-analysis test failure:",
    error
  );

  process.exit(1);
});
