'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { apiJson } from '@/lib/api'
import { useAppStore } from '@/store/useAppStore'

const glowBySeverity: Record<string, string> = {
  info: 'border-neon-cyan/20',
  warn: 'border-neon-violet/25',
  critical: 'border-neon-pink/25',
}

export default function OracleInsights() {
  const datasetId = useAppStore(s => s.datasetId)
  const [res, setRes] = useState<any>(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const run = async () => {
    if (!datasetId) return
    setBusy(true)
    setErr(null)
    try {
      const r = await apiJson('/v1/insights/generate', { method: 'POST', body: JSON.stringify({ dataset_id: datasetId }) })
      setRes(r)
    } catch (e: any) {
      setErr(e?.message || 'Failed')
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    if (datasetId) run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datasetId])

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div className="glass-strong neon-border rounded-3xl p-6 shadow-glowHard">
        <div className="text-sm uppercase tracking-[0.28em] text-white/60">Phase 8</div>
        <div className="mt-2 text-3xl font-semibold text-white">Oracle — AI Insights</div>
        <p className="mt-3 text-white/70">Human-readable insights + anomaly highlights with cinematic motion.</p>

        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          disabled={!datasetId || busy}
          onClick={run}
          className="mt-6 rounded-2xl px-4 py-3 bg-gradient-to-r from-neon-cyan/80 via-neon-violet/70 to-neon-pink/70 text-black font-semibold shadow-glow disabled:opacity-40"
        >
          {busy ? 'Consulting...' : datasetId ? 'Generate Insights' : 'Upload Dataset First'}
        </motion.button>

        {err ? <div className="mt-4 glass rounded-2xl p-4 border border-red-500/30 text-red-100">{err}</div> : null}

        <div className="mt-6 glass rounded-3xl p-5 border border-white/10">
          <div className="text-white font-semibold">Signal Deck</div>
          <div className="mt-2 text-white/60 text-sm">Cards float in with glow. Critical insights pulse.</div>
        </div>
      </div>

      <div className="glass-strong neon-border rounded-3xl p-6 shadow-glow">
        <div className="text-sm uppercase tracking-[0.28em] text-white/60">Insights</div>
        <div className="mt-4 grid grid-cols-1 gap-3">
          <AnimatePresence initial={false}>
            {(res?.insights || []).map((i: any, idx: number) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 14, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.45, delay: idx * 0.04, ease: [0.22, 1, 0.36, 1] }}
                className={`rounded-3xl p-5 glass border ${glowBySeverity[i.severity] || 'border-white/10'} ${i.severity === 'critical' ? 'shadow-glowHard' : 'shadow-glow'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-white font-semibold">{i.title}</div>
                  <motion.div
                    animate={i.severity === 'critical' ? { opacity: [0.5, 1, 0.5] } : { opacity: 0.6 }}
                    transition={i.severity === 'critical' ? { duration: 1.2, repeat: Infinity } : { duration: 0.2 }}
                    className="text-[10px] tracking-[0.28em] uppercase text-white/70"
                  >
                    {i.severity}
                  </motion.div>
                </div>
                <div className="mt-2 text-white/75 text-sm leading-relaxed">{i.text}</div>
                {i.anomalies ? (
                  <div className="mt-4 rounded-2xl bg-black/25 border border-white/5 p-3">
                    <div className="text-white/70 text-xs">Anomalies: {i.anomalies.length}</div>
                  </div>
                ) : null}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
