"use strict";

const assert = require("node:assert/strict");

const {
  createDecisionReport
} = require("../services/decisionEngineService");

const {
  createScenarioPlan
} = require("../services/scenarioPlanningService");

const {
  calculateRiskPlan
} = require("../services/riskPlanningService");

function createMasterAnalysisFixture() {
  return {
    success: true,

    meta: {
      symbol: "AAPL"
    },

    dataQuality: {
      status: "Good",
      warnings: []
    },

    data: {
      priceContext: {
        livePrice: 333.74,
        latestHistoricalClose: 333.74
      },

      market: {
        data: {
          symbol: "AAPL",
          price: 333.74
        }
      },

      sharedHistory: {
        latestHistoricalClose: 333.74
      },

      indicators: {},

      trend: {
        success: true,
        trend: "Strong Bullish"
      },

      agreement: {
        success: true,
        agreement: "aligned",
        direction: "Bullish",
        confidence: 60
      },

      risk: {
        success: true,
        riskLevel: "Low",
        riskScore: 28
      },

      shariah: {
        success: true,

        summary: {
          headline:
            "Apple Inc. passes all available Shariah screening methodologies.",
          status: "COMPLIANT",
          confidence: "HIGH",
          explanation:
            "Compliant under the available screening methodologies.",
          purificationRatePercent: 3.37,
          purificationRateFormatted: "3.37%",
          methodologiesPassed: 5,
          methodologiesFailed: 0,
          methodologiesUnknown: 0,
          methodologiesTotal: 5
        },

        company: {
          name: "Apple Inc.",
          assetType: "Equity",
          sector: "Technology",
          industry: "Consumer Electronics",
          country: "United States"
        },

        businessActivity: {
          status: "PASS",
          passed: true,
          reason: "Business activity is compliant."
        },

        financialScreen: {
          status: "PASS",
          passed: true
        },

        verification: {
          lastCheckedAt: "2026-07-15T08:25:31.345413+00:00",
          isStale: false,
          dataQuality: "Good"
        },

        provider: {
          id: "halal_terminal",
          name: "Halal Terminal",
          endpoint: "/api/screen/{symbol}"
        }
      }
    }
  };
}

function createRiskInput(direction) {
  return {
    direction,
    accountSize: 50000,
    riskPercent: 1,
    entryPrice: 333.5,
    invalidationPrice:
      direction === "LONG" ? 317.4 : 350,
    targetPrice:
      direction === "LONG" ? 360 : 310,
    allowFractionalShares: false
  };
}

function hasDirectionMismatchWarning(result) {
  return result.warnings.some((warning) =>
    warning.includes("differs from the inherited market bias")
  );
}

function run() {
  console.log("Phase 4.5 Stability Tests");
  console.log("==========================");

  const master = createMasterAnalysisFixture();

  // Shariah propagation: Master -> Decision
  const decisionResult = createDecisionReport(master);

  assert.equal(decisionResult.success, true);
  assert.equal(
    decisionResult.decision.shariah.status,
    "COMPLIANT"
  );
  assert.equal(
    decisionResult.decision.shariah.confidence,
    "HIGH"
  );
  assert.equal(
    decisionResult.decision.shariah.purificationRate,
    "3.37%"
  );
  assert.equal(
    decisionResult.decision.shariah.company.name,
    "Apple Inc."
  );
  assert.equal(
    decisionResult.decision.shariah.methodologies.passed,
    5
  );

  console.log("✓ Master Shariah data propagates to Decision Engine");

  // Shariah propagation: Decision -> Scenario
  const scenarioResult = createScenarioPlan(decisionResult);

  assert.equal(scenarioResult.success, true);
  assert.equal(
    scenarioResult.plan.shariah.status,
    "COMPLIANT"
  );
  assert.equal(
    scenarioResult.plan.shariah.confidence,
    "HIGH"
  );
  assert.equal(
    scenarioResult.plan.shariah.purificationRate,
    "3.37%"
  );

  console.log("✓ Decision Shariah data propagates to Scenario Engine");

  // Equivalent directions must not produce warnings.
  const longBullish = calculateRiskPlan(
    createRiskInput("LONG"),
    { marketBias: "BULLISH" }
  );

  assert.equal(longBullish.success, true);
  assert.equal(
    hasDirectionMismatchWarning(longBullish),
    false
  );

  console.log("✓ LONG and BULLISH are treated as equivalent");

  const longStronglyBullish = calculateRiskPlan(
    createRiskInput("LONG"),
    { marketBias: "STRONGLY_BULLISH" }
  );

  assert.equal(
    hasDirectionMismatchWarning(longStronglyBullish),
    false
  );

  console.log("✓ LONG and STRONGLY_BULLISH are equivalent");

  const shortBearish = calculateRiskPlan(
    createRiskInput("SHORT"),
    { marketBias: "BEARISH" }
  );

  assert.equal(shortBearish.success, true);
  assert.equal(
    hasDirectionMismatchWarning(shortBearish),
    false
  );

  console.log("✓ SHORT and BEARISH are treated as equivalent");

  const shortStronglyBearish = calculateRiskPlan(
    createRiskInput("SHORT"),
    { marketBias: "STRONGLY_BEARISH" }
  );

  assert.equal(
    hasDirectionMismatchWarning(shortStronglyBearish),
    false
  );

  console.log("✓ SHORT and STRONGLY_BEARISH are equivalent");

  // Genuine disagreements must still produce warnings.
  const longBearish = calculateRiskPlan(
    createRiskInput("LONG"),
    { marketBias: "BEARISH" }
  );

  assert.equal(
    hasDirectionMismatchWarning(longBearish),
    true
  );

  console.log("✓ LONG versus BEARISH produces a warning");

  const shortBullish = calculateRiskPlan(
    createRiskInput("SHORT"),
    { marketBias: "BULLISH" }
  );

  assert.equal(
    hasDirectionMismatchWarning(shortBullish),
    true
  );

  console.log("✓ SHORT versus BULLISH produces a warning");

  // Input aliases are also accepted.
  const bullishAlias = calculateRiskPlan(
    {
      ...createRiskInput("LONG"),
      direction: "BULLISH"
    },
    { marketBias: "BULLISH" }
  );

  assert.equal(bullishAlias.success, true);
  assert.equal(bullishAlias.inputs.direction, "LONG");

  console.log("✓ BULLISH input is normalized to LONG");

  const bearishAlias = calculateRiskPlan(
    {
      ...createRiskInput("SHORT"),
      direction: "BEARISH"
    },
    { marketBias: "BEARISH" }
  );

  assert.equal(bearishAlias.success, true);
  assert.equal(bearishAlias.inputs.direction, "SHORT");

  console.log("✓ BEARISH input is normalized to SHORT");

  console.log();
  console.log("All Phase 4.5 stability tests passed.");
}

try {
  run();
} catch (error) {
  console.error();
  console.error("Phase 4.5 stability test failed:");
  console.error(error);
  process.exitCode = 1;
}
