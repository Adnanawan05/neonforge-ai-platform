'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { API_URL } from '@/lib/api'
import { useAppStore } from '@/store/useAppStore'

function wsUrl(jobId: string) {
  const u = new URL(API_URL)
  const proto = u.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${proto}//${u.host}/v1/ws/jobs/${jobId}`
}

type EventMsg = { ts: string; level: string; phase?: string; message: string }

export default function LiveJobStream({ jobId }: { jobId: string }) {
  const [events, setEvents] = useState<EventMsg[]>([])
  const setJob = useAppStore(s => s.setJob)

  const url = useMemo(() => wsUrl(jobId), [jobId])

  useEffect(() => {
    let ws: WebSocket | null = null
    let alive = true

    const connect = () => {
      ws = new WebSocket(url)
      ws.onmessage = (ev) => {
        if (!alive) return
        try {
          const msg = JSON.parse(ev.data)
          if (msg.type === 'snapshot' || msg.type === 'job') {
            const job = msg.job || msg.job?.job
            if (job) setJob(job)
          }
          if (msg.type === 'event') {
            setEvents((e) => [msg as EventMsg, ...e].slice(0, 12))
          }
        } catch {
          // ignore
        }
      }
      ws.onclose = () => {
        if (!alive) return
        setTimeout(connect, 750)
      }
    }

    connect()

    return () => {
      alive = false
      ws?.close()
    }
  }, [url, setJob])

  return (
    <div className="glass rounded-3xl p-5 border border-white/10">
      <div className="flex items-center justify-between">
        <div className="text-white font-semibold">Live Pipeline</div>
        <div className="text-[10px] tracking-[0.28em] uppercase text-white/55">WebSocket</div>
      </div>

      <div className="mt-4 space-y-2">
        <AnimatePresence initial={false}>
          {events.map((e, idx) => (
            <motion.div
              key={`${e.ts}-${idx}`}
              initial={{ opacity: 0, x: -10, filter: 'blur(6px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: 10, filter: 'blur(6px)' }}
              transition={{ duration: 0.35 }}
              className="rounded-2xl px-3 py-2 bg-black/25 border border-white/5"
            >
              <div className="flex items-center justify-between">
                <div className="text-xs text-white/80">
                  <span className="text-neon-cyan">{(e.phase || 'system').toUpperCase()}</span> — {e.message}
                </div>
                <div className="text-[10px] text-white/45">{e.level}</div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
