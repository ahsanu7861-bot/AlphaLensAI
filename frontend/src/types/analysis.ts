export interface AnalysisResponse {
  data: {
    market: {
      success?: boolean
      provider?: string
      symbol?: string
      data?: {
        symbol?: string
        company?: string
        exchange?: string
        currency?: string
        price?: number
        previousClose?: number
        open?: number
        high?: number
        low?: number
        change?: number
        changePercent?: number
        timestamp?: number
      }
    }

    priceContext?: {
      livePrice?: number | null
      latestHistoricalClose?: number | null
      livePriceAvailable?: boolean
      historicalCloseAvailable?: boolean
      pricesMatch?: boolean
      analysisPrice?: number | null
      analysisPriceSource?: string
      note?: string
    }

    trend: {
      trend: string
      score: number
    }

    agreement: {
      confidence: number
      agreement?: string
      direction?: string
      agreementSummary?: string
    }

    indicators: {
      rsi: {
        rsi: number
      }

      ema: {
        ema20: number
      }

      sma: {
        sma50: number
      }

      macd: {
        macd: number
      }

      adx: {
        adx: number
      }

      atr: {
        atr: number
      }

      obv: {
        signal: string
      }

      rvol: {
        rvol: number
      }
    }

    confluence: {
      strongestZone: {
        zone: {
          center: number
        }
      }

      nearestSupport: {
        zone: {
          center: number
        }
      }
    }

    explanation: {
      overallAssessment: string
    }

    risk: {
      success?: boolean
      symbol?: string
      riskLevel?: string
      riskScore?: number
      volatility?: string
      currentPrice?: number | null
      atr?: number | null
      atrPercent?: number | null
      agreementConfidence?: number | null
      referenceDistances?: {
        tight?: {
          atrMultiplier?: number | null
          distance?: number | null
          percent?: number | null
        }
        standard?: {
          atrMultiplier?: number | null
          distance?: number | null
          percent?: number | null
        }
        wide?: {
          atrMultiplier?: number | null
          distance?: number | null
          percent?: number | null
        }
      }
      priceReferenceLevels?: {
        currentPrice?: number | null
        belowCurrentPrice?: {
          tight?: number | null
          standard?: number | null
          wide?: number | null
        }
        aboveCurrentPrice?: {
          tight?: number | null
          standard?: number | null
          wide?: number | null
        }
      }
      riskSummary?: string
      riskNotes?: string[]
      supportiveFactors?: string[]
      disclaimer?: string
    }

    shariah: {
      summary: {
        status: string
        confidence?: string | number
      }
    }
  }
}

export type AnalysisData = AnalysisResponse["data"]
