const { EMA } = require("technicalindicators");

function calculateEMA(closePrices, period = 20) {

  const emaValues = EMA.calculate({
    values: closePrices,
    period: period
  });

  return emaValues;

}

module.exports = {
  calculateEMA
};