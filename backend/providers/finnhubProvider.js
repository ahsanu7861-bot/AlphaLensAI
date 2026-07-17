const axios = require("axios");

// ============================
// Get Live Quote
// ============================

async function getFinnhubQuote(symbol) {
  try {
    const API_KEY = process.env.FINNHUB_API_KEY;

    // Current price
    const quoteResponse = await axios.get(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`
    );

    // Company profile
    const profileResponse = await axios.get(
      `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${API_KEY}`
    );

    const quote = quoteResponse.data;
    const profile = profileResponse.data;

    return {
      success: true,
      provider: "Finnhub",
      data: {
        symbol: symbol,
        company: profile.name,
        exchange: profile.exchange,
        currency: profile.currency,
        price: quote.c,
        previousClose: quote.pc,
        open: quote.o,
        high: quote.h,
        low: quote.l,
        change: quote.d,
        changePercent: quote.dp
      }
    };

  } catch (error) {

    return {
      success: false,
      provider: "Finnhub",
      error: error.message
    };

  }
}

// ============================
// Get Historical Candles
// ============================

async function getHistoricalCandles(symbol, resolution = "D", days = 100) {

  try {

    const API_KEY = process.env.FINNHUB_API_KEY;

    const to = Math.floor(Date.now() / 1000);
    const from = to - (days * 24 * 60 * 60);

    const response = await axios.get(
      `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}&token=${API_KEY}`
    );

    if (response.data.s !== "ok") {
      return {
        success: false,
        provider: "Finnhub",
        error: "No historical data found."
      };
    }

    return {
      success: true,
      provider: "Finnhub",
      data: response.data
    };

  } catch (error) {

    return {
      success: false,
      provider: "Finnhub",
      error: error.message
    };

  }

}

module.exports = {
  getFinnhubQuote,
  getHistoricalCandles
};