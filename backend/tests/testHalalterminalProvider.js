require("dotenv").config();

const {
  fetchScreening,
} = require("../providers/halalTerminalProvider");

async function run() {
  const symbol = process.argv[2] || "AAPL";

  console.log(`Testing Halal Terminal screening for ${symbol}...\n`);

  const result = await fetchScreening(symbol);

  console.dir(result, {
    depth: null,
    colors: true,
  });

  process.exit(result.success ? 0 : 1);
}

run().catch((error) => {
  console.error("Unexpected test failure:", error);
  process.exit(1);
});