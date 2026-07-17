const yahooFinance = require("yahoo-finance2").default;

async function getStock(symbol) {
  try {
    const quote = await yahooFinance.quote(symbol);

    return {
      symbol: quote.symbol,
      company: quote.shortName,
      exchange: quote.fullExchangeName,
      currency: quote.currency,
      price: quote.regularMarketPrice,
      previousClose: quote.regularMarketPreviousClose,
      open: quote.regularMarketOpen,
      dayHigh: quote.regularMarketDayHigh,
      dayLow: quote.regularMarketDayLow,
      volume: quote.regularMarketVolume,
      marketCap: quote.marketCap,
      change: quote.regularMarketChange,
      changePercent: quote.regularMarketChangePercent
    };
  } catch (error) {
    return {
      error: error.message
    };
  }
}

module.exports = {
  getStock
};