'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { apiJson } from '@/lib/api'
import { useAppStore } from '@/store/useAppStore'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'

export default function MLHeart() {
  const datasetId = useAppStore(s => s.datasetId)
  const setJob = useAppStore(s => s.setJob)

  const [preview, setPreview] = useState<any>(null)
  const [target, setTarget] = useState<string>('')
  const [busy, setBusy] = useState(false)
  const [res, setRes] = useState<any>(null)
  const [err, setErr] = useState<string | null>(null)

  const brainRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!brainRef.current) return
    const el = brainRef.current
    const tl = gsap.timeline({ repeat: -1, yoyo: true })
    tl.to(el, { filter: 'drop-shadow(0 0 28px rgba(78,240,255,0.35)) drop-shadow(0 0 40px rgba(255,79,216,0.18))', duration: 0.9, ease: 'sine.inOut' })
    return () => tl.kill()
  }, [])

  useEffect(() => {
    if (!datasetId) return
    apiJson(`/v1/datasets/${datasetId}/preview?limit=1`).then((p) => {
      setPreview(p)
      const cols = p?.columns || []
      setTarget(cols.find((c: string) => c.toLowerCase().includes('target')) || cols[0] || '')
    })
  }, [datasetId])

  const importances = useMemo(() => res?.importances || [], [res])

  const train = async () => {
    if (!datasetId || !target) return
    setBusy(true)
    setErr(null)
    try {
      const r = await apiJson('/v1/ml/train', { method: 'POST', body: JSON.stringify({ dataset_id: datasetId, target }) })
      setRes(r)

      // run full pipeline with target to light the pipeline
      const jr = await apiJson('/v1/pipeline/run', { method: 'POST', body: JSON.stringify({ dataset_id: datasetId, target }) })
      setJob({ id: jr.job_id, status: 'running', phase: 'collector', progress: 0.02 })
    } catch (e: any) {
      setErr(e?.message || 'Train failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div className="glass-strong neon-border rounded-3xl p-6 shadow-glowHard">
        <div className="text-sm uppercase tracking-[0.28em] text-white/60">Phase 6</div>
        <div className="mt-2 text-3xl font-semibold text-white">AI Heart — Model Training</div>
        <p className="mt-3 text-white/70">Auto-train Linear / Tree / Neural. Metrics + feature importance animate in.</p>

        <div className="mt-6 grid grid-cols-1 gap-4">
          <div className="glass rounded-2xl p-4 border border-white/10">
            <div className="text-white/70 text-xs tracking-[0.28em] uppercase">Target</div>
            <select
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="mt-2 w-full bg-black/25 border border-white/10 rounded-2xl px-3 py-3 text-white outline-none"
              disabled={!datasetId}
            >
              {(preview?.columns || []).map((c: string) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            disabled={!datasetId || !target || busy}
            onClick={train}
            className="rounded-2xl px-4 py-3 bg-gradient-to-r from-neon-cyan/80 via-neon-violet/70 to-neon-pink/70 text-black font-semibold shadow-glow disabled:opacity-40"
          >
            {busy ? 'Training...' : datasetId ? 'Train + Run Pipeline' : 'Upload Dataset First'}
          </motion.button>

          {err ? <div className="glass rounded-2xl p-4 border border-red-500/30 text-red-100">{err}</div> : null}
        </div>

        <div className="mt-6 glass rounded-3xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div className="text-white font-semibold">Neural Pulse</div>
            <div className="text-[10px] tracking-[0.28em] uppercase text-white/55">Cinematic</div>
          </div>
          <div className="mt-5 flex items-center justify-center">
            <div ref={brainRef} className="relative h-40 w-40">
              <div className="absolute inset-0 rounded-[36px] bg-gradient-to-br from-neon-cyan/30 via-neon-violet/20 to-neon-pink/20 blur-xl" />
              <div className="absolute inset-2 rounded-[32px] glass border border-neon-cyan/20" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0"
              >
                <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neon-cyan shadow-[0_0_22px_rgba(78,240,255,0.6)]" />
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neon-pink/80"
                    style={{ transform: `translate(-50%,-50%) rotate(${i * 36}deg) translateX(60px)` }}
                  />
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-strong neon-border rounded-3xl p-6 shadow-glow">
        <div className="text-sm uppercase tracking-[0.28em] text-white/60">Metrics</div>

        {res?.ok ? (
          <div className="mt-4 space-y-4">
            <div className="glass rounded-2xl p-4 border border-white/10">
              <div className="text-white font-semibold">Best Model</div>
              <div className="mt-1 text-white/70">{res.best_model} ({res.task})</div>
            </div>

            <div className="glass rounded-2xl p-4 border border-white/10">
              <div className="text-white font-semibold">Feature Importance</div>
              <div className="mt-3 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={importances} layout="vertical">
                    <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }} />
                    <YAxis type="category" dataKey="feature" width={120} tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: 'rgba(8,6,16,0.85)', border: '1px solid rgba(78,240,255,0.25)', borderRadius: 12 }} />
                    <Bar dataKey="importance" fill="rgba(61,255,181,0.65)" radius={[10, 10, 10, 10]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass rounded-2xl p-4 border border-white/10">
              <div className="text-white font-semibold">Raw Metrics</div>
              <pre className="mt-2 text-xs text-white/70 overflow-auto max-h-56">{JSON.stringify(res.metrics, null, 2)}</pre>
            </div>
          </div>
        ) : (
          <div className="mt-8 text-white/70">Train a model to reveal metrics.</div>
        )}
      </div>
    </div>
  )
}
