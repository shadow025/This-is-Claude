import { useEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from '../lib/motion'
import { es } from '../content/es'

export default function Tool() {
  const section = useRef<HTMLElement>(null)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.statement').forEach((el) => {
        gsap.from(el, {
          opacity: 0.08, x: -24, filter: 'blur(6px)', duration: 1,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 80%', end: 'top 45%', scrub: 0.6 },
        })
      })
      gsap.from('.flow-card', {
        y: 50, opacity: 0, duration: 0.9, stagger: 0.18, ease: 'power3.out',
        scrollTrigger: { trigger: '.flow', start: 'top 75%' },
      })
      gsap.from('.flow-arrow', {
        scaleX: 0, transformOrigin: 'left center', duration: 0.7, stagger: 0.18, ease: 'power2.out', delay: 0.3,
        scrollTrigger: { trigger: '.flow', start: 'top 75%' },
      })
      gsap.from('.teach-title', { y: 30, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: '.teach', start: 'top 78%' } })
      gsap.from('.teach-card', { y: 50, opacity: 0, duration: 0.9, stagger: 0.15, ease: 'power3.out', scrollTrigger: { trigger: '.teach', start: 'top 72%' } })
      gsap.from('.tool-closing', { opacity: 0, y: 24, duration: 1, scrollTrigger: { trigger: '.tool-closing', start: 'top 85%' } })
    }, section)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={section} className="relative border-t border-line bg-bg-2/40 py-32 md:py-44">
      <div className="mx-auto max-w-6xl px-6">
        <p className="font-mono text-xs tracking-[0.3em] text-accent uppercase">{es.tool.eyebrow}</p>

        <div className="mt-10 space-y-6 md:space-y-8">
          {es.tool.statements.map((line, i) => (
            <p
              key={line}
              className={`statement font-display leading-[1.05] font-bold tracking-tight ${
                i === es.tool.statements.length - 1 ? 'text-accent' : 'text-ink'
              } text-[clamp(1.7rem,4.6vw,3.6rem)]`}
            >
              {line}
            </p>
          ))}
        </div>

        <div className="flow mt-24 grid items-stretch gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
          {es.tool.flow.map((step, i) => (
            <div key={step.title} className="contents">
              <div className="flow-card rounded-3xl border border-line bg-bg p-7 md:p-8">
                <span className="font-mono text-xs text-muted">0{i + 1}</span>
                <h3 className="mt-3 font-display text-2xl font-bold tracking-tight">{step.title}</h3>
                <p className="mt-3 text-muted">{step.body}</p>
              </div>
              {i < es.tool.flow.length - 1 && (
                <div className="hidden items-center md:flex">
                  <span className="flow-arrow block h-px w-10 bg-gradient-to-r from-accent to-cyan" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="teach mt-28">
          <h3 className="teach-title font-display text-[clamp(1.6rem,4vw,2.8rem)] leading-tight font-bold tracking-tight">{es.tool.teach.title}</h3>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {es.tool.teach.items.map((it, i) => (
              <div key={it.title} className="teach-card group relative overflow-hidden rounded-3xl border border-line bg-bg p-7 transition-colors duration-500 hover:border-accent/60">
                <span className="absolute -top-6 -right-4 font-display text-[7rem] leading-none font-bold text-ink/[0.04] transition-colors duration-500 group-hover:text-accent/10">{i + 1}</span>
                <h4 className="font-display text-xl font-bold tracking-tight">{it.title}</h4>
                <p className="mt-3 text-muted">{it.body}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="tool-closing mt-20 max-w-3xl font-display text-xl text-ink/90 md:text-2xl">{es.tool.closing}</p>
      </div>
    </section>
  )
}
