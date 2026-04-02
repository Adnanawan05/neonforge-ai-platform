'use client'

import Shell from '@/components/Shell'
import { MotionPage } from '@/components/motion/MotionPage'
import WhatIfFlux from '@/components/sim/WhatIfFlux'

export default function FluxPage() {
  return (
    <Shell>
      <MotionPage>
        <WhatIfFlux />
      </MotionPage>
    </Shell>
  )
}
