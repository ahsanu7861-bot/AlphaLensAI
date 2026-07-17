const { MACD } = require("technicalindicators");

function calculateMACD(closePrices) {

  const macdValues = MACD.calculate({
    values: closePrices,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
    SimpleMAOscillator: false,
    SimpleMASignal: false
  });

  return macdValues;
}

module.exports = {
  calculateMACD
};