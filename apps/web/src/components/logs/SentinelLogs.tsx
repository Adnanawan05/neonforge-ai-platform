'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { apiJson } from '@/lib/api'

export default function SentinelLogs() {
  const [rows, setRows] = useState<any[]>([])
  const [err, setErr] = useState<string | null>(null)
  const [tick, setTick] = useState(0)
  const scroller = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 1200)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    apiJson<any[]>('/v1/logs?limit=120')
      .then((r) => {
        setRows(r)
        setErr(null)
      })
      .catch((e) => setErr(String(e?.message || e)))
  }, [tick])

  useEffect(() => {
    scroller.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [rows])

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div className="glass-strong neon-border rounded-3xl p-6 shadow-glowHard">
        <div className="text-sm uppercase tracking-[0.28em] text-white/60">Phase 10</div>
        <div className="mt-2 text-3xl font-semibold text-white">Sentinel — Logs</div>
        <p className="mt-3 text-white/70">Terminal-stream animation + error glow. Everything recorded server-side.</p>

        {err ? <div className="mt-4 glass rounded-2xl p-4 border border-red-500/30 text-red-100">{err}</div> : null}

        <div className="mt-6 glass rounded-3xl p-5 border border-white/10">
          <div className="text-white font-semibold">Signal Stream</div>
          <div className="mt-2 text-white/60 text-sm">Auto-refresh every ~1s.</div>
        </div>
      </div>

      <div className="glass-strong neon-border rounded-3xl p-6 shadow-glow">
        <div className="text-sm uppercase tracking-[0.28em] text-white/60">Terminal</div>
        <div ref={scroller} className="mt-4 rounded-3xl bg-black/35 border border-white/10 p-4 h-[520px] overflow-auto">
          <div className="font-mono text-xs space-y-2">
            {rows.map((r, idx) => {
              const isErr = r.level === 'error'
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`rounded-2xl px-3 py-2 border ${isErr ? 'border-red-500/30 bg-red-500/10' : 'border-white/5 bg-white/5'}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="truncate text-white/80">[{r.ts}] {r.phase ?? 'system'} — {r.message}</div>
                    <div className={`text-[10px] tracking-[0.28em] uppercase ${isErr ? 'text-red-200' : 'text-white/50'}`}>{r.level}</div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
