/**
 * AzaLens — Phase 4B Scenario & Trade-Planning Engine Test
 *
 * Run:
 *   node tests/testScenarioPlanning.js AAPL
 */

"use strict";

require("dotenv").config({ quiet: true });

const {
  getMasterAnalysis
} = require("../services/masterAnalysisService");

const {
  createDecisionReport
} = require("../services/decisionEngineService");

const {
  createScenarioPlan
} = require("../services/scenarioPlanningService");

function summarizeScenario(scenario) {
  return {
    status: scenario?.status || null,
    title: scenario?.title || null,
    observationTrigger: scenario?.observationTrigger || null,
    confirmations: scenario?.confirmations || [],
    invalidation: scenario?.invalidation || null,
    limitations: scenario?.limitations || []
  };
}

async function run() {
  const symbol = String(process.argv[2] || "AAPL")
    .trim()
    .toUpperCase();

  console.log(`\nTesting Phase 4B Scenario Planning for ${symbol}...\n`);

  try {
    const master = await getMasterAnalysis(symbol);
    const decision = createDecisionReport(master);

    if (!decision.success) {
      throw new Error(decision.error || "Phase 4A Decision Engine failed.");
    }

    const result = createScenarioPlan(decision);

    const output = {
      success: result.success,
      symbol: result?.plan?.symbol || symbol,
      summary: result?.plan?.summary || null,
      sourceDecision: result?.plan?.sourceDecision || null,
      marketLevels: result?.plan?.marketLevels || null,
      bullishScenario: summarizeScenario(
        result?.plan?.scenarios?.bullish
      ),
      neutralScenario: summarizeScenario(
        result?.plan?.scenarios?.neutral
      ),
      bearishScenario: summarizeScenario(
        result?.plan?.scenarios?.bearish
      ),
      riskPlan: result?.plan?.riskPlan || null,
      dataLimitations: result?.plan?.dataLimitations || [],
      shariah: result?.plan?.shariah || null,
      durationMs: result?.performance?.durationMs ?? null,
      error: result?.error || null
    };

    console.dir(output, {
      depth: null,
      colors: true
    });

    if (!result.success) {
      process.exitCode = 1;
    }
  } catch (error) {
    console.error("Phase 4B test failed:", error);
    process.exitCode = 1;
  }
}

run();