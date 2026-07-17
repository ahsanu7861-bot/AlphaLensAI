const { SMA } = require("technicalindicators");

function calculateSMA(closePrices, period = 50) {
  const smaValues = SMA.calculate({
    values: closePrices,
    period: period
  });

  return smaValues;
}

module.exports = {
  calculateSMA
};