const axios = require("axios");

async function getHistoricalData(symbol) {
  try {
    const API_KEY = process.env.ALPHAVANTAGE_API_KEY;

    const response = await axios.get(
      `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=compact&apikey=${API_KEY}`
    );

    const series = response.data["Time Series (Daily)"];

    if (!series) {
      return {
        success: false,
        provider: "AlphaVantage",
        error: "No historical data returned."
      };
    }

    const closes = [];
    const opens = [];
    const highs = [];
    const lows = [];
    const volumes = [];
    const dates = [];

    Object.keys(series)
      .reverse()
      .forEach(date => {
        dates.push(date);
        opens.push(Number(series[date]["1. open"]));
        highs.push(Number(series[date]["2. high"]));
        lows.push(Number(series[date]["3. low"]));
        closes.push(Number(series[date]["4. close"]));
        volumes.push(Number(series[date]["5. volume"]));
      });

    return {
      success: true,
      provider: "AlphaVantage",
      data: {
        t: dates,
        o: opens,
        h: highs,
        l: lows,
        c: closes,
        v: volumes
      }
    };

  } catch (error) {

    return {
      success: false,
      provider: "AlphaVantage",
      error: error.message
    };

  }
}

module.exports = {
  getHistoricalData
};