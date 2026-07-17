const { getEMA } = require("./emaService");
const { getSMA } = require("./smaService");
const { getMACD } = require("./macdService");
const { getADX } = require("./adxService");

const {
  analyzeTrend
} = require("../analysis/trend/trendEngine");

async function getTrend(symbol) {
  try {
    const ema = await getEMA(symbol);
    const sma = await getSMA(symbol);
    const macd = await getMACD(symbol);
    const adx = await getADX(symbol);

    const indicators = {
      ema,
      sma,
      macd,
      adx
    };

    const failedIndicators = Object.entries(indicators)
      .filter(([, result]) => !result || result.success !== true)
      .map(([name, result]) => ({
        indicator: name,
        error: result?.error || "Unknown error"
      }));

    if (failedIndicators.length > 0) {
      return {
        success: false,
        error: "Unable to calculate trend.",
        failedIndicators
      };
    }

    const trendAnalysis = analyzeTrend(
      ema.signal,
      sma.signal,
      macd.signal,
      adx.signal
    );

    return {
      success: true,
      provider: ema.provider || "AlphaVantage",
      symbol: symbol.toUpperCase(),
      ...trendAnalysis
    };
  } catch (error) {
    console.error("Trend Service Error:", error);

    return {
      success: false,
      error: "Unable to calculate trend.",
      details: error.message
    };
  }
}

module.exports = {
  getTrend
};