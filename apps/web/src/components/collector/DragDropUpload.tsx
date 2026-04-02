'use client'

import { useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { API_URL } from '@/lib/api'
import { useAppStore } from '@/store/useAppStore'
import LiveJobStream from '@/components/pipeline/LiveJobStream'

export default function DragDropUpload() {
  const [drag, setDrag] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const boxRef = useRef<HTMLDivElement | null>(null)

  const datasetId = useAppStore(s => s.datasetId)
  const setDatasetId = useAppStore(s => s.setDatasetId)
  const job = useAppStore(s => s.job)
  const setJob = useAppStore(s => s.setJob)

  const wsJobId = useMemo(() => job?.id ?? null, [job?.id])

  const pulse = () => {
    if (!boxRef.current) return
    gsap.fromTo(boxRef.current, { boxShadow: '0 0 0 1px rgba(78,240,255,0.18), 0 0 0 rgba(0,0,0,0)' }, { boxShadow: '0 0 0 1px rgba(78,240,255,0.35), 0 0 40px rgba(255,79,216,0.20)', duration: 0.45, yoyo: true, repeat: 1 })
  }

  const upload = async (file: File) => {
    setErr(null)
    setBusy(true)
    pulse()
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch(`${API_URL}/v1/collector/upload`, { method: 'POST', body: fd })
      if (!res.ok) throw new Error(await res.text())
      const meta = await res.json()
      setDatasetId(meta.dataset_id)

      // auto-run pipeline without target first (clean+process+painter+insights+export)
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
      setErr(e?.message || 'Upload failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-4">
        <motion.div
          ref={boxRef}
          onDragEnter={(e) => {
            e.preventDefault()
            setDrag(true)
          }}
          onDragOver={(e) => {
            e.preventDefault()
            setDrag(true)
          }}
          onDragLeave={(e) => {
            e.preventDefault()
            setDrag(false)
          }}
          onDrop={(e) => {
            e.preventDefault()
            setDrag(false)
            const f = e.dataTransfer.files?.[0]
            if (f) upload(f)
          }}
          whileHover={{ y: -2 }}
          className={`rounded-3xl p-5 glass ${drag ? 'border border-neon-cyan/50 shadow-glow' : 'border border-white/10'} cursor-pointer`}
          onClick={() => inputRef.current?.click()}
        >
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl glass flex items-center justify-center">
              <div className={`h-3 w-3 rounded-full ${drag ? 'bg-neon-cyan' : 'bg-white/30'} shadow-[0_0_22px_rgba(78,240,255,0.35)]`} />
            </div>
            <div className="flex-1">
              <div className="text-white font-semibold">Drop your dataset</div>
              <div className="mt-1 text-white/70 text-sm">CSV or Excel. The file will flow into the pipeline as energy.</div>
              <div className="mt-4 flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${busy ? 'bg-neon-pink animate-pulseGlow' : 'bg-white/25'}`} />
                <div className="text-xs text-white/60">{busy ? 'Uploading...' : datasetId ? 'Dataset loaded' : 'Awaiting file'}</div>
              </div>
            </div>
          </div>
          <div className="mt-5 h-[64px] rounded-2xl bg-black/25 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/15 via-neon-violet/10 to-neon-pink/15" />
            <div className="absolute inset-0 opacity-70">
              <div className="absolute top-0 left-0 h-full w-1/3 bg-white/20 blur-sm animate-shimmer" />
            </div>
          </div>

          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept=".csv,.xlsx,.xls"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) upload(f)
            }}
          />
        </motion.div>

        {err ? (
          <div className="glass rounded-2xl p-4 border border-red-500/30 text-red-100">
            {err}
          </div>
        ) : null}

        {wsJobId ? <LiveJobStream jobId={wsJobId} /> : null}
      </div>
    </div>
  )
}
