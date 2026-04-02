'use client'

import { MotionPage } from '@/components/motion/MotionPage'
import PipelineMap from '@/components/PipelineMap'
import DatasetVisual from '@/components/datasets/DatasetVisual'
import CollectorHub from '@/components/collector/CollectorHub'
import PhaseRunner from '@/components/pipeline/PhaseRunner'
import QueryLens from '@/components/query/QueryLens'
import WhatIfFlux from '@/components/sim/WhatIfFlux'
import MLHeart from '@/components/ml/MLHeart'
import PainterDashboard from '@/components/painter/PainterDashboard'
import OracleInsights from '@/components/insights/OracleInsights'
import ExportBay from '@/components/export/ExportBay'
import SentinelLogs from '@/components/logs/SentinelLogs'
import SiteShell from '@/components/site/SiteShell'
import { useAppStore } from '@/store/useAppStore'

function Section({ id, kicker, title, children }: { id: string; kicker: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28">
      <div className="glass-strong neon-border rounded-3xl p-6 shadow-glowHard">
        <div className="text-sm uppercase tracking-[0.28em] text-white/60">{kicker}</div>
        <div className="mt-2 text-3xl font-semibold text-white">{title}</div>
        <div className="mt-6">{children}</div>
      </div>
    </section>
  )
}

export default function Website() {
  const datasetId = useAppStore(s => s.datasetId)

  return (
    <SiteShell>
      <MotionPage>
        <section className="glass-strong neon-border rounded-3xl p-8 shadow-glowHard">
          <div className="text-sm uppercase tracking-[0.28em] text-white/60">Premium Website Experience</div>
          <div className="mt-2 text-5xl font-semibold text-white tracking-tight">NeonForge</div>
          <p className="mt-4 text-white/70 max-w-3xl leading-relaxed">
            Upload any dataset and watch it flow like energy through the Collector → Surgeon → Processor → Lens → Flux → AI Heart → Painter → Oracle → Export → Sentinel.
          </p>
          <div className="mt-8">
            <PipelineMap />
          </div>
          <div className="mt-8 grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="glass rounded-3xl p-6 border border-white/10">
              <div className="text-white font-semibold">Instant Visuals</div>
              <div className="mt-2 text-white/70 text-sm">Any upload turns into charts (missingness, distributions, correlation heatmap).</div>
            </div>
            <div className="glass rounded-3xl p-6 border border-white/10">
              <div className="text-white font-semibold">Realtime Pipeline</div>
              <div className="mt-2 text-white/70 text-sm">WebSocket event stream makes the system feel alive.</div>
            </div>
          </div>
        </section>

        <div className="mt-8 grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Section id="collector" kicker="Phase 1" title="The Collector">
            <CollectorHub />
          </Section>
          <Section id="collector-visuals" kicker="Live" title="Upload Results (Graphs)">
            {datasetId ? <DatasetVisual datasetId={datasetId} /> : <div className="text-white/70">Upload/connect data to render graphs.</div>}
          </Section>
        </div>

        <div className="mt-8">
          <div className="grid grid-cols-1 gap-6">
            <div id="surgeon" className="scroll-mt-28">
              <PhaseRunner phase="cleaner" title="Data Surgeon" subtitle="Phase 2 — missing values, duplicates, outliers" />
            </div>
            <div id="processor" className="scroll-mt-28">
              <PhaseRunner phase="processor" title="Feature Processor" subtitle="Phase 3 — feature generation + encoding" />
            </div>
            <div id="lens" className="scroll-mt-28">
              <QueryLens />
            </div>
            <div id="flux" className="scroll-mt-28">
              <WhatIfFlux />
            </div>
            <div id="heart" className="scroll-mt-28">
              <MLHeart />
            </div>
            <div id="painter" className="scroll-mt-28">
              <PainterDashboard />
            </div>
            <div id="oracle" className="scroll-mt-28">
              <OracleInsights />
            </div>
            <div id="export" className="scroll-mt-28">
              <ExportBay />
            </div>
            <div id="sentinel" className="scroll-mt-28">
              <SentinelLogs />
            </div>
          </div>
        </div>

        <footer className="mt-10 glass rounded-3xl p-6 border border-white/10">
          <div className="text-white font-semibold">NeonForge</div>
          <div className="mt-2 text-white/60 text-sm">All features run in the browser as a website. Backend is FastAPI with realtime WebSockets.</div>
        </footer>
      </MotionPage>
    </SiteShell>
  )
}
