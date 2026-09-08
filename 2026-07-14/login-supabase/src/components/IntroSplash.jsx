import { useEffect, useState } from 'react'

/**
 * Intro tipo Netflix: las siglas "SMC" aparecen con brillo,
 * pulsan un momento, y luego se desintegran (cada letra vuela
 * en una dirección aleatoria y se desvanece) antes de dar paso
 * al sistema.
 *
 * Fases: enter (0.9s) -> hold (1.3s) -> exit (1s) -> onFinish()
 */
export default function IntroSplash({ onFinish }) {
  const [phase, setPhase] = useState('enter')

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    if (prefersReducedMotion) {
      onFinish()
      return
    }

    const t1 = setTimeout(() => setPhase('hold'), 900)
    const t2 = setTimeout(() => setPhase('exit'), 2200)
    const t3 = setTimeout(() => onFinish(), 3200)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [onFinish])

  const letters = ['S', 'M', 'C']

  return (
    <div className={`intro-splash intro-splash--${phase}`}>
      <div className="intro-splash__logo">
        {letters.map((l, i) => (
          <span
            key={i}
            className="intro-splash__letter"
            style={{
              '--i': i,
              '--dx': `${(Math.random() - 0.5) * 320}px`,
              '--dy': `${(Math.random() - 0.5) * 240}px`,
              '--rot': `${(Math.random() - 0.5) * 100}deg`,
            }}
          >
            {l}
          </span>
        ))}
      </div>
      <p className="intro-splash__tagline">Sistema de Gestión Contable</p>
    </div>
  )
}