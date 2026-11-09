import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger, isMobile, prefersReducedMotion } from '../lib/motion'
import { es } from '../content/es'

const NeuralSphere = lazy(() => import('../components/hero/NeuralSphere'))

export default function Hero() {
  const section = useRef<HTMLElement>(null)
  const copy = useRef<HTMLDivElement>(null)
  const hint = useRef<HTMLDivElement>(null)
  const veil = useRef<HTMLDivElement>(null)
  const canvasWrap = useRef<HTMLDivElement>(null)
  const progress = useRef(0)
  const [mobile] = useState(() => isMobile())

  useEffect(() => {
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section.current,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          progress.current = self.progress
          if (copy.current) {
            const fade = 1 - Math.min(1, self.progress * 2.2)
            copy.current.style.opacity = String(fade)
            copy.current.style.transform = `translateY(${self.progress * -80}px)`
          }
          if (hint.current) hint.current.style.opacity = String(1 - Math.min(1, self.progress * 4))
          // Salida suave: la red se funde con el fondo y se aleja un poco en el último tramo.
          const out = Math.max(0, (self.progress - 0.68) / 0.32)
          const smooth = out * out * (3 - 2 * out)
          if (veil.current) veil.current.style.opacity = String(smooth)
          if (canvasWrap.current) {
            canvasWrap.current.style.transform = `scale(${1 - smooth * 0.08})`
            canvasWrap.current.style.filter = `blur(${smooth * 6}px)`
          }
        },
      })
      gsap.from('.hero-line', { y: 28, opacity: 0, duration: 1.1, stagger: 0.14, ease: 'power3.out', delay: 0.3 })
    }, section)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={section} className="relative h-[220vh]">
      <div className="sticky top-0 h-screen overflow-hidden bg-bg">
        <div ref={canvasWrap} className="absolute inset-0 will-change-transform">
          <Suspense fallback={<div className="absolute inset-0 bg-bg" />}>
            <NeuralSphere progress={progress} count={mobile ? 220 : 900} bloom={!mobile} />
          </Suspense>
        </div>
        <div ref={veil} className="pointer-events-none absolute inset-0 bg-bg opacity-0" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-bg" />

        <div ref={copy} className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <p className="hero-line mb-5 font-mono text-xs tracking-[0.3em] text-accent uppercase">{es.hero.eyebrow}</p>
          <h1 className="hero-line font-display text-[clamp(2.6rem,8vw,6.5rem)] leading-[0.95] font-bold tracking-tight text-ink">
            {es.hero.title}
          </h1>
          <p className="hero-line mt-9 max-w-2xl rounded-2xl border border-white/10 bg-bg/55 px-6 py-4 font-display text-lg leading-snug text-ink shadow-[0_20px_60px_-20px_rgba(0,0,0,0.9)] backdrop-blur-md md:text-2xl">
            {es.hero.subtitle.split('Con una condición:')[0]}
            <span className="text-accent">Con una condición:</span>
            {es.hero.subtitle.split('Con una condición:')[1]}
          </p>
        </div>

        <div ref={hint} className="pointer-events-none absolute inset-x-0 bottom-8 hidden flex-col items-center gap-3 text-xs text-muted [@media(min-height:640px)]:flex">
          <span>{es.hero.hint}</span>
          <span className="block h-10 w-px animate-pulse bg-gradient-to-b from-accent to-transparent" />
        </div>
      </div>
    </section>
  )
}
