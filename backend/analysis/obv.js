const { OBV } = require("technicalindicators");

function calculateOBV(closePrices, volumePrices) {

  return OBV.calculate({
    close: closePrices,
    volume: volumePrices
  });

}

module.exports = {
  calculateOBV
};