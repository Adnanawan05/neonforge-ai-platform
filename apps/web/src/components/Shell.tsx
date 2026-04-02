'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAppStore } from '@/store/useAppStore'

const nav = [
  { href: '/', label: 'Pulse', tag: 'Pipeline' },
  { href: '/collector', label: 'Collector', tag: 'Phase 1' },
  { href: '/surgeon', label: 'Surgeon', tag: 'Phase 2' },
  { href: '/processor', label: 'Processor', tag: 'Phase 3' },
  { href: '/lens', label: 'Lens', tag: 'Phase 4' },
  { href: '/flux', label: 'Flux', tag: 'Phase 5' },
  { href: '/heart', label: 'Heart', tag: 'Phase 6' },
  { href: '/oracle', label: 'Oracle', tag: 'Phase 8' },
  { href: '/export', label: 'Export', tag: 'Phase 9' },
  { href: '/sentinel', label: 'Sentinel', tag: 'Phase 10' },
]

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const datasetId = useAppStore(s => s.datasetId)
  const job = useAppStore(s => s.job)

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-[1400px] px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          <aside className="glass-strong neon-border rounded-3xl p-5 shadow-glowHard h-fit lg:sticky lg:top-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-semibold tracking-tight text-xl">NeonForge</div>
                <div className="text-white/60 text-xs mt-0.5">AI Data Platform</div>
              </div>
              <div className="h-10 w-10 rounded-2xl glass flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-neon-lime shadow-[0_0_18px_rgba(61,255,181,0.7)] animate-pulseGlow" />
              </div>
            </div>

            <div className="mt-5 space-y-2">
              {nav.map((n) => {
                const active = pathname === n.href
                return (
                  <Link key={n.href} href={n.href} className="block">
                    <motion.div
                      whileHover={{ y: -1 }}
                      className={`rounded-2xl px-4 py-3 glass ${active ? 'border border-neon-cyan/40 shadow-glow' : 'border border-white/5'} `}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-white font-medium">{n.label}</div>
                        <div className="text-[10px] tracking-[0.28em] uppercase text-white/50">{n.tag}</div>
                      </div>
                    </motion.div>
                  </Link>
                )
              })}
            </div>

            <div className="mt-5 glass rounded-2xl p-4">
              <div className="text-[10px] tracking-[0.28em] uppercase text-white/55">Session</div>
              <div className="mt-2 text-white/80 text-sm">Dataset: <span className="text-neon-cyan">{datasetId ?? '—'}</span></div>
              <div className="mt-1 text-white/80 text-sm">Job: <span className="text-neon-pink">{job?.id ?? '—'}</span></div>
              <div className="mt-2 h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-neon-cyan via-neon-violet to-neon-pink" style={{ width: `${Math.floor((job?.progress ?? 0) * 100)}%` }} />
              </div>
              <div className="mt-1 text-xs text-white/60">{job?.phase ? `Phase: ${job.phase}` : 'Idle'}</div>
            </div>
          </aside>

          <main>{children}</main>
        </div>
      </div>
    </div>
  )
}
