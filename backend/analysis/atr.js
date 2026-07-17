const { ATR } = require("technicalindicators");

function calculateATR(highPrices, lowPrices, closePrices) {

  const atr = ATR.calculate({
    high: highPrices,
    low: lowPrices,
    close: closePrices,
    period: 14
  });

  return atr;
}

module.exports = {
  calculateATR
};