'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { apiJson } from '@/lib/api'
import { useAppStore } from '@/store/useAppStore'

export default function WhatIfFlux() {
  const datasetId = useAppStore(s => s.datasetId)
  const [summary, setSummary] = useState<any>(null)
  const [res, setRes] = useState<any>(null)
  const [err, setErr] = useState<string | null>(null)

  const features = useMemo(() => (summary?.numeric_columns || []).slice(1, 5), [summary])

  const [a, setA] = useState<Record<string, number>>({})
  const [b, setB] = useState<Record<string, number>>({})

  useEffect(() => {
    if (!datasetId) return
    apiJson(`/v1/datasets/${datasetId}/summary`).then((s) => {
      setSummary(s)
      const cols = (s.numeric_columns || []).slice(1, 5)
      const initA: any = {}
      const initB: any = {}
      for (const c of cols) {
        initA[c] = 0
        initB[c] = 0
      }
      setA(initA)
      setB(initB)
    })
  }, [datasetId])

  const run = async (na = a, nb = b) => {
    if (!datasetId) return
    setErr(null)
    try {
      const r = await apiJson('/v1/simulate', { method: 'POST', body: JSON.stringify({ dataset_id: datasetId, scenario_a: na, scenario_b: nb }) })
      setRes(r)
    } catch (e: any) {
      setErr(e?.message || 'Simulation failed')
    }
  }

  useEffect(() => {
    if (datasetId && features.length) run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datasetId, features.join('|')])

  const slider = (label: string, value: number, onChange: (v: number) => void) => (
    <div className="glass rounded-2xl p-4 border border-white/10">
      <div className="flex items-center justify-between">
        <div className="text-white font-medium">{label}</div>
        <div className="text-white/60 text-sm">{value.toFixed(2)}</div>
      </div>
      <input
        type="range"
        min={-100}
        max={100}
        value={value}
        onChange={(e) => {
          const v = Number(e.target.value)
          onChange(v)
        }}
        className="mt-3 w-full"
      />
    </div>
  )

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div className="glass-strong neon-border rounded-3xl p-6 shadow-glowHard">
        <div className="text-sm uppercase tracking-[0.28em] text-white/60">Phase 5</div>
        <div className="mt-2 text-3xl font-semibold text-white">Flux — What-If Simulation</div>
        <p className="mt-3 text-white/70">Slide variables. The proxy prediction updates instantly (A vs B).</p>

        {!datasetId ? <div className="mt-6 text-white/70">Upload a dataset first.</div> : null}

        {!!datasetId && !features.length ? <div className="mt-6 text-white/70">Need numeric columns (run Processor if required).</div> : null}

        {!!datasetId && features.length ? (
          <div className="mt-6 grid grid-cols-1 gap-4">
            <div className="text-white/70 text-xs tracking-[0.28em] uppercase">Scenario A</div>
            {features.map((f) => slider(f, a[f] ?? 0, (v) => {
              const na = { ...a, [f]: v }
              setA(na)
              run(na, b)
            }))}
            <div className="text-white/70 text-xs tracking-[0.28em] uppercase mt-2">Scenario B</div>
            {features.map((f) => slider(f, b[f] ?? 0, (v) => {
              const nb = { ...b, [f]: v }
              setB(nb)
              run(a, nb)
            }))}
          </div>
        ) : null}

        {err ? <div className="mt-4 glass rounded-2xl p-4 border border-red-500/30 text-red-100">{err}</div> : null}
      </div>

      <div className="glass-strong neon-border rounded-3xl p-6 shadow-glow">
        <div className="text-sm uppercase tracking-[0.28em] text-white/60">Comparison</div>
        {res?.ok ? (
          <div className="mt-5 grid grid-cols-1 gap-4">
            <div className="glass rounded-2xl p-5 border border-white/10">
              <div className="text-white font-semibold">Target Proxy</div>
              <div className="text-white/60 text-sm mt-1">{res.target_proxy}</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <motion.div whileHover={{ y: -2 }} className="glass rounded-2xl p-5 border border-neon-cyan/20">
                <div className="text-white/70 text-xs tracking-[0.28em] uppercase">A</div>
                <div className="mt-2 text-2xl text-white font-semibold">{res.scenario_a.prediction.toFixed(2)}</div>
              </motion.div>
              <motion.div whileHover={{ y: -2 }} className="glass rounded-2xl p-5 border border-neon-pink/20">
                <div className="text-white/70 text-xs tracking-[0.28em] uppercase">B</div>
                <div className="mt-2 text-2xl text-white font-semibold">{res.scenario_b.prediction.toFixed(2)}</div>
              </motion.div>
            </div>
            <div className="glass rounded-2xl p-5 border border-white/10">
              <div className="text-white font-semibold">Δ (B − A)</div>
              <div className={`mt-2 text-2xl font-semibold ${res.delta >= 0 ? 'text-neon-lime' : 'text-neon-pink'}`}>{res.delta.toFixed(2)}</div>
            </div>
          </div>
        ) : (
          <div className="mt-8 text-white/70">Run a simulation to see deltas.</div>
        )}
      </div>
    </div>
  )
}
