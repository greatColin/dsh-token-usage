window.__ModuleLoader__.load({
  id: 'dsh-token-usage',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const { useCallback, useEffect, useMemo, useRef, useState } = React

    const NS = 'token-usage'
    const DAY_MS = 86_400_000
    const PICKER_ROW_LIMIT = 200

    const zh = {
      nav: 'Token 用量',
      viewLabel: '用量',
      title: 'Token 用量',
      subtitle: '本机会话日志里的模型调用消耗，只统计已结算的调用。',
      scopeAll: '全部会话',
      scopePick: '选择会话…',
      scopeRecent: '最近会话',
      scopeLabel: '范围',
      selected: '已选',
      clear: '清空',
      deselectAll: '取消全选',
      apply: '确定',
      cancel: '取消',
      search: '搜索会话标题、路径或 ID',
      selectAll: '全选',
      includeSubagents: '含子代理',
      rangeToday: '今天',
      range7: '近 7 天',
      range30: '近 30 天',
      rangeAll: '全部',
      rangeCustom: '自定义',
      from: '起始',
      to: '结束',
      rangeInvalid: '起始日期不能晚于结束日期',
      refresh: '刷新',
      rebuild: '重建',
      rebuilding: '重建中…',
      rebuildHint: '将重新扫描全部会话日志，可能需要几秒。被删除的会话会从统计中消失。',
      grainAuto: '自动',
      grainHour: '小时',
      grainDay: '天',
      cardTotal: '总 Token',
      cardIn: '未缓存输入',
      cardOut: '输出',
      cardCacheRead: '缓存读',
      cardCacheWrite: '缓存写',
      cardHit: '缓存命中率',
      cardCalls: '调用次数',
      chartTitle: '用量趋势',
      chartEmpty: '这个范围内没有数据。',
      chartEmptyHint: '换个时间范围，或把范围切到「全部」。',
      legendIn: '未缓存输入',
      legendOut: '输出',
      legendCache: '缓存读',
      legendCacheWrite: '缓存写',
      loading: '加载中…',
      failed: '读取失败',
      retry: '重试',
      pickerHint: '不选任何会话时统计全部会话。',
      pickerRange: '合计为所选时间范围内的用量',
      pickerLoading: '正在读取会话…',
      pickerFailed: '会话列表读取失败',
      pickerMore: '仅显示前 {n} 个，请继续搜索',
      noMatch: '没有匹配的会话',
      noSessions: '还没有可统计的会话',
      sessionsCount: '{shown} / {total} 个会话',
      workspaceUnknown: '未命名工作区',
      emptyScope: '当前统计全部会话。',
      removeSession: '移除 {name}',
      updatedAt: '更新于 {time}',
      updatedNow: '刚刚更新',
      peerLabel: '当前会话',
      breakdownTitle: '用量构成',
      breakdownSub: '按 Token 占比',
      rangeLabel: '时间',
      grainLabel: '粒度',
      modelShareTitle: '模型占比',
      modelShareSub: '按 Token 占比',
      modelUsageTitle: '模型用量',
      modelUsageSub: '按模型合计',
      modelTrendTitle: '模型用量趋势',
      modelEmpty: '这个范围内没有模型调用。',
      syncInfo: '扫描 {files} 个文件，更新 {changed} 个，耗时 {ms} ms',
    }

    const en = {
      nav: 'Token usage',
      viewLabel: 'Usage',
      title: 'Token usage',
      subtitle: 'Model consumption recorded in local session logs; settled calls only.',
      scopeAll: 'All sessions',
      scopePick: 'Choose sessions…',
      scopeRecent: 'Recent session',
      scopeLabel: 'Scope',
      selected: 'Selected',
      clear: 'Clear',
      deselectAll: 'Unselect all',
      apply: 'Apply',
      cancel: 'Cancel',
      search: 'Search title, path, or id',
      selectAll: 'Select all',
      includeSubagents: 'Include subagents',
      rangeToday: 'Today',
      range7: '7 days',
      range30: '30 days',
      rangeAll: 'All',
      rangeCustom: 'Custom',
      from: 'From',
      to: 'To',
      rangeInvalid: 'The start date cannot be later than the end date',
      refresh: 'Refresh',
      rebuild: 'Rebuild',
      rebuilding: 'Rebuilding…',
      rebuildHint: 'Re-scan every session log. Deleted sessions disappear from the totals.',
      grainAuto: 'Auto',
      grainHour: 'Hour',
      grainDay: 'Day',
      cardTotal: 'Total tokens',
      cardIn: 'Uncached input',
      cardOut: 'Output',
      cardCacheRead: 'Cache read',
      cardCacheWrite: 'Cache write',
      cardHit: 'Cache hit rate',
      cardCalls: 'Calls',
      chartTitle: 'Trend',
      chartEmpty: 'No data in this range.',
      chartEmptyHint: 'Try another range, or switch to All.',
      legendIn: 'Uncached input',
      legendOut: 'Output',
      legendCache: 'Cache read',
      legendCacheWrite: 'Cache write',
      loading: 'Loading…',
      failed: 'Failed to load',
      retry: 'Retry',
      pickerHint: 'With no session checked, every session is counted.',
      pickerRange: 'Totals cover the selected time range',
      pickerLoading: 'Loading sessions…',
      pickerFailed: 'Failed to load the session list',
      pickerMore: 'Showing the first {n}; keep typing to narrow',
      noMatch: 'No matching session',
      noSessions: 'No session has been recorded yet',
      sessionsCount: '{shown} / {total} sessions',
      workspaceUnknown: 'Unnamed workspace',
      emptyScope: 'All sessions are counted.',
      removeSession: 'Remove {name}',
      updatedAt: 'Updated {time}',
      updatedNow: 'Just updated',
      peerLabel: 'This session',
      breakdownTitle: 'Composition',
      breakdownSub: 'Share of tokens',
      rangeLabel: 'Time',
      grainLabel: 'Grain',
      modelShareTitle: 'Model share',
      modelShareSub: 'Share of tokens',
      modelUsageTitle: 'Model usage',
      modelUsageSub: 'Totals per model',
      modelTrendTitle: 'Model trend',
      modelEmpty: 'No model calls in this range.',
      syncInfo: 'Scanned {files} files, {changed} updated, {ms} ms',
    }

    function pad(value) {
      return String(value).padStart(2, '0')
    }

    function startOfToday(now) {
      const date = new Date(now)
      date.setHours(0, 0, 0, 0)
      return date.getTime()
    }

    function formatNumber(value) {
      const number = Number(value) || 0
      if (number >= 1e9) return `${(number / 1e9).toFixed(1)}B`
      if (number >= 1e6) return `${(number / 1e6).toFixed(1)}M`
      if (number >= 1e3) return `${(number / 1e3).toFixed(1)}K`
      return String(Math.round(number))
    }

    function formatExact(value) {
      return (Number(value) || 0).toLocaleString()
    }

    function formatPercent(value) {
      if (value === null || value === undefined || Number.isNaN(value)) return '—'
      return `${(value * 100).toFixed(1)}%`
    }

    function fmt(template, values) {
      return String(template).replace(/\{(\w+)\}/g, (match, key) => values[key] === undefined ? match : String(values[key]))
    }

    /**
     * Normalize one series bucket to epoch milliseconds. A Host that reports
     * buckets as hour indices (< 1e11) is distinguishable from one that reports
     * epoch milliseconds (>= 1e12 for every current date).
     */
    function bucketEpoch(bucket) {
      return bucket < 1e11 ? bucket * 3_600_000 : bucket
    }

    function formatBucket(bucket, granularity) {
      const date = new Date(bucketEpoch(bucket))
      if (granularity === 'hour') return `${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:00`
      return `${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
    }

    function formatClock(value) {
      const date = new Date(value)
      return `${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
    }

    function dateInputValue(value) {
      const date = new Date(value)
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
    }

    function parseDateInput(value, endOfDay) {
      const parts = String(value).split('-').map(Number)
      if (parts.length !== 3 || parts.some(part => !Number.isFinite(part))) return null
      return new Date(parts[0], parts[1] - 1, parts[2], endOfDay ? 23 : 0, endOfDay ? 59 : 0, endOfDay ? 59 : 0, endOfDay ? 999 : 0).getTime()
    }

    function rangeForPreset(preset) {
      const now = Date.now()
      // 1 rather than 0: a Host build that falls back on a falsy `from` would
      // otherwise narrow "all time" to its default window.
      if (preset === 'all') return { from: 1, to: now }
      if (preset === 'today') return { from: startOfToday(now), to: now }
      if (preset === '30d') return { from: startOfToday(now) - 29 * DAY_MS, to: now }
      return { from: startOfToday(now) - 6 * DAY_MS, to: now }
    }

    /**
     * Fold hourly buckets into local calendar days. The Host aggregates on its
     * own clock; folding here keeps day boundaries on the viewer's timezone.
     */
    function foldLocalDays(series) {
      const days = new Map()
      for (const point of series) {
        const date = new Date(bucketEpoch(point.bucket))
        date.setHours(0, 0, 0, 0)
        const key = date.getTime()
        const day = days.get(key) ?? { bucket: key, in: 0, out: 0, cacheRead: 0, cacheWrite: 0 }
        day.in += point.in
        day.out += point.out
        day.cacheRead += point.cacheRead
        day.cacheWrite += point.cacheWrite
        days.set(key, day)
      }
      return [...days.values()].sort((left, right) => left.bucket - right.bucket)
    }

    /** Animate one displayed number toward its new value. */
    function useCountUp(target, duration = 480) {
      const [value, setValue] = useState(target)
      const current = useRef(target)
      const frame = useRef(0)
      useEffect(() => {
        const from = current.current
        if (from === target) return
        const start = performance.now()
        const step = now => {
          const t = Math.min(1, (now - start) / duration)
          const eased = 1 - Math.pow(1 - t, 3)
          const next = from + (target - from) * eased
          current.current = next
          setValue(next)
          if (t < 1) frame.current = requestAnimationFrame(step)
          else { current.current = target; setValue(target) }
        }
        frame.current = requestAnimationFrame(step)
        return () => cancelAnimationFrame(frame.current)
      }, [target, duration])
      useEffect(() => () => cancelAnimationFrame(frame.current), [])
      return value
    }

    /** Shared data pipeline: one instance per mounted surface. */
    function useUsageData(t, defaultSession, initialPreset) {
      const [preset, setPreset] = useState(initialPreset)
      const [customFrom, setCustomFrom] = useState(dateInputValue(Date.now() - 6 * DAY_MS))
      const [customTo, setCustomTo] = useState(dateInputValue(Date.now()))
      const [customError, setCustomError] = useState(null)
      const [range, setRange] = useState(() => rangeForPreset(initialPreset))
      const [selected, setSelected] = useState(() => defaultSession === undefined ? [] : [defaultSession])
      const [includeSubagents, setIncludeSubagents] = useState(true)
      const [grain, setGrain] = useState('auto')
      const [pickerOpen, setPickerOpen] = useState(false)
      const [sessions, setSessions] = useState([])
      const [sessionsLoading, setSessionsLoading] = useState(true)
      const [sessionsError, setSessionsError] = useState(null)
      const [data, setData] = useState(null)
      const [modelData, setModelData] = useState(null)
      const [loading, setLoading] = useState(false)
      const [error, setError] = useState(null)
      const [tick, setTick] = useState(0)
      const [rebuilding, setRebuilding] = useState(false)
      const [updatedAt, setUpdatedAt] = useState(null)
      const alive = useRef(true)
      const generation = useRef(0)
      const firstPresetRun = useRef(true)
      const defaultRef = useRef(defaultSession)

      useEffect(() => () => { alive.current = false }, [])

      useEffect(() => {
        if (defaultRef.current === defaultSession) return
        defaultRef.current = defaultSession
        setSelected(defaultSession === undefined ? [] : [defaultSession])
      }, [defaultSession])

      useEffect(() => {
        if (firstPresetRun.current) { firstPresetRun.current = false; return }
        if (preset === 'custom') return
        setRange(rangeForPreset(preset))
      }, [preset])

      useEffect(() => {
        const controller = new AbortController()
        const gen = ++generation.current
        setLoading(true)
        setError(null)
        const params = new URLSearchParams({
          from: String(range.from), to: String(range.to), includeSubagents: includeSubagents ? '1' : '0',
          granularity: 'hour', tzOffset: String(new Date().getTimezoneOffset()),
        })
        if (selected.length > 0) params.set('sessions', selected.join(','))
        if (tick > 0) params.set('refresh', '1')
        const fetchJson = path => fetch(`${path}?${params}`, { signal: controller.signal })
          .then(response => response.ok ? response.json() : response.text().then(text => Promise.reject(new Error(text.slice(0, 200)))))
        Promise.all([fetchJson('/token-usage/api/overview'), fetchJson('/token-usage/api/models')])
          .then(([body, models]) => {
            if (!alive.current || gen !== generation.current) return
            setData(body)
            setModelData(models)
            setUpdatedAt(Date.now())
          })
          .catch(failure => {
            if (!alive.current || gen !== generation.current || failure.name === 'AbortError') return
            setError(String(failure.message ?? failure))
          })
          .finally(() => {
            if (!alive.current || gen !== generation.current) return
            setLoading(false)
          })
        return () => controller.abort()
      }, [range.from, range.to, selected, includeSubagents, tick])

      useEffect(() => {
        const controller = new AbortController()
        setSessionsLoading(true)
        setSessionsError(null)
        const params = new URLSearchParams({ from: String(range.from), to: String(range.to) })
        fetch(`/token-usage/api/sessions?${params}`, { signal: controller.signal })
          .then(response => response.ok ? response.json() : Promise.reject(new Error(String(response.status))))
          .then(body => { if (alive.current) setSessions(body.sessions ?? []) })
          .catch(failure => { if (alive.current && failure.name !== 'AbortError') setSessionsError(String(failure.message ?? failure)) })
          .finally(() => { if (alive.current) setSessionsLoading(false) })
        return () => controller.abort()
      }, [range.from, range.to, tick])

      const rebuild = useCallback(() => {
        if (!window.confirm(t('rebuildHint'))) return
        setRebuilding(true)
        setError(null)
        fetch('/token-usage/api/rescan', { method: 'POST' })
          .then(response => response.ok ? response.json() : Promise.reject(new Error(String(response.status))))
          .then(() => setTick(value => value + 1))
          .catch(failure => setError(String(failure.message ?? failure)))
          .finally(() => setRebuilding(false))
      }, [t])

      const applyCustom = (fromValue, toValue) => {
        const from = parseDateInput(fromValue, false)
        const to = parseDateInput(toValue, true)
        if (from === null || to === null || from > to) { setCustomError(t('rangeInvalid')); return }
        setCustomError(null)
        setRange({ from, to })
      }

      const view = useMemo(() => {
        const fallback = { in: 0, out: 0, cacheRead: 0, cacheWrite: 0, total: 0, calls: 0, cacheHitRate: null }
        if (data === null) return { series: [], granularity: 'hour', totals: fallback }
        const span = data.to - data.from
        const unit = grain === 'auto' ? (span > 3 * DAY_MS ? 'day' : 'hour') : grain
        return {
          series: unit === 'day' ? foldLocalDays(data.series) : data.series,
          granularity: unit,
          totals: data.totals,
        }
      }, [data, grain])

      const modelView = useMemo(() => {
        if (modelData === null) return { models: [], series: [], granularity: 'hour' }
        const span = modelData.to - modelData.from
        const unit = grain === 'auto' ? (span > 3 * DAY_MS ? 'day' : 'hour') : grain
        // Fold per-model hourly buckets into days when the chart reads by day.
        const folded = unit === 'day'
          ? (() => {
            const days = new Map()
            for (const point of modelData.series) {
              const date = new Date(bucketEpoch(point.bucket))
              date.setHours(0, 0, 0, 0)
              const key = `${point.model}\u0000${date.getTime()}`
              const day = days.get(key) ?? { model: point.model, bucket: date.getTime(), total: 0 }
              day.total += point.total
              days.set(key, day)
            }
            return [...days.values()]
          })()
          : modelData.series
        return { models: modelData.models, series: folded, granularity: unit }
      }, [modelData, grain])

      return {
        preset, setPreset, customFrom, setCustomFrom, customTo, setCustomTo, customError, applyCustom,
        range, selected, setSelected, includeSubagents, setIncludeSubagents, grain, setGrain,
        pickerOpen, setPickerOpen, sessions, sessionsLoading, sessionsError,
        data, loading, error, updatedAt, rebuilding, refresh: () => setTick(value => value + 1), rebuild,
        view, totals: view.totals, modelView,
        selectedRows: selected.map(id => sessions.find(session => session.id === id) ?? { id, title: id, origin: null, cwd: '' }),
      }
    }

    const tokens = {
      bg: 'var(--dsw-alias-bg-layer-1)',
      surface: 'var(--dsw-alias-bg-layer-2)',
      // The background layers collapse to one colour in the light theme, so a
      // control track takes its tint from the label ink instead.
      track: 'color-mix(in srgb, var(--dsw-alias-label-primary) 6%, transparent)',
      border: 'var(--dsw-alias-border-l1)',
      borderStrong: 'var(--dsw-alias-border-l2)',
      text: 'var(--dsw-alias-label-primary)',
      muted: 'var(--dsw-alias-label-secondary)',
      error: 'var(--dsw-alias-state-error-primary)',
      accent: 'var(--dsw-static-blue-500, #3b82f6)',
      warn: 'var(--dsw-static-amber-600, #d97706)',
      overlay: 'var(--dsw-alias-bg-overlay)',
      radius: 'var(--dsw-radius-lg, 16px)',
      radiusSmall: 'var(--dsw-radius-md, 12px)',
    }

    // Data colors are deliberately static palette tokens, not semantic aliases:
    // this theme maps `brand-primary` to near-black, which flattened the chart.
    const seriesColors = {
      in: 'var(--dsw-static-amber-500, #f59e0b)',
      out: 'var(--dsw-static-green-500, #22c55e)',
      cacheRead: 'var(--dsw-static-blue-500, #3b82f6)',
      cacheWrite: 'var(--dsw-static-violet-500, var(--dsw-static-neutral-400, #9ca3af))',
    }

    // Stable per-model colours: the Nth distinct model in the window gets the Nth
    // swatch, so a model keeps its hue across the donut, bars, and trend.
    const modelPalette = [
      'var(--dsw-static-blue-500, #3b82f6)',
      'var(--dsw-static-green-500, #22c55e)',
      'var(--dsw-static-amber-500, #f59e0b)',
      'var(--dsw-static-violet-500, #8b5cf6)',
      'var(--dsw-static-red-500, #ef4444)',
      'var(--dsw-static-cyan-500, #06b6d4)',
      'var(--dsw-static-pink-500, #ec4899)',
      'var(--dsw-static-neutral-500, #6b7280)',
    ]

    function modelLabel(name) {
      return name === '' ? 'unknown' : name
    }

    // Flat-card palette: card surfaces come from theme surfaces, data accents
    // from the static palette, and tints are the same hues at low alpha.
    const tints = {
      blue: 'rgba(59, 130, 246, 0.13)',
      green: 'rgba(34, 197, 94, 0.13)',
      amber: 'rgba(245, 158, 11, 0.15)',
      violet: 'rgba(139, 92, 246, 0.14)',
      red: 'rgba(239, 68, 68, 0.13)',
    }

    // Every module surface shares one fill, one border, and one radius, so the
    // toolbar and the cards below it read as a single family.
    const moduleShell = {
      background: tokens.bg,
      border: `1px solid ${tokens.borderStrong}`,
      borderRadius: tokens.radius,
    }
    const moduleShadow = '0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px rgba(15, 23, 42, 0.05)'

    const styles = {
      // ---- dashboard shell ----
      dash: {
        display: 'flex', flexDirection: 'column', gap: 14, color: tokens.text,
        background: tokens.surface, minHeight: '100%',
        padding: '20px 24px 40px', maxWidth: 1120, margin: '0 auto', width: '100%', boxSizing: 'border-box',
      },
      dashHead: { display: 'flex', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' },
      dashTitle: { margin: 0, fontSize: 19, fontWeight: 650, letterSpacing: '-0.01em' },
      dashSub: { margin: '3px 0 0', fontSize: 12, color: tokens.muted },
      row: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
      grow: { flex: 1 },
      ghost: {
        border: 0, background: 'transparent', color: tokens.muted,
        borderRadius: 999, padding: '6px 12px', fontSize: 12, cursor: 'pointer', minHeight: 30, fontWeight: 500,
      },
      quiet: {
        border: 0, background: 'transparent', color: tokens.muted,
        borderRadius: 999, padding: '6px 10px', fontSize: 12, cursor: 'pointer', minHeight: 30,
      },
      pill: {
        display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999,
        background: tints.blue, color: tokens.accent, fontSize: 12, maxWidth: 260,
      },
      pillName: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
      pillX: {
        border: 0, background: 'transparent', color: tokens.muted, cursor: 'pointer',
        padding: '0 2px', borderRadius: 4, fontSize: 14, lineHeight: 1,
      },
      linkish: { border: 0, background: 'transparent', color: tokens.muted, fontSize: 12, cursor: 'pointer', padding: '2px 4px', borderRadius: 4 },
      // ---- chart ----
      chartCard: {
        ...moduleShell, boxShadow: moduleShadow,
        padding: '14px 16px 6px', display: 'flex', flexDirection: 'column', gap: 10,
      },
      chartHead: { display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' },
      chartTitle: { fontSize: 12, fontWeight: 600, color: tokens.text },
      chartBody: { display: 'flex', flexDirection: 'column', gap: 10 },
      legend: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', fontSize: 11, color: tokens.muted },
      legendItem: { display: 'inline-flex', alignItems: 'center', gap: 5 },
      legendText: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 150 },
      swatch: { width: 9, height: 9, borderRadius: 2, display: 'inline-block' },
      tip: {
        border: `1px solid ${tokens.borderStrong}`, background: tokens.overlay, borderRadius: 8,
        padding: '6px 8px', fontSize: 11, color: tokens.text, boxShadow: '0 6px 18px rgba(0,0,0,0.18)',
      },
      tipHead: { color: tokens.muted, marginBottom: 3 },
      tipRow: { display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' },
      tipLabel: { display: 'inline-flex', alignItems: 'center', gap: 5, color: tokens.muted, minWidth: 0 },
      tipText: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 104 },
      tipValue: { fontVariantNumeric: 'tabular-nums' },
      tipTotal: { fontVariantNumeric: 'tabular-nums', fontWeight: 650 },
      empty: { padding: '44px 0 48px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 6 },
      emptyTitle: { fontSize: 13, color: tokens.text },
      emptyHint: { fontSize: 12, color: tokens.muted },
      // ---- settings surface (unchanged visual language) ----
      page: { display: 'flex', flexDirection: 'column', gap: 14, color: tokens.text },
      header: { display: 'flex', flexDirection: 'column', gap: 4 },
      title: { margin: 0, fontSize: 17, fontWeight: 600 },
      subtitle: { margin: 0, fontSize: 12, lineHeight: 1.5, color: tokens.muted },
      bar: { display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
      spacer: { flex: 1 },
      chip: {
        display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 8px', borderRadius: 999,
        border: `1px solid ${tokens.borderStrong}`, background: tokens.surface, fontSize: 12,
      },
      chipText: { maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
      chipClose: {
        border: 0, background: 'transparent', color: tokens.muted, cursor: 'pointer',
        padding: '0 2px', fontSize: 14, lineHeight: 1, borderRadius: 4,
      },
      button: {
        border: `1px solid ${tokens.borderStrong}`, background: tokens.surface, color: tokens.text,
        borderRadius: 8, padding: '5px 10px', fontSize: 12, cursor: 'pointer', minHeight: 28,
      },
      buttonActive: { borderColor: tokens.accent, color: tokens.accent, background: tokens.bg },
      buttonDisabled: { opacity: 0.5, cursor: 'default' },
      buttonPrimary: {
        border: `1px solid ${tokens.accent}`, background: tokens.accent, color: 'var(--dsw-alias-bg-base)',
        borderRadius: 8, padding: '5px 12px', fontSize: 12, cursor: 'pointer', fontWeight: 600, minHeight: 28,
      },
      cards: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(116px, 1fr))', gap: 8 },
      card: {
        ...moduleShell,
        padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 4,
      },
      cardLabel: { fontSize: 11, color: tokens.muted },
      cardValue: { fontSize: 18, fontWeight: 600, fontVariantNumeric: 'tabular-nums' },
      cardHint: { fontSize: 10, color: tokens.muted, fontVariantNumeric: 'tabular-nums' },
      chartFoot: { fontSize: 11, color: tokens.muted },
      error: { padding: '8px 12px', borderRadius: 8, fontSize: 12, color: tokens.error, border: `1px solid ${tokens.error}` },
      notice: { fontSize: 11, color: tokens.warn },
      footer: { fontSize: 11, color: tokens.muted },
      // ---- flat cards ----
      flatCard: {
        ...moduleShell, boxShadow: moduleShadow,
        padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14,
      },
      sectionHead: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
      sectionTitle: { margin: 0, fontSize: 14, fontWeight: 650 },
      sectionSub: { margin: 0, fontSize: 11, color: tokens.muted },
      iconChip(bg) {
        return {
          width: 36, height: 36, borderRadius: 12, background: bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none',
        }
      },
      heroRow: { display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' },
      ringWrap: { position: 'relative', width: 148, height: 148, flex: 'none' },
      ringCenter: {
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 1, pointerEvents: 'none',
      },
      ringValue: { fontSize: 24, fontWeight: 700, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' },
      ringLabel: { fontSize: 10, color: tokens.muted },
      ringHit: { fontSize: 10, color: tokens.muted, marginTop: 2 },
      metricGrid: {
        display: 'grid', gap: '14px 28px', flex: 1, minWidth: 220,
        gridTemplateColumns: 'repeat(auto-fit, minmax(132px, 1fr))',
      },
      metric: { display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 },
      metricLabel: { fontSize: 11, color: tokens.muted, whiteSpace: 'nowrap' },
      metricValue: { fontSize: 18, fontWeight: 650, fontVariantNumeric: 'tabular-nums', lineHeight: 1.25 },
      metricUnit: { fontSize: 11, fontWeight: 500, color: tokens.muted, marginLeft: 3 },
      // ---- unified filter toolbar (scope + range + grain) ----
      toolbar: {
        ...moduleShell, boxShadow: moduleShadow,
        padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12,
      },
      toolbarLine: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', minWidth: 0 },
      toolbarKey: {
        fontSize: 11, fontWeight: 600, color: tokens.muted, textTransform: 'uppercase',
        letterSpacing: '0.04em', width: 36, flex: 'none',
      },
      toolbarGroup: {
        display: 'inline-flex', alignItems: 'center', gap: 2, padding: 3, borderRadius: 999,
        background: tokens.track, border: `1px solid ${tokens.borderStrong}`, flexWrap: 'wrap', minWidth: 0,
      },
      toolbarChip(active) {
        return {
          border: active ? `1px solid ${tokens.accent}` : '1px solid transparent',
          borderRadius: 999, padding: '5px 12px', fontSize: 12, cursor: 'pointer', minHeight: 28,
          background: active ? tints.blue : 'transparent',
          color: active ? tokens.accent : tokens.muted,
          fontWeight: active ? 650 : 500,
        }
      },
      toolbarSelected: { display: 'inline-flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', minWidth: 0 },
      toolbarSelectedNote: { fontSize: 11, color: tokens.muted },
      toolbarDate: {
        border: `1px solid ${tokens.borderStrong}`, background: tokens.surface, color: tokens.text,
        borderRadius: 999, padding: '4px 10px', fontSize: 12, minHeight: 28, boxSizing: 'border-box',
      },
      // ---- ranked rows shared by the breakdown and the model sections ----
      rankList: { display: 'flex', flexDirection: 'column', gap: 10 },
      rankRow: { display: 'grid', gridTemplateColumns: '10px minmax(96px, 1.2fr) 2fr auto', alignItems: 'center', gap: 10 },
      rankDot(color) { return { width: 8, height: 8, borderRadius: 999, background: color, flex: 'none' } },
      rankName: { fontSize: 12, color: tokens.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 },
      rankMeta: { fontSize: 10, color: tokens.muted, fontVariantNumeric: 'tabular-nums' },
      rankValue: { fontSize: 12, fontWeight: 600, fontVariantNumeric: 'tabular-nums', textAlign: 'right', whiteSpace: 'nowrap' },
      donutRow: { display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' },
      track: { height: 8, borderRadius: 999, background: tokens.track, overflow: 'hidden', minWidth: 60 },
      trackFill(color, pct) {
        return { height: '100%', width: `${pct}%`, borderRadius: 999, background: color, minWidth: pct > 0 ? 6 : 0, transition: 'width 420ms ease' }
      },
      overlay: {
        position: 'fixed', inset: 0, background: 'var(--dsw-alias-bg-mask-1, rgba(0,0,0,0.35))',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 40, padding: 16,
      },
      dialog: {
        width: 'min(560px, 100%)', maxHeight: 'min(72vh, 640px)', display: 'flex', flexDirection: 'column',
        background: tokens.overlay, border: `1px solid ${tokens.border}`, borderRadius: 12, overflow: 'hidden',
        boxShadow: '0 12px 40px var(--dsw-alias-bg-mask-1, rgba(0,0,0,0.28))',
      },
      dialogHead: { padding: 12, borderBottom: `1px solid ${tokens.border}`, display: 'flex', flexDirection: 'column', gap: 8 },
      dialogTitle: { margin: 0, fontSize: 13, fontWeight: 600 },
      input: {
        width: '100%', boxSizing: 'border-box', border: `1px solid ${tokens.borderStrong}`,
        background: tokens.surface, color: tokens.text, borderRadius: 8, padding: '6px 8px', fontSize: 12,
      },
      list: { overflow: 'auto', flex: 1, padding: '4px 0' },
      groupHead: {
        display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', fontSize: 11,
        color: tokens.muted, background: tokens.track,
      },
      groupName: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 },
      pickRow: { display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px', fontSize: 12, cursor: 'pointer' },
      rowTitle: { flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
      rowMeta: { fontSize: 10, color: tokens.muted, fontVariantNumeric: 'tabular-nums' },
      dialogFoot: { display: 'flex', gap: 8, alignItems: 'center', padding: 12, borderTop: `1px solid ${tokens.border}` },
    }

    function Picker({ sessions, selected, loading, error, onCancel, onApply, t }) {
      const [draft, setDraft] = useState(selected)
      const [search, setSearch] = useState('')
      const titleId = 'token-usage-picker-title'

      useEffect(() => {
        const onKey = event => { if (event.key === 'Escape') onCancel() }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
      }, [onCancel])

      const groups = useMemo(() => {
        const query = search.trim().toLowerCase()
        const byWorkspace = new Map()
        for (const session of sessions) {
          const title = session.title || session.id
          if (query && !`${title} ${session.cwd ?? ''} ${session.id}`.toLowerCase().includes(query)) continue
          const key = session.cwd || ''
          const list = byWorkspace.get(key) ?? []
          list.push(session)
          byWorkspace.set(key, list)
        }
        return [...byWorkspace.entries()].sort((left, right) => left[0].localeCompare(right[0]))
      }, [sessions, search])

      const shown = useMemo(() => {
        let remaining = PICKER_ROW_LIMIT
        return groups.map(([cwd, list]) => {
          const slice = list.slice(0, Math.max(0, remaining))
          remaining -= slice.length
          return [cwd, slice, list.length]
        })
      }, [groups])
      const shownCount = shown.reduce((sum, entry) => sum + entry[1].length, 0)
      const matchedCount = groups.reduce((sum, entry) => sum + entry[1].length, 0)
      const truncated = matchedCount > shownCount

      const toggle = id => setDraft(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id])
      const toggleGroup = (list, on) => setDraft(current => {
        const ids = new Set(list.map(session => session.id))
        return on ? [...new Set([...current, ...ids])] : current.filter(id => !ids.has(id))
      })

      const renderGroup = ([cwd, list, total]) => {
        const allSelected = list.every(session => draft.includes(session.id)) && list.length === total
        return h('div', { key: cwd || 'none' },
          h('div', { style: styles.groupHead },
            h('span', { style: styles.groupName, title: cwd }, cwd || t('workspaceUnknown')),
            h('button', {
              type: 'button', style: styles.linkish, 'aria-pressed': allSelected ? true : undefined,
              onClick: () => toggleGroup(list, !allSelected),
            }, allSelected ? t('deselectAll') : t('selectAll'))),
          list.map(session => h('label', { key: session.id, style: styles.pickRow },
            h('input', {
              type: 'checkbox', checked: draft.includes(session.id), onChange: () => toggle(session.id),
              style: { accentColor: tokens.accent },
            }),
            h('span', { style: styles.rowTitle, title: session.title || session.id }, session.title || session.id),
            session.origin === 'subagent' ? h('span', { style: styles.rowMeta }, 'subagent') : null,
            h('span', { style: styles.rowMeta }, formatNumber(session.total)))))
      }

      const body = () => {
        if (loading) return h('div', { style: styles.empty, role: 'status' }, h('div', { style: styles.emptyHint }, t('pickerLoading')))
        if (error !== null) return h('div', { style: styles.empty, role: 'alert' }, h('div', { style: styles.emptyHint }, `${t('pickerFailed')}: ${error}`))
        if (sessions.length === 0) return h('div', { style: styles.empty }, h('div', { style: styles.emptyHint }, t('noSessions')))
        if (groups.length === 0) return h('div', { style: styles.empty }, h('div', { style: styles.emptyHint }, t('noMatch')))
        return shown.map(renderGroup)
      }

      return h('div', { style: styles.overlay, onMouseDown: event => { if (event.target === event.currentTarget) onCancel() } },
        h('div', { style: styles.dialog, role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': titleId },
          h('div', { style: styles.dialogHead },
            h('h3', { id: titleId, style: styles.dialogTitle }, t('scopePick')),
            h('input', {
              style: styles.input, value: search, autoFocus: true, placeholder: t('search'), 'aria-label': t('search'),
              onChange: event => setSearch(event.target.value),
            }),
            h('div', { style: { display: 'flex', gap: 8, alignItems: 'center' } },
              h('span', { style: styles.rowMeta }, fmt(t('sessionsCount'), { shown: shownCount, total: sessions.length })),
              h('span', { style: styles.rowMeta }, t('pickerRange')),
              h('span', { style: styles.grow }),
              h('button', { type: 'button', style: styles.linkish, onClick: () => setDraft([]) }, t('clear')))),
          h('div', { style: styles.list }, body()),
          truncated ? h('div', { style: { ...styles.groupHead, justifyContent: 'center' } }, fmt(t('pickerMore'), { n: PICKER_ROW_LIMIT })) : null,
          h('div', { style: styles.dialogFoot },
            h('span', { style: styles.rowMeta }, `${t('selected')}: ${draft.length} · ${t('pickerHint')}`),
            h('span', { style: styles.grow }),
            h('button', { type: 'button', style: styles.button, onClick: onCancel }, t('cancel')),
            h('button', { type: 'button', style: styles.buttonPrimary, onClick: () => onApply(draft) }, t('apply')))))
    }

    function ScopeBar({ data, t, showRecent, compact }) {
      const { selected, setSelected, sessions, setPickerOpen } = data
      const rows = data.selectedRows
      const shownLimit = compact ? 3 : 8
      const scopeItems = [
        ...(showRecent && sessions.length > 0 ? [['recent', t('scopeRecent')]] : []),
        ['all', t('scopeAll')],
        ['pick', t('scopePick')],
      ]
      const active = selected.length === 0 ? 'all' : 'pick'
      return h('div', { style: styles.toolbarLine },
        h('span', { style: styles.toolbarKey }, t('scopeLabel')),
        h('div', { style: styles.toolbarGroup, role: 'group' },
          scopeItems.map(([key, label]) => h('button', {
            key, type: 'button',
            style: styles.toolbarChip(key === 'recent' ? false : key === active),
            'aria-pressed': key !== 'recent' && key === active ? true : undefined,
            onClick: () => {
              if (key === 'all') setSelected([])
              else if (key === 'pick') setPickerOpen(true)
              else {
                const latest = sessions.find(session => session.origin !== 'subagent')
                if (latest !== undefined) setSelected([latest.id])
              }
            },
          }, label))),
        selected.length === 0
          ? h('span', { style: styles.toolbarSelectedNote }, t('emptyScope'))
          : h('div', { style: styles.toolbarSelected },
            rows.slice(0, shownLimit).map(session => h('span', { key: session.id, style: styles.pill },
              h('span', { style: styles.pillName, title: session.title || session.id }, session.title || session.id),
              h('button', {
                type: 'button', style: styles.pillX, 'aria-label': fmt(t('removeSession'), { name: session.title || session.id }),
                onClick: () => setSelected(current => current.filter(id => id !== session.id)),
              }, '×'))),
            rows.length > shownLimit
              ? h('span', { style: styles.toolbarSelectedNote }, `+${rows.length - shownLimit}`)
              : null,
            h('label', { style: { ...styles.toolbarSelectedNote, display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer' } },
              h('input', {
                type: 'checkbox', checked: data.includeSubagents, onChange: event => data.setIncludeSubagents(event.target.checked),
                style: { accentColor: tokens.accent },
              }), t('includeSubagents'))))
    }

    function RangeBar({ data, t }) {
      const presets = [
        ['today', t('rangeToday')], ['7d', t('range7')], ['30d', t('range30')],
        ['all', t('rangeAll')], ['custom', t('rangeCustom')],
      ]
      const grains = [['auto', t('grainAuto')], ['hour', t('grainHour')], ['day', t('grainDay')]]
      return h('div', { style: styles.toolbarLine },
        h('span', { style: styles.toolbarKey }, t('rangeLabel')),
        h(Chips, {
          items: presets,
          value: data.preset,
          onChange: value => {
            data.setPreset(value)
            if (value === 'custom') {
              data.setCustomFrom(dateInputValue(data.range.from > 1 ? data.range.from : Date.now() - 6 * DAY_MS))
              data.setCustomTo(dateInputValue(data.range.to))
            }
          },
        }),
        data.preset === 'custom'
          ? h('div', { style: styles.toolbarLine },
            h('input', {
              style: { ...styles.toolbarDate, width: 132 }, type: 'date', value: data.customFrom, max: data.customTo,
              'aria-label': t('from'),
              onChange: event => { data.setCustomFrom(event.target.value); data.applyCustom(event.target.value, data.customTo) },
            }),
            h('span', { style: styles.toolbarSelectedNote }, '→'),
            h('input', {
              style: { ...styles.toolbarDate, width: 132 }, type: 'date', value: data.customTo, min: data.customFrom,
              'aria-label': t('to'),
              onChange: event => { data.setCustomTo(event.target.value); data.applyCustom(data.customFrom, event.target.value) },
            }))
          : null,
        h('span', { style: styles.grow }),
        h('span', { style: styles.toolbarKey }, t('grainLabel')),
        h(Chips, { items: grains, value: data.grain, onChange: data.setGrain }))
    }

    /** Pill group used by the toolbar: one tinted track, a raised active chip. */
    function Chips({ items, value, onChange }) {
      return h('div', { style: styles.toolbarGroup, role: 'group' },
        items.map(([key, label]) => h('button', {
          key, type: 'button', style: styles.toolbarChip(value === key),
          'aria-pressed': value === key ? true : undefined,
          onClick: () => onChange(key),
        }, label)))
    }

    // One geometry for every trend chart of the plugin.
    const CHART = { height: 260, padLeft: 52, padRight: 14, padTop: 12, padBottom: 26, ticks: [0, 0.25, 0.5, 0.75, 1] }

    let chartStylesInjected = false

    /** Inject the tooltip keyframes once; every chart instance shares them. */
    function ensureChartStyles() {
      if (chartStylesInjected || typeof document === 'undefined') return
      chartStylesInjected = true
      const tag = document.createElement('style')
      tag.dataset.tokenUsage = 'chart'
      tag.textContent = '@keyframes tu-tip-in{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}.tu-tip{animation:tu-tip-in 140ms ease-out both}'
      document.head.appendChild(tag)
    }

    /** The four token buckets in stack order, ready for the chart. */
    function usageSeries(points, t) {
      return [
        { key: 'cacheRead', label: t('legendCache'), color: seriesColors.cacheRead, values: points.map(point => point.cacheRead) },
        { key: 'in', label: t('legendIn'), color: seriesColors.in, values: points.map(point => point.in) },
        { key: 'out', label: t('legendOut'), color: seriesColors.out, values: points.map(point => point.out) },
        { key: 'cacheWrite', label: t('legendCacheWrite'), color: seriesColors.cacheWrite, values: points.map(point => point.cacheWrite) },
      ]
    }

    /**
     * The single trend chart of the plugin. The token trend and the per-model
     * trend both render through it, so geometry, grid, axes, legend, draw-in
     * animation, hover column, and tooltip stay identical. `mode: 'stacked'`
     * layers the token buckets as filled areas, `mode: 'lines'` draws one
     * stroke per model.
     */
    function TrendChart({ buckets, series, mode, granularity, t, title, emptyTitle, emptyHint }) {
      const host = useRef(null)
      const [width, setWidth] = useState(760)
      const [hover, setHover] = useState(null)
      const [progress, setProgress] = useState(0)
      const stacked = mode === 'stacked'
      const gradId = useRef(`tu-${Math.random().toString(36).slice(2, 8)}`).current

      useEffect(() => { ensureChartStyles() }, [])

      // A text signature of the data keeps the draw-in animation from
      // restarting on every render while still reacting to real changes.
      const signature = useMemo(
        () => JSON.stringify([buckets, series.map(item => [item.key, item.values])]),
        [buckets, series],
      )

      const shape = useMemo(() => {
        const count = buckets.length
        const tops = []
        const bases = []
        let running = new Array(count).fill(0)
        for (const item of series) {
          const base = stacked ? running.slice() : new Array(count).fill(0)
          const top = buckets.map((_, index) => base[index] + (item.values[index] ?? 0))
          bases.push(base)
          tops.push(top)
          if (stacked) running = top
        }
        const totals = buckets.map((_, index) => series.reduce((sum, item) => sum + (item.values[index] ?? 0), 0))
        const maxValue = Math.max(1, ...(stacked ? totals : tops.flat()))
        return { tops, bases, totals, maxValue }
      }, [signature, stacked])

      useEffect(() => {
        if (buckets.length === 0) { setProgress(1); return }
        setProgress(0)
        let frame = 0
        const start = performance.now()
        const step = now => {
          const ratio = Math.min(1, (now - start) / 620)
          setProgress(1 - Math.pow(1 - ratio, 3))
          if (ratio < 1) frame = requestAnimationFrame(step)
        }
        frame = requestAnimationFrame(step)
        return () => cancelAnimationFrame(frame)
      }, [signature])

      useEffect(() => {
        const element = host.current
        if (element === null || typeof ResizeObserver === 'undefined') return
        const observer = new ResizeObserver(entries => {
          const next = entries[0]?.contentRect?.width
          if (Number.isFinite(next) && next > 0) setWidth(Math.max(320, Math.round(next)))
        })
        observer.observe(element)
        return () => observer.disconnect()
      }, [])

      if (buckets.length === 0 || series.length === 0) {
        return h('div', { style: styles.empty },
          h('div', { style: styles.emptyTitle }, emptyTitle),
          h('div', { style: styles.emptyHint }, emptyHint))
      }

      const { tops, bases, totals, maxValue } = shape
      const innerW = width - CHART.padLeft - CHART.padRight
      const innerH = CHART.height - CHART.padTop - CHART.padBottom
      const x = index => CHART.padLeft + (buckets.length === 1 ? innerW / 2 : (index / (buckets.length - 1)) * innerW)
      const y = value => CHART.padTop + innerH - (value / maxValue) * innerH
      const scaled = value => y(value * progress)
      const labelEvery = Math.max(1, Math.ceil(buckets.length / 7))
      const step = buckets.length > 1 ? x(1) - x(0) : innerW

      const onMove = event => {
        const svg = event.currentTarget
        const matrix = svg.getScreenCTM?.()
        if (matrix === null || matrix === undefined) return
        const screen = svg.createSVGPoint()
        screen.x = event.clientX
        screen.y = event.clientY
        const local = screen.matrixTransform(matrix.inverse())
        const ratio = (local.x - CHART.padLeft) / innerW
        if (!Number.isFinite(ratio)) return
        const index = Math.round(ratio * (buckets.length - 1))
        setHover(Math.max(0, Math.min(buckets.length - 1, index)))
      }

      const marks = series.map((item, index) => {
        const top = tops[index]
        const base = bases[index]
        const line = top.map((value, at) => `${at === 0 ? 'M' : 'L'}${x(at).toFixed(1)},${scaled(value).toFixed(1)}`).join(' ')
        if (!stacked) return { key: item.key, item, line }
        const area = `${line} ` + base.map((value, at) => {
          const back = buckets.length - 1 - at
          return `L${x(back).toFixed(1)},${scaled(base[back]).toFixed(1)}`
        }).join(' ') + ' Z'
        return { key: item.key, item, line, area }
      })

      const hoverColumn = hover === null ? null : h('rect', {
        x: Math.max(CHART.padLeft, x(hover) - step / 2), y: CHART.padTop,
        width: Math.max(0, Math.min(step, width - CHART.padRight - Math.max(CHART.padLeft, x(hover) - step / 2))),
        height: innerH, fill: tokens.borderStrong,
      })

      const hoverDots = hover === null ? []
        : stacked
          ? [h('circle', {
            key: 'dot-total', cx: x(hover), cy: scaled(totals[hover]), r: 3.6,
            fill: tokens.bg, stroke: series[series.length - 1].color, strokeWidth: 2,
          })]
          : marks.map(mark => {
            const value = mark.item.values[hover] ?? 0
            if (value <= 0) return null
            return h('circle', {
              key: `dot-${mark.key}`, cx: x(hover), cy: scaled(value), r: 3.6,
              fill: tokens.bg, stroke: mark.item.color, strokeWidth: 2,
            })
          }).filter(Boolean)

      let tooltip = null
      if (hover !== null) {
        const left = Math.min(Math.max(x(hover), 104), width - 104)
        const rows = series.map(item => ({ key: item.key, label: item.label, color: item.color, value: item.values[hover] ?? 0 }))
        const body = stacked ? rows : rows.filter(row => row.value > 0)
        const head = stacked ? [{ key: 'total', label: t('cardTotal'), value: totals[hover] }] : []
        const list = [...head, ...body]
        tooltip = h('foreignObject', { x: left - 100, y: 4, width: 200, height: 34 + list.length * 16, style: { pointerEvents: 'none' } },
          h('div', { className: 'tu-tip', xmlns: 'http://www.w3.org/1999/xhtml', style: styles.tip },
            h('div', { style: styles.tipHead }, formatBucket(buckets[hover], granularity)),
            list.map(row => h('div', { key: row.key, style: styles.tipRow },
              h('span', { style: styles.tipLabel },
                row.color === undefined ? null : h('span', { style: { ...styles.swatch, background: row.color, flex: 'none' } }),
                h('span', { style: styles.tipText, title: row.label }, row.label)),
              h('span', { style: row.key === 'total' ? styles.tipTotal : styles.tipValue }, formatExact(row.value))))))
      }

      return h('div', { style: styles.chartBody },
        h('div', { style: styles.legend },
          series.map(item => h('span', { key: item.key, style: styles.legendItem },
            h('span', { style: { ...styles.swatch, background: item.color } }),
            h('span', { style: styles.legendText, title: item.label }, item.label)))),
        h('div', { ref: host, style: { position: 'relative', width: '100%' } },
          h('svg', {
            viewBox: `0 0 ${width} ${CHART.height}`, width: '100%', height: CHART.height, role: 'img',
            'aria-label': title, style: { display: 'block', overflow: 'visible' },
            onMouseMove: onMove,
            onMouseLeave: () => setHover(null),
          },
          stacked
            ? h('defs', null, series.map(item => h('linearGradient', {
              key: item.key, id: `${gradId}-${item.key}`, x1: '0', y1: '0', x2: '0', y2: '1',
            },
            h('stop', { offset: '0%', stopColor: item.color, stopOpacity: 0.4 }),
            h('stop', { offset: '100%', stopColor: item.color, stopOpacity: 0.05 }))))
            : null,
          CHART.ticks.map(tick => h('line', {
            key: `grid-${tick}`, x1: CHART.padLeft, x2: width - CHART.padRight,
            y1: CHART.padTop + innerH - tick * innerH, y2: CHART.padTop + innerH - tick * innerH,
            stroke: tokens.borderStrong, strokeWidth: 1,
          })),
          CHART.ticks.map(tick => h('text', {
            key: `y-${tick}`, x: CHART.padLeft - 8, y: CHART.padTop + innerH - tick * innerH + 4,
            textAnchor: 'end', fontSize: 10, fill: tokens.muted,
          }, formatNumber(maxValue * tick))),
          hoverColumn,
          stacked ? marks.map(mark => h('path', {
            key: `area-${mark.key}`, d: mark.area, fill: `url(#${gradId}-${mark.key})`, stroke: 'none',
          })) : null,
          marks.map(mark => h('path', {
            key: `line-${mark.key}`, d: mark.line, fill: 'none', stroke: mark.item.color,
            strokeWidth: stacked ? (mark.key === series[0].key ? 2 : 1.5) : 2,
            strokeLinejoin: 'round', strokeLinecap: 'round',
          })),
          buckets.map((bucket, index) => (index % labelEvery === 0 || index === buckets.length - 1)
            ? h('text', {
              key: `x-${bucket}`, x: x(index), y: CHART.height - 8, textAnchor: 'middle', fontSize: 10, fill: tokens.muted,
            }, formatBucket(bucket, granularity))
            : null),
          hoverDots,
          tooltip)))
    }

    /** Stable colour per model, assigned by rank in the current window. */
    function colorMap(models) {
      const map = new Map()
      models.forEach((model, index) => map.set(model.model, modelPalette[index % modelPalette.length]))
      return map
    }

    /** Share-of-total donut for models, reusing the ring geometry of the summary. */
    function ModelShare({ models, colors, t }) {
      const total = models.reduce((sum, model) => sum + model.total, 0)
      const size = 148
      const stroke = 13
      const radius = (size - stroke) / 2 - 2
      const circumference = 2 * Math.PI * radius
      const sum = total || 1
      let travelled = 0
      return h('div', { style: styles.donutRow },
        h('div', { style: styles.ringWrap },
          h('svg', { width: size, height: size, viewBox: `0 0 ${size} ${size}`, 'aria-hidden': true },
            h('circle', { cx: size / 2, cy: size / 2, r: radius, fill: 'none', stroke: tokens.track, strokeWidth: stroke }),
            models.map(model => {
              const length = (model.total / sum) * circumference
              const dash = `${Math.max(0, length - 3)} ${circumference}`
              const offset = -travelled
              travelled += length
              return h('circle', {
                key: model.model, cx: size / 2, cy: size / 2, r: radius, fill: 'none',
                stroke: colors.get(model.model), strokeWidth: stroke, strokeDasharray: dash, strokeDashoffset: offset,
                strokeLinecap: 'round', transform: `rotate(-90 ${size / 2} ${size / 2})`,
              })
            })),
          h('div', { style: styles.ringCenter },
            h('div', { style: styles.ringValue }, formatNumber(total)),
            h('div', { style: styles.ringLabel }, t('cardTotal')))),
        h('div', { style: { ...styles.rankList, flex: 1, minWidth: 220 } },
          models.length === 0
            ? h('div', { style: styles.emptyHint }, t('modelEmpty'))
            : models.map(model => {
              const share = total === 0 ? 0 : model.total / total
              return h('div', { key: model.model, style: styles.rankRow },
                h('span', { style: styles.rankDot(colors.get(model.model)) }),
                h('span', { style: styles.rankName, title: modelLabel(model.model) }, modelLabel(model.model)),
                h('div', { style: styles.track }, h('div', { style: styles.trackFill(colors.get(model.model), Math.round(share * 100)) })),
                h('span', { style: styles.rankValue }, formatPercent(share)))
            })))
    }

    /** Ranked per-model usage bars with exact figures and call counts. */
    function ModelUsage({ models, colors, t }) {
      const max = models.reduce((top, model) => Math.max(top, model.total), 0) || 1
      if (models.length === 0) return h('div', { style: styles.empty }, h('div', { style: styles.emptyHint }, t('modelEmpty')))
      return h('div', { style: styles.rankList },
        models.map(model => h('div', { key: model.model, style: styles.rankRow },
          h('span', { style: styles.rankDot(colors.get(model.model)) }),
          h('div', { style: { minWidth: 0 } },
            h('div', { style: styles.rankName, title: modelLabel(model.model) }, modelLabel(model.model)),
            h('div', { style: styles.rankMeta }, `${t('cardCalls')} ${formatExact(model.calls)} · ${t('cardIn')} ${formatNumber(model.in)} · ${t('cardOut')} ${formatNumber(model.out)}`)),
          h('div', { style: styles.track }, h('div', { style: styles.trackFill(colors.get(model.model), Math.round(model.total / max * 100)) })),
          h('span', { style: styles.rankValue }, formatExact(model.total)))))
    }

    const ICON_PATHS = {
      in: 'M12 4v12m0 0-4-4m4 4 4-4',
      out: 'M12 20V8m0 0-4 4m4-4 4 4',
      db: 'M4 7c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3Zm0 0v10c0 1.7 3.6 3 8 3s8-1.3 8-3V7',
      pulse: 'M3 12h4l2-6 3 12 2-6h5',
      spark: 'M12 3.5l1.9 5.4 5.6 1.9-5.6 1.9L12 18.1l-1.9-5.4L4.5 10.8l5.6-1.9L12 3.5Z',
      refresh: 'M20 11a8 8 0 1 0-2.3 6M20 5v6h-6',
    }

    function Icon({ name, color, size }) {
      return h('svg', {
        width: size === undefined ? 18 : size, height: size === undefined ? 18 : size,
        viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 1.9,
        strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true,
      }, h('path', { d: ICON_PATHS[name] ?? ICON_PATHS.spark }))
    }

    /** Donut of the four buckets with the total in its hole. */
    function Ring({ parts, total, hit, t }) {
      const size = 148
      const stroke = 13
      const radius = (size - stroke) / 2 - 2
      const circumference = 2 * Math.PI * radius
      const sum = parts.reduce((accumulated, part) => accumulated + part.value, 0) || 1
      let travelled = 0
      return h('div', { style: styles.ringWrap },
        h('svg', { width: size, height: size, viewBox: `0 0 ${size} ${size}`, 'aria-hidden': true },
          h('circle', {
            cx: size / 2, cy: size / 2, r: radius, fill: 'none',
            stroke: tokens.track, strokeWidth: stroke,
          }),
          parts.map(part => {
            const length = (part.value / sum) * circumference
            const dash = `${Math.max(0, length - 3)} ${circumference}`
            const offset = -travelled
            travelled += length
            return h('circle', {
              key: part.key, cx: size / 2, cy: size / 2, r: radius, fill: 'none',
              stroke: part.color, strokeWidth: stroke, strokeDasharray: dash, strokeDashoffset: offset,
              strokeLinecap: 'round', transform: `rotate(-90 ${size / 2} ${size / 2})`,
            })
          })),
        h('div', { style: styles.ringCenter },
          h('div', { style: styles.ringValue }, formatNumber(total)),
          h('div', { style: styles.ringLabel }, t('cardTotal')),
          hit === null ? null : h('div', { style: styles.ringHit }, `${t('cardHit')} ${formatPercent(hit)}`)))
    }

    function FlatMetric({ icon, color, tint, label, value, format }) {
      const animated = useCountUp(value)
      return h('div', { style: styles.metric },
        h('div', { style: styles.iconChip(tint) }, h(Icon, { name: icon, color, size: 17 })),
        h('div', { style: { minWidth: 0 } },
          h('div', { style: styles.metricLabel }, label),
          h('div', { style: styles.metricValue }, format(animated))))
    }

    /** Main-column dashboard: flat cards, a ring summary, and a soft area chart. */
    function UsageDashboard({ t, sessionId }) {
      const data = useUsageData(t, sessionId, 'all')
      const totals = data.totals
      const parts = [
        { key: 'cacheRead', label: t('legendCache'), value: totals.cacheRead, color: seriesColors.cacheRead },
        { key: 'in', label: t('legendIn'), value: totals.in, color: seriesColors.in },
        { key: 'out', label: t('legendOut'), value: totals.out, color: seriesColors.out },
        { key: 'cacheWrite', label: t('legendCacheWrite'), value: totals.cacheWrite, color: seriesColors.cacheWrite },
      ]
      const sum = parts.reduce((total, part) => total + part.value, 0) || 1
      const models = data.modelView.models
      const modelColors = useMemo(() => colorMap(models), [models])

      // Both trend cards read the same chart component, so their series are
      // prepared here in one shape: buckets plus one value list per series.
      const usageChart = useMemo(() => ({
        buckets: data.view.series.map(point => point.bucket),
        series: usageSeries(data.view.series, t),
      }), [data.view.series, t])

      const modelChart = useMemo(() => {
        const buckets = [...new Set(data.modelView.series.map(point => point.bucket))].sort((left, right) => left - right)
        const indexOf = new Map(buckets.map((bucket, index) => [bucket, index]))
        const series = models.map(model => {
          const values = new Array(buckets.length).fill(0)
          for (const point of data.modelView.series) {
            if (point.model !== model.model) continue
            const index = indexOf.get(point.bucket)
            if (index !== undefined) values[index] += point.total
          }
          return { key: model.model, label: modelLabel(model.model), color: modelColors.get(model.model), values }
        })
        return { buckets, series }
      }, [data.modelView.series, models, modelColors])

      return h('div', { style: styles.dash },
        // Filters first: scope and range govern every card below, so they lead.
        h('section', { style: styles.toolbar },
          h(ScopeBar, { data, t, showRecent: false, compact: true }),
          h(RangeBar, { data, t }),
          data.customError !== null ? h('div', { style: styles.notice, role: 'alert' }, data.customError) : null,
          data.error !== null ? h('div', { style: styles.error, role: 'alert' }, `${t('failed')}: ${data.error}`) : null),

        h('section', { style: styles.flatCard, 'aria-busy': data.loading },
          h('div', { style: styles.sectionHead },
            h('div', { style: styles.iconChip(tints.blue) }, h(Icon, { name: 'spark', color: tokens.accent })),
            h('div', null,
              h('h1', { style: styles.sectionTitle }, t('title')),
              h('p', { style: styles.sectionSub }, t('subtitle'))),
            h('span', { style: styles.grow }),
            h('button', {
              type: 'button', style: styles.quiet, onClick: () => { if (!data.loading) data.refresh() },
              'aria-label': t('refresh'), title: t('refresh'),
            }, h(Icon, { name: 'refresh', color: tokens.muted, size: 15 }))),
          h('div', { style: styles.heroRow },
            h(Ring, { parts, total: totals.total, hit: totals.cacheHitRate, t }),
            h('div', { style: styles.metricGrid },
              h(FlatMetric, { icon: 'in', color: seriesColors.in, tint: tints.amber, label: t('cardIn'), value: totals.in, format: formatNumber }),
              h(FlatMetric, { icon: 'out', color: seriesColors.out, tint: tints.green, label: t('cardOut'), value: totals.out, format: formatNumber }),
              h(FlatMetric, { icon: 'db', color: seriesColors.cacheRead, tint: tints.blue, label: t('cardCacheRead'), value: totals.cacheRead, format: formatNumber }),
              h(FlatMetric, { icon: 'pulse', color: seriesColors.cacheWrite, tint: tints.violet, label: t('cardCalls'), value: totals.calls, format: formatNumber })))),

        h('section', { style: styles.flatCard },
          h('div', { style: styles.sectionHead },
            h('div', { style: styles.iconChip(tints.green) }, h(Icon, { name: 'pulse', color: seriesColors.out })),
            h('h2', { style: styles.sectionTitle }, t('chartTitle')),
            h('span', { style: styles.grow }),
            h('span', { style: styles.pill }, data.view.granularity === 'hour' ? t('grainHour') : t('grainDay'))),
          h(TrendChart, {
            buckets: usageChart.buckets, series: usageChart.series, mode: 'stacked',
            granularity: data.view.granularity, t, title: t('chartTitle'),
            emptyTitle: t('chartEmpty'), emptyHint: t('chartEmptyHint'),
          })),

        h('section', { style: styles.flatCard },
          h('div', { style: styles.sectionHead },
            h('div', { style: styles.iconChip(tints.amber) }, h(Icon, { name: 'db', color: seriesColors.in })),
            h('h2', { style: styles.sectionTitle }, t('breakdownTitle')),
            h('span', { style: styles.grow }),
            h('span', { style: styles.sectionSub }, t('breakdownSub'))),
          h('div', { style: styles.rankList },
            parts.map(part => h('div', { key: part.key, style: styles.rankRow },
              h('span', { style: styles.rankDot(part.color) }),
              h('span', { style: styles.rankName }, part.label),
              h('div', { style: styles.track }, h('div', { style: styles.trackFill(part.color, Math.round(part.value / sum * 100)) })),
              h('span', { style: styles.rankValue }, formatExact(part.value)))))),

        h('section', { style: styles.flatCard },
          h('div', { style: styles.sectionHead },
            h('div', { style: styles.iconChip(tints.violet) }, h(Icon, { name: 'spark', color: seriesColors.cacheWrite })),
            h('h2', { style: styles.sectionTitle }, t('modelShareTitle')),
            h('span', { style: styles.grow }),
            h('span', { style: styles.sectionSub }, t('modelShareSub'))),
          h(ModelShare, { models, colors: modelColors, t })),

        h('section', { style: styles.flatCard },
          h('div', { style: styles.sectionHead },
            h('div', { style: styles.iconChip(tints.blue) }, h(Icon, { name: 'db', color: seriesColors.cacheRead })),
            h('h2', { style: styles.sectionTitle }, t('modelUsageTitle')),
            h('span', { style: styles.grow }),
            h('span', { style: styles.sectionSub }, t('modelUsageSub'))),
          h(ModelUsage, { models, colors: modelColors, t })),

        h('section', { style: styles.flatCard },
          h('div', { style: styles.sectionHead },
            h('div', { style: styles.iconChip(tints.green) }, h(Icon, { name: 'pulse', color: seriesColors.out })),
            h('h2', { style: styles.sectionTitle }, t('modelTrendTitle')),
            h('span', { style: styles.grow }),
            h('span', { style: styles.pill }, data.modelView.granularity === 'hour' ? t('grainHour') : t('grainDay'))),
          h(TrendChart, {
            buckets: modelChart.buckets, series: modelChart.series, mode: 'lines',
            granularity: data.modelView.granularity, t, title: t('modelTrendTitle'),
            emptyTitle: t('modelEmpty'), emptyHint: t('chartEmptyHint'),
          })),

        h('div', { style: styles.footer },
          data.updatedAt === null ? null : fmt(t('updatedAt'), { time: formatClock(data.updatedAt) }),
          data.data?.sync ? ` · ${fmt(t('syncInfo'), { files: data.data.sync.files, changed: data.data.sync.changed, ms: data.data.sync.ms })}` : null,
          h('span', { style: { float: 'right' } },
            h('button', {
              type: 'button', style: styles.linkish,
              onClick: () => { if (!data.rebuilding) data.rebuild() },
            }, data.rebuilding ? t('rebuilding') : t('rebuild')))),

        data.pickerOpen
          ? h(Picker, {
            sessions: data.sessions, selected: data.selected, loading: data.sessionsLoading, error: data.sessionsError, t,
            onCancel: () => data.setPickerOpen(false),
            onApply: ids => { data.setSelected(ids); data.setPickerOpen(false) },
          })
          : null)
    }

    /** Settings surface: the compact form-style layout it shipped with. */
    function SettingsPanel({ t }) {
      const data = useUsageData(t, undefined, '7d')
      const totals = data.totals
      const cards = [
        { label: t('cardTotal'), value: formatNumber(totals.total), hint: formatExact(totals.total) },
        { label: t('cardIn'), value: formatNumber(totals.in), hint: formatExact(totals.in) },
        { label: t('cardOut'), value: formatNumber(totals.out), hint: formatExact(totals.out) },
        { label: t('cardCacheRead'), value: formatNumber(totals.cacheRead), hint: formatExact(totals.cacheRead) },
        { label: t('cardCacheWrite'), value: formatNumber(totals.cacheWrite), hint: formatExact(totals.cacheWrite) },
        { label: t('cardHit'), value: formatPercent(totals.cacheHitRate) },
        { label: t('cardCalls'), value: formatNumber(totals.calls), hint: formatExact(totals.calls) },
      ]
      const usageChart = useMemo(() => ({
        buckets: data.view.series.map(point => point.bucket),
        series: usageSeries(data.view.series, t),
      }), [data.view.series, t])
      return h('div', { style: styles.page },
        h('div', { style: styles.header },
          h('h2', { style: styles.title }, t('title')),
          h('p', { style: styles.subtitle }, t('subtitle'))),

        h('div', { style: styles.bar },
          h(ScopeBar, { data, t, showRecent: true, compact: false }),
          h('span', { style: styles.spacer }),
          h('button', { type: 'button', style: { ...styles.button, ...(data.loading ? styles.buttonDisabled : {}) }, onClick: () => { if (!data.loading) data.refresh() } }, t('refresh')),
          h('button', { type: 'button', style: { ...styles.button, ...(data.rebuilding ? styles.buttonDisabled : {}) }, onClick: () => { if (!data.rebuilding) data.rebuild() } },
            data.rebuilding ? t('rebuilding') : t('rebuild'))),

        h('div', { style: styles.bar }, h(RangeBar, { data, t })),

        data.customError !== null ? h('div', { style: styles.notice, role: 'alert' }, data.customError) : null,
        data.error !== null ? h('div', { style: styles.error, role: 'alert' }, `${t('failed')}: ${data.error}`) : null,

        h('div', { style: { ...styles.cards, opacity: data.loading ? 0.6 : 1 }, 'aria-busy': data.loading },
          cards.map(card => h('div', { key: card.label, style: styles.card },
            h('span', { style: styles.cardLabel }, card.label),
            h('span', { style: styles.cardValue }, card.value),
            card.hint === undefined ? null : h('span', { style: styles.cardHint }, card.hint)))),

        h('div', { style: styles.chartCard },
          h('div', { style: styles.chartHead },
            h('span', { style: styles.chartTitle }, t('chartTitle')),
            h('span', { style: styles.spacer }),
            h('span', { style: styles.chartFoot }, data.view.granularity === 'hour' ? t('grainHour') : t('grainDay'))),
          h(TrendChart, {
            buckets: usageChart.buckets, series: usageChart.series, mode: 'stacked',
            granularity: data.view.granularity, t, title: t('chartTitle'),
            emptyTitle: t('chartEmpty'), emptyHint: t('chartEmptyHint'),
          })),

        h('div', { style: styles.footer },
          data.updatedAt === null ? null : fmt(t('updatedAt'), { time: formatClock(data.updatedAt) }),
          data.data?.sync ? ` · ${fmt(t('syncInfo'), { files: data.data.sync.files, changed: data.data.sync.changed, ms: data.data.sync.ms })}` : null),

        data.pickerOpen
          ? h(Picker, {
            sessions: data.sessions, selected: data.selected, loading: data.sessionsLoading, error: data.sessionsError, t,
            onCancel: () => data.setPickerOpen(false),
            onApply: ids => { data.setSelected(ids); data.setPickerOpen(false) },
          })
          : null)
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'token-usage: dictionaries')
        const t = ctx.locale.bind(NS)
        // Settings keeps a compact form layout; the Conversation tab is a
        // full-width dashboard that starts on the Session it belongs to.
        ctx.slots.inject('settings.section', () => ctx.slots.register({
          name: 'settings.section',
          id: 'token-usage',
          order: 40,
          label: () => t('nav'),
        }, () => h(SettingsPanel, { t })))
        ctx.slots.inject('conversation.view', () => ctx.slots.register({
          name: 'conversation.view',
          id: 'token-usage',
          order: 50,
          locale: NS,
          label: () => t('viewLabel'),
          inject: sessionId => ({ t, sessionId }),
        }, props => h(UsageDashboard, { t: props.t, sessionId: props.sessionId })))
      },
    }
  },
})
