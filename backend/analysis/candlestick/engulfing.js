const {
  bullishengulfingpattern,
  bearishengulfingpattern
} = require("technicalindicators");

function detectEngulfing(open, high, low, close) {

  const input = {
    open,
    high,
    low,
    close
  };

  // Bullish Engulfing
  if (bullishengulfingpattern(input)) {
    return {
      pattern: "Bullish Engulfing",
      bias: "Bullish",
      strength: 90
    };
  }

  // Bearish Engulfing
  if (bearishengulfingpattern(input)) {
    return {
      pattern: "Bearish Engulfing",
      bias: "Bearish",
      strength: 90
    };
  }

  return null;
}

module.exports = {
  detectEngulfing
};