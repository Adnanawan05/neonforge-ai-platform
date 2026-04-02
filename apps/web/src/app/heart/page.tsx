'use client'

import Shell from '@/components/Shell'
import { MotionPage } from '@/components/motion/MotionPage'
import MLHeart from '@/components/ml/MLHeart'

export default function HeartPage() {
  return (
    <Shell>
      <MotionPage>
        <MLHeart />
      </MotionPage>
    </Shell>
  )
}
