'use client'

import Shell from '@/components/Shell'
import { MotionPage } from '@/components/motion/MotionPage'
import OracleInsights from '@/components/insights/OracleInsights'

export default function OraclePage() {
  return (
    <Shell>
      <MotionPage>
        <OracleInsights />
      </MotionPage>
    </Shell>
  )
}
