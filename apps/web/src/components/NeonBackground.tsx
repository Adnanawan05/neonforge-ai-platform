'use client'

import { useEffect, useRef } from 'react'

type P = { x: number; y: number; vx: number; vy: number; r: number; hue: number }

export default function NeonBackground() {
  const ref = useRef<HTMLCanvasElement | null>(null)
  const particles = useRef<P[]>([])

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1))
      canvas.width = Math.floor(window.innerWidth * dpr)
      canvas.height = Math.floor(window.innerHeight * dpr)
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resize()
    window.addEventListener('resize', resize)

    const seed = () => {
      const n = Math.min(120, Math.floor((window.innerWidth * window.innerHeight) / 16000))
      particles.current = Array.from({ length: n }).map(() => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: 1 + Math.random() * 2.2,
        hue: 190 + Math.random() * 110,
      }))
    }

    seed()

    let raf = 0
    const tick = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

      // soft gradient glow
      const g = ctx.createRadialGradient(window.innerWidth * 0.3, window.innerHeight * 0.2, 0, window.innerWidth * 0.3, window.innerHeight * 0.2, Math.max(window.innerWidth, window.innerHeight))
      g.addColorStop(0, 'rgba(91,108,255,0.22)')
      g.addColorStop(0.45, 'rgba(168,85,247,0.08)')
      g.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)

      const ps = particles.current
      for (let i = 0; i < ps.length; i++) {
        const p = ps[i]
        p.x += p.vx
        p.y += p.vy
        if (p.x < -40) p.x = window.innerWidth + 40
        if (p.x > window.innerWidth + 40) p.x = -40
        if (p.y < -40) p.y = window.innerHeight + 40
        if (p.y > window.innerHeight + 40) p.y = -40

        ctx.beginPath()
        ctx.fillStyle = `hsla(${p.hue}, 95%, 65%, 0.10)`
        ctx.arc(p.x, p.y, p.r * 3.2, 0, Math.PI * 2)
        ctx.fill()

        ctx.beginPath()
        ctx.fillStyle = `hsla(${p.hue}, 95%, 65%, 0.45)`
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      }

      // connective energy lines
      ctx.lineWidth = 1
      for (let i = 0; i < ps.length; i += 1) {
        const a = ps[i]
        for (let j = i + 1; j < ps.length; j += 8) {
          const b = ps[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const d2 = dx * dx + dy * dy
          if (d2 < 110 * 110) {
            const alpha = 0.09 * (1 - Math.sqrt(d2) / 110)
            ctx.strokeStyle = `rgba(78,240,255,${alpha})`
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
      }

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={ref} className="h-full w-full" />
}
