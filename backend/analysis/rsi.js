const { RSI } = require("technicalindicators");

function calculateRSI(closePrices, period = 14) {
  const rsiValues = RSI.calculate({
    values: closePrices,
    period: period
  });

  return rsiValues;
}

module.exports = {
  calculateRSI
};