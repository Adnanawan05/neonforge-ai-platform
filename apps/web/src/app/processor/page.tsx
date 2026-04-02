'use client'

import Shell from '@/components/Shell'
import { MotionPage } from '@/components/motion/MotionPage'
import PhaseRunner from '@/components/pipeline/PhaseRunner'

export default function ProcessorPage() {
  return (
    <Shell>
      <MotionPage>
        <PhaseRunner phase="processor" title="Feature Processor" subtitle="Phase 3 — generation + encoding" />
      </MotionPage>
    </Shell>
  )
}
