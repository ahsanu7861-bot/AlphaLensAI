const { ADX } = require("technicalindicators");

function calculateADX(highPrices, lowPrices, closePrices) {

  const adx = ADX.calculate({
    high: highPrices,
    low: lowPrices,
    close: closePrices,
    period: 14
  });

  return adx;
}

module.exports = {
  calculateADX
};