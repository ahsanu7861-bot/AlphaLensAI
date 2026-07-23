# Shariah development fixtures

Fixture mode reads a raw provider-shaped JSON response named after the
normalized ticker, for example `AAPL.json`.

Characters other than letters, numbers, and hyphens are converted to
underscores in fixture filenames, so `BRK.B` is read from `BRK_B.json`.

Fixtures must contain no credentials or personal data. Do not commit licensed
provider responses unless AzaLens has written permission to store and reuse
them. When no approved fixture exists, the application must return an
unavailable Shariah result instead of inventing a verdict.
