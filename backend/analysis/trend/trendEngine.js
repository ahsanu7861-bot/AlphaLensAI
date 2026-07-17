function analyzeTrend(
  emaSignal,
  smaSignal,
  macdSignal,
  adxSignal
) {
  let score = 0;
  const details = [];

  // Convert values safely to strings
  const ema = String(emaSignal || "").toLowerCase();
  const sma = String(smaSignal || "").toLowerCase();
  const macd = String(macdSignal || "").toLowerCase();
  const adx = String(adxSignal || "").toLowerCase();

  // ============================
  // EMA — Direction
  // ============================

  if (
    ema.includes("above ema") ||
    ema.includes("bullish")
  ) {
    score += 25;
    details.push("EMA Bullish");
  } else if (
    ema.includes("below ema") ||
    ema.includes("bearish")
  ) {
    score -= 25;
    details.push("EMA Bearish");
  } else {
    details.push("EMA Neutral");
  }

  // ============================
  // SMA — Direction
  // ============================

  if (
    sma.includes("above sma") ||
    sma.includes("bullish")
  ) {
    score += 25;
    details.push("SMA Bullish");
  } else if (
    sma.includes("below sma") ||
    sma.includes("bearish")
  ) {
    score -= 25;
    details.push("SMA Bearish");
  } else {
    details.push("SMA Neutral");
  }

  // ============================
  // MACD — Momentum Direction
  // ============================

  if (macd.includes("bullish")) {
    score += 30;
    details.push("MACD Bullish");
  } else if (macd.includes("bearish")) {
    score -= 30;
    details.push("MACD Bearish");
  } else {
    details.push("MACD Neutral");
  }

  // ============================
  // ADX — Trend Strength
  // ============================

  /*
   * ADX does not provide direction.
   * It only strengthens the direction already detected
   * by EMA, SMA and MACD.
   */

  if (adx.includes("very strong")) {
    if (score > 0) {
      score += 20;
    } else if (score < 0) {
      score -= 20;
    }

    details.push("ADX Very Strong");
  } else if (adx.includes("strong")) {
    if (score > 0) {
      score += 15;
    } else if (score < 0) {
      score -= 15;
    }

    details.push("ADX Strong");
  } else if (
    adx.includes("developing") ||
    adx.includes("moderate")
  ) {
    if (score > 0) {
      score += 5;
    } else if (score < 0) {
      score -= 5;
    }

    details.push("ADX Developing");
  } else {
    details.push("ADX Weak");
  }

  // Keep score within -100 to +100
  score = Math.max(-100, Math.min(100, score));

  // ============================
  // Final Trend Classification
  // ============================

  let trend = "Sideways";

  if (score >= 75) {
    trend = "Strong Bullish";
  } else if (score >= 30) {
    trend = "Bullish";
  } else if (score > -30 && score < 30) {
    trend = "Sideways";
  } else if (score <= -75) {
    trend = "Strong Bearish";
  } else if (score <= -30) {
    trend = "Bearish";
  }

  return {
    trend,
    score,
    details
  };
}

module.exports = {
  analyzeTrend
};