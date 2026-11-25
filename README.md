# Token usage

A DeepSeek Harness Web plugin that reports how many tokens each session spent,
by hour, model, and workspace. It reads the session logs the Harness already
writes — no proxy, no account, no network — and keeps a small local index so the
page opens fast.

## Where it shows up

| Entry | Scope |
|---|---|
| **Settings → Token usage** | every session, last 7 days by default |
| **Usage** tab next to Chat / Trajectory | the current session, all time by default |

Both views share one data source and one set of numbers. The tab starts on the
session it belongs to; clearing the selection counts every session.

## What it counts

- Seven figures: total tokens, uncached input, output, cache read, cache write,
  cache hit rate, and call count.
- A stacked area chart of the four buckets over time, with hourly or daily
  buckets (chosen automatically from the range, or forced), hover readout, and
  a composition card with per-bucket bars and shares.
- Scope: all sessions, one recent session, or a picked set grouped by workspace,
  optionally including subagent sessions.

## Data rules

- One row per settled model call, keyed by `(session_id, seq)`. A step that
  settles twice keeps only the last settlement chargeable; a retried step is
  charged per attempt.
- Forked sessions skip their inherited prefix, so a fork plus its parent never
  double counts.
- Cache hit rate = cache read ÷ (uncached input + cache write + cache read).
- Daily buckets are folded in the browser's timezone.
- Rows live in `$DSH_HOME/storages/token-usage/usage.db`; the session log stays
  the source of truth, and a full re-scan reproduces the same numbers.

## Limitations

- Tokens only, no money: local pricing tables would be a guess, so the plugin
  does not show a cost.
- Not a bill; the figures describe what the local logs recorded.
- Deleted sessions keep their historical rows until a rebuild.
- The session picker renders at most 200 rows; search narrows the list.

## Install

From this directory:

```
dsh plugin --profile desktop add <absolute path to this directory>
```

Or in the Web GUI: **Plugins → Add plugin** and pick the directory. The bundle is
linked rather than copied, so editing the sources and refreshing the page picks
up client changes; Host changes need a restart.

## Develop

- `index.js` — Host half: scans `$DSH_HOME/sessions`, folds usage rows into
  SQLite (`node:sqlite`), serves `/token-usage/api/{overview,sessions,rescan}`.
- `client.js` — browser half: registers the Settings section and the
  `conversation.view` tab, renders both surfaces.
- `docs/DETAIL.md` — the plugin-page document shown in Plugins.

No build step: the client module is loaded as-is through `window.__ModuleLoader__`.
