import { useEffect, useRef } from 'react'

/**
 * Fondo de partículas animadas (puntos que se mueven y se conectan
 * con líneas cuando están cerca). Se dibuja en un <canvas> a pantalla
 * completa, detrás de todo el contenido (position: fixed, z-index bajo).
 *
 * Uso:
 *   <ParticlesBackground />
 *   <ParticlesBackground color="34, 211, 238" particleCount={80} />
 */
export default function ParticlesBackground({
  particleCount = 70,
  color = '34, 211, 238', // rgb de --accent, sin paréntesis (para armar rgba)
  linkDistance = 130,
  speed = 0.35,
}) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animationId
    let particles = []
    let width = window.innerWidth
    let height = window.innerHeight

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    function resize() {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
    }

    function createParticles() {
      particles = Array.from({ length: particleCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        r: Math.random() * 1.6 + 0.6,
      }))
    }

    function draw() {
      ctx.clearRect(0, 0, width, height)

      // Líneas entre partículas cercanas
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < linkDistance) {
            const opacity = 1 - dist / linkDistance
            ctx.strokeStyle = `rgba(${color}, ${opacity * 0.25})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }

      // Partículas (puntos)
      particles.forEach((p) => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${color}, 0.85)`
        ctx.fill()

        if (!prefersReducedMotion) {
          p.x += p.vx
          p.y += p.vy

          if (p.x < 0 || p.x > width) p.vx *= -1
          if (p.y < 0 || p.y > height) p.vy *= -1
        }
      })

      if (!prefersReducedMotion) {
        animationId = requestAnimationFrame(draw)
      }
    }

    resize()
    createParticles()
    draw()

    window.addEventListener('resize', resize)
    return () => {
      window.removeEventListener('resize', resize)
      if (animationId) cancelAnimationFrame(animationId)
    }
  }, [particleCount, color, linkDistance, speed])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -2,
        backgroundColor: 'var(--bg-primary)',
      }}
    />
  )
}