const fs = require("fs").promises;
const path = require("path");

const WATCHLIST_FILE = path.join(
  __dirname,
  "../storage/watchlists.json"
);

// Read watchlist
async function getWatchlist() {
  try {
    const data = await fs.readFile(WATCHLIST_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Save watchlist
async function saveWatchlist(watchlist) {
  await fs.writeFile(
    WATCHLIST_FILE,
    JSON.stringify(watchlist, null, 2)
  );
}

// Add symbol
async function addSymbol(symbol) {
  symbol = symbol.toUpperCase().trim();

  const watchlist = await getWatchlist();

  const exists = watchlist.some(
    (item) => item.symbol === symbol
  );

  if (exists) {
    throw new Error("Symbol already exists in watchlist.");
  }

  const newItem = {
    symbol,
    addedAt: new Date().toISOString(),
  };

  watchlist.push(newItem);

  await saveWatchlist(watchlist);

  return newItem;
}

// Delete symbol
async function removeSymbol(symbol) {
  symbol = symbol.toUpperCase().trim();

  const watchlist = await getWatchlist();

  const filtered = watchlist.filter(
    (item) => item.symbol !== symbol
  );

  if (filtered.length === watchlist.length) {
    throw new Error("Symbol not found.");
  }

  await saveWatchlist(filtered);

  return filtered;
}

module.exports = {
  getWatchlist,
  addSymbol,
  removeSymbol,
};