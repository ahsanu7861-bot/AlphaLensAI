"use strict";

const assert = require("node:assert/strict");

const {
  analyzeConfluence,
} = require("../analysis/confluence/confluenceEngine");

function buildInput(includeNearbySecondSource = false) {
  return {
    symbol: "TEST",
    currentPrice: 100,
    marketStructure: {
      supportResistance: {
        success: true,
        support: [
          {
            zone: { low: 98, high: 98, center: 98 },
            strengthScore: 60,
            classification: "Moderate",
          },
          {
            zone: { low: 89, high: 89, center: 89 },
            strengthScore: 75,
            classification: "Strong",
          },
        ],
        resistance: [],
      },
      fibonacci: {
        success: true,
        direction: "Uptrend",
        levels: [
          { name: "38.2%", ratio: 0.382, price: 88.8 },
          { name: "50%", ratio: 0.5, price: 89.2 },
        ],
      },
    },
    indicators: {
      ema: {
        success: includeNearbySecondSource,
        ema20: 98.2,
        signal: "Price Above EMA",
      },
      sma: {
        success: true,
        sma50: 89.1,
        signal: "Price Above SMA",
      },
    },
  };
}

function run() {
  const distantOnly = analyzeConfluence(buildInput(false));

  assert.equal(distantOnly.success, true);
  assert.equal(distantOnly.nearestSupport.zone.center, 98);
  assert.ok(distantOnly.strongestZone.distancePercent > 5);
  assert.equal(distantOnly.actionableZone, null);
  assert.match(
    distantOnly.warnings.join(" "),
    /No multi-source confluence zone met the immediate 5% swing window/
  );

  const nearbyMultiSource = analyzeConfluence(buildInput(true));

  assert.equal(nearbyMultiSource.success, true);
  assert.ok(nearbyMultiSource.actionableZone);
  assert.ok(nearbyMultiSource.actionableZone.distancePercent <= 5);
  assert.ok(nearbyMultiSource.actionableZone.sourceCount >= 2);
  assert.ok(nearbyMultiSource.actionableZone.score >= 40);

  console.log(
    "Confluence actionability tests passed: structural strength remains separate from immediate swing relevance."
  );
}

try {
  run();
} catch (error) {
  console.error("Confluence actionability test failed:");
  console.error(error);
  process.exitCode = 1;
}
