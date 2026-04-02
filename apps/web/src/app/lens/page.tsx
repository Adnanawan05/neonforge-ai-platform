'use client'

import Shell from '@/components/Shell'
import { MotionPage } from '@/components/motion/MotionPage'
import QueryLens from '@/components/query/QueryLens'

export default function LensPage() {
  return (
    <Shell>
      <MotionPage>
        <QueryLens />
      </MotionPage>
    </Shell>
  )
}
