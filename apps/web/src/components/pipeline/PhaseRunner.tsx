'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { apiJson } from '@/lib/api'
import { useAppStore } from '@/store/useAppStore'
import DatasetVisual from '@/components/datasets/DatasetVisual'

export default function PhaseRunner({ phase, title, subtitle }: { phase: 'cleaner' | 'processor'; title: string; subtitle: string }) {
  const datasetId = useAppStore(s => s.datasetId)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [err, setErr] = useState<string | null>(null)

  const endpoint = useMemo(() => (phase === 'cleaner' ? '/v1/cleaner/run' : '/v1/processor/run'), [phase])

  const run = async () => {
    if (!datasetId) return
    setBusy(true)
    setErr(null)
    try {
      const r = await apiJson<any>(endpoint, {
        method: 'POST',
        body: JSON.stringify({ dataset_id: datasetId }),
      })
      setResult(r)
    } catch (e: any) {
      setErr(e?.message || 'Failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div className="glass-strong neon-border rounded-3xl p-6 shadow-glowHard">
        <div className="text-sm uppercase tracking-[0.28em] text-white/60">{subtitle}</div>
        <div className="mt-2 text-3xl font-semibold text-white">{title}</div>
        <p className="mt-3 text-white/70">Run the phase and watch the dataset morph. Results are shown as visuals (before vs after where applicable).</p>

        <div className="mt-6 flex items-center gap-3">
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            disabled={!datasetId || busy}
            onClick={run}
            className="rounded-2xl px-4 py-3 bg-gradient-to-r from-neon-cyan/80 via-neon-violet/70 to-neon-pink/70 text-black font-semibold shadow-glow disabled:opacity-40"
          >
            {busy ? 'Processing...' : datasetId ? 'Run Phase' : 'Upload Dataset First'}
          </motion.button>
          <div className="text-white/60 text-sm">Dataset: <span className="text-neon-cyan">{datasetId ?? '—'}</span></div>
        </div>

        {err ? <div className="mt-4 glass rounded-2xl p-4 border border-red-500/30 text-red-100">{err}</div> : null}

        {result ? (
          <div className="mt-5 space-y-3">
            <div className="glass rounded-2xl p-4 border border-white/10">
              <div className="text-white font-semibold">Result</div>
              <pre className="mt-2 text-xs text-white/70 overflow-auto max-h-64">{JSON.stringify(result, null, 2)}</pre>
            </div>
            {phase === 'cleaner' && result.before && result.after ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="glass rounded-2xl p-4 border border-white/10">
                  <div className="text-white/70 text-xs tracking-[0.28em] uppercase">Before</div>
                  <div className="mt-2 text-white text-sm">Missing top: {result.before.missing_top?.[0]?.column ?? '—'}</div>
                </div>
                <div className="glass rounded-2xl p-4 border border-white/10">
                  <div className="text-white/70 text-xs tracking-[0.28em] uppercase">After</div>
                  <div className="mt-2 text-white text-sm">Duplicates removed: {result.duplicates_removed ?? 0}</div>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="glass-strong neon-border rounded-3xl p-6 shadow-glow">
        <div className="text-sm uppercase tracking-[0.28em] text-white/60">Live Visuals</div>
        {datasetId ? <DatasetVisual datasetId={datasetId} /> : <div className="mt-8 text-white/70">Upload a dataset first.</div>}
      </div>
    </div>
  )
}
