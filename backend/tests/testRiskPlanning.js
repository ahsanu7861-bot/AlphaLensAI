/**
 * AzaLens — Phase 4C Risk & Position Planning Test
 *
 * Run:
 *   node tests/testRiskPlanning.js AAPL
 *
 * Optional CLI values:
 *   node tests/testRiskPlanning.js AAPL LONG 50000 1 333.50 317.40 360
 */

"use strict";

require("dotenv").config();

const {
  getMasterAnalysis
} = require("../services/masterAnalysisService");

const {
  createDecisionReport
} = require("../services/decisionEngineService");

const {
  createScenarioPlan
} = require("../services/scenarioPlanningService");

const {
  calculateRiskPlan
} = require("../services/riskPlanningService");

function readNumber(value, fallback) {
  if (value === undefined) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

async function run() {
  const symbol = String(process.argv[2] || "AAPL")
    .trim()
    .toUpperCase();

  const direction = String(process.argv[3] || "LONG")
    .trim()
    .toUpperCase();

  const accountSize = readNumber(process.argv[4], 50000);
  const riskPercent = readNumber(process.argv[5], 1);
  const entryPrice = readNumber(process.argv[6], 333.5);
  const invalidationPrice = readNumber(process.argv[7], 317.4);
  const targetPrice =
    process.argv[8] === undefined
      ? 360
      : readNumber(process.argv[8], null);

  console.log(
    `\nTesting Phase 4C Risk & Position Planning for ${symbol}...\n`
  );

  try {
    const master = await getMasterAnalysis(symbol);
    const decision = createDecisionReport(master);
    const scenario = createScenarioPlan(decision);

    const favoredScenario =
      scenario?.scenarios?.bullish?.status === "FAVORED"
        ? scenario.scenarios.bullish
        : scenario?.scenarios?.bearish?.status === "FAVORED"
          ? scenario.scenarios.bearish
          : scenario?.scenarios?.neutral || null;

    const result = calculateRiskPlan(
      {
        symbol,
        direction,
        accountSize,
        riskPercent,
        entryPrice,
        invalidationPrice,
        targetPrice,
        allowFractionalShares: false
      },
      {
        symbol,
        marketBias:
          decision?.decision?.marketBias ||
          scenario?.sourceDecision?.marketBias ||
          null,
        confidence:
          decision?.decision?.confidence ||
          scenario?.sourceDecision?.confidence ||
          null,
        reportedRisk:
          decision?.decision?.risk?.level ||
          scenario?.sourceDecision?.reportedRisk ||
          null,
        scenarioStatus: favoredScenario?.status || null,
        dataQuality:
          master?.dataQuality?.overall ||
          master?.dataQuality?.status ||
          master?.dataQuality ||
          null,
        shariah:
          decision?.decision?.shariah ||
          scenario?.shariah ||
          master?.data?.shariah ||
          null
      }
    );

    console.dir(
      {
        success: result.success,
        symbol: result.symbol,
        inputs: result.inputs,
        riskSummary: result.riskSummary,
        rewardRisk: result.rewardRisk,
        inheritedContext: result.inheritedContext,
        warnings: result.warnings,
        controls: result.controls,
        durationMs: result?.performance?.durationMs ?? null,
        error: result.error || null
      },
      {
        depth: null,
        colors: true
      }
    );

    if (!result.success) {
      process.exitCode = 1;
    }
  } catch (error) {
    console.error("Phase 4C test failed:", error);
    process.exitCode = 1;
  }
}

run();