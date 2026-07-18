/**
 * AlphaLens AI — Phase 4A Decision Engine Test
 *
 * Run:
 *   node tests/testDecisionEngine.js AAPL
 */

"use strict";

/**
 * Load environment variables before importing services.
 * Some providers validate API keys during service execution.
 */
require("dotenv").config();

const {
  getMasterAnalysis
} = require("../services/masterAnalysisService");

const {
  createDecisionReport
} = require("../services/decisionEngineService");

async function run() {
  const symbol = String(process.argv[2] || "AAPL")
    .trim()
    .toUpperCase();

  console.log(
    `\nTesting Phase 4A Decision Engine for ${symbol}...\n`
  );

  try {
    const master = await getMasterAnalysis(symbol);
    const result = createDecisionReport(master);

    const output = {
      success: result.success,
      symbol: result?.decision?.symbol || symbol,
      headline: result?.decision?.headline || null,
      marketBias: result?.decision?.marketBias || null,
      directionalScore:
        result?.decision?.technicalScore?.directionalScore ?? null,
      normalizedScore:
        result?.decision?.technicalScore?.normalizedScore ?? null,
      confidence:
        result?.decision?.confidence || null,
      currentPrice:
        result?.decision?.marketContext?.currentPrice ?? null,
      support:
        result?.decision?.levels?.nearestSupport ?? null,
      resistance:
        result?.decision?.levels?.nearestResistance ?? null,
      risk:
        result?.decision?.risk?.level || null,
      shariah:
        result?.decision?.shariah || null,
      bullishReasons:
        result?.decision?.evidence?.bullish
          ?.slice(0, 5)
          ?.map((item) => item.statement) || [],
      bearishReasons:
        result?.decision?.evidence?.bearish
          ?.slice(0, 5)
          ?.map((item) => item.statement) || [],
      warnings:
        result?.decision?.warnings || [],
      durationMs:
        result?.performance?.durationMs ?? null,
      error:
        result?.error || null
    };

    console.dir(output, {
      depth: null,
      colors: true
    });

    if (!result.success) {
      process.exitCode = 1;
    }
  } catch (error) {
    console.error("Phase 4A test failed:", error);
    process.exitCode = 1;
  }
}

run();