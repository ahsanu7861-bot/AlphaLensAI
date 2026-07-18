/**
 * AlphaLens AI — Phase 4A Decision Engine
 *
 * Purpose:
 * - Convert an existing Master Analysis response into one clear,
 *   frontend-ready decision-support report.
 * - Never issue direct buy/sell instructions.
 * - Never invent unavailable values.
 * - Preserve uncertainty and degraded-data warnings.
 */

"use strict";

const PROVIDER = "AlphaLens AI";
const ENGINE_VERSION = "1.0.0";

const BIAS = Object.freeze({
  STRONGLY_BULLISH: "STRONGLY_BULLISH",
  BULLISH: "BULLISH",
  NEUTRAL: "NEUTRAL",
  BEARISH: "BEARISH",
  STRONGLY_BEARISH: "STRONGLY_BEARISH",
  UNKNOWN: "UNKNOWN"
});

const CONFIDENCE = Object.freeze({
  HIGH: "HIGH",
  MEDIUM: "MEDIUM",
  LOW: "LOW",
  UNKNOWN: "UNKNOWN"
});

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function round(value, decimals = 2) {
  if (!isFiniteNumber(value)) return null;
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function upper(value) {
  return text(value).toUpperCase();
}

function includesAny(value, terms) {
  const normalized = upper(value);
  return terms.some((term) => normalized.includes(term));
}

function getLivePrice(master) {
  const candidates = [
    master?.data?.priceContext?.livePrice,
    master?.data?.market?.data?.price,
    master?.data?.market?.price,
    master?.data?.sharedHistory?.latestHistoricalClose
  ];

  return candidates.find(isFiniteNumber) ?? null;
}

function getHistoricalClose(master) {
  const candidates = [
    master?.data?.priceContext?.latestHistoricalClose,
    master?.data?.sharedHistory?.latestHistoricalClose
  ];

  return candidates.find(isFiniteNumber) ?? null;
}

function getIndicator(master, name) {
  return master?.data?.indicators?.[name] || null;
}

function addEvidence(list, category, direction, weight, statement, source) {
  list.push({
    category,
    direction,
    weight,
    statement,
    source
  });
}

function scoreTrend(master, evidence) {
  const trend = master?.data?.trend || {};
  const labels = [
    trend?.trend,
    trend?.signal,
    trend?.direction,
    trend?.classification,
    trend?.summary,
    trend?.interpretation
  ].filter(Boolean).join(" ");

  if (includesAny(labels, ["STRONG UPTREND", "STRONGLY BULLISH"])) {
    addEvidence(evidence, "Trend", "bullish", 22, "The trend engine identifies a strong upward trend.", "trend");
    return 22;
  }

  if (includesAny(labels, ["UPTREND", "BULLISH"])) {
    addEvidence(evidence, "Trend", "bullish", 16, "The trend engine identifies an upward or bullish trend.", "trend");
    return 16;
  }

  if (includesAny(labels, ["STRONG DOWNTREND", "STRONGLY BEARISH"])) {
    addEvidence(evidence, "Trend", "bearish", -22, "The trend engine identifies a strong downward trend.", "trend");
    return -22;
  }

  if (includesAny(labels, ["DOWNTREND", "BEARISH"])) {
    addEvidence(evidence, "Trend", "bearish", -16, "The trend engine identifies a downward or bearish trend.", "trend");
    return -16;
  }

  if (labels) {
    addEvidence(evidence, "Trend", "neutral", 0, "The trend engine does not show a decisive directional trend.", "trend");
  }

  return 0;
}

function scoreAgreement(master, evidence) {
  const agreement = master?.data?.agreement || {};
  const label = [
    agreement?.signal,
    agreement?.agreement,
    agreement?.classification,
    agreement?.summary
  ].filter(Boolean).join(" ");

  const explicitScore = [
    agreement?.confidenceScore,
    agreement?.score,
    agreement?.agreementScore,
    agreement?.confidence
  ].find(isFiniteNumber);

  if (includesAny(label, ["BULLISH AGREEMENT", "BULLISH"])) {
    const weight = isFiniteNumber(explicitScore)
      ? round(clamp(explicitScore, 0, 100) * 0.18)
      : 14;
    addEvidence(evidence, "Agreement", "bullish", weight, "Multiple indicators show bullish agreement.", "agreement");
    return weight;
  }

  if (includesAny(label, ["BEARISH AGREEMENT", "BEARISH"])) {
    const weight = isFiniteNumber(explicitScore)
      ? -round(clamp(explicitScore, 0, 100) * 0.18)
      : -14;
    addEvidence(evidence, "Agreement", "bearish", weight, "Multiple indicators show bearish agreement.", "agreement");
    return weight;
  }

  if (label) {
    addEvidence(evidence, "Agreement", "neutral", 0, "Indicator agreement is mixed or neutral.", "agreement");
  }

  return 0;
}

function scoreMovingAverages(master, evidence) {
  let score = 0;
  const ema = getIndicator(master, "ema") || {};
  const sma = getIndicator(master, "sma") || {};

  const emaSignal = [ema?.signal, ema?.interpretation].filter(Boolean).join(" ");
  const smaSignal = [sma?.signal, sma?.interpretation].filter(Boolean).join(" ");

  if (includesAny(emaSignal, ["ABOVE EMA", "BULLISH"])) {
    score += 8;
    addEvidence(evidence, "Moving Average", "bullish", 8, "Price is trading above the short-term EMA.", "indicators.ema");
  } else if (includesAny(emaSignal, ["BELOW EMA", "BEARISH"])) {
    score -= 8;
    addEvidence(evidence, "Moving Average", "bearish", -8, "Price is trading below the short-term EMA.", "indicators.ema");
  }

  if (includesAny(smaSignal, ["ABOVE SMA", "BULLISH"])) {
    score += 7;
    addEvidence(evidence, "Moving Average", "bullish", 7, "Price is trading above the medium-term SMA.", "indicators.sma");
  } else if (includesAny(smaSignal, ["BELOW SMA", "BEARISH"])) {
    score -= 7;
    addEvidence(evidence, "Moving Average", "bearish", -7, "Price is trading below the medium-term SMA.", "indicators.sma");
  }

  return score;
}

function scoreMacd(master, evidence) {
  const macd = getIndicator(master, "macd") || {};
  const label = [macd?.signal, macd?.interpretation, macd?.trend].filter(Boolean).join(" ");

  if (includesAny(label, ["BULLISH"])) {
    addEvidence(evidence, "Momentum", "bullish", 12, "MACD indicates bullish momentum.", "indicators.macd");
    return 12;
  }

  if (includesAny(label, ["BEARISH"])) {
    addEvidence(evidence, "Momentum", "bearish", -12, "MACD indicates bearish momentum.", "indicators.macd");
    return -12;
  }

  if (isFiniteNumber(macd?.macd) && isFiniteNumber(macd?.signalLine)) {
    if (macd.macd > macd.signalLine) {
      addEvidence(evidence, "Momentum", "bullish", 8, "MACD is above its signal line.", "indicators.macd");
      return 8;
    }
    if (macd.macd < macd.signalLine) {
      addEvidence(evidence, "Momentum", "bearish", -8, "MACD is below its signal line.", "indicators.macd");
      return -8;
    }
  }

  return 0;
}

function scoreRsi(master, evidence, warnings) {
  const rsi = getIndicator(master, "rsi") || {};
  const value = [rsi?.rsi, rsi?.value].find(isFiniteNumber);

  if (!isFiniteNumber(value)) return 0;

  if (value >= 70) {
    warnings.push(`RSI is overbought at ${round(value)}.`);
    addEvidence(evidence, "Momentum", "caution", -4, `RSI is overbought at ${round(value)}, which raises pullback risk.`, "indicators.rsi");
    return -4;
  }

  if (value <= 30) {
    warnings.push(`RSI is oversold at ${round(value)}.`);
    addEvidence(evidence, "Momentum", "caution", 4, `RSI is oversold at ${round(value)}, which may indicate rebound potential but does not confirm a reversal.`, "indicators.rsi");
    return 4;
  }

  if (value >= 55) {
    addEvidence(evidence, "Momentum", "bullish", 5, `RSI at ${round(value)} shows positive momentum without being overbought.`, "indicators.rsi");
    return 5;
  }

  if (value <= 45) {
    addEvidence(evidence, "Momentum", "bearish", -5, `RSI at ${round(value)} shows weak momentum without being oversold.`, "indicators.rsi");
    return -5;
  }

  addEvidence(evidence, "Momentum", "neutral", 0, `RSI at ${round(value)} is neutral.`, "indicators.rsi");
  return 0;
}

function scoreAdx(master, evidence) {
  const adx = getIndicator(master, "adx") || {};
  const value = [adx?.adx, adx?.value].find(isFiniteNumber);

  if (!isFiniteNumber(value)) return 0;

  if (value >= 25) {
    addEvidence(evidence, "Trend Strength", "confirmation", 4, `ADX at ${round(value)} confirms that the current trend has meaningful strength.`, "indicators.adx");
    return 4;
  }

  addEvidence(evidence, "Trend Strength", "caution", -2, `ADX at ${round(value)} suggests weak or range-bound trend strength.`, "indicators.adx");
  return -2;
}

function scoreVolume(master, evidence) {
  let score = 0;
  const rvol = getIndicator(master, "rvol") || {};
  const volumeSpike = getIndicator(master, "volumeSpike") ||
    getIndicator(master, "volume-spike") || {};
  const obv = getIndicator(master, "obv") || {};

  const rvolValue = [
    rvol?.relativeVolume,
    rvol?.rvol,
    rvol?.value
  ].find(isFiniteNumber);

  if (isFiniteNumber(rvolValue) && rvolValue >= 1.2) {
    score += 4;
    addEvidence(evidence, "Volume", "confirmation", 4, `Relative volume is elevated at ${round(rvolValue)}x.`, "indicators.rvol");
  }

  if (volumeSpike?.spikeDetected === true) {
    score += 3;
    addEvidence(evidence, "Volume", "confirmation", 3, "A recent volume spike confirms increased market participation.", "indicators.volumeSpike");
  }

  const obvLabel = [obv?.signal, obv?.trend, obv?.interpretation].filter(Boolean).join(" ");
  if (includesAny(obvLabel, ["ACCUMULATION", "BULLISH", "RISING"])) {
    score += 5;
    addEvidence(evidence, "Volume", "bullish", 5, "OBV suggests accumulation.", "indicators.obv");
  } else if (includesAny(obvLabel, ["DISTRIBUTION", "BEARISH", "FALLING"])) {
    score -= 5;
    addEvidence(evidence, "Volume", "bearish", -5, "OBV suggests distribution.", "indicators.obv");
  }

  return score;
}

function scoreBollinger(master, evidence, warnings) {
  const bb = getIndicator(master, "bollinger") ||
    getIndicator(master, "bollingerBands") || {};
  const label = [bb?.signal, bb?.interpretation].filter(Boolean).join(" ");

  if (includesAny(label, ["ABOVE UPPER", "NEAR UPPER"])) {
    warnings.push("Price is near or above the upper Bollinger Band.");
    addEvidence(evidence, "Volatility", "caution", -3, "Price is near the upper Bollinger Band, increasing extension risk.", "indicators.bollinger");
    return -3;
  }

  if (includesAny(label, ["BELOW LOWER", "NEAR LOWER"])) {
    warnings.push("Price is near or below the lower Bollinger Band.");
    addEvidence(evidence, "Volatility", "caution", 2, "Price is near the lower Bollinger Band; rebound potential exists but requires confirmation.", "indicators.bollinger");
    return 2;
  }

  return 0;
}

function extractConfluence(master, evidence) {
  const confluence = master?.data?.confluence || {};
  const strongest = confluence?.strongestZone || null;
  const score = strongest?.score;

  if (isFiniteNumber(score) && score >= 70) {
    addEvidence(
      evidence,
      "Confluence",
      "confirmation",
      8,
      `The strongest technical confluence zone has a score of ${round(score)}.`,
      "confluence"
    );
    return 8;
  }

  if (isFiniteNumber(score) && score >= 40) {
    addEvidence(
      evidence,
      "Confluence",
      "confirmation",
      4,
      `The strongest technical confluence zone has a moderate score of ${round(score)}.`,
      "confluence"
    );
    return 4;
  }

  return 0;
}

function getZonePrice(zone) {
  const candidates = [
    zone?.zone?.center,
    zone?.center,
    zone?.price,
    zone?.level,
    zone?.zone?.low,
    zone?.zone?.high
  ];
  return candidates.find(isFiniteNumber) ?? null;
}

function buildLevels(master, currentPrice) {
  const confluence = master?.data?.confluence || {};
  const structure = master?.data?.marketStructure || {};

  const supportCandidates = [
    confluence?.nearestSupport,
    structure?.nearestSupport,
    structure?.supportResistance?.nearestSupport,
    structure?.support?.nearest
  ];

  const resistanceCandidates = [
    confluence?.nearestResistance,
    structure?.nearestResistance,
    structure?.supportResistance?.nearestResistance,
    structure?.resistance?.nearest
  ];

  const support = supportCandidates
    .map(getZonePrice)
    .find(isFiniteNumber) ?? null;

  const resistance = resistanceCandidates
    .map(getZonePrice)
    .find(isFiniteNumber) ?? null;

  return {
    currentPrice,
    nearestSupport: support,
    nearestResistance: resistance,
    supportDistancePercent:
      isFiniteNumber(currentPrice) && isFiniteNumber(support) && currentPrice !== 0
        ? round(((currentPrice - support) / currentPrice) * 100)
        : null,
    resistanceDistancePercent:
      isFiniteNumber(currentPrice) && isFiniteNumber(resistance) && currentPrice !== 0
        ? round(((resistance - currentPrice) / currentPrice) * 100)
        : null
  };
}

function buildScenarioFramework(levels, bias) {
  const bullish = [BIAS.STRONGLY_BULLISH, BIAS.BULLISH].includes(bias);
  const bearish = [BIAS.STRONGLY_BEARISH, BIAS.BEARISH].includes(bias);

  return {
    bullishScenario: {
      condition:
        isFiniteNumber(levels.nearestResistance)
          ? `Price sustains above resistance near ${levels.nearestResistance}.`
          : "Price confirms continuation with stronger momentum and volume.",
      interpretation:
        bullish
          ? "This would support continuation of the existing positive bias."
          : "This would improve the current technical outlook."
    },
    bearishScenario: {
      condition:
        isFiniteNumber(levels.nearestSupport)
          ? `Price loses support near ${levels.nearestSupport}.`
          : "Price weakens with deteriorating momentum and volume.",
      interpretation:
        bearish
          ? "This would support continuation of the existing negative bias."
          : "This would weaken the current technical outlook."
    },
    invalidation:
      bullish && isFiniteNumber(levels.nearestSupport)
        ? `The bullish thesis weakens below support near ${levels.nearestSupport}.`
        : bearish && isFiniteNumber(levels.nearestResistance)
          ? `The bearish thesis weakens above resistance near ${levels.nearestResistance}.`
          : "No reliable invalidation level is available from the current dataset."
  };
}

function classifyBias(score) {
  if (score >= 60) return BIAS.STRONGLY_BULLISH;
  if (score >= 20) return BIAS.BULLISH;
  if (score <= -60) return BIAS.STRONGLY_BEARISH;
  if (score <= -20) return BIAS.BEARISH;
  return BIAS.NEUTRAL;
}

function buildConfidence(master, evidence, warnings) {
  const quality = upper(master?.dataQuality?.status);
  const directional = evidence.filter((item) =>
    ["bullish", "bearish"].includes(item.direction)
  );
  const bullish = directional.filter((item) => item.direction === "bullish").length;
  const bearish = directional.filter((item) => item.direction === "bearish").length;
  const availableCategories = new Set(evidence.map((item) => item.category)).size;

  let score = 35;
  score += Math.min(30, availableCategories * 4);
  score += Math.min(20, Math.abs(bullish - bearish) * 4);

  if (quality === "GOOD") score += 10;
  if (quality === "DEGRADED") score -= 12;
  if (quality === "POOR" || quality === "FAILED") score -= 25;
  score -= Math.min(20, warnings.length * 3);

  score = clamp(Math.round(score), 0, 100);

  let level = CONFIDENCE.LOW;
  if (score >= 75) level = CONFIDENCE.HIGH;
  else if (score >= 50) level = CONFIDENCE.MEDIUM;

  return {
    level,
    score,
    evidenceCategories: availableCategories,
    bullishEvidenceCount: bullish,
    bearishEvidenceCount: bearish,
    note:
      "Confidence measures agreement and data completeness. It does not measure certainty or guarantee future performance."
  };
}

function buildRisk(master, levels, warnings) {
  const risk = master?.data?.risk || {};
  const label = [
    risk?.level,
    risk?.riskLevel,
    risk?.classification,
    risk?.overallRisk,
    risk?.summary
  ].filter(Boolean).join(" ");

  let level = "UNKNOWN";

  if (includesAny(label, ["VERY HIGH", "HIGH"])) level = "HIGH";
  else if (includesAny(label, ["MEDIUM", "MODERATE"])) level = "MEDIUM";
  else if (includesAny(label, ["LOW"])) level = "LOW";

  if (
    isFiniteNumber(levels.supportDistancePercent) &&
    levels.supportDistancePercent <= 2
  ) {
    warnings.push("Price is close to identified support; a breakdown would materially change the setup.");
  }

  if (
    isFiniteNumber(levels.resistanceDistancePercent) &&
    levels.resistanceDistancePercent <= 2
  ) {
    warnings.push("Price is close to identified resistance; upside may be constrained without a confirmed breakout.");
  }

  return {
    level,
    source: risk?.success === false ? "Unavailable" : "Master Analysis Risk Engine",
    original: risk || null
  };
}

function buildShariah(master) {
  const shariah = master?.data?.shariah || {};
  return {
    status: shariah?.status || "UNKNOWN",
    confidence: shariah?.confidence || "UNKNOWN",
    provider: shariah?.provider || null,
    headline: shariah?.headline || null,
    purificationRate:
      shariah?.purificationRateFormatted ??
      shariah?.purificationRate ??
      null,
    note:
      "Shariah status is reported from the screening provider and is not a religious ruling by AlphaLens AI."
  };
}

function buildHeadline(symbol, bias, confidence) {
  const readableBias = bias
    .toLowerCase()
    .replaceAll("_", " ");

  return `${symbol} currently has a ${readableBias} technical bias with ${confidence.toLowerCase()} confidence.`;
}

function buildSummary({ bias, score, confidence, levels, warnings }) {
  const direction =
    [BIAS.STRONGLY_BULLISH, BIAS.BULLISH].includes(bias)
      ? "Positive evidence currently outweighs negative evidence."
      : [BIAS.STRONGLY_BEARISH, BIAS.BEARISH].includes(bias)
        ? "Negative evidence currently outweighs positive evidence."
        : "Bullish and bearish evidence is currently balanced or inconclusive.";

  const levelContext =
    isFiniteNumber(levels.nearestSupport) || isFiniteNumber(levels.nearestResistance)
      ? `The nearest identified support is ${levels.nearestSupport ?? "Unknown"} and resistance is ${levels.nearestResistance ?? "Unknown"}.`
      : "Reliable nearby support and resistance levels are not both available.";

  return `${direction} The normalized technical score is ${score}/100 and confidence is ${confidence.level}. ${levelContext} ${warnings.length ? "Important cautions are present." : "No major technical cautions were detected from available modules."}`;
}

function validateMaster(master) {
  if (!master || typeof master !== "object") {
    return "Master Analysis response must be an object.";
  }

  if (master.success !== true) {
    return master.error || "Master Analysis did not complete successfully.";
  }

  if (!master.data || typeof master.data !== "object") {
    return "Master Analysis response does not contain a data object.";
  }

  return null;
}

function createDecisionReport(master) {
  const startedAt = Date.now();
  const validationError = validateMaster(master);

  if (validationError) {
    return {
      success: false,
      provider: PROVIDER,
      engineVersion: ENGINE_VERSION,
      error: validationError,
      decision: null,
      performance: {
        durationMs: Date.now() - startedAt
      }
    };
  }

  const symbol =
    master?.meta?.symbol ||
    master?.data?.market?.symbol ||
    master?.data?.market?.data?.symbol ||
    "UNKNOWN";

  const evidence = [];
  const warnings = [
    ...(Array.isArray(master?.dataQuality?.warnings)
      ? master.dataQuality.warnings
      : [])
  ];

  let rawScore = 0;
  rawScore += scoreTrend(master, evidence);
  rawScore += scoreAgreement(master, evidence);
  rawScore += scoreMovingAverages(master, evidence);
  rawScore += scoreMacd(master, evidence);
  rawScore += scoreRsi(master, evidence, warnings);
  rawScore += scoreAdx(master, evidence);
  rawScore += scoreVolume(master, evidence);
  rawScore += scoreBollinger(master, evidence, warnings);
  rawScore += extractConfluence(master, evidence);

  rawScore = clamp(round(rawScore), -100, 100);
  const normalizedScore = Math.round((rawScore + 100) / 2);
  const bias = classifyBias(rawScore);
  const confidence = buildConfidence(master, evidence, warnings);
  const currentPrice = getLivePrice(master) ?? getHistoricalClose(master);
  const levels = buildLevels(master, currentPrice);
  const risk = buildRisk(master, levels, warnings);
  const shariah = buildShariah(master);
  const scenarios = buildScenarioFramework(levels, bias);

  const uniqueWarnings = [...new Set(warnings.filter(Boolean))];

  const bullishEvidence = evidence
    .filter((item) => item.direction === "bullish")
    .sort((a, b) => b.weight - a.weight);

  const bearishEvidence = evidence
    .filter((item) => item.direction === "bearish")
    .sort((a, b) => a.weight - b.weight);

  const cautionEvidence = evidence.filter((item) =>
    ["caution", "neutral"].includes(item.direction)
  );

  const decision = {
    symbol,
    generatedAt: new Date().toISOString(),
    headline: buildHeadline(symbol, bias, confidence.level),
    marketBias: bias,
    technicalScore: {
      directionalScore: rawScore,
      normalizedScore,
      scale:
        "Directional score ranges from -100 to +100. Normalized score ranges from 0 to 100, where 50 is neutral."
    },
    confidence,
    summary: null,
    marketContext: {
      currentPrice,
      latestHistoricalClose: getHistoricalClose(master),
      dataQuality: master?.dataQuality?.status || "Unknown"
    },
    levels,
    risk,
    shariah,
    evidence: {
      bullish: bullishEvidence,
      bearish: bearishEvidence,
      caution: cautionEvidence,
      all: evidence
    },
    scenarios,
    warnings: uniqueWarnings,
    disclaimer:
      "This report is decision-support research, not a buy or sell instruction, investment advice, a price prediction, or a guarantee of future results."
  };

  decision.summary = buildSummary({
    bias,
    score: normalizedScore,
    confidence,
    levels,
    warnings: uniqueWarnings
  });

  return {
    success: true,
    provider: PROVIDER,
    engineVersion: ENGINE_VERSION,
    decision,
    performance: {
      durationMs: Date.now() - startedAt
    }
  };
}

module.exports = {
  createDecisionReport,
  BIAS,
  CONFIDENCE
};