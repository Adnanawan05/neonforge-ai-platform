'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
import { apiJson } from '@/lib/api'

type Summary = {
  shape: [number, number]
  missing_top: { column: string; missing: number }[]
  histogram?: { column: string; bins: { x0: number; x1: number; count: number }[] }
  correlation?: { columns: string[]; matrix: number[][] }
  numeric_columns: string[]
  categorical_columns: string[]
}

function Heatmap({ corr }: { corr: NonNullable<Summary['correlation']> }) {
  const cols = corr.columns
  return (
    <div className="rounded-2xl bg-black/25 border border-white/5 p-3 overflow-auto">
      <div className="grid" style={{ gridTemplateColumns: `120px repeat(${cols.length}, minmax(42px, 1fr))` }}>
        <div />
        {cols.map(c => (
          <div key={c} className="text-[10px] text-white/55 truncate px-1 py-1">{c}</div>
        ))}
        {cols.map((r, i) => (
          <div key={r} className="contents">
            <div className="text-[10px] text-white/55 truncate px-1 py-1">{r}</div>
            {cols.map((c, j) => {
              const v = corr.matrix[i][j]
              const a = Math.min(1, Math.abs(v))
              const bg = v >= 0 ? `rgba(78,240,255,${0.10 + 0.35 * a})` : `rgba(255,79,216,${0.10 + 0.35 * a})`
              return (
                <motion.div
                  key={c}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (i + j) * 0.008, duration: 0.25 }}
                  className="m-[2px] rounded-lg h-8 flex items-center justify-center text-[10px] text-white/70"
                  style={{ background: bg, border: '1px solid rgba(255,255,255,0.06)' }}
                  title={`${r} vs ${c}: ${v.toFixed(2)}`}
                >
                  {v.toFixed(2)}
                </motion.div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DatasetVisual({ datasetId }: { datasetId: string }) {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    setErr(null)
    apiJson<Summary>(`/v1/datasets/${datasetId}/summary`)
      .then((s) => alive && setSummary(s))
      .catch((e) => alive && setErr(String(e?.message || e)))
    return () => {
      alive = false
    }
  }, [datasetId])

  const missingBars = useMemo(() => (summary?.missing_top || []).filter(x => x.missing > 0).slice(0, 8), [summary])
  const hist = useMemo(() => {
    if (!summary?.histogram) return []
    return summary.histogram.bins.map((b, i) => ({
      name: `${i + 1}`,
      count: b.count,
    }))
  }, [summary])

  if (err) return <div className="text-red-100">{err}</div>
  if (!summary) return <div className="text-white/70">Materializing charts...</div>

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-4">
          <div className="text-white/60 text-xs tracking-[0.28em] uppercase">Rows</div>
          <div className="mt-1 text-white text-2xl font-semibold">{summary.shape[0].toLocaleString()}</div>
        </div>
        <div className="glass rounded-2xl p-4">
          <div className="text-white/60 text-xs tracking-[0.28em] uppercase">Columns</div>
          <div className="mt-1 text-white text-2xl font-semibold">{summary.shape[1].toLocaleString()}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-4 border border-white/10">
          <div className="text-white font-semibold">Missingness</div>
          <div className="mt-3 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={missingBars}>
                <XAxis dataKey="column" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }} />
                <Tooltip contentStyle={{ background: 'rgba(8,6,16,0.85)', border: '1px solid rgba(78,240,255,0.25)', borderRadius: 12 }} />
                <Bar dataKey="missing" fill="rgba(255,79,216,0.7)" radius={[10, 10, 4, 4]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-2xl p-4 border border-white/10">
          <div className="text-white font-semibold">Distribution</div>
          <div className="text-xs text-white/60 mt-1">{summary.histogram?.column ?? '—'}</div>
          <div className="mt-3 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hist}>
                <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }} />
                <Tooltip contentStyle={{ background: 'rgba(8,6,16,0.85)', border: '1px solid rgba(78,240,255,0.25)', borderRadius: 12 }} />
                <Bar dataKey="count" fill="rgba(78,240,255,0.65)" radius={[10, 10, 4, 4]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {summary.correlation ? (
        <div>
          <div className="text-white font-semibold">Correlation Heatmap</div>
          <div className="mt-3">
            <Heatmap corr={summary.correlation} />
          </div>
        </div>
      ) : null}
    </div>
  )
}
