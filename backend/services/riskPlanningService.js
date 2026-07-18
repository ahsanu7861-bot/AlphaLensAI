"use strict";

const DIRECTION = Object.freeze({ LONG: "LONG", SHORT: "SHORT" });
const TRADE_QUALITY = Object.freeze({
  UNAVAILABLE: "UNAVAILABLE",
  POOR: "POOR",
  FAIR: "FAIR",
  GOOD: "GOOD",
  EXCELLENT: "EXCELLENT"
});

function toNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function round(value, decimals = 2) {
  if (!Number.isFinite(value)) return null;
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function normalizeMarketDirection(value) {
  const direction = String(value || "")
    .trim()
    .toUpperCase()
    .replaceAll("-", "_")
    .replaceAll(" ", "_");

  if (
    direction === DIRECTION.LONG ||
    direction === "BULLISH" ||
    direction === "STRONGLY_BULLISH"
  ) {
    return DIRECTION.LONG;
  }

  if (
    direction === DIRECTION.SHORT ||
    direction === "BEARISH" ||
    direction === "STRONGLY_BEARISH"
  ) {
    return DIRECTION.SHORT;
  }

  if (direction === "NEUTRAL") {
    return "NEUTRAL";
  }

  return null;
}

function normalizeDirection(value) {
  const direction = normalizeMarketDirection(value);

  return direction === DIRECTION.LONG || direction === DIRECTION.SHORT
    ? direction
    : null;
}

function classifyRewardRisk(ratio) {
  if (!Number.isFinite(ratio)) return TRADE_QUALITY.UNAVAILABLE;
  if (ratio < 1) return TRADE_QUALITY.POOR;
  if (ratio < 1.5) return TRADE_QUALITY.FAIR;
  if (ratio < 2.5) return TRADE_QUALITY.GOOD;
  return TRADE_QUALITY.EXCELLENT;
}

function validationError(code, field, message) {
  return { code, field, message };
}

function validateInputs(input = {}) {
  const errors = [];
  const normalized = {
    direction: normalizeDirection(input.direction),
    accountSize: toNumber(input.accountSize),
    riskPercent: toNumber(input.riskPercent),
    entryPrice: toNumber(input.entryPrice),
    invalidationPrice: toNumber(input.invalidationPrice),
    targetPrice: toNumber(input.targetPrice),
    allowFractionalShares: Boolean(input.allowFractionalShares)
  };

  const {
    direction,
    accountSize,
    riskPercent,
    entryPrice,
    invalidationPrice,
    targetPrice
  } = normalized;

  if (!direction) {
    errors.push(validationError(
      "INVALID_DIRECTION",
      "direction",
      "Direction must be LONG or SHORT."
    ));
  }

  if (accountSize === null || accountSize <= 0) {
    errors.push(validationError(
      "INVALID_ACCOUNT_SIZE",
      "accountSize",
      "Account size must be greater than zero."
    ));
  }

  if (riskPercent === null || riskPercent <= 0 || riskPercent > 100) {
    errors.push(validationError(
      "INVALID_RISK_PERCENT",
      "riskPercent",
      "Risk percentage must be greater than zero and no more than 100."
    ));
  }

  if (entryPrice === null || entryPrice <= 0) {
    errors.push(validationError(
      "INVALID_ENTRY_PRICE",
      "entryPrice",
      "Entry price must be greater than zero."
    ));
  }

  if (invalidationPrice === null || invalidationPrice <= 0) {
    errors.push(validationError(
      "INVALID_INVALIDATION_PRICE",
      "invalidationPrice",
      "Invalidation price must be greater than zero."
    ));
  }

  if (
    entryPrice !== null &&
    invalidationPrice !== null &&
    entryPrice === invalidationPrice
  ) {
    errors.push(validationError(
      "ZERO_RISK_PER_SHARE",
      "invalidationPrice",
      "Entry and invalidation prices cannot be equal."
    ));
  }

  if (
    direction === DIRECTION.LONG &&
    entryPrice !== null &&
   invalidationPrice !== null &&
   invalidationPrice >= entryPrice
  ) {
    errors.push(validationError(
      "INVALID_LONG_INVALIDATION",
      "invalidationPrice",
      "For a LONG plan, invalidation must be below entry."
    ));
  }

  if (
    direction === DIRECTION.SHORT &&
    entryPrice !== null &&
   invalidationPrice !== null &&
   invalidationPrice <= entryPrice
  ) {
    errors.push(validationError(
      "INVALID_SHORT_INVALIDATION",
      "invalidationPrice",
      "For a SHORT plan, invalidation must be above entry."
    ));
  }

  if (targetPrice !== null && targetPrice <= 0) {
    errors.push(validationError(
      "INVALID_TARGET_PRICE",
      "targetPrice",
      "Target price must be greater than zero when supplied."
    ));
  }

  if (
    direction === DIRECTION.LONG &&
    targetPrice !== null &&
    entryPrice !== null &&
    targetPrice < entryPrice
  ) {
    errors.push(validationError(
      "INVALID_LONG_TARGET",
      "targetPrice",
      "For a LONG plan, target cannot be below entry."
    ));
  }

  if (
    direction === DIRECTION.SHORT &&
    targetPrice !== null &&
    entryPrice !== null &&
    targetPrice > entryPrice
  ) {
    errors.push(validationError(
      "INVALID_SHORT_TARGET",
      "targetPrice",
      "For a SHORT plan, target cannot be above entry."
    ));
  }

  return {
    valid: errors.length === 0,
    errors,
    normalized
  };
}

function calculateRiskPlan(input = {}, context = {}) {
  const startedAt = Date.now();
  const validation = validateInputs(input);

  if (!validation.valid) {
    return {
      success: false,
      phase: "4C",
      engine: "Risk & Position Planning Engine",
      error: {
        code: "VALIDATION_FAILED",
        message: "One or more risk-planning inputs are invalid.",
        details: validation.errors
      },
      performance: { durationMs: Date.now() - startedAt }
    };
  }

  const {
    direction,
    accountSize,
    riskPercent,
    entryPrice,
    invalidationPrice,
    targetPrice,
    allowFractionalShares
  } = validation.normalized;

  const maximumDollarRisk = accountSize * (riskPercent / 100);
  const riskPerShare = Math.abs(entryPrice - invalidationPrice);
  const rawPositionSize = maximumDollarRisk / riskPerShare;
  const positionSize = allowFractionalShares
    ? round(rawPositionSize, 4)
    : Math.floor(rawPositionSize);

  const plannedDollarRisk = positionSize * riskPerShare;
  const capitalRequired = positionSize * entryPrice;
  const accountExposurePct = (capitalRequired / accountSize) * 100;
  const unusedRiskCapacity = maximumDollarRisk - plannedDollarRisk;

  const targetSupplied = targetPrice !== null;
  const rewardPerShare = targetSupplied
    ? Math.abs(targetPrice - entryPrice)
    : null;
  const totalPotentialReward = targetSupplied
    ? rewardPerShare * positionSize
    : null;
  const rewardRiskRatio = targetSupplied
    ? rewardPerShare / riskPerShare
    : null;

  const warnings = [];

  if (!allowFractionalShares && positionSize < 1) {
    warnings.push(
      "The whole-share position size is below one share for the supplied risk limit."
    );
  }

  if (accountExposurePct > 100) {
    warnings.push(
      "The calculated position requires more capital than the account size. AlphaLens does not assume leverage."
    );
  }

  if (riskPercent > 5) {
    warnings.push(
      "The supplied risk percentage is above 5%. AlphaLens reports this input but does not endorse it."
    );
  }

  if (targetSupplied && rewardPerShare === 0) {
    warnings.push("Target equals entry, so projected reward is zero.");
  }

  const inheritedBias = context.marketBias
    ? String(context.marketBias).trim().toUpperCase()
    : null;

  const normalizedInheritedBias =
    normalizeMarketDirection(inheritedBias);

  if (
    normalizedInheritedBias &&
    normalizedInheritedBias !== "NEUTRAL" &&
    normalizedInheritedBias !== direction
  ) {
    warnings.push(
      `The supplied direction (${direction}) differs from the inherited market bias (${inheritedBias}).`
    );
  }

  return {
    success: true,
    phase: "4C",
    engine: "Risk & Position Planning Engine",
    symbol: context.symbol || input.symbol || null,
    inputs: {
      direction,
      accountSize: round(accountSize, 2),
      riskPercent: round(riskPercent, 4),
      entryPrice: round(entryPrice, 6),
      invalidationPrice: round(invalidationPrice, 6),
      targetPrice: targetSupplied ? round(targetPrice, 6) : null,
      allowFractionalShares
    },
    riskSummary: {
      maximumDollarRisk: round(maximumDollarRisk, 2),
      riskPerShare: round(riskPerShare, 6),
      rawPositionSize: round(rawPositionSize, 6),
      positionSize,
      positionUnit: "SHARES",
      plannedDollarRisk: round(plannedDollarRisk, 2),
      unusedRiskCapacity: round(unusedRiskCapacity, 2),
      capitalRequired: round(capitalRequired, 2),
      accountExposurePct: round(accountExposurePct, 2)
    },
    rewardRisk: {
      available: targetSupplied,
      reason: targetSupplied ? null : "Target price was not supplied.",
      rewardPerShare: targetSupplied ? round(rewardPerShare, 6) : null,
      totalPotentialReward: targetSupplied
        ? round(totalPotentialReward, 2)
        : null,
      ratio: targetSupplied ? round(rewardRiskRatio, 2) : null,
      display: targetSupplied ? `${round(rewardRiskRatio, 2)} : 1` : null,
      tradeQuality: classifyRewardRisk(rewardRiskRatio)
    },
    inheritedContext: {
      marketBias: context.marketBias || null,
      confidence: context.confidence || null,
      reportedRisk: context.reportedRisk || null,
      scenarioStatus: context.scenarioStatus || null,
      dataQuality: context.dataQuality || null,
      shariah: context.shariah || null
    },
    warnings,
    controls: [
      "Treat invalidation as a thesis boundary, not a guaranteed execution price.",
      "Losses can exceed the planned amount because of gaps, slippage, fees, liquidity, or execution delays.",
      "Recalculate whenever account size, risk percentage, entry, invalidation, or target changes.",
      "This output is a calculation aid, not a buy or sell instruction."
    ],
    disclaimer:
      "AlphaLens AI performs deterministic calculations from user-supplied values and does not provide investment, financial, legal, or religious advice.",
    performance: { durationMs: Date.now() - startedAt }
  };
}

module.exports = {
  calculateRiskPlan,
  validateInputs,
  classifyRewardRisk,
  DIRECTION,
  TRADE_QUALITY
};
