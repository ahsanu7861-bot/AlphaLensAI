const { getPortfolio } = require("./portfolioService");
const { getMasterAnalysis } = require("./masterAnalysisService");

async function getPortfolioIntelligence() {
  const portfolio = await getPortfolio();

  if (!portfolio.length) {
    return {
      summary: {
        holdings: 0,
        totalCost: 0,
        marketValue: 0,
        profitLoss: 0,
        profitLossPercent: 0
      },
      holdings: []
    };
  }

  const holdings = [];

  let totalCost = 0;
  let totalMarketValue = 0;

  for (const holding of portfolio) {
    const analysisResponse =
  await getMasterAnalysis(holding.symbol);

const analysis =
  analysisResponse?.data ?? analysisResponse;

const currentPrice =
  Number(
    analysis?.priceContext?.analysisPrice ??
    analysis?.market?.data?.price ??
    analysis?.sharedHistory?.latestHistoricalClose
  ) || 0;

    const marketValue =
      currentPrice * holding.shares;

    const totalHoldingCost =
      holding.averagePrice * holding.shares;

    const profitLoss =
      marketValue - totalHoldingCost;

    totalCost += totalHoldingCost;
    totalMarketValue += marketValue;

    holdings.push({
      symbol: holding.symbol,

      shares: holding.shares,

      averagePrice: holding.averagePrice,

      currentPrice,

      totalCost: Number(totalHoldingCost.toFixed(2)),

      marketValue: Number(marketValue.toFixed(2)),

      profitLoss: Number(profitLoss.toFixed(2)),

      profitLossPercent:
        Number(
          (
            (profitLoss / totalHoldingCost) *
            100
          ).toFixed(2)
        ),

      trend: analysis?.trend?.trend ?? "Unknown",

      trendScore:
        analysis?.trend?.score ?? null,

      agreement:
        analysis?.agreement?.agreement ?? "Unknown",

      agreementConfidence:
        analysis?.agreement?.confidence ?? null,

      risk:
        analysis?.risk?.riskLevel ?? "Unknown",

      riskScore:
        analysis?.risk?.riskScore ?? null,

      shariah:
        analysis?.shariah?.summary?.status ??
        "UNKNOWN",

      aiSummary:
        analysis?.explanation
          ?.overallAssessment ??
        ""
    });
  }

  const totalProfit =
    totalMarketValue - totalCost;

  holdings.forEach((holding) => {
  holding.allocation =
    totalMarketValue > 0
      ? Number(
          (
            (holding.marketValue /
              totalMarketValue) *
            100
          ).toFixed(2)
        )
      : 0;
});

  return {
    summary: {
      holdings: holdings.length,

      totalCost:
        Number(totalCost.toFixed(2)),

      marketValue:
        Number(totalMarketValue.toFixed(2)),

      profitLoss:
        Number(totalProfit.toFixed(2)),

      profitLossPercent:
        Number(
          (
            (totalProfit / totalCost) *
            100
          ).toFixed(2)
        )
    },

    holdings
  };
}

module.exports = {
  getPortfolioIntelligence
};