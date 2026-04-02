'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts'
import { apiJson } from '@/lib/api'
import { useAppStore } from '@/store/useAppStore'

export default function PainterDashboard() {
  const datasetId = useAppStore(s => s.datasetId)
  const [res, setRes] = useState<any>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    if (!datasetId) return
    apiJson('/v1/painter/story', { method: 'POST', body: JSON.stringify({ dataset_id: datasetId }) })
      .then(setRes)
      .catch((e) => setErr(String(e?.message || e)))
  }, [datasetId])

  const trend = useMemo(() => res?.trend?.points || [], [res])
  const spotlight = useMemo(() => res?.spotlight?.bars || [], [res])

  return (
    <div className="space-y-6">
      <div className="glass-strong neon-border rounded-3xl p-6 shadow-glowHard">
        <div className="text-sm uppercase tracking-[0.28em] text-white/60">Phase 7</div>
        <div className="mt-2 text-3xl font-semibold text-white">Painter — Storytelling Analytics</div>
        <p className="mt-3 text-white/70">Not a table. A cinematic narrative: KPIs → trend → spotlight.</p>
      </div>

      {!datasetId ? <div className="text-white/70">Upload a dataset first.</div> : null}
      {err ? <div className="glass rounded-2xl p-4 border border-red-500/30 text-red-100">{err}</div> : null}

      {res ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-1 glass-strong neon-border rounded-3xl p-6 shadow-glow">
            <div className="text-white font-semibold">KPI Constellation</div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {(res.kpis || []).slice(0, 6).map((k: any, idx: number) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -2 }}
                  className="glass rounded-2xl p-4 border border-white/10"
                >
                  <div className="text-[10px] tracking-[0.28em] uppercase text-white/55">{k.label}</div>
                  <div className="mt-2 text-white text-xl font-semibold">{typeof k.value === 'number' ? k.value.toLocaleString() : String(k.value)}</div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="xl:col-span-2 glass-strong neon-border rounded-3xl p-6 shadow-glowHard">
            <div className="flex items-center justify-between">
              <div className="text-white font-semibold">Trend Line</div>
              <div className="text-[10px] tracking-[0.28em] uppercase text-white/55">auto-detected</div>
            </div>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend}>
                  <XAxis dataKey="t" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: 'rgba(8,6,16,0.85)', border: '1px solid rgba(78,240,255,0.25)', borderRadius: 12 }} />
                  <Line type="monotone" dataKey="v" stroke="rgba(168,85,247,0.95)" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="glass rounded-2xl p-4 border border-white/10">
                <div className="text-white font-semibold">Spotlight</div>
                <div className="text-xs text-white/60 mt-1">{res.spotlight?.column ?? '—'}</div>
                <div className="mt-3 h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={spotlight}>
                      <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }} />
                      <YAxis tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }} />
                      <Tooltip contentStyle={{ background: 'rgba(8,6,16,0.85)', border: '1px solid rgba(78,240,255,0.25)', borderRadius: 12 }} />
                      <Bar dataKey="value" fill="rgba(78,240,255,0.65)" radius={[10, 10, 4, 4]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="glass rounded-2xl p-4 border border-white/10">
                <div className="text-white font-semibold">Mini Distributions</div>
                <div className="mt-3 space-y-2 max-h-52 overflow-auto">
                  {(res.constellation || []).map((c: any, idx: number) => (
                    <div key={idx} className="rounded-2xl bg-black/25 border border-white/5 p-3">
                      <div className="text-white/80 text-xs">{c.column}</div>
                      <div className="mt-2 h-20">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={c.bins}>
                            <Line type="monotone" dataKey="y" stroke="rgba(255,79,216,0.85)" strokeWidth={2} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
