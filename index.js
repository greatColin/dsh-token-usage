/**
 * Token usage Host half: a durable per-request usage table derived from the
 * durable Session logs, plus the JSON API the Web page reads.
 *
 * The log stays the source of truth: a session file is re-parsed as a whole and
 * its rows are replaced atomically, so rows are idempotent by
 * (session_id, seq) and a stale scan can never double count. `charged` is
 * decided here, not by the reader, because one step may settle twice
 * (assistant/attempt then assistant/message) while a retried step settles for
 * real twice.
 */
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import zlib from 'node:zlib'
import { DatabaseSync } from 'node:sqlite'

const ZSTD_MAGIC = 0xFD2FB528
const HOUR_MS = 3_600_000
const SYNC_THROTTLE_MS = 1500

/** Registered plugin services: the Host HTTP carrier is the only requirement. */
export const inject = ['webServer']

/**
 * Walk one session artifact's concatenated Zstandard frames.
 * @param {Buffer} buffer complete artifact bytes.
 * @returns {{start:number,end:number}[]} structurally complete frame ranges.
 */
function scanFrames (buffer) {
  const frames = []
  let offset = 0
  while (offset < buffer.length) {
    const start = offset
    if (buffer.length - offset < 4) break
    if (buffer.readUInt32LE(offset) !== ZSTD_MAGIC) throw new Error(`invalid frame magic at byte ${offset}`)
    offset += 4
    if (offset === buffer.length) break
    const descriptor = buffer.readUInt8(offset)
    offset += 1
    const contentSizeFlag = descriptor >>> 6
    const singleSegment = (descriptor & 0x20) !== 0
    const checksum = (descriptor & 0x04) !== 0
    const dictionaryFlag = descriptor & 0x03
    const dictionaryBytes = dictionaryFlag === 3 ? 4 : dictionaryFlag
    const contentSizeBytes = contentSizeFlag === 0
      ? (singleSegment ? 1 : 0)
      : 1 << contentSizeFlag
    offset += (singleSegment ? 0 : 1) + dictionaryBytes + contentSizeBytes
    for (;;) {
      if (buffer.length - offset < 3) { offset = buffer.length; break }
      const blockHeader = buffer.readUIntLE(offset, 3)
      offset += 3
      const lastBlock = (blockHeader & 1) !== 0
      const blockType = (blockHeader >>> 1) & 0x03
      const blockSize = blockHeader >>> 3
      offset += blockType === 0x01 ? 1 : blockSize
      if (lastBlock) break
    }
    if (offset > buffer.length) { offset = buffer.length; break }
    if (checksum) offset += 4
    if (offset > buffer.length) break
    frames.push({ start, end: offset })
  }
  return frames
}

/**
 * Decode every event of one session artifact.
 * @param {string} file absolute artifact path.
 * @returns {object[]} parsed events in file order.
 */
function readEvents (file) {
  const buffer = fs.readFileSync(file)
  const isZstd = buffer.length >= 4 && buffer.readUInt32LE(0) === ZSTD_MAGIC
  const chunks = []
  if (isZstd) {
    for (const frame of scanFrames(buffer)) chunks.push(zlib.zstdDecompressSync(buffer.subarray(frame.start, frame.end)))
  } else {
    chunks.push(buffer)
  }
  const events = []
  for (const chunk of chunks) {
    for (const line of chunk.toString('utf8').split('\n')) {
      const text = line.trim()
      if (text.length === 0) continue
      try {
        events.push(JSON.parse(text))
      } catch {
        // A torn or partial final line is not a committed event.
      }
    }
  }
  return events
}

/**
 * Read the provider-reported usage embedded in one settlement.
 * @param {object} event assistant/message or assistant/attempt.
 * @returns {{inputTokens:number,outputTokens:number,cacheReadTokens?:number,cacheWriteTokens?:number}|undefined} the sample.
 */
function usageOf (event) {
  const data = event.data
  if (data && typeof data.usage === 'object' && data.usage !== null) return data.usage
  const stream = Array.isArray(data?.stream) ? data.stream : []
  for (let index = stream.length - 1; index >= 0; index -= 1) {
    const usage = stream[index]?.chunk?.usage
    if (typeof usage === 'object' && usage !== null) return usage
  }
  return undefined
}

/**
 * Fold one session's events into chargeable usage rows.
 * @param {object[]} events parsed session events.
 * @param {string} sessionId owning session id.
 * @param {string} file artifact path.
 * @returns {{rows:object[], meta:object}} rows plus the session metadata.
 */
function foldSession (events, sessionId, file) {
  const header = events.find(event => event.type === 'session') ?? {}
  let inherited = 0
  for (const event of events) {
    if (event.type === 'session/end-seed' && event.data?.inherited === true) {
      inherited = Math.max(inherited, Number(event.seq) + 1)
    }
  }
  let title = null
  let cwd = typeof header.cwd === 'string' ? header.cwd : null
  let origin = typeof header.origin === 'string' ? header.origin : null
  let parentSessionId = typeof header.parentSession === 'string' ? header.parentSession : null
  let updatedAt = Number(header.createdAt) || 0
  let config = null
  const rows = []
  let last = null

  for (const event of events) {
    const seq = Number(event.seq)
    const time = Number(event.time) || 0
    if (time > updatedAt) updatedAt = time
    if (!Number.isFinite(seq)) continue
    if (event.type === 'session/title' && typeof event.data?.title === 'string') title = event.data.title
    if (seq < inherited) continue
    if (event.type === 'request/header') {
      const next = event.data?.header?.config
      if (next && typeof next.model === 'string') config = next
      continue
    }
    if (event.type === 'llm/retry-started') {
      if (last && last.turn === event.data?.turn && last.step === event.data?.step) last = null
      continue
    }
    if (event.type !== 'assistant/message' && event.type !== 'assistant/attempt') continue
    const usage = usageOf(event)
    if (usage === undefined) continue
    const turn = Number(event.data?.turn) || 0
    const step = Number(event.data?.step) || 0
    const sameStep = last !== null && last.turn === turn && last.step === step
    if (sameStep) {
      // The later settlement of one step owns the charge; the earlier attempt row stays as evidence.
      last.row.charged = 0
    }
    const row = {
      session_id: sessionId,
      seq,
      time,
      hour: Math.floor(time / HOUR_MS),
      provider: typeof config?.provider === 'string' ? config.provider : null,
      model: typeof config?.model === 'string' ? config.model : null,
      turn,
      step,
      type: event.type === 'assistant/message' ? 'message' : 'attempt',
      charged: 1,
      tok_in: Number(usage.inputTokens) || 0,
      tok_out: Number(usage.outputTokens) || 0,
      tok_cache_read: Number(usage.cacheReadTokens) || 0,
      tok_cache_write: Number(usage.cacheWriteTokens) || 0,
    }
    rows.push(row)
    last = { turn, step, row }
  }

  return {
    rows,
    meta: {
      id: sessionId,
      title,
      cwd,
      origin,
      parent_session_id: parentSessionId,
      created_at: Number(header.createdAt) || 0,
      updated_at: updatedAt,
      file,
    },
  }
}

/**
 * List every session artifact under the sessions root.
 * @param {string} root sessions directory.
 * @returns {string[]} artifact paths.
 */
function listArtifacts (root) {
  const files = []
  const walk = directory => {
    let entries
    try {
      entries = fs.readdirSync(directory, { withFileTypes: true })
    } catch {
      return
    }
    for (const entry of entries) {
      const full = path.join(directory, entry.name)
      if (entry.isDirectory()) walk(full)
      else if (/^session(\..*)?\.jsonl(\.zstd)?$/.test(entry.name)) files.push(full)
    }
  }
  walk(root)
  return files
}

/**
 * Serve one JSON response.
 * @param {import('node:http').ServerResponse} res response.
 * @param {number} status HTTP status.
 * @param {unknown} body JSON body.
 */
function sendJson (res, status, body) {
  const text = JSON.stringify(body)
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Content-Length': Buffer.byteLength(text),
  })
  res.end(text)
}

/**
 * Host half entry: open the store, keep it in step with the Session logs, and
 * answer the page's queries.
 * @param {import('@deepseek-ai/cordis').Context} ctx plugin context.
 */
export function apply (ctx) {
  const home = process.env.DSH_HOME || path.join(os.homedir(), '.dsh')
  const sessionsRoot = path.join(home, 'sessions')
  const storeDir = path.join(home, 'storages', 'token-usage')
  fs.mkdirSync(storeDir, { recursive: true })
  const db = new DatabaseSync(path.join(storeDir, 'usage.db'))
  db.exec('PRAGMA journal_mode = WAL')
  db.exec('PRAGMA synchronous = NORMAL')
  db.exec(`
    CREATE TABLE IF NOT EXISTS usage (
      session_id TEXT NOT NULL,
      seq INTEGER NOT NULL,
      time INTEGER NOT NULL,
      hour INTEGER NOT NULL,
      provider TEXT,
      model TEXT,
      turn INTEGER NOT NULL DEFAULT 0,
      step INTEGER NOT NULL DEFAULT 0,
      type TEXT NOT NULL,
      charged INTEGER NOT NULL DEFAULT 1,
      tok_in INTEGER NOT NULL DEFAULT 0,
      tok_out INTEGER NOT NULL DEFAULT 0,
      tok_cache_read INTEGER NOT NULL DEFAULT 0,
      tok_cache_write INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (session_id, seq)
    );
    CREATE INDEX IF NOT EXISTS usage_time ON usage(time);
    CREATE INDEX IF NOT EXISTS usage_hour ON usage(hour);
    CREATE TABLE IF NOT EXISTS files (
      path TEXT PRIMARY KEY,
      session_id TEXT,
      mtime REAL NOT NULL,
      size INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      title TEXT,
      cwd TEXT,
      origin TEXT,
      parent_session_id TEXT,
      created_at INTEGER NOT NULL DEFAULT 0,
      updated_at INTEGER NOT NULL DEFAULT 0,
      file TEXT
    );
  `)

  const selectFile = db.prepare('SELECT mtime, size FROM files WHERE path = ?')
  const upsertFile = db.prepare('INSERT INTO files (path, session_id, mtime, size) VALUES (?, ?, ?, ?) ON CONFLICT(path) DO UPDATE SET session_id = excluded.session_id, mtime = excluded.mtime, size = excluded.size')
  const upsertSession = db.prepare(`INSERT INTO sessions (id, title, cwd, origin, parent_session_id, created_at, updated_at, file)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      title = COALESCE(excluded.title, sessions.title),
      cwd = COALESCE(excluded.cwd, sessions.cwd),
      origin = COALESCE(excluded.origin, sessions.origin),
      parent_session_id = COALESCE(excluded.parent_session_id, sessions.parent_session_id),
      created_at = MAX(sessions.created_at, excluded.created_at),
      updated_at = MAX(sessions.updated_at, excluded.updated_at),
      file = excluded.file`)
  const deleteUsage = db.prepare('DELETE FROM usage WHERE session_id = ?')
  const insertUsage = db.prepare(`INSERT INTO usage
    (session_id, seq, time, hour, provider, model, turn, step, type, charged, tok_in, tok_out, tok_cache_read, tok_cache_write)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)

  let lastSyncAt = 0
  let lastSyncReport = { files: 0, changed: 0, ms: 0, errors: [] }

  /**
   * Re-read every changed artifact and replace its rows atomically.
   * @param {boolean} force ignore file stat equality.
   * @returns {{files:number,changed:number,ms:number,errors:string[]}} the run report.
   */
  function sync (force) {
    const startedAt = Date.now()
    const artifacts = listArtifacts(sessionsRoot)
    let changed = 0
    const errors = []
    for (const file of artifacts) {
      let stat
      try {
        stat = fs.statSync(file)
      } catch (error) {
        errors.push(`${file}: ${String(error)}`)
        continue
      }
      const known = selectFile.get(file)
      if (!force && known && known.mtime === stat.mtimeMs && known.size === stat.size) continue
      let folded
      try {
        folded = foldSession(readEvents(file), path.basename(path.dirname(file)), file)
      } catch (error) {
        errors.push(`${path.basename(path.dirname(file))}: ${String(error)}`)
        continue
      }
      db.exec('BEGIN IMMEDIATE')
      try {
        deleteUsage.run(folded.meta.id)
        for (const row of folded.rows) {
          insertUsage.run(row.session_id, row.seq, row.time, row.hour, row.provider, row.model,
            row.turn, row.step, row.type, row.charged, row.tok_in, row.tok_out, row.tok_cache_read, row.tok_cache_write)
        }
        upsertSession.run(folded.meta.id, folded.meta.title, folded.meta.cwd, folded.meta.origin,
          folded.meta.parent_session_id, folded.meta.created_at, folded.meta.updated_at, folded.meta.file)
        upsertFile.run(file, folded.meta.id, stat.mtimeMs, stat.size)
        db.exec('COMMIT')
        changed += 1
      } catch (error) {
        db.exec('ROLLBACK')
        errors.push(`${folded.meta.id}: ${String(error)}`)
      }
    }
    lastSyncAt = Date.now()
    lastSyncReport = { files: artifacts.length, changed, ms: lastSyncAt - startedAt, errors: errors.slice(0, 5) }
    if (errors.length > 0) ctx.logger?.warn?.(`token-usage: ${errors.length} artifact(s) failed to sync`)
    return lastSyncReport
  }

  /**
   * Expand a selection with descendant subagent sessions.
   * @param {string[]} ids selected session ids.
   * @returns {string[]} the ids plus every descendant.
   */
  function withDescendants (ids) {
    if (ids.length === 0) return []
    const children = new Map()
    for (const row of db.prepare('SELECT id, parent_session_id FROM sessions WHERE parent_session_id IS NOT NULL').all()) {
      const list = children.get(row.parent_session_id) ?? []
      list.push(row.id)
      children.set(row.parent_session_id, list)
    }
    const seen = new Set(ids)
    const queue = [...ids]
    while (queue.length > 0) {
      const current = queue.pop()
      for (const child of children.get(current) ?? []) {
        if (seen.has(child)) continue
        seen.add(child)
        queue.push(child)
      }
    }
    return [...seen]
  }

  /**
   * Answer one page query.
   * @param {URL} url request URL.
   * @param {import('node:http').ServerResponse} res response.
   */
  function overview (url, res) {
    const now = Date.now()
    if (url.searchParams.get('refresh') === '1' || now - lastSyncAt > SYNC_THROTTLE_MS) sync(false)
    const rawTo = Number(url.searchParams.get('to'))
    const to = Number.isFinite(rawTo) && rawTo > 0 ? rawTo : now
    const rawFrom = Number(url.searchParams.get('from'))
    const from = Number.isFinite(rawFrom) && rawFrom >= 0 ? rawFrom : to - 7 * 24 * 3_600_000
    const requested = (url.searchParams.get('sessions') ?? '').split(',').map(value => value.trim()).filter(Boolean)
    const includeSubagents = url.searchParams.get('includeSubagents') !== '0'
    const scope = requested.length === 0 ? [] : (includeSubagents ? withDescendants(requested) : requested)
    const granularityParam = url.searchParams.get('granularity')
    const span = to - from
    const bucket = granularityParam === 'day' || (granularityParam !== 'hour' && span > 3 * 24 * 3_600_000)
      ? { unit: 'day', size: 24 }
      : { unit: 'hour', size: 1 }
    // The browser reports its UTC offset in minutes; shifting by the local offset
    // makes hourly and daily buckets start at the viewer's local hour and midnight
    // instead of UTC ones.
    const rawOffset = Number(url.searchParams.get('tzOffset'))
    const tzShift = Number.isFinite(rawOffset) ? -rawOffset * 60_000 : 0

    const where = ['charged = 1', 'time >= ?', 'time <= ?']
    const params = [from, to]
    if (scope.length > 0) {
      where.push(`session_id IN (${scope.map(() => '?').join(',')})`)
      params.push(...scope)
    }
    const clause = where.join(' AND ')

    const totals = db.prepare(`SELECT COALESCE(SUM(tok_in),0) AS tok_in, COALESCE(SUM(tok_out),0) AS tok_out,
      COALESCE(SUM(tok_cache_read),0) AS tok_cache_read, COALESCE(SUM(tok_cache_write),0) AS tok_cache_write,
      COUNT(*) AS calls FROM usage WHERE ${clause}`).get(...params)
    const series = db.prepare(`SELECT CAST((time + ?) / ? AS INTEGER) AS bucket, SUM(tok_in) AS tok_in, SUM(tok_out) AS tok_out,
      SUM(tok_cache_read) AS tok_cache_read, SUM(tok_cache_write) AS tok_cache_write
      FROM usage WHERE ${clause} GROUP BY bucket ORDER BY bucket`).all(tzShift, bucket.size * 3_600_000, ...params)

    const promptTokens = totals.tok_in + totals.tok_cache_read + totals.tok_cache_write
    sendJson(res, 200, {
      granularity: bucket.unit,
      bucketSize: bucket.size,
      from,
      to,
      scope,
      totals: {
        in: totals.tok_in,
        out: totals.tok_out,
        cacheRead: totals.tok_cache_read,
        cacheWrite: totals.tok_cache_write,
        total: totals.tok_in + totals.tok_out + totals.tok_cache_read + totals.tok_cache_write,
        calls: totals.calls,
        cacheHitRate: promptTokens === 0 ? null : totals.tok_cache_read / promptTokens,
      },
      series: series.map(row => ({
        bucket: Number(row.bucket) * bucket.size * 3_600_000 - tzShift,
        in: row.tok_in,
        out: row.tok_out,
        cacheRead: row.tok_cache_read,
        cacheWrite: row.tok_cache_write,
      })),
      sync: lastSyncReport,
    })
  }

  /**
   * Per-model totals and a per-model series over the same filters as the overview.
   * @param {URL} url request URL.
   * @param {import('node:http').ServerResponse} res response.
   */
  function models (url, res) {
    const now = Date.now()
    if (url.searchParams.get('refresh') === '1' || now - lastSyncAt > SYNC_THROTTLE_MS) sync(false)
    const rawTo = Number(url.searchParams.get('to'))
    const to = Number.isFinite(rawTo) && rawTo > 0 ? rawTo : now
    const rawFrom = Number(url.searchParams.get('from'))
    const from = Number.isFinite(rawFrom) && rawFrom >= 0 ? rawFrom : to - 7 * 24 * 3_600_000
    const requested = (url.searchParams.get('sessions') ?? '').split(',').map(value => value.trim()).filter(Boolean)
    const includeSubagents = url.searchParams.get('includeSubagents') !== '0'
    const scope = requested.length === 0 ? [] : (includeSubagents ? withDescendants(requested) : requested)
    const granularityParam = url.searchParams.get('granularity')
    const span = to - from
    const bucket = granularityParam === 'day' || (granularityParam !== 'hour' && span > 3 * 24 * 3_600_000)
      ? { unit: 'day', size: 24 }
      : { unit: 'hour', size: 1 }
    const rawOffset = Number(url.searchParams.get('tzOffset'))
    const tzShift = Number.isFinite(rawOffset) ? -rawOffset * 60_000 : 0

    const where = ['charged = 1', 'time >= ?', 'time <= ?']
    const params = [from, to]
    if (scope.length > 0) {
      where.push(`session_id IN (${scope.map(() => '?').join(',')})`)
      params.push(...scope)
    }
    const clause = where.join(' AND ')

    // A NULL model (calls that carried none) is reported as '' so it still groups.
    const totals = db.prepare(`SELECT COALESCE(model, '') AS model,
      COALESCE(SUM(tok_in),0) AS tok_in, COALESCE(SUM(tok_out),0) AS tok_out,
      COALESCE(SUM(tok_cache_read),0) AS tok_cache_read, COALESCE(SUM(tok_cache_write),0) AS tok_cache_write,
      COUNT(*) AS calls FROM usage WHERE ${clause} GROUP BY model ORDER BY (SUM(tok_in)+SUM(tok_out)+SUM(tok_cache_read)+SUM(tok_cache_write)) DESC`).all(...params)
    const series = db.prepare(`SELECT COALESCE(model, '') AS model, CAST((time + ?) / ? AS INTEGER) AS bucket,
      SUM(tok_in) AS tok_in, SUM(tok_out) AS tok_out, SUM(tok_cache_read) AS tok_cache_read, SUM(tok_cache_write) AS tok_cache_write
      FROM usage WHERE ${clause} GROUP BY model, bucket ORDER BY bucket`).all(tzShift, bucket.size * 3_600_000, ...params)

    sendJson(res, 200, {
      granularity: bucket.unit,
      bucketSize: bucket.size,
      from,
      to,
      scope,
      models: totals.map(row => ({
        model: row.model,
        in: row.tok_in,
        out: row.tok_out,
        cacheRead: row.tok_cache_read,
        cacheWrite: row.tok_cache_write,
        total: row.tok_in + row.tok_out + row.tok_cache_read + row.tok_cache_write,
        calls: row.calls,
      })),
      series: series.map(row => ({
        model: row.model,
        bucket: Number(row.bucket) * bucket.size * 3_600_000 - tzShift,
        total: row.tok_in + row.tok_out + row.tok_cache_read + row.tok_cache_write,
      })),
    })
  }

  /**
   * List sessions with their in-range totals for the picker.
   * @param {URL} url request URL.
   * @param {import('node:http').ServerResponse} res response.
   */
  function sessionList (url, res) {
    const now = Date.now()
    if (url.searchParams.get('refresh') === '1' || now - lastSyncAt > SYNC_THROTTLE_MS) sync(false)
    const rawTo = Number(url.searchParams.get('to'))
    const to = Number.isFinite(rawTo) && rawTo > 0 ? rawTo : now
    const rawFrom = Number(url.searchParams.get('from'))
    const from = Number.isFinite(rawFrom) && rawFrom >= 0 ? rawFrom : 0
    const rows = db.prepare(`SELECT s.id, s.title, s.cwd, s.origin, s.parent_session_id, s.created_at, s.updated_at,
      COALESCE(SUM(CASE WHEN u.charged = 1 THEN u.tok_in + u.tok_out + u.tok_cache_read + u.tok_cache_write END), 0) AS total,
      COUNT(CASE WHEN u.charged = 1 THEN 1 END) AS calls
      FROM sessions s LEFT JOIN usage u ON u.session_id = s.id AND u.time >= ? AND u.time <= ?
      GROUP BY s.id ORDER BY s.updated_at DESC`).all(from, to)
    sendJson(res, 200, {
      sessions: rows.map(row => ({
        id: row.id,
        title: row.title,
        cwd: row.cwd,
        origin: row.origin,
        parentSessionId: row.parent_session_id,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        total: row.total,
        calls: row.calls,
      })),
    })
  }

  /**
   * Force a full re-read of every artifact.
   * @param {import('node:http').ServerResponse} res response.
   */
  function rescan (res) {
    db.exec('DELETE FROM files')
    sendJson(res, 200, sync(true))
  }

  const dispose = ctx.webServer.register({
    kind: 'prefix',
    path: '/token-usage/api',
    handler: (req, res) => {
      try {
        const url = new URL(req.url ?? '/', 'http://localhost')
        if (req.method === 'POST' && url.pathname === '/token-usage/api/rescan') return rescan(res)
        if (req.method !== 'GET' && req.method !== 'HEAD') return sendJson(res, 405, { error: 'method not allowed' })
        if (url.pathname === '/token-usage/api/overview') return overview(url, res)
        if (url.pathname === '/token-usage/api/sessions') return sessionList(url, res)
        if (url.pathname === '/token-usage/api/models') return models(url, res)
        return sendJson(res, 404, { error: 'not found' })
      } catch (error) {
        ctx.logger?.warn?.(`token-usage: request failed: ${String(error)}`)
        return sendJson(res, 500, { error: String(error) })
      }
    },
  })

  ctx.effect(() => () => {
    dispose()
    db.close()
  }, 'token-usage: store')
}
