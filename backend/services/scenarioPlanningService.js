/**
 * AzaLens — Phase 4B Scenario & Trade-Planning Engine
 *
 * Purpose:
 * - Convert a Phase 4A Decision Report into conditional market scenarios.
 * - Provide observation, confirmation, invalidation, and risk context.
 * - Never issue direct buy/sell instructions.
 * - Never invent unavailable prices, targets, or probabilities.
 */

"use strict";

const PROVIDER = "AzaLens";
const ENGINE_VERSION = "1.0.0";

const SCENARIO_TYPE = Object.freeze({
  BULLISH: "BULLISH",
  NEUTRAL: "NEUTRAL",
  BEARISH: "BEARISH"
});

const SCENARIO_STATUS = Object.freeze({
  FAVORED: "FAVORED",
  ALTERNATIVE: "ALTERNATIVE",
  DEFENSIVE: "DEFENSIVE",
  LIMITED_DATA: "LIMITED_DATA"
});

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function round(value, decimals = 2) {
  if (!isFiniteNumber(value)) return null;
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function upper(value) {
  return text(value).toUpperCase();
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function getDecision(input) {
  if (input?.success === true && input?.decision) return input.decision;
  if (input?.symbol && input?.marketBias) return input;
  return null;
}

function validateDecision(input) {
  const decision = getDecision(input);

  if (!decision) {
    return {
      decision: null,
      error: "A successful Phase 4A Decision Report is required."
    };
  }

  return { decision, error: null };
}

function classifyScenarioStatuses(bias) {
  const normalized = upper(bias);

  if (["STRONGLY_BULLISH", "BULLISH"].includes(normalized)) {
    return {
      bullish: SCENARIO_STATUS.FAVORED,
      neutral: SCENARIO_STATUS.ALTERNATIVE,
      bearish: SCENARIO_STATUS.DEFENSIVE
    };
  }

  if (["STRONGLY_BEARISH", "BEARISH"].includes(normalized)) {
    return {
      bullish: SCENARIO_STATUS.DEFENSIVE,
      neutral: SCENARIO_STATUS.ALTERNATIVE,
      bearish: SCENARIO_STATUS.FAVORED
    };
  }

  return {
    bullish: SCENARIO_STATUS.ALTERNATIVE,
    neutral: SCENARIO_STATUS.FAVORED,
    bearish: SCENARIO_STATUS.ALTERNATIVE
  };
}

function percentDistance(from, to) {
  if (!isFiniteNumber(from) || !isFiniteNumber(to) || from === 0) return null;
  return round(((to - from) / from) * 100);
}

function buildLevelContext(decision) {
  const currentPrice = decision?.marketContext?.currentPrice;
  const support = decision?.levels?.nearestSupport;
  const resistance = decision?.levels?.nearestResistance;

  return {
    currentPrice: isFiniteNumber(currentPrice) ? round(currentPrice) : null,
    nearestSupport: isFiniteNumber(support) ? round(support) : null,
    nearestResistance: isFiniteNumber(resistance) ? round(resistance) : null,
    distanceToSupportPct:
      isFiniteNumber(currentPrice) && isFiniteNumber(support)
        ? percentDistance(currentPrice, support)
        : null,
    distanceToResistancePct:
      isFiniteNumber(currentPrice) && isFiniteNumber(resistance)
        ? percentDistance(currentPrice, resistance)
        : null
  };
}

function buildBullishScenario(decision, levels, status) {
  const hasResistance = isFiniteNumber(levels.nearestResistance);
  const hasSupport = isFiniteNumber(levels.nearestSupport);

  const confirmations = unique([
    hasResistance
      ? `Price closes and holds above confirmed resistance near ${levels.nearestResistance}.`
      : "Price establishes a new confirmed resistance breakout level with sustained follow-through.",
    "Momentum remains constructive instead of weakening after the move.",
    "Volume or accumulation evidence supports the advance.",
    upper(decision?.confidence?.level) === "LOW"
      ? "Decision confidence improves from LOW before treating the scenario as well supported."
      : null
  ]);

  const invalidation = hasSupport
    ? {
        condition: `A decisive loss of confirmed support near ${levels.nearestSupport} would weaken the bullish scenario.`,
        level: levels.nearestSupport,
        type: "CONFIRMED_SUPPORT"
      }
    : {
        condition: "The bullish scenario weakens if price forms a lower low and no confirmed support remains intact.",
        level: null,
        type: "STRUCTURAL"
      };

  return {
    type: SCENARIO_TYPE.BULLISH,
    status,
    title: "Bullish continuation scenario",
    thesis:
      "Positive technical evidence remains dominant and price continues to confirm upward structure.",
    observationTrigger: hasResistance
      ? `Observe whether price can move above ${levels.nearestResistance} and remain accepted above it.`
      : "Observe whether price can create and hold a fresh breakout structure because no confirmed resistance is currently available.",
    confirmations,
    invalidation,
    objectives: hasResistance
      ? [
          {
            label: "First structural objective",
            value: levels.nearestResistance,
            note: "This is a confirmation level, not a predicted profit target."
          }
        ]
      : [],
    limitations: unique([
      !hasResistance
        ? "No confirmed resistance level is available, so an exact breakout trigger cannot be stated."
        : null,
      ...(decision?.warnings || []).filter((item) =>
        /overbought|upper bollinger|resistance|fibonacci/i.test(item)
      )
    ])
  };
}

function buildNeutralScenario(decision, levels, status) {
  const hasSupport = isFiniteNumber(levels.nearestSupport);
  const hasResistance = isFiniteNumber(levels.nearestResistance);
  const hasRange = hasSupport && hasResistance && levels.nearestSupport < levels.nearestResistance;

  return {
    type: SCENARIO_TYPE.NEUTRAL,
    status,
    title: "Consolidation or indecision scenario",
    thesis:
      "Price pauses, directional evidence becomes mixed, or the market waits for a clearer structural break.",
    observationTrigger: hasRange
      ? `Observe price behavior between support near ${levels.nearestSupport} and resistance near ${levels.nearestResistance}.`
      : "Observe whether momentum cools and price forms a stable range before a new directional signal appears.",
    confirmations: unique([
      "Directional indicators stop expanding in the current direction.",
      "Price repeatedly rejects both sides of a developing range.",
      "Confidence or evidence agreement declines toward mixed conditions."
    ]),
    invalidation: {
      condition: hasRange
        ? "A confirmed close outside the identified range would invalidate the neutral scenario."
        : "A confirmed structural breakout with indicator agreement would invalidate the neutral scenario.",
      level: null,
      type: hasRange ? "RANGE_BREAK" : "STRUCTURAL"
    },
    range: hasRange
      ? {
          lowerBoundary: levels.nearestSupport,
          upperBoundary: levels.nearestResistance,
          widthPct: round(
            ((levels.nearestResistance - levels.nearestSupport) /
              levels.nearestSupport) *
              100
          )
        }
      : null,
    limitations: unique([
      !hasRange
        ? "Both confirmed support and resistance are required to define an exact consolidation range."
        : null
    ])
  };
}

function buildBearishScenario(decision, levels, status) {
  const hasSupport = isFiniteNumber(levels.nearestSupport);
  const hasResistance = isFiniteNumber(levels.nearestResistance);

  const confirmations = unique([
    hasSupport
      ? `Price closes below confirmed support near ${levels.nearestSupport} and fails to reclaim it.`
      : "Price forms a confirmed lower low after support fails to develop.",
    "Momentum shifts bearish or bullish momentum materially weakens.",
    "Distribution or negative volume evidence confirms the decline."
  ]);

  const invalidation = hasResistance
    ? {
        condition: `A decisive recovery above confirmed resistance near ${levels.nearestResistance} would weaken the bearish scenario.`,
        level: levels.nearestResistance,
        type: "CONFIRMED_RESISTANCE"
      }
    : {
        condition: "The bearish scenario weakens if price restores higher-high and higher-low structure.",
        level: null,
        type: "STRUCTURAL"
      };

  return {
    type: SCENARIO_TYPE.BEARISH,
    status,
    title: "Bearish breakdown scenario",
    thesis:
      "Support fails, momentum deteriorates, and negative evidence begins to outweigh positive evidence.",
    observationTrigger: hasSupport
      ? `Observe whether price loses ${levels.nearestSupport} with confirmation rather than a brief intraday breach.`
      : "Observe whether price forms a confirmed breakdown structure because no reliable support level is currently available.",
    confirmations,
    invalidation,
    objectives: hasSupport
      ? [
          {
            label: "Breakdown confirmation level",
            value: levels.nearestSupport,
            note: "This is a structural confirmation level, not a predicted downside target."
          }
        ]
      : [],
    limitations: unique([
      !hasSupport
        ? "No confirmed support level is available, so an exact breakdown trigger cannot be stated."
        : null
    ])
  };
}

function buildRiskPlan(decision, levels) {
  const confidence = upper(decision?.confidence?.level) || "UNKNOWN";
  const riskLevel = upper(decision?.risk?.level) || "UNKNOWN";
  const warnings = Array.isArray(decision?.warnings) ? decision.warnings : [];

  const controls = [
    "Require scenario confirmation before treating a scenario as active.",
    "Use a predefined invalidation condition rather than changing the thesis after price moves.",
    "Do not calculate position size until account value and maximum acceptable loss are explicitly provided.",
    "Re-run the analysis when price materially changes or new market data becomes available."
  ];

  if (confidence === "LOW" || confidence === "UNKNOWN") {
    controls.push("Treat the report as low-conviction because evidence confidence is limited.");
  }

  if (["HIGH", "VERY_HIGH"].includes(riskLevel)) {
    controls.push("Risk is elevated; scenario confirmation should be stricter than normal.");
  }

  if (!isFiniteNumber(levels.nearestSupport) || !isFiniteNumber(levels.nearestResistance)) {
    controls.push("Exact reward-to-risk cannot be calculated because both support and resistance are not available.");
  }

  return {
    reportedRiskLevel: riskLevel,
    confidenceLevel: confidence,
    positionSizing: {
      available: false,
      reason:
        "Account value, maximum risk percentage, intended entry, and invalidation price were not supplied."
    },
    rewardToRisk: {
      available: false,
      reason:
        "AzaLens does not infer an entry price. A valid entry and invalidation level are required for this calculation."
    },
    controls: unique(controls),
    inheritedWarnings: warnings
  };
}

function buildScenarioSummary(symbol, bias, confidence, statuses) {
  const favored = Object.entries(statuses)
    .find(([, status]) => status === SCENARIO_STATUS.FAVORED)?.[0]
    ?.toUpperCase() || "NONE";

  return `${symbol} currently has a ${upper(bias) || "UNKNOWN"} bias with ${upper(confidence) || "UNKNOWN"} confidence. The ${favored} scenario is favored by current evidence, but it remains conditional and requires confirmation.`;
}

function createScenarioPlan(input) {
  const startedAt = Date.now();
  const { decision, error } = validateDecision(input);

  if (error) {
    return {
      success: false,
      provider: PROVIDER,
      engineVersion: ENGINE_VERSION,
      error,
      plan: null,
      performance: { durationMs: Date.now() - startedAt }
    };
  }

  const symbol = decision?.symbol || "UNKNOWN";
  const levels = buildLevelContext(decision);
  const statuses = classifyScenarioStatuses(decision?.marketBias);

  const bullish = buildBullishScenario(decision, levels, statuses.bullish);
  const neutral = buildNeutralScenario(decision, levels, statuses.neutral);
  const bearish = buildBearishScenario(decision, levels, statuses.bearish);

  const dataLimitations = unique([
    !isFiniteNumber(levels.currentPrice) ? "Current price is unavailable." : null,
    !isFiniteNumber(levels.nearestSupport) ? "Confirmed support is unavailable." : null,
    !isFiniteNumber(levels.nearestResistance) ? "Confirmed resistance is unavailable." : null,
    upper(decision?.marketContext?.dataQuality) !== "GOOD"
      ? `Market data quality is ${decision?.marketContext?.dataQuality || "Unknown"}.`
      : null
  ]);

  const plan = {
    symbol,
    generatedAt: new Date().toISOString(),
    headline: `${symbol} conditional scenario plan`,
    summary: buildScenarioSummary(
      symbol,
      decision?.marketBias,
      decision?.confidence?.level,
      statuses
    ),
    sourceDecision: {
      marketBias: decision?.marketBias || "UNKNOWN",
      directionalScore:
        decision?.technicalScore?.directionalScore ?? null,
      normalizedScore:
        decision?.technicalScore?.normalizedScore ?? null,
      confidence: decision?.confidence || null,
      reportedRisk: decision?.risk?.level || "UNKNOWN"
    },
    marketLevels: levels,
    scenarios: {
      bullish,
      neutral,
      bearish
    },
    riskPlan: buildRiskPlan(decision, levels),
    dataLimitations,
    shariah: decision?.shariah || {
      status: "UNKNOWN",
      confidence: "UNKNOWN",
      note:
        "Shariah status is reported from the screening provider and is not a religious ruling by AzaLens."
    },
    disclaimer:
      "This plan presents conditional research scenarios only. It is not a buy or sell instruction, personalized investment advice, a price prediction, or a guarantee of future results."
  };

  return {
    success: true,
    provider: PROVIDER,
    engineVersion: ENGINE_VERSION,
    plan,
    performance: { durationMs: Date.now() - startedAt }
  };
}

module.exports = {
  createScenarioPlan,
  SCENARIO_TYPE,
  SCENARIO_STATUS
};