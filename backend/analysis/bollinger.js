const { BollingerBands } = require("technicalindicators");

function calculateBollinger(closePrices) {

  const bands = BollingerBands.calculate({
    period: 20,
    values: closePrices,
    stdDev: 2
  });

  return bands;
}

module.exports = {
  calculateBollinger
};