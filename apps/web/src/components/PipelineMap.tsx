'use client'

import { useEffect, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { useAppStore } from '@/store/useAppStore'

const phases = [
  { id: 'collector', label: 'Collector' },
  { id: 'cleaner', label: 'Surgeon' },
  { id: 'processor', label: 'Processor' },
  { id: 'ml', label: 'Heart' },
  { id: 'painter', label: 'Painter' },
  { id: 'insights', label: 'Oracle' },
  { id: 'export', label: 'Export' },
]

export default function PipelineMap() {
  const ref = useRef<HTMLDivElement | null>(null)
  const job = useAppStore(s => s.job)

  const activeIndex = useMemo(() => phases.findIndex(p => p.id === (job?.phase ?? 'collector')), [job?.phase])

  useEffect(() => {
    if (!ref.current) return
    const el = ref.current
    const dots = el.querySelectorAll('[data-dot]')
    gsap.killTweensOf(dots)
    gsap.fromTo(
      dots,
      { scale: 0.9, opacity: 0.55 },
      { scale: 1.05, opacity: 1, yoyo: true, repeat: -1, duration: 0.9, stagger: 0.08, ease: 'sine.inOut' }
    )
    return () => gsap.killTweensOf(dots)
  }, [])

  return (
    <div ref={ref} className="relative">
      <div className="absolute left-0 right-0 top-[22px] h-[2px] rounded-full bg-white/10 overflow-hidden">
        <div className="h-full w-full bg-gradient-to-r from-neon-cyan via-neon-violet to-neon-pink opacity-80">
          <div className="h-full w-1/3 bg-white/30 blur-sm animate-shimmer" />
        </div>
      </div>
      <div className={`grid grid-cols-${phases.length} gap-2`}>
        {phases.map((p, i) => {
          const active = i <= activeIndex && (job?.status === 'running' || job?.status === 'done')
          const pulsing = i === activeIndex && job?.status === 'running'
          return (
            <div key={p.id} className="text-center">
              <motion.div
                data-dot
                animate={pulsing ? { boxShadow: '0 0 0 1px rgba(78,240,255,0.22), 0 0 24px rgba(255,79,216,0.28)' } : {}}
                className={`mx-auto h-11 w-11 rounded-2xl glass flex items-center justify-center ${active ? 'border border-neon-cyan/30' : 'border border-white/5'}`}
              >
                <div className={`h-2.5 w-2.5 rounded-full ${active ? 'bg-neon-cyan' : 'bg-white/25'}`} />
              </motion.div>
              <div className="mt-2 text-[11px] tracking-[0.22em] uppercase text-white/60">{p.label}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
