// ==================================================
// AzaLens
// Fibonacci Retracement Engine
// ==================================================

const DEFAULT_OPTIONS = {
  pivotWindow: 5,
  lookbackBars: 100,
  minimumBars: 20,
  proximityThresholdPercent: 1
};

const FIBONACCI_RATIOS = [
  { name: "0%", ratio: 0 },
  { name: "23.6%", ratio: 0.236 },
  { name: "38.2%", ratio: 0.382 },
  { name: "50%", ratio: 0.5 },
  { name: "61.8%", ratio: 0.618 },
  { name: "78.6%", ratio: 0.786 },
  { name: "100%", ratio: 1 }
];

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

// ==================================================
// Date Normalization
// ==================================================

function normalizeDate(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  if (
    typeof value === "number"
  ) {
    const milliseconds =
      value > 1000000000000
        ? value
        : value * 1000;

    const date =
      new Date(milliseconds);

    return Number.isNaN(
      date.getTime()
    )
      ? null
      : date.toISOString();
  }

  const date =
    new Date(value);

  return Number.isNaN(
    date.getTime()
  )
    ? String(value)
    : date.toISOString();
}

// ==================================================
// Bar Normalization
// ==================================================

function normalizeBars(history) {
  if (
    Array.isArray(history)
  ) {
    return history
      .map(
        (bar, index) => ({
          index,

          date:
            bar?.date ??
            bar?.timestamp ??
            bar?.time ??
            null,

          normalizedDate:
            normalizeDate(
              bar?.date ??
              bar?.timestamp ??
              bar?.time
            ),

          open:
            toFiniteNumber(
              bar?.open ??
              bar?.o
            ),

          high:
            toFiniteNumber(
              bar?.high ??
              bar?.h
            ),

          low:
            toFiniteNumber(
              bar?.low ??
              bar?.l
            ),

          close:
            toFiniteNumber(
              bar?.close ??
              bar?.c
            ),

          volume:
            toFiniteNumber(
              bar?.volume ??
              bar?.v,
              0
            )
        })
      )
      .filter(
        (bar) =>
          bar.high !== null &&
          bar.low !== null &&
          bar.close !== null
      );
  }

  const bars =
    Array.isArray(
      history?.bars
    )
      ? history.bars
      : null;

  if (bars) {
    return normalizeBars(bars);
  }

  const data =
    history?.data;

  const open =
    Array.isArray(data?.o)
      ? data.o
      : [];

  const high =
    Array.isArray(data?.h)
      ? data.h
      : [];

  const low =
    Array.isArray(data?.l)
      ? data.l
      : [];

  const close =
    Array.isArray(data?.c)
      ? data.c
      : [];

  const volume =
    Array.isArray(data?.v)
      ? data.v
      : [];

  const timestamps =
    Array.isArray(data?.t)
      ? data.t
      : [];

  const length =
    Math.min(
      high.length,
      low.length,
      close.length
    );

  const normalizedBars = [];

  for (
    let index = 0;
    index < length;
    index += 1
  ) {
    normalizedBars.push({
      index,

      date:
        timestamps[index] ??
        null,

      normalizedDate:
        normalizeDate(
          timestamps[index]
        ),

      open:
        toFiniteNumber(
          open[index]
        ),

      high:
        toFiniteNumber(
          high[index]
        ),

      low:
        toFiniteNumber(
          low[index]
        ),

      close:
        toFiniteNumber(
          close[index]
        ),

      volume:
        toFiniteNumber(
          volume[index],
          0
        )
    });
  }

  return normalizedBars.filter(
    (bar) =>
      bar.high !== null &&
      bar.low !== null &&
      bar.close !== null
  );
}

// ==================================================
// Pivot Detection
// ==================================================

function isSwingHigh(
  bars,
  index,
  pivotWindow
) {
  const currentHigh =
    bars[index]?.high;

  if (
    !Number.isFinite(
      currentHigh
    )
  ) {
    return false;
  }

  for (
    let offset = 1;
    offset <= pivotWindow;
    offset += 1
  ) {
    const previousHigh =
      bars[index - offset]
        ?.high;

    const nextHigh =
      bars[index + offset]
        ?.high;

    if (
      !Number.isFinite(
        previousHigh
      ) ||
      !Number.isFinite(
        nextHigh
      ) ||
      currentHigh <=
        previousHigh ||
      currentHigh <=
        nextHigh
    ) {
      return false;
    }
  }

  return true;
}

function isSwingLow(
  bars,
  index,
  pivotWindow
) {
  const currentLow =
    bars[index]?.low;

  if (
    !Number.isFinite(
      currentLow
    )
  ) {
    return false;
  }

  for (
    let offset = 1;
    offset <= pivotWindow;
    offset += 1
  ) {
    const previousLow =
      bars[index - offset]
        ?.low;

    const nextLow =
      bars[index + offset]
        ?.low;

    if (
      !Number.isFinite(
        previousLow
      ) ||
      !Number.isFinite(
        nextLow
      ) ||
      currentLow >=
        previousLow ||
      currentLow >=
        nextLow
    ) {
      return false;
    }
  }

  return true;
}

function detectPivots(
  bars,
  pivotWindow
) {
  const swingHighs = [];
  const swingLows = [];

  for (
    let index = pivotWindow;
    index <
      bars.length -
        pivotWindow;
    index += 1
  ) {
    if (
      isSwingHigh(
        bars,
        index,
        pivotWindow
      )
    ) {
      swingHighs.push({
        type:
          "Swing High",

        price:
          bars[index].high,

        index,

        date:
          bars[index].date,

        normalizedDate:
          bars[index]
            .normalizedDate
      });
    }

    if (
      isSwingLow(
        bars,
        index,
        pivotWindow
      )
    ) {
      swingLows.push({
        type:
          "Swing Low",

        price:
          bars[index].low,

        index,

        date:
          bars[index].date,

        normalizedDate:
          bars[index]
            .normalizedDate
      });
    }
  }

  return {
    swingHighs,
    swingLows
  };
}

// ==================================================
// Directional Swing Selection
// ==================================================

function findLatestDirectionalSwing({
  swingHighs,
  swingLows
}) {
  const latestHigh =
    swingHighs.length > 0
      ? swingHighs[
          swingHighs.length - 1
        ]
      : null;

  const latestLow =
    swingLows.length > 0
      ? swingLows[
          swingLows.length - 1
        ]
      : null;

  if (
    !latestHigh ||
    !latestLow
  ) {
    return null;
  }

  if (
    latestHigh.index >
    latestLow.index
  ) {
    const priorLow =
      [...swingLows]
        .reverse()
        .find(
          (pivot) =>
            pivot.index <
            latestHigh.index
        );

    if (!priorLow) {
      return null;
    }

    return {
      direction:
        "Uptrend",

      swingLow:
        priorLow,

      swingHigh:
        latestHigh,

      start:
        priorLow,

      end:
        latestHigh,

      barsBetween:
        latestHigh.index -
        priorLow.index
    };
  }

  const priorHigh =
    [...swingHighs]
      .reverse()
      .find(
        (pivot) =>
          pivot.index <
          latestLow.index
      );

  if (!priorHigh) {
    return null;
  }

  return {
    direction:
      "Downtrend",

    swingHigh:
      priorHigh,

    swingLow:
      latestLow,

    start:
      priorHigh,

    end:
      latestLow,

    barsBetween:
      latestLow.index -
      priorHigh.index
  };
}

// ==================================================
// Fallback Swing Selection
// ==================================================

function findFallbackSwing(bars) {
  if (
    !Array.isArray(bars) ||
    bars.length === 0
  ) {
    return null;
  }

  let highest = {
    price:
      bars[0].high,

    index: 0,

    date:
      bars[0].date,

    normalizedDate:
      bars[0]
        .normalizedDate
  };

  let lowest = {
    price:
      bars[0].low,

    index: 0,

    date:
      bars[0].date,

    normalizedDate:
      bars[0]
        .normalizedDate
  };

  bars.forEach(
    (bar, index) => {
      if (
        bar.high >
        highest.price
      ) {
        highest = {
          price:
            bar.high,

          index,

          date:
            bar.date,

          normalizedDate:
            bar.normalizedDate
        };
      }

      if (
        bar.low <
        lowest.price
      ) {
        lowest = {
          price:
            bar.low,

          index,

          date:
            bar.date,

          normalizedDate:
            bar.normalizedDate
        };
      }
    }
  );

  if (
    highest.index >
    lowest.index
  ) {
    return {
      direction:
        "Uptrend",

      swingLow: {
        type:
          "Range Low",

        ...lowest
      },

      swingHigh: {
        type:
          "Range High",

        ...highest
      },

      start: {
        type:
          "Range Low",

        ...lowest
      },

      end: {
        type:
          "Range High",

        ...highest
      },

      barsBetween:
        highest.index -
        lowest.index,

      fallback:
        true
    };
  }

  return {
    direction:
      "Downtrend",

    swingHigh: {
      type:
        "Range High",

      ...highest
    },

    swingLow: {
      type:
        "Range Low",

      ...lowest
    },

    start: {
      type:
        "Range High",

      ...highest
    },

    end: {
      type:
        "Range Low",

      ...lowest
    },

    barsBetween:
      lowest.index -
      highest.index,

    fallback:
      true
  };
}

// ==================================================
// Fibonacci Level Calculation
// ==================================================

function calculateFibonacciLevels(
  swing
) {
  const high =
    toFiniteNumber(
      swing?.swingHigh?.price
    );

  const low =
    toFiniteNumber(
      swing?.swingLow?.price
    );

  if (
    high === null ||
    low === null ||
    high <= low
  ) {
    return [];
  }

  const range =
    high - low;

  return FIBONACCI_RATIOS.map(
    ({
      name,
      ratio
    }) => {
      const price =
        swing.direction ===
        "Uptrend"
          ? high -
            range * ratio
          : low +
            range * ratio;

      return {
        name,

        ratio,

        price:
          round(
            price,
            2
          ),

        description:
          swing.direction ===
          "Uptrend"
            ? `${name} retracement measured downward from the swing high.`
            : `${name} retracement measured upward from the swing low.`
      };
    }
  );
}

// ==================================================
// Current Price Relationships
// ==================================================

function addPriceRelationships(
  levels,
  currentPrice,
  proximityThresholdPercent
) {
  return levels.map(
    (level) => {
      const distancePercent =
        calculatePercentDistance(
          currentPrice,
          level.price
        );

      let relation =
        "Unavailable";

      if (
        Number.isFinite(
          currentPrice
        )
      ) {
        if (
          currentPrice >
          level.price
        ) {
          relation =
            "Below Current Price";
        } else if (
          currentPrice <
          level.price
        ) {
          relation =
            "Above Current Price";
        } else {
          relation =
            "At Current Price";
        }
      }

      return {
        ...level,

        relationToPrice:
          relation,

        distancePercent,

        nearCurrentPrice:
          distancePercent !==
            null &&
          distancePercent <=
            proximityThresholdPercent
      };
    }
  );
}

function findNearestLevel(levels) {
  const availableLevels =
    levels.filter(
      (level) =>
        Number.isFinite(
          level.distancePercent
        )
    );

  if (
    availableLevels.length ===
    0
  ) {
    return null;
  }

  return [...availableLevels]
    .sort(
      (first, second) =>
        first.distancePercent -
        second.distancePercent
    )[0];
}

function findNearestLevelBelowPrice(
  levels,
  currentPrice
) {
  if (
    !Number.isFinite(
      currentPrice
    )
  ) {
    return null;
  }

  return (
    levels
      .filter(
        (level) =>
          level.price <
          currentPrice
      )
      .sort(
        (first, second) =>
          second.price -
          first.price
      )[0] || null
  );
}

function findNearestLevelAbovePrice(
  levels,
  currentPrice
) {
  if (
    !Number.isFinite(
      currentPrice
    )
  ) {
    return null;
  }

  return (
    levels
      .filter(
        (level) =>
          level.price >
          currentPrice
      )
      .sort(
        (first, second) =>
          first.price -
          second.price
      )[0] || null
  );
}

// ==================================================
// Interpretation
// ==================================================

function buildInterpretation({
  swing,
  nearestLevel,
  nearestBelow,
  nearestAbove,
  currentPrice
}) {
  const observations = [];

  if (
    swing.direction ===
    "Uptrend"
  ) {
    observations.push(
      "Fibonacci levels are measuring a potential retracement of the most recent confirmed upward swing."
    );
  } else {
    observations.push(
      "Fibonacci levels are measuring a potential retracement of the most recent confirmed downward swing."
    );
  }

  if (nearestLevel) {
    observations.push(
      `The closest Fibonacci level to the current price is ${nearestLevel.name} at ${nearestLevel.price}, approximately ${nearestLevel.distancePercent}% away.`
    );
  }

  if (nearestBelow) {
    observations.push(
      `The nearest Fibonacci reference below the current price is ${nearestBelow.name} at ${nearestBelow.price}.`
    );
  }

  if (nearestAbove) {
    observations.push(
      `The nearest Fibonacci reference above the current price is ${nearestAbove.name} at ${nearestAbove.price}.`
    );
  }

  const currentPriceOutsideSwing =
    Number.isFinite(
      currentPrice
    ) &&
    (
      currentPrice >
        swing.swingHigh.price ||
      currentPrice <
        swing.swingLow.price
    );

  if (
    currentPriceOutsideSwing
  ) {
    observations.push(
      "The current price is outside the selected swing range, which may indicate a breakout, continuation, or that a newer confirmed pivot has not yet formed."
    );
  }

  return {
    summary:
      swing.direction ===
      "Uptrend"
        ? "The engine identified an upward swing and calculated retracement levels from the swing high toward the swing low."
        : "The engine identified a downward swing and calculated retracement levels from the swing low toward the swing high.",

    observations,

    currentPriceOutsideSwing
  };
}

// ==================================================
// Main Fibonacci Engine
// ==================================================

function analyzeFibonacci({
  symbol,
  history,
  bars,
  currentPrice,
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

  const normalizedBars =
    normalizeBars(
      Array.isArray(bars)
        ? bars
        : history
    );

  const selectedBars =
    normalizedBars.slice(
      -Math.max(
        configuration.lookbackBars,
        configuration.minimumBars
      )
    );

  if (
    selectedBars.length <
    configuration.minimumBars
  ) {
    return {
      success:
        false,

      provider:
        "AzaLens",

      symbol:
        normalizedSymbol,

      error:
        "Insufficient historical OHLCV data for Fibonacci analysis.",

      details: {
        requiredBars:
          configuration.minimumBars,

        availableBars:
          selectedBars.length
      },

      dataSource:
        "Shared OHLCV",

      performance: {
        durationMs:
          Date.now() -
          startedAt
      }
    };
  }

  const analysisPrice =
    toFiniteNumber(
      currentPrice,
      selectedBars[
        selectedBars.length - 1
      ]?.close
    );

  const {
    swingHighs,
    swingLows
  } = detectPivots(
    selectedBars,
    configuration.pivotWindow
  );

  let swing =
    findLatestDirectionalSwing({
      swingHighs,
      swingLows
    });

  const warnings = [];

  if (!swing) {
    swing =
      findFallbackSwing(
        selectedBars
      );

    warnings.push(
      "A complete recent pivot pair was unavailable, so the lookback range high and low were used as a fallback."
    );
  }

  if (!swing) {
    return {
      success:
        false,

      provider:
        "AzaLens",

      symbol:
        normalizedSymbol,

      error:
        "Unable to identify a valid price swing for Fibonacci analysis.",

      dataSource:
        "Shared OHLCV",

      performance: {
        durationMs:
          Date.now() -
          startedAt
      }
    };
  }

  const rawLevels =
    calculateFibonacciLevels(
      swing
    );

  if (
    rawLevels.length === 0
  ) {
    return {
      success:
        false,

      provider:
        "AzaLens",

      symbol:
        normalizedSymbol,

      error:
        "Unable to calculate Fibonacci levels from the selected swing.",

      swing,

      dataSource:
        "Shared OHLCV",

      performance: {
        durationMs:
          Date.now() -
          startedAt
      }
    };
  }

  const levels =
    addPriceRelationships(
      rawLevels,
      analysisPrice,
      configuration
        .proximityThresholdPercent
    );

  const nearestLevel =
    findNearestLevel(
      levels
    );

  const nearestLevelBelowPrice =
    findNearestLevelBelowPrice(
      levels,
      analysisPrice
    );

  const nearestLevelAbovePrice =
    findNearestLevelAbovePrice(
      levels,
      analysisPrice
    );

  const interpretation =
    buildInterpretation({
      swing,

      nearestLevel,

      nearestBelow:
        nearestLevelBelowPrice,

      nearestAbove:
        nearestLevelAbovePrice,

      currentPrice:
        analysisPrice
    });

  if (
    interpretation
      .currentPriceOutsideSwing
  ) {
    warnings.push(
      "The current price is outside the selected Fibonacci swing range."
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

    direction:
      swing.direction,

    swing: {
      source:
        swing.fallback === true
          ? "Lookback Range Fallback"
          : "Confirmed Pivot Pair",

      start:
        swing.start,

      end:
        swing.end,

      swingHigh:
        swing.swingHigh,

      swingLow:
        swing.swingLow,

      range:
        round(
          swing.swingHigh.price -
          swing.swingLow.price,
          2
        ),

      rangePercent:
        round(
          (
            (
              swing.swingHigh.price -
              swing.swingLow.price
            ) /
            swing.swingLow.price
          ) * 100,
          2
        ),

      barsBetween:
        swing.barsBetween
    },

    levels,

    nearestLevel,

    nearestLevelBelowPrice,

    nearestLevelAbovePrice,

    interpretation,

    statistics: {
      barsAnalyzed:
        selectedBars.length,

      swingHighsDetected:
        swingHighs.length,

      swingLowsDetected:
        swingLows.length,

      levelsCalculated:
        levels.length,

      levelsNearCurrentPrice:
        levels.filter(
          (level) =>
            level.nearCurrentPrice
        ).length
    },

    methodology: {
      pivotDefinition:
        `A swing high or low must be higher or lower than the ${configuration.pivotWindow} candles before and after it.`,

      pivotWindow:
        configuration.pivotWindow,

      lookbackBars:
        configuration.lookbackBars,

      proximityThresholdPercent:
        configuration
          .proximityThresholdPercent,

      ratios:
        FIBONACCI_RATIOS.map(
          (level) => ({
            name:
              level.name,

            ratio:
              level.ratio
          })
        )
    },

    warnings:
      [...new Set(warnings)],

    dataSource:
      "Shared OHLCV",

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
  analyzeFibonacci,
  normalizeBars,
  detectPivots,
  findLatestDirectionalSwing,
  calculateFibonacciLevels
};