import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import LuisLink from '../components/LuisLink'
import { gsap, isMobile, prefersReducedMotion } from '../lib/motion'
import { es } from '../content/es'

const NeuralSphere = lazy(() => import('../components/hero/NeuralSphere'))

export default function Conclusion() {
  const section = useRef<HTMLElement>(null)
  const progress = useRef(0)
  const [mobile] = useState(() => isMobile())
  const [showSphere, setShowSphere] = useState(false)

  // La esfera vuelve, pero solo se monta cuando la sección está cerca.
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setShowSphere(true), { rootMargin: '600px 0px' })
    if (section.current) io.observe(section.current)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.from('.end-line', {
        y: 60, opacity: 0, duration: 1.1, stagger: 0.25, ease: 'power3.out',
        scrollTrigger: { trigger: section.current, start: 'top 60%' },
      })
      gsap.from('.end-body', { opacity: 0, y: 30, duration: 1, ease: 'power2.out', scrollTrigger: { trigger: '.end-body', start: 'top 85%' } })
      gsap.from('.end-closing', { opacity: 0, letterSpacing: '0.3em', duration: 1.4, ease: 'power3.out', scrollTrigger: { trigger: '.end-closing', start: 'top 85%' } })
      gsap.from('.end-foot', { opacity: 0, y: 16, duration: 0.8, stagger: 0.12, scrollTrigger: { trigger: '.end-closing', start: 'top 80%' } })
    }, section)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={section} className="relative overflow-hidden border-t border-line">
      {/* Esfera de fondo, tenue, enmascarada hacia los bordes */}
      <div className="pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_72%)]">
        {showSphere && (
          <Suspense fallback={null}>
            <NeuralSphere progress={progress} count={mobile ? 140 : 420} bloom={!mobile} />
          </Suspense>
        )}
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-bg via-transparent to-bg" />

      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-32 text-center md:py-44">
        <p className="font-mono text-xs tracking-[0.3em] text-accent uppercase">{es.conclusion.eyebrow}</p>

        <div className="mt-8 space-y-2">
          {es.conclusion.lines.map((l, i) => (
            <p key={l} className={`end-line font-display text-[clamp(2rem,6vw,4.8rem)] leading-[1.02] font-bold tracking-tight ${i === 1 ? 'text-accent' : 'text-ink'}`}>
              {l}
            </p>
          ))}
        </div>

        <p className="end-body mx-auto mt-12 max-w-2xl rounded-2xl border border-white/10 bg-bg/60 px-7 py-5 text-base leading-relaxed text-ink/90 backdrop-blur-md md:text-lg">
          {es.conclusion.body}
        </p>

        <p className="end-closing mt-16 font-display text-2xl font-bold tracking-tight text-ink md:text-4xl">{es.conclusion.closing}</p>
        <p className="end-foot mt-4 font-mono text-sm text-muted">— {es.conclusion.signature}</p>

        <div className="end-foot mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <LuisLink className="rounded-full bg-accent px-6 py-3 font-display text-sm font-bold text-bg transition hover:brightness-110">
            {es.conclusion.cta} →
          </LuisLink>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })}
            className="rounded-full border border-line px-6 py-3 text-sm text-ink transition hover:border-accent hover:text-accent"
          >
            ↑ {es.conclusion.top}
          </button>
        </div>
      </div>
    </section>
  )
}
