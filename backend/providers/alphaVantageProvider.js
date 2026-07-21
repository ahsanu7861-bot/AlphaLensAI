const axios = require("axios");

const ALPHA_VANTAGE_URL =
  "https://www.alphavantage.co/query";

function normalizeSymbol(symbol) {
  return String(symbol || "")
    .trim()
    .toUpperCase();
}

function getProviderError(data) {
  if (!data || typeof data !== "object") {
    return "Alpha Vantage returned an invalid response.";
  }

  if (data["Error Message"]) {
    return data["Error Message"];
  }

  if (data.Note) {
    return data.Note;
  }

  if (data.Information) {
    return data.Information;
  }

  return null;
}

async function getHistoricalData(symbol) {
  const normalizedSymbol =
    normalizeSymbol(symbol);

  const API_KEY =
    process.env.ALPHAVANTAGE_API_KEY;

  if (!normalizedSymbol) {
    return {
      success: false,
      provider: "AlphaVantage",
      symbol: normalizedSymbol,
      error:
        "A valid ticker symbol is required."
    };
  }

  if (!API_KEY) {
    console.error(
      "Alpha Vantage configuration error: ALPHAVANTAGE_API_KEY is missing."
    );

    return {
      success: false,
      provider: "AlphaVantage",
      symbol: normalizedSymbol,
      error:
        "Alpha Vantage API key is not configured.",
      code:
        "ALPHAVANTAGE_API_KEY_MISSING"
    };
  }

  try {
    const response = await axios.get(
      ALPHA_VANTAGE_URL,
      {
        params: {
          function:
            "TIME_SERIES_DAILY",
          symbol:
            normalizedSymbol,
          outputsize:
            "compact",
          datatype:
            "json",
          apikey:
            API_KEY
        },
        timeout: 15000
      }
    );

    const data = response.data;

    const providerError =
      getProviderError(data);

    if (providerError) {
      console.error(
        `[AlphaVantage] ${normalizedSymbol}:`,
        providerError
      );

      return {
        success: false,
        provider: "AlphaVantage",
        symbol: normalizedSymbol,
        error: providerError,
        code:
          data.Note
            ? "ALPHAVANTAGE_RATE_LIMIT"
            : data.Information
              ? "ALPHAVANTAGE_INFORMATION"
              : "ALPHAVANTAGE_PROVIDER_ERROR"
      };
    }

    const series =
      data?.["Time Series (Daily)"];

    if (
      !series ||
      typeof series !== "object" ||
      Object.keys(series).length === 0
    ) {
      console.error(
        `[AlphaVantage] Unexpected response for ${normalizedSymbol}:`,
        JSON.stringify(data)
      );

      return {
        success: false,
        provider: "AlphaVantage",
        symbol: normalizedSymbol,
        error:
          "Alpha Vantage returned no daily historical series.",
        code:
          "ALPHAVANTAGE_EMPTY_SERIES"
      };
    }

    const bars = Object.entries(series)
      .map(([date, values]) => {
        const open =
          Number(values?.["1. open"]);

        const high =
          Number(values?.["2. high"]);

        const low =
          Number(values?.["3. low"]);

        const close =
          Number(values?.["4. close"]);

        const volume =
          Number(values?.["5. volume"]);

        if (
          !date ||
          !Number.isFinite(open) ||
          !Number.isFinite(high) ||
          !Number.isFinite(low) ||
          !Number.isFinite(close) ||
          !Number.isFinite(volume)
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
      .sort(
        (first, second) =>
          new Date(first.date) -
          new Date(second.date)
      );

    if (bars.length === 0) {
      return {
        success: false,
        provider: "AlphaVantage",
        symbol: normalizedSymbol,
        error:
          "Alpha Vantage data contained no valid OHLCV bars.",
        code:
          "ALPHAVANTAGE_INVALID_BARS"
      };
    }

    return {
      success: true,
      provider: "AlphaVantage",
      symbol: normalizedSymbol,
      data: {
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
      },
      bars,
      metadata: {
        barCount: bars.length,
        latestDate:
          bars[bars.length - 1]?.date ||
          null,
        oldestDate:
          bars[0]?.date ||
          null
      }
    };
  } catch (error) {
    console.error(
      `[AlphaVantage] Request failed for ${normalizedSymbol}:`,
      error.response?.data ||
      error.message
    );

    return {
      success: false,
      provider: "AlphaVantage",
      symbol: normalizedSymbol,
      error:
        error.response?.data?.Information ||
        error.response?.data?.Note ||
        error.response?.data?.[
          "Error Message"
        ] ||
        error.message ||
        "Alpha Vantage request failed.",
      code:
        "ALPHAVANTAGE_REQUEST_FAILED",
      httpStatus:
        error.response?.status ||
        null
    };
  }
}

module.exports = {
  getHistoricalData
};