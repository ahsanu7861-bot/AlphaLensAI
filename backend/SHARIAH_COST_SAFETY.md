# Shariah provider cost safety

AzaLens blocks paid Shariah-provider traffic by default. A live request is
possible only when all three controls allow it:

1. `SHARIAH_DATA_MODE=live`
2. `HALAL_TERMINAL_LIVE_ENABLED=true`
3. `HALAL_TERMINAL_MONTHLY_TOKEN_BUDGET` is a positive number with enough
   estimated tokens remaining

The safe development defaults require no environment changes:

```text
SHARIAH_DATA_MODE=offline
HALAL_TERMINAL_LIVE_ENABLED=false
HALAL_TERMINAL_MONTHLY_TOKEN_BUDGET=0
HALAL_TERMINAL_ESTIMATED_TOKENS_PER_REQUEST=10
```

## Runtime modes

- `offline`: never reads fixtures and never contacts Halal Terminal.
- `fixture`: reads `{SYMBOL}.json` from `backend/fixtures/shariah`.
- `cache-only`: returns an existing in-process cached result or an unavailable
  result; it never contacts Halal Terminal.
- `live`: permits a provider call only after the explicit live flag and monthly
  budget guard both pass.

The usage ledger is stored at
`backend/storage/halal-terminal-usage.json`, survives backend restarts, and is
excluded from Git. The guard reserves a conservative estimated cost before
each request because the provider response does not currently expose a trusted
token-usage total.

Ledger updates use an exclusive local lock. If another backend process is
already reserving tokens, the new request is blocked instead of risking an
overspend.

Do not enable live mode during routine frontend or backend development. Do not
commit API keys or licensed provider responses as fixtures.
