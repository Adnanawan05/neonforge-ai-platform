'use client'

import Shell from '@/components/Shell'
import { MotionPage } from '@/components/motion/MotionPage'
import ExportBay from '@/components/export/ExportBay'

export default function ExportPage() {
  return (
    <Shell>
      <MotionPage>
        <ExportBay />
      </MotionPage>
    </Shell>
  )
}
