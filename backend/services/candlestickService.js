const { getHistory } = require("./marketEngine");

const {
  detectCandlestick
} = require("../analysis/candlestick");

// ============================
// Helpers
// ============================

function normalizeSymbol(symbol) {
  return String(symbol || "")
    .trim()
    .toUpperCase();
}

function getOHLC(history) {
  if (
    Array.isArray(history?.bars) &&
    history.bars.length > 0
  ) {
    const open = [];
    const high = [];
    const low = [];
    const close = [];

    history.bars.forEach((bar) => {
      const openValue =
        Number(bar.open);

      const highValue =
        Number(bar.high);

      const lowValue =
        Number(bar.low);

      const closeValue =
        Number(bar.close);

      if (
        Number.isFinite(openValue) &&
        Number.isFinite(highValue) &&
        Number.isFinite(lowValue) &&
        Number.isFinite(closeValue)
      ) {
        open.push(openValue);
        high.push(highValue);
        low.push(lowValue);
        close.push(closeValue);
      }
    });

    return {
      open,
      high,
      low,
      close
    };
  }

  return {
    open:
      Array.isArray(
        history?.data?.o
      )
        ? history.data.o
            .map(Number)
            .filter(Number.isFinite)
        : [],

    high:
      Array.isArray(
        history?.data?.h
      )
        ? history.data.h
            .map(Number)
            .filter(Number.isFinite)
        : [],

    low:
      Array.isArray(
        history?.data?.l
      )
        ? history.data.l
            .map(Number)
            .filter(Number.isFinite)
        : [],

    close:
      Array.isArray(
        history?.data?.c
      )
        ? history.data.c
            .map(Number)
            .filter(Number.isFinite)
        : []
  };
}

// ============================
// Candlestick Service
// ============================

async function getCandlestick(
  symbol,
  sharedHistory = null
) {
  const normalizedSymbol =
    normalizeSymbol(symbol);

  if (!normalizedSymbol) {
    return {
      success: false,
      error:
        "A valid ticker symbol is required."
    };
  }

  try {
    const history =
      sharedHistory ||
      await getHistory(
        normalizedSymbol
      );

    if (
      !history ||
      history.success !== true
    ) {
      return {
        success: false,

        provider:
          history?.provider ||
          "TwelveData",

        symbol:
          normalizedSymbol,

        error:
          history?.error ||
          "Unable to fetch historical market data."
      };
    }

    const {
      open,
      high,
      low,
      close
    } = getOHLC(history);

    if (
      open.length < 2 ||
      high.length < 2 ||
      low.length < 2 ||
      close.length < 2
    ) {
      return {
        success: false,

        provider:
          history.provider ||
          "TwelveData",

        symbol:
          normalizedSymbol,

        error:
          "Insufficient historical OHLC data to detect candlestick patterns."
      };
    }

    if (
      open.length !==
        high.length ||
      open.length !==
        low.length ||
      open.length !==
        close.length
    ) {
      return {
        success: false,

        provider:
          history.provider ||
          "TwelveData",

        symbol:
          normalizedSymbol,

        error:
          "Historical OHLC arrays have inconsistent lengths."
      };
    }

    const result =
      detectCandlestick(
        open,
        high,
        low,
        close
      );

    if (
      !result ||
      typeof result !==
        "object"
    ) {
      return {
        success: false,

        provider:
          history.provider ||
          "TwelveData",

        symbol:
          normalizedSymbol,

        error:
          "Unable to detect candlestick pattern."
      };
    }

    const lastIndex =
      close.length - 1;

    return {
      success: true,

      provider:
        history.provider ||
        "TwelveData",

      symbol:
        normalizedSymbol,

      ...result,

      lastCandle: {
        open:
          open[lastIndex],

        high:
          high[lastIndex],

        low:
          low[lastIndex],

        close:
          close[lastIndex]
      },

      dataSource:
        sharedHistory
          ? "Shared OHLCV"
          : "Market Engine"
    };
  } catch (error) {
    console.error(
      "Candlestick Service Error:",
      error
    );

    return {
      success: false,

      symbol:
        normalizedSymbol,

      error:
        "Unable to detect candlestick pattern.",

      details:
        error.message
    };
  }
}

module.exports = {
  getCandlestick
};