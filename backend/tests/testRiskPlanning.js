"use strict";

require("dotenv").config({ quiet: true });

const { getMasterAnalysis } = require("../services/masterAnalysisService");
const { createDecisionReport } = require("../services/decisionEngineService");
const { createScenarioPlan } = require("../services/scenarioPlanningService");
const { calculateRiskPlan } = require("../services/riskPlanningService");

function numberArg(index, fallback) {
  const value = process.argv[index];
  if (value === undefined) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

async function run() {
  const symbol = String(process.argv[2] || "AAPL").trim().toUpperCase();
  const direction = String(process.argv[3] || "LONG").trim().toUpperCase();
  const accountSize = numberArg(4, 50000);
  const riskPercent = numberArg(5, 1);
  const entryPrice = numberArg(6, 333.5);
  const invalidationPrice = numberArg(7, 317.4);
  const targetPrice = process.argv[8] === undefined
    ? 360
    : numberArg(8, null);

  console.log(`\nTesting Phase 4C Risk Planning for ${symbol}...\n`);

  try {
    const master = await getMasterAnalysis(symbol);
    const decision = createDecisionReport(master);
    const scenario = createScenarioPlan(decision);

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
        scenarioStatus:
          scenario?.bullishScenario?.status ||
          scenario?.bearishScenario?.status ||
          scenario?.neutralScenario?.status ||
          null,
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

    console.dir(result, { depth: null, colors: true });

    if (!result.success) process.exitCode = 1;
  } catch (error) {
    console.error("Phase 4C test failed:", error);
    process.exitCode = 1;
  }
}

run();
