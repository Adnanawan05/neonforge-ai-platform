'use client'

import Shell from '@/components/Shell'
import { MotionPage } from '@/components/motion/MotionPage'
import SentinelLogs from '@/components/logs/SentinelLogs'

export default function SentinelPage() {
  return (
    <Shell>
      <MotionPage>
        <SentinelLogs />
      </MotionPage>
    </Shell>
  )
}
