'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { API_URL } from '@/lib/api'
import { useAppStore } from '@/store/useAppStore'

export default function ExportBay() {
  const datasetId = useAppStore(s => s.datasetId)
  const [busy, setBusy] = useState<string | null>(null)

  const dl = async (kind: 'pdf' | 'csv') => {
    if (!datasetId) return
    setBusy(kind)
    try {
      const res = await fetch(`${API_URL}/v1/export/${kind}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataset_id: datasetId }),
      })
      if (!res.ok) throw new Error(await res.text())
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = kind === 'pdf' ? 'neonforge-report.pdf' : 'neonforge-export.csv'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div className="glass-strong neon-border rounded-3xl p-6 shadow-glowHard">
        <div className="text-sm uppercase tracking-[0.28em] text-white/60">Phase 9</div>
        <div className="mt-2 text-3xl font-semibold text-white">Export Bay</div>
        <p className="mt-3 text-white/70">Generate PDF reports + export CSV. Everything is server-side, ready for sharing.</p>

        <div className="mt-6 grid grid-cols-1 gap-4">
          <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} disabled={!datasetId || busy === 'pdf'} onClick={() => dl('pdf')}
            className="rounded-2xl px-4 py-3 bg-gradient-to-r from-neon-cyan/80 via-neon-violet/70 to-neon-pink/70 text-black font-semibold shadow-glow disabled:opacity-40">
            {busy === 'pdf' ? 'Forging PDF...' : 'Download PDF'}
          </motion.button>
          <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} disabled={!datasetId || busy === 'csv'} onClick={() => dl('csv')}
            className="rounded-2xl px-4 py-3 bg-white/10 border border-white/10 text-white font-semibold shadow-glow disabled:opacity-40">
            {busy === 'csv' ? 'Forging CSV...' : 'Download CSV'}
          </motion.button>
        </div>

        <div className="mt-6 glass rounded-3xl p-5 border border-white/10">
          <div className="text-white font-semibold">Report includes</div>
          <div className="mt-2 text-white/70 text-sm">Summary, missingness, and a preview slice (ready to extend).</div>
        </div>
      </div>

      <div className="glass-strong neon-border rounded-3xl p-6 shadow-glow">
        <div className="text-sm uppercase tracking-[0.28em] text-white/60">Status</div>
        <div className="mt-6 glass rounded-3xl p-5 border border-white/10">
          <div className="text-white/80">Dataset</div>
          <div className="mt-1 text-neon-cyan font-semibold">{datasetId ?? '—'}</div>
        </div>
      </div>
    </div>
  )
}
