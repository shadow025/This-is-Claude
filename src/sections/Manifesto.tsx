import { useEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from '../lib/motion'
import { es } from '../content/es'

function Words({ text }: { text: string }) {
  return (
    <>
      {text.split(' ').map((w, i) => (
        <span key={i} className="reveal-word mr-[0.28em]">
          {w}
        </span>
      ))}
    </>
  )
}

export default function Manifesto() {
  const section = useRef<HTMLElement>(null)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.from('.reveal-word', {
        y: 40, opacity: 0, rotateX: -40, duration: 0.9, stagger: 0.05, ease: 'power3.out',
        scrollTrigger: { trigger: '.manifesto-title', start: 'top 78%' },
      })
      gsap.from('.col-left', { x: -90, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.cols', start: 'top 75%' } })
      gsap.from('.col-right', { x: 90, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.cols', start: 'top 75%' } })
      gsap.from('.col-item', { y: 18, opacity: 0, duration: 0.6, stagger: 0.08, ease: 'power2.out', scrollTrigger: { trigger: '.cols', start: 'top 65%' } })
      gsap.from('.manifesto-note', { opacity: 0, y: 20, duration: 1, scrollTrigger: { trigger: '.manifesto-note', start: 'top 85%' } })
    }, section)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={section} className="relative mx-auto max-w-6xl px-6 py-32 md:py-44">
      <h2 className="manifesto-title font-display text-[clamp(2rem,6vw,4.5rem)] leading-[1.02] font-bold tracking-tight [perspective:800px]">
        <Words text={es.manifesto.title} />
      </h2>

      <div className="cols mt-16 grid gap-6 md:grid-cols-2 md:gap-10">
        {[es.manifesto.left, es.manifesto.right].map((col, i) => (
          <div
            key={col.label}
            className={`${i === 0 ? 'col-left' : 'col-right'} rounded-3xl border border-line bg-bg-2/70 p-7 backdrop-blur md:p-9`}
          >
            <p className={`font-mono text-xs tracking-[0.25em] uppercase ${i === 0 ? 'text-accent' : 'text-cyan'}`}>{col.label}</p>
            <ul className="mt-6 space-y-3">
              {col.items.map((item) => (
                <li key={item} className="col-item flex items-center gap-3 text-lg text-ink/90">
                  <span className={`h-1.5 w-1.5 rounded-full ${i === 0 ? 'bg-accent' : 'bg-cyan'}`} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="manifesto-note mt-16 max-w-2xl font-display text-xl text-muted md:text-2xl">{es.manifesto.note}</p>
    </section>
  )
}
