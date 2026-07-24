"use strict";

const assert = require("node:assert/strict");

const {
  normalizeHalalTerminalResponse,
} = require("../providers/halalTerminalProvider");
const {
  transformProviderResult,
} = require("../services/shariahComplianceService");

function createConflictingProviderPayload() {
  return {
    symbol: "AAPL",
    name: "Apple Inc.",
    is_compliant: true,
    shariah_compliance_status: "COMPLIANT",
    compliance_explanation:
      "Provider-level aggregate status should not override AAOIFI.",
    last_checked_at: "2026-07-24T10:00:00.000Z",
    is_stale: false,
    by_methodology: {
      AAOIFI: {
        is_compliant: false,
        verified: true,
        basis: "assets",
        reason: "AAOIFI debt threshold was exceeded.",
      },
      DJIM: {
        is_compliant: true,
        verified: true,
        basis: "market_cap",
        reason: "DJIM screening passed.",
      },
      MAQASID_LAB: {
        is_compliant: true,
        verified: false,
        reason: "Future methodology retained for extensibility.",
      },
    },
  };
}

function run() {
  const normalized = normalizeHalalTerminalResponse(
    createConflictingProviderPayload(),
    {
      dataMode: "fixture",
      fixture: true,
    }
  );
  const result = transformProviderResult(normalized);

  assert.equal(result.success, true);
  assert.equal(result.summary.methodologyId, "AAOIFI");
  assert.equal(result.summary.status, "NON_COMPLIANT");
  assert.match(result.summary.headline, /AAOIFI/);
  assert.doesNotMatch(result.summary.headline, /all available/i);
  assert.equal(result.primaryMethodology.id, "AAOIFI");
  assert.equal(result.primaryMethodology.status, "NON_COMPLIANT");
  assert.equal(result.methodologies.primary, "AAOIFI");
  assert.equal(
    result.methodologies.results.DJIM.status,
    "COMPLIANT"
  );
  assert.equal(
    result.methodologies.results.MAQASID_LAB.status,
    "COMPLIANT"
  );
  assert.equal(
    Object.hasOwn(result.summary, "methodologiesTotal"),
    false
  );

  const missingAAOIFI = transformProviderResult(
    normalizeHalalTerminalResponse({
      symbol: "TEST",
      name: "Test Company",
      is_compliant: true,
      by_methodology: {
        DJIM: {
          is_compliant: true,
          verified: true,
        },
      },
    })
  );

  assert.equal(missingAAOIFI.summary.status, "UNKNOWN");
  assert.equal(
    missingAAOIFI.primaryMethodology.status,
    "UNKNOWN"
  );

  const currentDocumentedShape = transformProviderResult(
    normalizeHalalTerminalResponse({
      symbol: "AAPL",
      name: "Apple Inc.",
      overall_status: "COMPLIANT",
      methodologies: {
        AAOIFI: "COMPLIANT",
        DJIM: "COMPLIANT",
        FTSE: "COMPLIANT",
        MSCI: "COMPLIANT",
        "S&P": "COMPLIANT",
      },
      purification_rate: 0.42,
    })
  );

  assert.equal(currentDocumentedShape.summary.status, "COMPLIANT");
  assert.equal(
    currentDocumentedShape.primaryMethodology.status,
    "COMPLIANT"
  );
  assert.equal(
    currentDocumentedShape.methodologies.results.AAOIFI.isCompliant,
    true
  );
  assert.equal(
    currentDocumentedShape.summary.purificationRateFormatted,
    "0.42%"
  );

  const unavailable = transformProviderResult({
    success: false,
    symbol: "MISS",
    error: {
      code: "TEST_UNAVAILABLE",
      message: "Fixture unavailable.",
    },
  });

  assert.equal(unavailable.success, false);
  assert.equal(unavailable.summary.status, "UNKNOWN");
  assert.equal(unavailable.summary.methodologyId, "AAOIFI");
  assert.equal(unavailable.methodologies.primary, "AAOIFI");

  console.log(
    "AAOIFI primary-methodology tests passed with conflicting secondary results retained but not promoted."
  );
}

try {
  run();
} catch (error) {
  console.error("AAOIFI primary-methodology test failed:");
  console.error(error);
  process.exitCode = 1;
}
