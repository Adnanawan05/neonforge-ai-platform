'use client'

import Shell from '@/components/Shell'
import { MotionPage } from '@/components/motion/MotionPage'
import PhaseRunner from '@/components/pipeline/PhaseRunner'

export default function SurgeonPage() {
  return (
    <Shell>
      <MotionPage>
        <PhaseRunner phase="cleaner" title="Data Surgeon" subtitle="Phase 2 — missing values, duplicates, outliers" />
      </MotionPage>
    </Shell>
  )
}
