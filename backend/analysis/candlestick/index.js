const { detectEngulfing } = require("./engulfing");
const { detectHammer } = require("./hammer");
const { detectMorningEveningStar } = require("./starPatterns");

function detectCandlestick(open, high, low, close) {

  // Highest priority
  const engulfing = detectEngulfing(open, high, low, close);

  if (engulfing) {
    return engulfing;
  }

  // Second priority
  const star = detectMorningEveningStar(
    open,
    high,
    low,
    close
  );

  if (star) {
    return star;
  }

  // Third priority
  const hammer = detectHammer(
    open,
    high,
    low,
    close
  );

  if (hammer) {
    return hammer;
  }

  return {
    pattern: "No Pattern",
    bias: "Neutral",
    strength: 0
  };
}

module.exports = {
  detectCandlestick
};