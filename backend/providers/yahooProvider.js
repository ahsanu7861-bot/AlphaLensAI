const yahooFinance = require("yahoo-finance2").default;

async function getYahooQuote(symbol) {
  try {
    const quote = await yahooFinance.quote(symbol);

    return {
      success: true,
      provider: "Yahoo Finance",
      data: {
        symbol: quote.symbol,
        company: quote.shortName,
        exchange: quote.fullExchangeName,
        currency: quote.currency,
        price: quote.regularMarketPrice,
        previousClose: quote.regularMarketPreviousClose,
        open: quote.regularMarketOpen,
        high: quote.regularMarketDayHigh,
        low: quote.regularMarketDayLow,
        volume: quote.regularMarketVolume,
        marketCap: quote.marketCap,
        change: quote.regularMarketChange,
        changePercent: quote.regularMarketChangePercent
      }
    };

  } catch (error) {

    return {
      success: false,
      provider: "Yahoo Finance",
      error: error.message
    };

  }
}

module.exports = {
  getYahooQuote
};