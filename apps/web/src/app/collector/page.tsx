'use client'

import Shell from '@/components/Shell'
import CollectorHub from '@/components/collector/CollectorHub'
import DatasetVisual from '@/components/datasets/DatasetVisual'
import { MotionPage } from '@/components/motion/MotionPage'
import { useAppStore } from '@/store/useAppStore'

export default function CollectorPage() {
  const datasetId = useAppStore(s => s.datasetId)

  return (
    <Shell>
      <MotionPage>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="glass-strong neon-border rounded-3xl p-6 shadow-glowHard">
            <div className="text-sm uppercase tracking-[0.28em] text-white/60">Phase 1</div>
            <div className="mt-2 text-3xl font-semibold text-white">The Collector</div>
            <p className="mt-3 text-white/70">Drag & drop, API link, or Database query. Everything becomes visuals.</p>
            <div className="mt-6">
              <CollectorHub />
            </div>
          </div>

          <div className="glass-strong neon-border rounded-3xl p-6 shadow-glow">
            <div className="text-sm uppercase tracking-[0.28em] text-white/60">Visual Snapshot</div>
            {datasetId ? (
              <DatasetVisual datasetId={datasetId} />
            ) : (
              <div className="mt-8 text-white/70">Connect a dataset to materialize the first graphs.</div>
            )}
          </div>
        </div>
      </MotionPage>
    </Shell>
  )
}
