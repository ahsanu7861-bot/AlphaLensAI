function detectMorningEveningStar(open, high, low, close) {

  if (open.length < 3) return null;

  const i = open.length - 1;

  const o1 = open[i - 2];
  const c1 = close[i - 2];

  const o2 = open[i - 1];
  const c2 = close[i - 1];

  const o3 = open[i];
  const c3 = close[i];

  // ----------------------------
  // Morning Star
  // ----------------------------

  const firstBearish = c1 < o1;

  const smallBody =
    Math.abs(c2 - o2) <
    Math.abs(c1 - o1) * 0.5;

  const thirdBullish = c3 > o3;

  const closesAboveHalf =
    c3 > (o1 + c1) / 2;

  if (
    firstBearish &&
    smallBody &&
    thirdBullish &&
    closesAboveHalf
  ) {
    return {
      pattern: "Morning Star",
      bias: "Bullish",
      strength: 95
    };
  }

  // ----------------------------
  // Evening Star
  // ----------------------------

  const firstBullish = c1 > o1;

  const thirdBearish = c3 < o3;

  const closesBelowHalf =
    c3 < (o1 + c1) / 2;

  if (
    firstBullish &&
    smallBody &&
    thirdBearish &&
    closesBelowHalf
  ) {
    return {
      pattern: "Evening Star",
      bias: "Bearish",
      strength: 95
    };
  }

  return null;
}

module.exports = {
  detectMorningEveningStar
};