const {
  getFinnhubQuote
} = require("../providers/finnhubProvider");

const {
  getHistoricalData
} = require("../providers/twelveDataProvider");

const {
  getCache,
  setCache
} = require("../utils/cache");

// ==================================================
// Helpers
// ==================================================

function normalizeSymbol(symbol) {
  return String(symbol || "")
    .trim()
    .toUpperCase();
}

function toNumber(value, fallback = null) {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
}

function normalizeLiveCacheMetadata(
  cache
) {
  if (
    !cache ||
    typeof cache !== "object"
  ) {
    return {
      status: "UNKNOWN",
      hit: false,
      ttlSeconds: 20,
      ageSeconds: 0,
      expiresInSeconds: 0
    };
  }

  return {
    status:
      cache.status ||
      (cache.hit ? "HIT" : "MISS"),

    hit:
      cache.hit === true,

    ttlSeconds:
      toNumber(
        cache.ttlSeconds,
        20
      ),

    ageSeconds:
      toNumber(
        cache.ageSeconds,
        0
      ),

    expiresInSeconds:
      toNumber(
        cache.expiresInSeconds,
        0
      )
  };
}

// ==================================================
// Normalize Column-Based OHLCV
// ==================================================

function normalizeColumnData(data) {
  if (
    !data ||
    typeof data !== "object" ||
    !Array.isArray(data.t)
  ) {
    return [];
  }

  const dates = data.t;
  const opens =
    Array.isArray(data.o)
      ? data.o
      : [];

  const highs =
    Array.isArray(data.h)
      ? data.h
      : [];

  const lows =
    Array.isArray(data.l)
      ? data.l
      : [];

  const closes =
    Array.isArray(data.c)
      ? data.c
      : [];

  const volumes =
    Array.isArray(data.v)
      ? data.v
      : [];

  const bars = [];

  for (
    let index = 0;
    index < dates.length;
    index += 1
  ) {
    const date = dates[index];
    const open =
      toNumber(opens[index]);

    const high =
      toNumber(highs[index]);

    const low =
      toNumber(lows[index]);

    const close =
      toNumber(closes[index]);

    const volume =
      toNumber(
        volumes[index],
        0
      );

    if (
      !date ||
      open === null ||
      high === null ||
      low === null ||
      close === null
    ) {
      continue;
    }

    bars.push({
      date,
      open,
      high,
      low,
      close,
      volume
    });
  }

  return bars.sort((a, b) => {
    return (
      new Date(a.date) -
      new Date(b.date)
    );
  });
}

// ==================================================
// Normalize Array-Based OHLCV
// ==================================================

function normalizeArrayData(rawData) {
  if (!Array.isArray(rawData)) {
    return [];
  }

  return rawData
    .map((bar) => {
      const date =
        bar.date ||
        bar.datetime ||
        bar.timestamp ||
        bar.time ||
        null;

      const open =
        toNumber(bar.open);

      const high =
        toNumber(bar.high);

      const low =
        toNumber(bar.low);

      const close =
        toNumber(bar.close);

      const volume =
        toNumber(
          bar.volume,
          0
        );

      if (
        !date ||
        open === null ||
        high === null ||
        low === null ||
        close === null
      ) {
        return null;
      }

      return {
        date,
        open,
        high,
        low,
        close,
        volume
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      return (
        new Date(a.date) -
        new Date(b.date)
      );
    });
}

// ==================================================
// Universal Historical Normalizer
// ==================================================

function normalizeHistoricalBars(source) {
  if (!source) {
    return [];
  }

  if (Array.isArray(source)) {
    return normalizeArrayData(source);
  }

  if (
    typeof source === "object" &&
    Array.isArray(source.t)
  ) {
    return normalizeColumnData(source);
  }

  if (
    typeof source === "object" &&
    source.data
  ) {
    return normalizeHistoricalBars(
      source.data
    );
  }

  if (
    typeof source === "object" &&
    source.bars
  ) {
    return normalizeHistoricalBars(
      source.bars
    );
  }

  if (
    typeof source === "object" &&
    source.history
  ) {
    return normalizeHistoricalBars(
      source.history
    );
  }

  return [];
}

// ==================================================
// Build Legacy Column Data
// ==================================================

function buildColumnData(bars) {
  return {
    t: bars.map(
      (bar) => bar.date
    ),

    o: bars.map(
      (bar) => bar.open
    ),

    h: bars.map(
      (bar) => bar.high
    ),

    l: bars.map(
      (bar) => bar.low
    ),

    c: bars.map(
      (bar) => bar.close
    ),

    v: bars.map(
      (bar) => bar.volume
    )
  };
}

// ==================================================
// Historical Data Quality
// ==================================================

function buildHistoricalQuality(
  bars,
  cacheStatus
) {
  const warnings = [];

  if (
    !Array.isArray(bars) ||
    bars.length === 0
  ) {
    return {
      status: "Unavailable",
      historicalBars: 0,
      latestHistoricalDate: null,
      oldestHistoricalDate: null,
      cache: cacheStatus,

      warnings: [
        "No valid historical OHLCV bars were available."
      ]
    };
  }

  if (bars.length < 50) {
    warnings.push(
      "Historical dataset contains fewer than 50 bars."
    );
  }

  const invalidVolumeBars =
    bars.filter((bar) => {
      return (
        !Number.isFinite(
          bar.volume
        ) ||
        bar.volume < 0
      );
    }).length;

  if (invalidVolumeBars > 0) {
    warnings.push(
      `${invalidVolumeBars} bars contain invalid volume data.`
    );
  }

  const duplicateDates =
    bars.length -
    new Set(
      bars.map(
        (bar) => bar.date
      )
    ).size;

  if (duplicateDates > 0) {
    warnings.push(
      `${duplicateDates} duplicate historical dates were detected.`
    );
  }

  return {
    status:
      warnings.length > 0
        ? "Degraded"
        : "Good",

    historicalBars:
      bars.length,

    latestHistoricalDate:
      bars[
        bars.length - 1
      ]?.date || null,

    oldestHistoricalDate:
      bars[0]?.date || null,

    cache: cacheStatus,
    warnings
  };
}

// ==================================================
// Live Market Data — Finnhub
// ==================================================

async function getMarketData(symbol) {
  const normalizedSymbol =
    normalizeSymbol(symbol);

  const startedAt = Date.now();

  if (!normalizedSymbol) {
    return {
      success: false,
      provider: "Finnhub",
      symbol: normalizedSymbol,

      error:
        "A valid ticker symbol is required.",

      cache: {
        status: "BYPASS",
        hit: false,
        ttlSeconds: 20,
        ageSeconds: 0,
        expiresInSeconds: 0
      },

      performance: {
        durationMs:
          Date.now() -
          startedAt,

        cacheHit: false
      }
    };
  }

  try {
    const result =
      await getFinnhubQuote(
        normalizedSymbol
      );

    const cache =
      normalizeLiveCacheMetadata(
        result?.cache
      );

    if (result?.success === true) {
      return {
        ...result,

        symbol:
          result.symbol ||
          result.data?.symbol ||
          normalizedSymbol,

        cache,

        performance: {
          durationMs:
            Date.now() -
            startedAt,

          cacheHit:
            cache.hit,

          source:
            cache.hit
              ? "CACHE"
              : "FINNHUB"
        }
      };
    }

    return {
      success: false,

      provider:
        result?.provider ||
        "Finnhub",

      symbol:
        result?.symbol ||
        normalizedSymbol,

      error:
        result?.error ||
        "Unable to fetch live market data.",

      cache,

      performance: {
        durationMs:
          Date.now() -
          startedAt,

        cacheHit:
          cache.hit,

        source:
          cache.hit
            ? "CACHE"
            : "FINNHUB"
      }
    };
  } catch (error) {
    console.error(
      "Market Engine Live Error:",
      error
    );

    return {
      success: false,
      provider: "Finnhub",
      symbol: normalizedSymbol,

      error:
        "Unable to fetch live market data.",

      details:
        error.message,

      cache: {
        status: "ERROR",
        hit: false,
        ttlSeconds: 20,
        ageSeconds: 0,
        expiresInSeconds: 0
      },

      performance: {
        durationMs:
          Date.now() -
          startedAt,

        cacheHit: false,
        source: "FINNHUB"
      }
    };
  }
}

// ==================================================
// Historical Data — Shared OHLCV
// ==================================================

async function getHistory(symbol) {
  const normalizedSymbol =
    normalizeSymbol(symbol);

  const startedAt = Date.now();

  if (!normalizedSymbol) {
    return {
      success: false,
      provider: "TwelveData",
      symbol: normalizedSymbol,

      error:
        "A valid ticker symbol is required.",

      performance: {
        durationMs:
          Date.now() -
          startedAt,

        cacheHit: false
      }
    };
  }

  const cacheKey =
    `history_${normalizedSymbol}`;

  try {
    // ==============================================
    // Cache Check
    // ==============================================

    const cachedResult =
      getCache(cacheKey);

    if (cachedResult) {
      const bars =
        normalizeHistoricalBars(
          cachedResult.bars ||
          cachedResult.data ||
          cachedResult.history
        );

      if (bars.length === 0) {
        return {
          success: false,
          provider: "TwelveData",
          symbol: normalizedSymbol,

          error:
            "Cached historical data could not be normalized.",

          performance: {
            durationMs:
              Date.now() -
              startedAt,

            cacheHit: true
          }
        };
      }

      const data =
        buildColumnData(bars);

      return {
        success: true,

        provider:
          cachedResult.provider ||
          "TwelveData",

        symbol: normalizedSymbol,

        // Existing services can use data.c,
        // data.o, data.h, data.l and data.v.
        data,

        // Shared-OHLCV services use bars.
        bars,

        cache: "HIT",

        dataQuality:
          buildHistoricalQuality(
            bars,
            "HIT"
          ),

        performance: {
          durationMs:
            Date.now() -
            startedAt,

          cacheHit: true
        }
      };
    }

    // ==============================================
    // Twelve Data Fetch
    // ==============================================

    const result =
      await getHistoricalData(
        normalizedSymbol
      );

    if (result?.success !== true) {
      return {
        success: false,

        provider:
          result?.provider ||
          "TwelveData",

        symbol:
          normalizedSymbol,

        error:
          result?.error ||
          "Unable to fetch historical market data.",

        performance: {
          durationMs:
            Date.now() -
            startedAt,

          cacheHit: false
        }
      };
    }

    const bars =
      normalizeHistoricalBars(
        result.data ||
        result.bars ||
        result.history ||
        result
      );

    if (bars.length === 0) {
      return {
        success: false,

        provider:
          result.provider ||
          "TwelveData",

        symbol:
          normalizedSymbol,

        error:
          "Historical data was returned, but no valid OHLCV bars could be normalized.",

        performance: {
          durationMs:
            Date.now() -
            startedAt,

          cacheHit: false
        }
      };
    }

    const data =
      buildColumnData(bars);

    const normalizedResult = {
      success: true,

      provider:
        result.provider ||
        "TwelveData",

      symbol:
        normalizedSymbol,

      // Legacy structure
      data,

      // Shared OHLCV structure
      bars
    };

    // Existing cache utility uses minutes.
    setCache(
      cacheKey,
      normalizedResult,
      30
    );

    return {
      ...normalizedResult,

      cache: "MISS",

      dataQuality:
        buildHistoricalQuality(
          bars,
          "MISS"
        ),

      performance: {
        durationMs:
          Date.now() -
          startedAt,

        cacheHit: false
      }
    };
  } catch (error) {
    console.error(
      "Market Engine Historical Error:",
      error
    );

    return {
      success: false,
      provider: "TwelveData",
      symbol: normalizedSymbol,

      error:
        "Unable to fetch historical market data.",

      details:
        error.message,

      performance: {
        durationMs:
          Date.now() -
          startedAt,

        cacheHit: false
      }
    };
  }
}

module.exports = {
  getMarketData,
  getHistory,
  normalizeHistoricalBars,
  buildColumnData
};