'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { useAppStore } from '@/store/useAppStore'

const items = [
  { id: 'collector', label: 'Collector' },
  { id: 'surgeon', label: 'Surgeon' },
  { id: 'processor', label: 'Processor' },
  { id: 'lens', label: 'Lens' },
  { id: 'flux', label: 'Flux' },
  { id: 'heart', label: 'AI Heart' },
  { id: 'painter', label: 'Painter' },
  { id: 'oracle', label: 'Oracle' },
  { id: 'export', label: 'Export' },
  { id: 'sentinel', label: 'Sentinel' },
]

function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const datasetId = useAppStore(s => s.datasetId)
  const job = useAppStore(s => s.job)

  const [active, setActive] = useState<string>('collector')

  const progress = Math.max(0, Math.min(1, job?.progress ?? 0))

  const phaseLabel = useMemo(() => {
    const ph = job?.phase
    if (!ph) return 'Idle'
    return ph === 'cleaner' ? 'Surgeon' : ph === 'ml' ? 'AI Heart' : ph
  }, [job?.phase])

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const vis = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0))[0]
        if (vis?.target?.id) setActive(vis.target.id)
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: [0.12, 0.2, 0.35] }
    )

    for (const it of items) {
      const el = document.getElementById(it.id)
      if (el) obs.observe(el)
    }

    return () => obs.disconnect()
  }, [])

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40">
        <div className="mx-auto max-w-[1400px] px-4 pt-4">
          <div className="glass-strong neon-border rounded-3xl px-4 py-3 shadow-glowHard">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Link href="/" className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl glass flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-neon-lime shadow-[0_0_18px_rgba(61,255,181,0.7)] animate-pulseGlow" />
                  </div>
                  <div>
                    <div className="text-white font-semibold tracking-tight">NeonForge</div>
                    <div className="text-white/60 text-xs">Website • AI Data Platform</div>
                  </div>
                </Link>
              </div>

              <div className="hidden lg:flex items-center gap-1">
                {items.map((it) => {
                  const on = active === it.id
                  return (
                    <motion.button
                      key={it.id}
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => scrollToId(it.id)}
                      className={`relative rounded-2xl px-3 py-2 text-sm ${on ? 'text-white' : 'text-white/70'} hover:text-white`}
                    >
                      {on ? (
                        <motion.span
                          layoutId="nav-pill"
                          className="absolute inset-0 rounded-2xl bg-white/10 border border-white/10"
                          transition={{ type: 'spring', stiffness: 520, damping: 34 }}
                        />
                      ) : null}
                      <span className="relative z-10">{it.label}</span>
                    </motion.button>
                  )
                })}
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden md:block text-xs text-white/60">
                  Dataset: <span className="text-neon-cyan">{datasetId ?? '—'}</span>
                </div>
                <div className="w-40 hidden md:block">
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-neon-cyan via-neon-violet to-neon-pink" style={{ width: `${Math.floor(progress * 100)}%` }} />
                  </div>
                  <div className="mt-1 text-[10px] tracking-[0.28em] uppercase text-white/55">{phaseLabel}</div>
                </div>

                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => scrollToId('collector')}
                  className="rounded-2xl px-4 py-2.5 bg-gradient-to-r from-neon-cyan/80 via-neon-violet/70 to-neon-pink/70 text-black font-semibold shadow-glow"
                >
                  Upload & Run
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-4 pb-16 pt-6">
        {children}
      </main>
    </div>
  )
}
