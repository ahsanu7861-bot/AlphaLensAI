const express = require("express");

const {
  getWatchlist,
  addSymbol,
  removeSymbol,
} = require("../services/watchlistService");

const router = express.Router();

function isValidSymbol(symbol) {
  return /^[A-Z0-9.\-]{1,15}$/.test(symbol);
}

// GET /api/watchlist
router.get("/", async (req, res) => {
  try {
    const watchlist = await getWatchlist();

    return res.status(200).json({
      success: true,
      message: "Watchlist retrieved successfully.",
      data: watchlist,
    });
  } catch (error) {
    console.error("Watchlist GET error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve watchlist.",
    });
  }
});

// POST /api/watchlist
router.post("/", async (req, res) => {
  try {
    const rawSymbol = req.body?.symbol;

    if (typeof rawSymbol !== "string" || !rawSymbol.trim()) {
      return res.status(400).json({
        success: false,
        message: "A valid symbol is required.",
      });
    }

    const symbol = rawSymbol.trim().toUpperCase();

    if (!isValidSymbol(symbol)) {
      return res.status(400).json({
        success: false,
        message: "Symbol format is invalid.",
      });
    }

    const item = await addSymbol(symbol);

    return res.status(201).json({
      success: true,
      message: `${symbol} added to watchlist.`,
      data: item,
    });
  } catch (error) {
    const statusCode =
      error.message === "Symbol already exists in watchlist." ? 409 : 500;

    return res.status(statusCode).json({
      success: false,
      message:
        statusCode === 409
          ? error.message
          : "Unable to add symbol to watchlist.",
    });
  }
});

// DELETE /api/watchlist/:symbol
router.delete("/:symbol", async (req, res) => {
  try {
    const symbol = req.params.symbol.trim().toUpperCase();

    if (!isValidSymbol(symbol)) {
      return res.status(400).json({
        success: false,
        message: "Symbol format is invalid.",
      });
    }

    const updatedWatchlist = await removeSymbol(symbol);

    return res.status(200).json({
      success: true,
      message: `${symbol} removed from watchlist.`,
      data: updatedWatchlist,
    });
  } catch (error) {
    const statusCode = error.message === "Symbol not found." ? 404 : 500;

    return res.status(statusCode).json({
      success: false,
      message:
        statusCode === 404
          ? error.message
          : "Unable to remove symbol from watchlist.",
    });
  }
});

module.exports = router;