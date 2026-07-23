export interface AnalysisResponse {
  data: {
    market: {
      data: {
        price: number
        changePercent: number
      }
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
      riskLevel: string
      riskScore?: number
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
