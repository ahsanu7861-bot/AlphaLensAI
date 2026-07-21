require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");

// ============================
// Import Services
// ============================

const { getMarketData, getHistory } = require("./services/marketEngine");
const { getRSI } = require("./services/rsiService");
const { getEMA } = require("./services/emaService");
const { getSMA } = require("./services/smaService");
const { getMACD } = require("./services/macdService");
const { getBollinger } = require("./services/bollingerService");
const { getATR } = require("./services/atrService");
const { getADX } = require("./services/adxService");
const { getOBV } = require("./services/obvService");
const { getRVOL } = require("./services/rvolService");
const { getVolumeSpike } = require("./services/volumeSpikeService");
const { getCandlestick } = require("./services/candlestickService");
const { getTrend } = require("./services/trendService");
const { getAgreement } = require("./services/agreementService");

const {
  getMasterAnalysis
} = require("./services/masterAnalysisService");

const {
  getExplanation
} = require("./services/explanationService");
// ============================
// Routes
// ============================

const watchlistRoutes = require("./routes/watchlistRoutes");
const portfolioRoutes = require("./routes/portfolioRoutes");

const app = express();
const PORT = process.env.PORT || 5000;


// ============================
// Middleware
// ============================

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// ============================
// API Routes
// ============================
app.use("/api/watchlist", watchlistRoutes);
app.use("/api/portfolio", portfolioRoutes);
// ============================
// Home
// ============================

app.get("/", (req, res) => {
  res.json({
    project: "AzaLens",
    version: "0.1.0",
    status: "Running",
    message: "Welcome to AzaLens 🚀"
  });
});

// ============================
// Health
// ============================

app.get("/health", (req, res) => {
  res.json({
    status: "Healthy",
    uptime: process.uptime(),
    timestamp: new Date()
  });
});

// ============================
// Version
// ============================

app.get("/version", (req, res) => {
  res.json({
    project: "AzaLens",
    version: "0.1.0"
  });
});

// ============================
// Live Quote
// ============================

app.get("/stock/:symbol", async (req, res) => {
  try {
    const symbol = req.params.symbol
      .trim()
      .toUpperCase();

    const result = await getMarketData(symbol);

    res.json(result);
  } catch (error) {
    console.error("Live Quote Route Error:", error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================
// Historical Data
// ============================

app.get("/history/:symbol", async (req, res) => {
  try {
    const symbol = req.params.symbol
      .trim()
      .toUpperCase();

    const interval =
      req.query.interval || "1day";

    const result =
      await getHistory(
        symbol,
        interval
      );

    res.json(result);
  } catch (error) {
    console.error("Historical Data Route Error:", error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================
// RSI
// ============================

app.get("/rsi/:symbol", async (req, res) => {
  try {
    const symbol = req.params.symbol
      .trim()
      .toUpperCase();

    const result = await getRSI(symbol);

    res.json(result);
  } catch (error) {
    console.error("RSI Route Error:", error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================
// EMA
// ============================

app.get("/ema/:symbol", async (req, res) => {
  try {
    const symbol = req.params.symbol
      .trim()
      .toUpperCase();

    const result = await getEMA(symbol);

    res.json(result);
  } catch (error) {
    console.error("EMA Route Error:", error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================
// SMA
// ============================

app.get("/sma/:symbol", async (req, res) => {
  try {
    const symbol = req.params.symbol
      .trim()
      .toUpperCase();

    const result = await getSMA(symbol);

    res.json(result);
  } catch (error) {
    console.error("SMA Route Error:", error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================
// MACD
// ============================

app.get("/macd/:symbol", async (req, res) => {
  try {
    const symbol = req.params.symbol
      .trim()
      .toUpperCase();

    const result = await getMACD(symbol);

    res.json(result);
  } catch (error) {
    console.error("MACD Route Error:", error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================
// Bollinger Bands
// ============================

app.get("/bollinger/:symbol", async (req, res) => {
  try {
    const symbol = req.params.symbol
      .trim()
      .toUpperCase();

    const result = await getBollinger(symbol);

    res.json(result);
  } catch (error) {
    console.error("Bollinger Route Error:", error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================
// ATR
// ============================

app.get("/atr/:symbol", async (req, res) => {
  try {
    const symbol = req.params.symbol
      .trim()
      .toUpperCase();

    const result = await getATR(symbol);

    res.json(result);
  } catch (error) {
    console.error("ATR Route Error:", error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================
// ADX
// ============================

app.get("/adx/:symbol", async (req, res) => {
  try {
    const symbol = req.params.symbol
      .trim()
      .toUpperCase();

    const result = await getADX(symbol);

    res.json(result);
  } catch (error) {
    console.error("ADX Route Error:", error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================
// OBV
// ============================

app.get("/obv/:symbol", async (req, res) => {
  try {
    const symbol = req.params.symbol
      .trim()
      .toUpperCase();

    const result = await getOBV(symbol);

    res.json(result);
  } catch (error) {
    console.error("OBV Route Error:", error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================
// Relative Volume
// ============================

app.get("/rvol/:symbol", async (req, res) => {
  try {
    const symbol = req.params.symbol
      .trim()
      .toUpperCase();

    const result = await getRVOL(symbol);

    res.json(result);
  } catch (error) {
    console.error("RVOL Route Error:", error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================
// Volume Spike Detector
// ============================

app.get("/volume-spike/:symbol", async (req, res) => {
  try {
    const symbol = req.params.symbol
      .trim()
      .toUpperCase();

    const result = await getVolumeSpike(symbol);

    res.json(result);
  } catch (error) {
    console.error("Volume Spike Route Error:", error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================
// Candlestick Pattern Engine
// ============================

app.get("/candlestick/:symbol", async (req, res) => {
  try {
    const symbol = req.params.symbol
      .trim()
      .toUpperCase();

    const result = await getCandlestick(symbol);

    res.json(result);
  } catch (error) {
    console.error("Candlestick Route Error:", error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================
// Trend Engine
// ============================

app.get("/trend/:symbol", async (req, res) => {
  try {
    const symbol = req.params.symbol
      .trim()
      .toUpperCase();

    const result = await getTrend(symbol);

    res.json(result);
  } catch (error) {
    console.error("Trend Route Error:", error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================
// Agreement Engine
// ============================

app.get("/agreement/:symbol", async (req, res) => {
  try {
    const symbol = req.params.symbol
      .trim()
      .toUpperCase();

    const result = await getAgreement(symbol);

    res.json(result);
  } catch (error) {
    console.error("Agreement Route Error:", error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================
// Master Analysis Engine
// ============================

app.get("/api/analyze/:symbol", async (req, res) => {
  try {
    const symbol = req.params.symbol
      .trim()
      .toUpperCase();

    const result = await getMasterAnalysis(symbol);

    const statusCode = result.success ? 200 : 500;

    res.status(statusCode).json(result);
  } catch (error) {
    console.error("Master Analysis Route Error:", error);

    res.status(500).json({
      success: false,
      error: "Unable to generate master analysis.",
      details: error.message
    });
  }
});

// ============================
// Explanation Engine
// ============================

app.get("/api/explanation/:symbol", async (req, res) => {
  try {
    const symbol = req.params.symbol
      .trim()
      .toUpperCase();

    const result = await getExplanation(symbol);

    const statusCode = result.success ? 200 : 500;

    res.status(statusCode).json(result);
  } catch (error) {
    console.error("Explanation Route Error:", error);

    res.status(500).json({
      success: false,
      error: "Unable to generate explanation.",
      details: error.message
    });
  }
});

// ============================
// 404 Route
// ============================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found."
  });
});

// ============================
// Start Server
// ============================

app.listen(PORT, () => {
  console.log(
    `🚀 AzaLens Backend running on port ${PORT}`
  );
});