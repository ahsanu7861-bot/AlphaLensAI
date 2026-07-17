const { getRSI } = require("./rsiService");
const { getEMA } = require("./emaService");
const { getSMA } = require("./smaService");
const { getMACD } = require("./macdService");
const { getBollinger } = require("./bollingerService");
const { getADX } = require("./adxService");
const { getRVOL } = require("./rvolService");
const { getVolumeSpike } = require("./volumeSpikeService");
const { getCandlestick } = require("./candlestickService");

const {
  analyzeAgreement
} = require("../analysis/agreement/agreementEngine");

async function getAgreement(symbol) {
  /*
   * Run sequentially for now.
   * The first service fetches historical data.
   * The remaining services should receive it from cache.
   */
  const rsi = await getRSI(symbol);
  const ema = await getEMA(symbol);
  const sma = await getSMA(symbol);
  const macd = await getMACD(symbol);
  const bollinger = await getBollinger(symbol);
  const adx = await getADX(symbol);
  const rvol = await getRVOL(symbol);
  const volumeSpike = await getVolumeSpike(symbol);
  const candlestick = await getCandlestick(symbol);

  const indicators = {
    rsi,
    ema,
    sma,
    macd,
    bollinger,
    adx,
    rvol,
    volumeSpike,
    candlestick
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
      error: "Unable to calculate agreement.",
      failedIndicators
    };
  }

  const agreement = analyzeAgreement(indicators);

  return {
    success: true,
    provider: ema.provider,
    symbol,
    ...agreement
  };
}

module.exports = {
  getAgreement
};