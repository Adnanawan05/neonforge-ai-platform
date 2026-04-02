'use client'

import Shell from '@/components/Shell'
import PipelineMap from '@/components/PipelineMap'
import { MotionPage } from '@/components/motion/MotionPage'

export default function Home() {
  return (
    <Shell>
      <MotionPage>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="glass-strong neon-border rounded-3xl p-6 shadow-glowHard">
            <div className="text-sm uppercase tracking-[0.28em] text-white/60">NeonForge</div>
            <div className="mt-2 text-3xl font-semibold text-white">Living Pipeline</div>
            <p className="mt-3 text-white/70 leading-relaxed">
              Upload data. Watch it flow through the Collector → Surgeon → Processor → AI Heart → Oracle.
            </p>
            <div className="mt-6">
              <PipelineMap />
            </div>
          </div>
          <div className="glass-strong neon-border rounded-3xl p-6 shadow-glow">
            <div className="text-sm uppercase tracking-[0.28em] text-white/60">Quick Start</div>
            <div className="mt-2 text-xl font-semibold text-white">Collector</div>
            <p className="mt-2 text-white/70">
              Go to <span className="text-neon-cyan">Collector</span> and drag & drop CSV/Excel.
              The first snapshot becomes charts instantly.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="glass rounded-2xl p-4">
                <div className="text-white/70 text-sm">Realtime</div>
                <div className="mt-1 text-white font-semibold">WebSocket Job Stream</div>
              </div>
              <div className="glass rounded-2xl p-4">
                <div className="text-white/70 text-sm">Exports</div>
                <div className="mt-1 text-white font-semibold">PDF + CSV</div>
              </div>
            </div>
          </div>
        </div>
      </MotionPage>
    </Shell>
  )
}
