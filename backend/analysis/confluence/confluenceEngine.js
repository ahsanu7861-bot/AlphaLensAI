// ==================================================
// AzaLens
// Market Confluence Engine
// ==================================================

const DEFAULT_OPTIONS = {
  clusterThresholdPercent: 1,
  maximumZones: 10,
  minimumConfluenceScore: 15,
  proximityThresholdPercent: 2,
  actionableDistancePercent: 5,
  minimumActionableSourceCount: 2,
  minimumActionableScore: 40
};

const SOURCE_WEIGHTS = {
  "Support & Resistance": 30,
  Fibonacci: 22,
  EMA: 18,
  SMA: 16,
  "Bollinger Bands": 14
};

// ==================================================
// Numeric Helpers
// ==================================================

function toFiniteNumber(
  value,
  fallback = null
) {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
}

function round(
  value,
  decimals = 2
) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return null;
  }

  const multiplier =
    10 ** decimals;

  return (
    Math.round(
      number * multiplier
    ) / multiplier
  );
}

function calculatePercentDistance(
  firstValue,
  secondValue
) {
  const first =
    toFiniteNumber(firstValue);

  const second =
    toFiniteNumber(secondValue);

  if (
    first === null ||
    second === null ||
    second === 0
  ) {
    return null;
  }

  return round(
    (
      Math.abs(
        first - second
      ) /
      Math.abs(second)
    ) * 100,
    2
  );
}

function normalizeLabel(
  value,
  fallback
) {
  const label =
    String(value || "")
      .trim();

  return label || fallback;
}

// ==================================================
// Generic Value Extraction
// ==================================================

function findFirstFiniteNumber(
  object,
  paths
) {
  for (const path of paths) {
    const parts =
      path.split(".");

    let value =
      object;

    for (const part of parts) {
      value =
        value?.[part];
    }

    const number =
      toFiniteNumber(value);

    if (number !== null) {
      return number;
    }
  }

  return null;
}

// ==================================================
// Candidate Builder
// ==================================================

function buildCandidate({
  source,
  label,
  price,
  role = "reference",
  baseWeight,
  sourceStrength = null,
  metadata = null
}) {
  const normalizedPrice =
    toFiniteNumber(price);

  if (
    normalizedPrice === null ||
    normalizedPrice <= 0
  ) {
    return null;
  }

  return {
    source,
    label,

    price:
      normalizedPrice,

    role,

    baseWeight:
      toFiniteNumber(
        baseWeight,
        0
      ),

    sourceStrength:
      toFiniteNumber(
        sourceStrength
      ),

    metadata
  };
}

// ==================================================
// Support & Resistance Extraction
// ==================================================

function extractSupportResistanceCandidates(
  supportResistance
) {
  if (
    supportResistance?.success !==
    true
  ) {
    return [];
  }

  const candidates = [];

  const groups = [
    {
      items:
        Array.isArray(
          supportResistance.support
        )
          ? supportResistance.support
          : [],

      role:
        "support"
    },
    {
      items:
        Array.isArray(
          supportResistance.resistance
        )
          ? supportResistance.resistance
          : [],

      role:
        "resistance"
    }
  ];

  groups.forEach(
    ({
      items,
      role
    }) => {
      items.forEach(
        (zone, index) => {
          const price =
            toFiniteNumber(
              zone?.zone?.center
            ) ??
            toFiniteNumber(
              zone?.zone?.low
            ) ??
            toFiniteNumber(
              zone?.price
            );

          const strengthScore =
            toFiniteNumber(
              zone?.strengthScore
            ) ??
            toFiniteNumber(
              zone?.strength
            );

          const candidate =
            buildCandidate({
              source:
                "Support & Resistance",

              label:
                `${
                  role === "support"
                    ? "Support"
                    : "Resistance"
                } Zone ${index + 1}`,

              price,

              role,

              baseWeight:
                SOURCE_WEIGHTS[
                  "Support & Resistance"
                ],

              sourceStrength:
                strengthScore,

              metadata: {
                originalType:
                  zone?.type ||
                  role,

                classification:
                  zone?.classification ||
                  null,

                touches:
                  toFiniteNumber(
                    zone?.touches,
                    0
                  ),

                zone:
                  zone?.zone ||
                  null
              }
            });

          if (candidate) {
            candidates.push(
              candidate
            );
          }
        }
      );
    }
  );

  return candidates;
}

// ==================================================
// Fibonacci Extraction
// ==================================================

function extractFibonacciCandidates(
  fibonacci
) {
  if (
    fibonacci?.success !== true ||
    !Array.isArray(
      fibonacci.levels
    )
  ) {
    return [];
  }

  return fibonacci.levels
    .map(
      (level) =>
        buildCandidate({
          source:
            "Fibonacci",

          label:
            `${normalizeLabel(
              level?.name,
              "Fib"
            )} Fibonacci`,

          price:
            level?.price,

          role:
            "retracement",

          baseWeight:
            SOURCE_WEIGHTS
              .Fibonacci,

          metadata: {
            ratio:
              toFiniteNumber(
                level?.ratio
              ),

            direction:
              fibonacci
                ?.direction ||
              null,

            swingSource:
              fibonacci
                ?.swing
                ?.source ||
              null
          }
        })
    )
    .filter(Boolean);
}

// ==================================================
// EMA and SMA Extraction
// ==================================================

function extractMovingAverageCandidates(
  indicators
) {
  const candidates = [];

  const ema =
    indicators?.ema;

  const sma =
    indicators?.sma;

  if (
    ema?.success === true
  ) {
    const emaDefinitions = [
      [
        "EMA 9",
        [
          "ema9",
          "data.ema9",
          "values.ema9",
          "result.ema9",
          "shortEMA",
          "data.shortEMA"
        ]
      ],
      [
        "EMA 12",
        [
          "ema12",
          "data.ema12",
          "values.ema12",
          "result.ema12"
        ]
      ],
      [
        "EMA 20",
        [
          "ema20",
          "data.ema20",
          "values.ema20",
          "result.ema20"
        ]
      ],
      [
        "EMA 26",
        [
          "ema26",
          "data.ema26",
          "values.ema26",
          "result.ema26"
        ]
      ],
      [
        "EMA 50",
        [
          "ema50",
          "data.ema50",
          "values.ema50",
          "result.ema50",
          "mediumEMA",
          "data.mediumEMA"
        ]
      ],
      [
        "EMA 100",
        [
          "ema100",
          "data.ema100",
          "values.ema100",
          "result.ema100"
        ]
      ],
      [
        "EMA 200",
        [
          "ema200",
          "data.ema200",
          "values.ema200",
          "result.ema200",
          "longEMA",
          "data.longEMA"
        ]
      ]
    ];

    emaDefinitions.forEach(
      ([label, paths]) => {
        const candidate =
          buildCandidate({
            source:
              "EMA",

            label,

            price:
              findFirstFiniteNumber(
                ema,
                paths
              ),

            role:
              "moving-average",

            baseWeight:
              SOURCE_WEIGHTS.EMA,

            metadata: {
              signal:
                ema?.signal ||
                null
            }
          });

        if (candidate) {
          candidates.push(
            candidate
          );
        }
      }
    );
  }

  if (
    sma?.success === true
  ) {
    const smaDefinitions = [
      [
        "SMA 20",
        [
          "sma20",
          "data.sma20",
          "values.sma20",
          "result.sma20",
          "shortSMA",
          "data.shortSMA"
        ]
      ],
      [
        "SMA 50",
        [
          "sma50",
          "data.sma50",
          "values.sma50",
          "result.sma50",
          "mediumSMA",
          "data.mediumSMA"
        ]
      ],
      [
        "SMA 100",
        [
          "sma100",
          "data.sma100",
          "values.sma100",
          "result.sma100"
        ]
      ],
      [
        "SMA 200",
        [
          "sma200",
          "data.sma200",
          "values.sma200",
          "result.sma200",
          "longSMA",
          "data.longSMA"
        ]
      ]
    ];

    smaDefinitions.forEach(
      ([label, paths]) => {
        const candidate =
          buildCandidate({
            source:
              "SMA",

            label,

            price:
              findFirstFiniteNumber(
                sma,
                paths
              ),

            role:
              "moving-average",

            baseWeight:
              SOURCE_WEIGHTS.SMA,

            metadata: {
              signal:
                sma?.signal ||
                null
            }
          });

        if (candidate) {
          candidates.push(
            candidate
          );
        }
      }
    );
  }

  return candidates;
}

// ==================================================
// Bollinger Band Extraction
// ==================================================

function extractBollingerCandidates(
  indicators
) {
  const bollinger =
    indicators?.bollinger;

  if (
    bollinger?.success !== true
  ) {
    return [];
  }

  const definitions = [
    {
      label:
        "Bollinger Upper Band",

      role:
        "dynamic-resistance",

      paths: [
        "upper",
        "upperBand",
        "data.upper",
        "data.upperBand",
        "bands.upper",
        "result.upper"
      ]
    },
    {
      label:
        "Bollinger Middle Band",

      role:
        "mean",

      paths: [
        "middle",
        "middleBand",
        "basis",
        "data.middle",
        "data.middleBand",
        "bands.middle",
        "result.middle"
      ]
    },
    {
      label:
        "Bollinger Lower Band",

      role:
        "dynamic-support",

      paths: [
        "lower",
        "lowerBand",
        "data.lower",
        "data.lowerBand",
        "bands.lower",
        "result.lower"
      ]
    }
  ];

  return definitions
    .map(
      (definition) =>
        buildCandidate({
          source:
            "Bollinger Bands",

          label:
            definition.label,

          price:
            findFirstFiniteNumber(
              bollinger,
              definition.paths
            ),

          role:
            definition.role,

          baseWeight:
            SOURCE_WEIGHTS[
              "Bollinger Bands"
            ],

          metadata: {
            signal:
              bollinger?.signal ||
              null
          }
        })
    )
    .filter(Boolean);
}

// ==================================================
// Candidate Extraction
// ==================================================

function extractCandidates({
  marketStructure,
  indicators
}) {
  const supportResistance =
    marketStructure
      ?.supportResistance;

  const fibonacci =
    marketStructure
      ?.fibonacci;

  return [
    ...extractSupportResistanceCandidates(
      supportResistance
    ),

    ...extractFibonacciCandidates(
      fibonacci
    ),

    ...extractMovingAverageCandidates(
      indicators
    ),

    ...extractBollingerCandidates(
      indicators
    )
  ];
}

// ==================================================
// Volume Context
// ==================================================

function calculateVolumeContext(
  indicators
) {
  const rvol =
    indicators?.rvol;

  const volumeSpike =
    indicators?.volumeSpike;

  const obv =
    indicators?.obv;

  const relativeVolume =
    findFirstFiniteNumber(
      rvol,
      [
        "rvol",
        "value",
        "data.rvol",
        "data.value",
        "relativeVolume",
        "data.relativeVolume"
      ]
    );

  const spikeDetected =
    volumeSpike?.success ===
      true &&
    (
      volumeSpike?.spike ===
        true ||
      volumeSpike?.isSpike ===
        true ||
      volumeSpike?.data
        ?.spike === true ||
      volumeSpike?.data
        ?.isSpike === true ||
      String(
        volumeSpike?.signal ||
        ""
      )
        .toLowerCase()
        .includes("spike")
    );

  const obvSignal =
    String(
      obv?.signal ||
      ""
    ).trim() || null;

  let multiplier = 1;

  const evidence = [];

  if (
    relativeVolume !== null
  ) {
    if (
      relativeVolume >= 2
    ) {
      multiplier += 0.15;

      evidence.push(
        `Very high relative volume (${round(
          relativeVolume,
          2
        )}x).`
      );
    } else if (
      relativeVolume >= 1.5
    ) {
      multiplier += 0.1;

      evidence.push(
        `High relative volume (${round(
          relativeVolume,
          2
        )}x).`
      );
    } else if (
      relativeVolume >= 1.1
    ) {
      multiplier += 0.05;

      evidence.push(
        `Above-average relative volume (${round(
          relativeVolume,
          2
        )}x).`
      );
    } else if (
      relativeVolume < 0.75
    ) {
      multiplier -= 0.05;

      evidence.push(
        `Below-average relative volume (${round(
          relativeVolume,
          2
        )}x).`
      );
    }
  }

  if (spikeDetected) {
    multiplier += 0.1;

    evidence.push(
      "A recent volume spike was detected."
    );
  }

  if (obvSignal) {
    const normalizedSignal =
      obvSignal.toLowerCase();

    if (
      normalizedSignal
        .includes("bull") ||
      normalizedSignal
        .includes("accum")
    ) {
      multiplier += 0.05;

      evidence.push(
        `OBV evidence: ${obvSignal}.`
      );
    } else if (
      normalizedSignal
        .includes("bear") ||
      normalizedSignal
        .includes("distrib")
    ) {
      multiplier += 0.05;

      evidence.push(
        `OBV evidence: ${obvSignal}.`
      );
    }
  }

  return {
    multiplier:
      round(
        Math.max(
          0.8,
          Math.min(
            multiplier,
            1.3
          )
        ),
        2
      ),

    relativeVolume,

    spikeDetected,

    obvSignal,

    evidence
  };
}

// ==================================================
// Clustering
// ==================================================

function areCandidatesNear(
  first,
  second,
  thresholdPercent
) {
  const reference =
    (
      Math.abs(first.price) +
      Math.abs(second.price)
    ) / 2;

  if (
    !Number.isFinite(
      reference
    ) ||
    reference === 0
  ) {
    return false;
  }

  const distance =
    (
      Math.abs(
        first.price -
        second.price
      ) /
      reference
    ) * 100;

  return (
    distance <=
    thresholdPercent
  );
}

function clusterCandidates(
  candidates,
  thresholdPercent
) {
  const sorted =
    [...candidates].sort(
      (first, second) =>
        first.price -
        second.price
    );

  const clusters = [];

  sorted.forEach(
    (candidate) => {
      const matchingCluster =
        clusters.find(
          (cluster) =>
            areCandidatesNear(
              candidate,
              {
                price:
                  cluster.center
              },
              thresholdPercent
            )
        );

      if (!matchingCluster) {
        clusters.push({
          candidates: [
            candidate
          ],

          center:
            candidate.price
        });

        return;
      }

      matchingCluster
        .candidates
        .push(candidate);

      matchingCluster.center =
        matchingCluster
          .candidates
          .reduce(
            (
              sum,
              item
            ) =>
              sum +
              item.price,
            0
          ) /
        matchingCluster
          .candidates
          .length;
    }
  );

  return clusters;
}

// ==================================================
// Zone Role
// ==================================================

function determineZoneRole(
  center,
  currentPrice,
  candidates
) {
  if (
    Number.isFinite(
      currentPrice
    )
  ) {
    if (
      center <
      currentPrice
    ) {
      return "support-candidate";
    }

    if (
      center >
      currentPrice
    ) {
      return "resistance-candidate";
    }

    return "at-current-price";
  }

  const supportVotes =
    candidates.filter(
      (candidate) =>
        String(
          candidate.role
        ).includes(
          "support"
        )
    ).length;

  const resistanceVotes =
    candidates.filter(
      (candidate) =>
        String(
          candidate.role
        ).includes(
          "resistance"
        )
    ).length;

  if (
    supportVotes >
    resistanceVotes
  ) {
    return "support-candidate";
  }

  if (
    resistanceVotes >
    supportVotes
  ) {
    return "resistance-candidate";
  }

  return "reference-zone";
}

// ==================================================
// Scoring
// ==================================================

function calculateClusterScore(
  cluster,
  volumeContext
) {
  const distinctSources =
    [
      ...new Set(
        cluster.candidates.map(
          (candidate) =>
            candidate.source
        )
      )
    ];

  const baseScore =
    cluster.candidates.reduce(
      (
        sum,
        candidate
      ) => {
        let candidateScore =
          candidate.baseWeight;

        if (
          candidate.sourceStrength !==
          null
        ) {
          const normalizedStrength =
            Math.max(
              0,
              Math.min(
                candidate
                  .sourceStrength,
                100
              )
            );

          candidateScore *=
            0.75 +
            normalizedStrength /
              400;
        }

        return (
          sum +
          candidateScore
        );
      },
      0
    );

  const diversityBonus =
    Math.max(
      0,
      distinctSources.length -
        1
    ) * 12;

  const levelBonus =
    Math.max(
      0,
      cluster.candidates.length -
        1
    ) * 4;

  const rawScore =
    (
      baseScore +
      diversityBonus +
      levelBonus
    ) *
    volumeContext.multiplier;

  return {
    score:
      round(
        Math.min(
          rawScore,
          100
        ),
        1
      ),

    rawScore:
      round(
        rawScore,
        2
      ),

    distinctSources,

    diversityBonus,

    levelBonus
  };
}

function classifyScore(
  score
) {
  if (score >= 80) {
    return "Very Strong";
  }

  if (score >= 60) {
    return "Strong";
  }

  if (score >= 40) {
    return "Moderate";
  }

  return "Weak";
}

// ==================================================
// Zone Builder
// ==================================================

function buildZone(
  cluster,
  currentPrice,
  volumeContext,
  index
) {
  const prices =
    cluster.candidates.map(
      (candidate) =>
        candidate.price
    );

  const low =
    Math.min(...prices);

  const high =
    Math.max(...prices);

  const center =
    prices.reduce(
      (
        sum,
        price
      ) =>
        sum + price,
      0
    ) /
    prices.length;

  const scoring =
    calculateClusterScore(
      cluster,
      volumeContext
    );

  const distancePercent =
    calculatePercentDistance(
      currentPrice,
      center
    );

  return {
    id:
      `CZ-${index + 1}`,

    zone: {
      low:
        round(
          low,
          2
        ),

      high:
        round(
          high,
          2
        ),

      center:
        round(
          center,
          2
        ),

      width:
        round(
          high - low,
          2
        ),

      widthPercent:
        calculatePercentDistance(
          high,
          low
        )
    },

    role:
      determineZoneRole(
        center,
        currentPrice,
        cluster.candidates
      ),

    score:
      scoring.score,

    classification:
      classifyScore(
        scoring.score
      ),

    distancePercent,

    sourceCount:
      scoring
        .distinctSources
        .length,

    levelCount:
      cluster
        .candidates
        .length,

    sources:
      scoring
        .distinctSources,

    evidence:
      cluster.candidates.map(
        (candidate) => ({
          source:
            candidate.source,

          label:
            candidate.label,

          price:
            round(
              candidate.price,
              2
            ),

          role:
            candidate.role,

          baseWeight:
            candidate.baseWeight,

          sourceStrength:
            candidate
              .sourceStrength,

          metadata:
            candidate.metadata
        })
      ),

    scoring: {
      rawScore:
        scoring.rawScore,

      diversityBonus:
        scoring.diversityBonus,

      levelBonus:
        scoring.levelBonus,

      volumeMultiplier:
        volumeContext.multiplier
    }
  };
}

// ==================================================
// Nearest Zone
// ==================================================

function findNearestZone(
  zones,
  role
) {
  const filtered =
    zones.filter(
      (zone) =>
        zone.role === role &&
        zone.distancePercent !==
          null
    );

  if (
    filtered.length === 0
  ) {
    return null;
  }

  return [...filtered]
    .sort(
      (
        first,
        second
      ) =>
        first
          .distancePercent -
        second
          .distancePercent
    )[0];
}

function findActionableZone(
  zones,
  configuration
) {
  return (
    zones.find(
      (zone) =>
        zone.distancePercent !== null &&
        zone.distancePercent <=
          configuration.actionableDistancePercent &&
        zone.sourceCount >=
          configuration.minimumActionableSourceCount &&
        zone.score >=
          configuration.minimumActionableScore
    ) || null
  );
}

// ==================================================
// Interpretation
// ==================================================

function buildInterpretation(
  zones,
  actionableZone,
  nearestSupport,
  nearestResistance,
  volumeContext,
  configuration
) {
  const strongestZone =
    zones[0] ||
    null;

  const observations = [];

  if (strongestZone) {
    observations.push(
      `The strongest confluence zone is centered near ${strongestZone.zone.center} with a ${strongestZone.classification.toLowerCase()} score of ${strongestZone.score}.`
    );
  }

  if (actionableZone) {
    observations.push(
      `The current swing-actionable confluence zone is centered near ${actionableZone.zone.center}, approximately ${actionableZone.distancePercent}% from the current price.`
    );
  } else {
    observations.push(
      `No multi-source confluence zone meets the immediate ${configuration.actionableDistancePercent}% swing window.`
    );
  }

  if (nearestSupport) {
    observations.push(
      `The nearest support candidate is centered near ${nearestSupport.zone.center}, approximately ${nearestSupport.distancePercent}% below the current price.`
    );
  }

  if (nearestResistance) {
    observations.push(
      `The nearest resistance candidate is centered near ${nearestResistance.zone.center}, approximately ${nearestResistance.distancePercent}% above the current price.`
    );
  }

  if (
    volumeContext
      .evidence
      .length > 0
  ) {
    observations.push(
      ...volumeContext
        .evidence
    );
  }

  return {
    summary:
      "Confluence zones combine independent technical references that occur near the same price. Higher scores indicate more agreement, not a buy or sell instruction.",

    observations
  };
}

// ==================================================
// Main Confluence Engine
// ==================================================

function analyzeConfluence({
  symbol,
  currentPrice,
  marketStructure,
  indicators,
  options = {}
}) {
  const startedAt =
    Date.now();

  const normalizedSymbol =
    String(symbol || "")
      .trim()
      .toUpperCase();

  const configuration = {
    ...DEFAULT_OPTIONS,
    ...options
  };

  const analysisPrice =
    toFiniteNumber(
      currentPrice
    );

  const candidates =
    extractCandidates({
      marketStructure,
      indicators
    });

  if (
    candidates.length === 0
  ) {
    return {
      success:
        false,

      provider:
        "AzaLens",

      symbol:
        normalizedSymbol,

      error:
        "No valid technical levels were available for confluence analysis.",

      dataSource:
        "Existing Analysis Results",

      performance: {
        durationMs:
          Date.now() -
          startedAt
      }
    };
  }

  const volumeContext =
    calculateVolumeContext(
      indicators
    );

  const clusters =
    clusterCandidates(
      candidates,
      configuration
        .clusterThresholdPercent
    );

  const zones =
    clusters
      .map(
        (
          cluster,
          index
        ) =>
          buildZone(
            cluster,
            analysisPrice,
            volumeContext,
            index
          )
      )
      .filter(
        (zone) =>
          zone.score >=
          configuration
            .minimumConfluenceScore
      )
      .sort(
        (
          first,
          second
        ) => {
          if (
            second.score !==
            first.score
          ) {
            return (
              second.score -
              first.score
            );
          }

          return (
            (
              first
                .distancePercent ??
              Infinity
            ) -
            (
              second
                .distancePercent ??
              Infinity
            )
          );
        }
      )
      .slice(
        0,
        configuration
          .maximumZones
      )
      .map(
        (
          zone,
          index
        ) => ({
          ...zone,

          rank:
            index + 1,

          nearCurrentPrice:
            zone
              .distancePercent !==
              null &&
            zone
              .distancePercent <=
              configuration
                .proximityThresholdPercent
        })
      );

  const nearestSupport =
    findNearestZone(
      zones,
      "support-candidate"
    );

  const nearestResistance =
    findNearestZone(
      zones,
      "resistance-candidate"
    );

  const actionableZone =
    findActionableZone(
      zones,
      configuration
    );

  const interpretation =
    buildInterpretation(
      zones,
      actionableZone,
      nearestSupport,
      nearestResistance,
      volumeContext,
      configuration
    );

  const warnings = [];

  if (!nearestSupport) {
    warnings.push(
      "No confluence support candidate was found below the current price."
    );
  }

  if (!nearestResistance) {
    warnings.push(
      "No confluence resistance candidate was found above the current price."
    );
  }

  if (
    zones.length === 0
  ) {
    warnings.push(
      "No cluster met the minimum confluence score."
    );
  }

  if (
    zones.length > 0 &&
    !actionableZone
  ) {
    warnings.push(
      `No multi-source confluence zone met the immediate ${configuration.actionableDistancePercent}% swing window.`
    );
  }

  return {
    success:
      true,

    provider:
      "AzaLens",

    symbol:
      normalizedSymbol,

    currentPrice:
      round(
        analysisPrice,
        2
      ),

    strongestZone:
      zones[0] ||
      null,

    actionableZone,

    nearestSupport,

    nearestResistance,

    zones,

    volumeContext,

    interpretation,

    statistics: {
      candidatesExtracted:
        candidates.length,

      clustersCreated:
        clusters.length,

      zonesReturned:
        zones.length,

      sourcesAvailable:
        [
          ...new Set(
            candidates.map(
              (candidate) =>
                candidate.source
            )
          )
        ],

      zonesNearCurrentPrice:
        zones.filter(
          (zone) =>
            zone.nearCurrentPrice
        ).length
    },

    methodology: {
      clusterThresholdPercent:
        configuration
          .clusterThresholdPercent,

      proximityThresholdPercent:
        configuration
          .proximityThresholdPercent,

      actionableDistancePercent:
        configuration
          .actionableDistancePercent,

      minimumActionableSourceCount:
        configuration
          .minimumActionableSourceCount,

      minimumActionableScore:
        configuration
          .minimumActionableScore,

      minimumConfluenceScore:
        configuration
          .minimumConfluenceScore,

      maximumZones:
        configuration
          .maximumZones,

      sourceWeights:
        SOURCE_WEIGHTS,

      scoringNote:
        "Scores combine source weights, source diversity, the number of nearby levels, support/resistance strength where available, and volume context."
    },

    warnings:
      [...new Set(warnings)],

    dataSource:
      "Existing Analysis Results",

    performance: {
      durationMs:
        Date.now() -
        startedAt
    }
  };
}

// ==================================================
// Exports
// ==================================================

module.exports = {
  analyzeConfluence,
  extractCandidates,
  clusterCandidates,
  calculateVolumeContext
};
