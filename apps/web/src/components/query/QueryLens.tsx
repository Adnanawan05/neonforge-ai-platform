'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { apiJson } from '@/lib/api'
import { useAppStore } from '@/store/useAppStore'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts'

export default function QueryLens() {
  const datasetId = useAppStore(s => s.datasetId)
  const [q, setQ] = useState('Show sales in last 3 months')
  const [busy, setBusy] = useState(false)
  const [res, setRes] = useState<any>(null)
  const [err, setErr] = useState<string | null>(null)

  const run = async () => {
    if (!datasetId) return
    setBusy(true)
    setErr(null)
    try {
      const r = await apiJson<any>('/v1/query', { method: 'POST', body: JSON.stringify({ dataset_id: datasetId, query: q }) })
      setRes(r)
    } catch (e: any) {
      setErr(e?.message || 'Query failed')
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    if (datasetId) run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datasetId])

  const chart = useMemo(() => {
    const rows = res?.preview?.rows || []
    if (!rows.length) return []
    const keys = Object.keys(rows[0])
    const numKey = keys.find(k => typeof rows[0][k] === 'number')
    if (!numKey) return []
    return rows.slice(0, 40).map((r: any, i: number) => ({ i: i + 1, v: r[numKey] }))
  }, [res])

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div className="glass-strong neon-border rounded-3xl p-6 shadow-glowHard">
        <div className="text-sm uppercase tracking-[0.28em] text-white/60">Phase 4</div>
        <div className="mt-2 text-3xl font-semibold text-white">Lens — Natural Language Query</div>

        <div className="mt-6 glass rounded-2xl p-4 border border-white/10">
          <div className="text-xs text-white/60 tracking-[0.28em] uppercase">Ask the dataset</div>
          <motion.textarea
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="mt-3 w-full bg-transparent outline-none text-white/90 min-h-24"
            animate={{ opacity: [0.9, 1, 0.9] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="mt-3 flex items-center gap-3">
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              disabled={!datasetId || busy}
              onClick={run}
              className="rounded-2xl px-4 py-3 bg-gradient-to-r from-neon-cyan/80 via-neon-violet/70 to-neon-pink/70 text-black font-semibold shadow-glow disabled:opacity-40"
            >
              {busy ? 'Focusing...' : datasetId ? 'Query' : 'Upload Dataset First'}
            </motion.button>
            <div className="text-xs text-white/60">Suggestions: “top 10”, “where price > 10”</div>
          </div>
        </div>

        {err ? <div className="mt-4 glass rounded-2xl p-4 border border-red-500/30 text-red-100">{err}</div> : null}

        {res?.plan ? (
          <div className="mt-5 glass rounded-2xl p-4 border border-white/10">
            <div className="text-white font-semibold">Plan</div>
            <pre className="mt-2 text-xs text-white/70 overflow-auto">{JSON.stringify(res.plan, null, 2)}</pre>
          </div>
        ) : null}
      </div>

      <div className="glass-strong neon-border rounded-3xl p-6 shadow-glow">
        <div className="text-sm uppercase tracking-[0.28em] text-white/60">Results</div>
        <div className="mt-3 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chart}>
              <XAxis dataKey="i" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: 'rgba(8,6,16,0.85)', border: '1px solid rgba(78,240,255,0.25)', borderRadius: 12 }} />
              <Line type="monotone" dataKey="v" stroke="rgba(78,240,255,0.9)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-5 glass rounded-2xl p-4 border border-white/10">
          <div className="text-white font-semibold">Preview</div>
          <div className="mt-3 grid grid-cols-1 gap-2 max-h-56 overflow-auto">
            {(res?.preview?.rows || []).slice(0, 12).map((r: any, idx: number) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="rounded-2xl p-3 bg-black/25 border border-white/5"
              >
                <div className="text-xs text-white/70 truncate">{Object.entries(r).slice(0, 4).map(([k, v]) => `${k}: ${String(v)}`).join('  •  ')}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
