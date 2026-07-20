const fs = require("fs").promises;
const path = require("path");

const PORTFOLIO_FILE = path.join(
  __dirname,
  "../storage/portfolios.json"
);

async function getPortfolio() {
  try {
    const data = await fs.readFile(PORTFOLIO_FILE, "utf8");

    if (!data.trim()) {
      return [];
    }

    const portfolio = JSON.parse(data);

    if (!Array.isArray(portfolio)) {
      throw new Error("Portfolio storage must contain an array.");
    }

    return portfolio;
  } catch (error) {
    if (error.code === "ENOENT") {
      await savePortfolio([]);
      return [];
    }

    if (error instanceof SyntaxError) {
      throw new Error("Portfolio storage contains invalid JSON.");
    }

    throw error;
  }
}

async function savePortfolio(portfolio) {
  const temporaryFile = `${PORTFOLIO_FILE}.tmp`;

  await fs.writeFile(
    temporaryFile,
    JSON.stringify(portfolio, null, 2),
    "utf8"
  );

  await fs.rename(temporaryFile, PORTFOLIO_FILE);
}

async function addHolding({ symbol, shares, averagePrice }) {
  const normalizedSymbol = symbol.trim().toUpperCase();
  const portfolio = await getPortfolio();

  const existingHolding = portfolio.find(
    (holding) => holding.symbol === normalizedSymbol
  );

  if (existingHolding) {
    const error = new Error(
      "Symbol already exists in portfolio. Use the update endpoint instead."
    );

    error.code = "DUPLICATE_HOLDING";
    throw error;
  }

  const timestamp = new Date().toISOString();

  const holding = {
    symbol: normalizedSymbol,
    shares,
    averagePrice,
    addedAt: timestamp,
    updatedAt: timestamp,
  };

  portfolio.push(holding);
  await savePortfolio(portfolio);

  return holding;
}

async function updateHolding(symbol, updates) {
  const normalizedSymbol = symbol.trim().toUpperCase();
  const portfolio = await getPortfolio();

  const holdingIndex = portfolio.findIndex(
    (holding) => holding.symbol === normalizedSymbol
  );

  if (holdingIndex === -1) {
    const error = new Error("Holding not found.");
    error.code = "HOLDING_NOT_FOUND";
    throw error;
  }

  const currentHolding = portfolio[holdingIndex];

  const updatedHolding = {
    ...currentHolding,
    shares:
      updates.shares !== undefined
        ? updates.shares
        : currentHolding.shares,
    averagePrice:
      updates.averagePrice !== undefined
        ? updates.averagePrice
        : currentHolding.averagePrice,
    updatedAt: new Date().toISOString(),
  };

  portfolio[holdingIndex] = updatedHolding;
  await savePortfolio(portfolio);

  return updatedHolding;
}

async function removeHolding(symbol) {
  const normalizedSymbol = symbol.trim().toUpperCase();
  const portfolio = await getPortfolio();

  const holdingExists = portfolio.some(
    (holding) => holding.symbol === normalizedSymbol
  );

  if (!holdingExists) {
    const error = new Error("Holding not found.");
    error.code = "HOLDING_NOT_FOUND";
    throw error;
  }

  const updatedPortfolio = portfolio.filter(
    (holding) => holding.symbol !== normalizedSymbol
  );

  await savePortfolio(updatedPortfolio);

  return updatedPortfolio;
}

module.exports = {
  getPortfolio,
  addHolding,
  updateHolding,
  removeHolding,
};