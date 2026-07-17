function analyzeAgreement(indicators) {
  const bullish = [];
  const bearish = [];
  const neutral = [];
  const agreementDetails = [];

  // ============================
  // RSI
  // ============================

  if (indicators.rsi.signal === "Oversold") {
    bullish.push("RSI");

    agreementDetails.push(
      `RSI is ${indicators.rsi.rsi}, indicating oversold conditions.`
    );
  } else if (indicators.rsi.signal === "Overbought") {
    bearish.push("RSI");

    agreementDetails.push(
      `RSI is ${indicators.rsi.rsi}, indicating overbought conditions.`
    );
  } else {
    neutral.push("RSI");

    agreementDetails.push(
      `RSI is ${indicators.rsi.rsi}, currently neutral.`
    );
  }

  // ============================
  // EMA
  // ============================

  if (indicators.ema.signal.includes("Above EMA")) {
    bullish.push("EMA");
    agreementDetails.push("Price is above EMA20.");
  } else if (indicators.ema.signal.includes("Below EMA")) {
    bearish.push("EMA");
    agreementDetails.push("Price is below EMA20.");
  } else {
    neutral.push("EMA");
    agreementDetails.push("Price is near EMA20.");
  }

  // ============================
  // SMA
  // ============================

  if (indicators.sma.signal.includes("Above SMA")) {
    bullish.push("SMA");
    agreementDetails.push("Price is above SMA50.");
  } else if (indicators.sma.signal.includes("Below SMA")) {
    bearish.push("SMA");
    agreementDetails.push("Price is below SMA50.");
  } else {
    neutral.push("SMA");
    agreementDetails.push("Price is near SMA50.");
  }

  // ============================
  // MACD
  // ============================

  if (indicators.macd.signal.includes("Bullish")) {
    bullish.push("MACD");
    agreementDetails.push("MACD indicates bullish momentum.");
  } else if (indicators.macd.signal.includes("Bearish")) {
    bearish.push("MACD");
    agreementDetails.push("MACD indicates bearish momentum.");
  } else {
    neutral.push("MACD");
    agreementDetails.push("MACD momentum is currently neutral.");
  }

  // ============================
  // Bollinger Bands
  // ============================

  if (
    indicators.bollinger.signal === "Above Upper Band" ||
    indicators.bollinger.signal === "Price Near Upper Band"
  ) {
    bullish.push("Bollinger Bands");

    agreementDetails.push(
      "Price is trading in the upper Bollinger Band region."
    );
  } else if (
    indicators.bollinger.signal === "Below Lower Band" ||
    indicators.bollinger.signal === "Price Near Lower Band"
  ) {
    bearish.push("Bollinger Bands");

    agreementDetails.push(
      "Price is trading in the lower Bollinger Band region."
    );
  } else {
    neutral.push("Bollinger Bands");

    agreementDetails.push(
      "Price is trading near the middle Bollinger Band."
    );
  }

  // ============================
  // ADX
  // ============================

  // ADX measures trend strength, not direction.
  neutral.push("ADX");

  agreementDetails.push(
    `ADX is ${indicators.adx.adx} and reports "${indicators.adx.signal}".`
  );

  // ============================
  // Candlestick
  // ============================

  if (indicators.candlestick.bias === "Bullish") {
    bullish.push("Candlestick");

    agreementDetails.push(
      `${indicators.candlestick.pattern} provides bullish price-action evidence.`
    );
  } else if (indicators.candlestick.bias === "Bearish") {
    bearish.push("Candlestick");

    agreementDetails.push(
      `${indicators.candlestick.pattern} provides bearish price-action evidence.`
    );
  } else {
    neutral.push("Candlestick");

    agreementDetails.push(
      "No directional candlestick pattern was detected."
    );
  }

  // ============================
  // RVOL
  // ============================

  // RVOL measures participation, not direction.
  neutral.push("RVOL");

  agreementDetails.push(
    `Relative volume is ${indicators.rvol.rvol}× average volume.`
  );

  // ============================
  // Volume Spike
  // ============================

  // A volume spike confirms participation, but not bullish/bearish direction.
  neutral.push("Volume Spike");

  if (indicators.volumeSpike.volumeSpikeDetected) {
    agreementDetails.push(
      `${indicators.volumeSpike.signal} detected; this confirms unusually strong participation but not direction by itself.`
    );
  } else {
    agreementDetails.push("No unusual volume spike was detected.");
  }

  // ============================
  // Signal Counts
  // ============================

  const bullishSignals = bullish.length;
  const bearishSignals = bearish.length;
  const neutralSignals = neutral.length;

  const totalIndicators =
    bullishSignals + bearishSignals + neutralSignals;

  const dominantCount = Math.max(
    bullishSignals,
    bearishSignals
  );

  // ============================
  // Direction
  // ============================

  let direction = "Mixed";

  if (bullishSignals > bearishSignals) {
    direction = "Bullish";
  } else if (bearishSignals > bullishSignals) {
    direction = "Bearish";
  }

  // ============================
  // Confidence
  // ============================

  /*
   * Dominant directional signals receive full weight.
   * Neutral signals receive partial credit because they do not oppose
   * the dominant direction, but they also do not confirm it strongly.
   */

  let confidence = 0;

  if (totalIndicators > 0) {
    confidence = Math.round(
      (
        dominantCount +
        neutralSignals * 0.35
      ) /
      totalIndicators *
      100
    );
  }

  confidence = Math.min(100, Math.max(0, confidence));

  // ============================
  // Agreement Status
  // ============================

  let agreement = "conflicting";

  const opposingCount =
    direction === "Bullish"
      ? bearishSignals
      : direction === "Bearish"
      ? bullishSignals
      : Math.max(bullishSignals, bearishSignals);

  if (
    direction !== "Mixed" &&
    dominantCount >= 3 &&
    dominantCount > opposingCount &&
    confidence >= 60
  ) {
    agreement = "aligned";
  }

  // ============================
  // Agreement Summary
  // ============================

  let agreementSummary =
    "Indicators are mixed and do not currently provide clear directional agreement.";

  if (agreement === "aligned" && direction === "Bullish") {
    agreementSummary =
      "Bullish indicators are aligned, although neutral signals may reduce conviction.";
  } else if (agreement === "aligned" && direction === "Bearish") {
    agreementSummary =
      "Bearish indicators are aligned, although neutral signals may reduce conviction.";
  } else if (direction === "Bullish") {
    agreementSummary =
      "Bullish evidence is present, but confirmation is incomplete or conflicting.";
  } else if (direction === "Bearish") {
    agreementSummary =
      "Bearish evidence is present, but confirmation is incomplete or conflicting.";
  }

  return {
    agreement,
    direction,
    confidence,
    agreementSummary,
    agreementDetails,

    bullishSignals,
    bearishSignals,
    neutralSignals,

    bullish,
    bearish,
    neutral,

    totalIndicators
  };
}

module.exports = {
  analyzeAgreement
};