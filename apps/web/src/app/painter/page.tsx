'use client'

import Shell from '@/components/Shell'
import { MotionPage } from '@/components/motion/MotionPage'
import PainterDashboard from '@/components/painter/PainterDashboard'

export default function PainterPage() {
  return (
    <Shell>
      <MotionPage>
        <PainterDashboard />
      </MotionPage>
    </Shell>
  )
}
