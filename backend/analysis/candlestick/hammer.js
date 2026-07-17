const {
  hammerpattern,
  hangingman
} = require("technicalindicators");

function detectHammer(open, high, low, close) {

  const input = {
    open,
    high,
    low,
    close
  };

  if (hammerpattern(input)) {
    return {
      pattern: "Hammer",
      bias: "Bullish",
      strength: 85
    };
  }

  if (hangingman(input)) {
    return {
      pattern: "Hanging Man",
      bias: "Bearish",
      strength: 85
    };
  }

  return null;
}

module.exports = {
  detectHammer
};