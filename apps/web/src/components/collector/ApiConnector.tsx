'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { API_URL } from '@/lib/api'
import { useAppStore } from '@/store/useAppStore'
import LiveJobStream from '@/components/pipeline/LiveJobStream'

export default function ApiConnector() {
  const setDatasetId = useAppStore(s => s.setDatasetId)
  const job = useAppStore(s => s.job)
  const setJob = useAppStore(s => s.setJob)

  const [name, setName] = useState('API Stream')
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/posts')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const connect = async () => {
    setBusy(true)
    setErr(null)
    try {
      const res = await fetch(`${API_URL}/v1/collector/api`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, url, method: 'GET', headers: {} }),
      })
      if (!res.ok) throw new Error(await res.text())
      const meta = await res.json()
      setDatasetId(meta.dataset_id)

      const jr = await fetch(`${API_URL}/v1/pipeline/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataset_id: meta.dataset_id }),
      })
      if (jr.ok) {
        const j = await jr.json()
        setJob({ id: j.job_id, status: 'running', phase: 'collector', progress: 0.02 })
      }
    } catch (e: any) {
      setErr(e?.message || 'Connect failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="glass rounded-3xl p-5 border border-white/10">
        <div className="text-white font-semibold">Live API Connector</div>
        <div className="mt-3 grid grid-cols-1 gap-3">
          <input value={name} onChange={(e) => setName(e.target.value)} className="rounded-2xl bg-black/25 border border-white/10 px-3 py-3 text-white outline-none" placeholder="Name" />
          <input value={url} onChange={(e) => setUrl(e.target.value)} className="rounded-2xl bg-black/25 border border-white/10 px-3 py-3 text-white outline-none" placeholder="https://..." />
          <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} disabled={busy} onClick={connect}
            className="rounded-2xl px-4 py-3 bg-gradient-to-r from-neon-cyan/80 via-neon-violet/70 to-neon-pink/70 text-black font-semibold shadow-glow disabled:opacity-40">
            {busy ? 'Connecting...' : 'Connect & Ingest'}
          </motion.button>
        </div>
        {err ? <div className="mt-4 glass rounded-2xl p-4 border border-red-500/30 text-red-100">{err}</div> : null}
      </div>

      {job?.id ? <LiveJobStream jobId={job.id} /> : null}
    </div>
  )
}
