import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger, prefersReducedMotion } from '../lib/motion'
import { es } from '../content/es'

const WIDTHS = { desktop: 1280, tablet: 768, phone: 390 } as const
type Stage = keyof typeof WIDTHS

export default function ResponsiveDemo() {
  const section = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const frame = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState<number>(WIDTHS.desktop)
  const [rule, setRule] = useState<Stage>('desktop')
  const [scale, setScale] = useState(1)

  // El marco de 1280 px se escala para caber en la pantalla real.
  useEffect(() => {
    const fit = () => {
      if (!stage.current) return
      const available = stage.current.clientWidth
      setScale(Math.min(1, available / WIDTHS.desktop))
    }
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])

  useEffect(() => {
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
    const el = frame.current!
    const state = { w: WIDTHS.desktop }
    const apply = () => {
      el.style.width = `${state.w}px`
      setWidth(Math.round(state.w))
    }
    const tl = gsap.timeline({ repeat: -1, paused: true, defaults: { ease: 'power2.inOut', onUpdate: apply } })
    tl.to(state, { w: WIDTHS.desktop, duration: 2.2 })
      .add(() => setRule('tablet'))
      .to(state, { w: WIDTHS.tablet, duration: 1.4 })
      .to(state, { w: WIDTHS.tablet, duration: 2 })
      .add(() => setRule('phone'))
      .to(state, { w: WIDTHS.phone, duration: 1.4 })
      .to(state, { w: WIDTHS.phone, duration: 2.2 })
      .add(() => setRule('desktop'))
      .to(state, { w: WIDTHS.desktop, duration: 1.8 })

    const trigger = ScrollTrigger.create({
      trigger: section.current,
      start: 'top 70%',
      end: 'bottom 30%',
      onEnter: () => tl.play(),
      onEnterBack: () => tl.play(),
      onLeave: () => tl.pause(),
      onLeaveBack: () => tl.pause(),
    })
    gsap.from(el, { y: 60, opacity: 0, rotateX: 12, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: section.current, start: 'top 75%' } })
    return () => {
      tl.kill()
      trigger.kill()
    }
    }, section)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={section} className="relative overflow-hidden py-32 md:py-44">
      <div className="mx-auto max-w-6xl px-6">
        <p className="font-mono text-xs tracking-[0.3em] text-violet uppercase">responsive · en vivo</p>
        <h2 className="mt-4 font-display text-[clamp(2rem,5.5vw,4rem)] leading-[1.02] font-bold tracking-tight">{es.responsive.title}</h2>
        <p className="mt-4 max-w-xl text-muted">{es.responsive.caption}</p>
      </div>

      <div ref={stage} className="mx-auto mt-14 max-w-6xl px-6 [perspective:1600px]">
        <div style={{ height: 720 * scale }} className="relative flex items-start justify-center">
          <div style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }} className="absolute top-0">
            <div
              ref={frame}
              style={{ width: WIDTHS.desktop }}
              className="relative h-[680px] overflow-hidden rounded-2xl border border-line bg-[#fbfaf7] shadow-[0_40px_120px_-30px_rgba(0,0,0,0.8)]"
            >
              <div className="flex items-center gap-2 border-b border-[#e7e4dc] bg-[#f1efe9] px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                <span className="h-3 w-3 rounded-full bg-[#28c840]" />
                <div className="ml-3 flex-1 rounded-md bg-white px-3 py-1 font-mono text-xs text-[#55555f]">thisisclaude.dev/demo</div>
                <span className="rounded-md bg-[#15151c] px-2 py-1 font-mono text-[11px] text-white tabular-nums">{width}px</span>
              </div>
              <DemoPage />
            </div>
          </div>
        </div>

        <p className="mx-auto mt-6 max-w-3xl text-center font-mono text-xs text-muted md:text-sm">
          <span className="text-violet">{rule === 'desktop' ? '1280px' : rule === 'tablet' ? '768px' : '390px'}</span>
          <span className="mx-2 text-line">·</span>
          {es.responsive.rules[rule]}
        </p>
      </div>
    </section>
  )
}

function DemoPage() {
  return (
    <div className="demo-page">
      <nav className="demo-page__nav">
        <strong style={{ fontFamily: 'var(--font-display)' }}>Nube Café</strong>
        <div className="demo-page__links">
          <span>Menú</span>
          <span>Locales</span>
          <span>Historia</span>
          <span>Pedidos</span>
        </div>
        <span className="demo-page__burger" aria-hidden />
      </nav>
      <div className="demo-page__hero">
        <div>
          <h3 className="demo-page__title">Café de origen, tostado esta semana.</h3>
          <p className="demo-page__lead">Pide en línea y recógelo en diez minutos en cualquiera de nuestros locales. Sin filas, sin apps que instalar.</p>
          <span className="demo-page__cta">Hacer un pedido</span>
        </div>
        <div className="demo-page__art" />
      </div>
      <div className="demo-page__cards">
        {[
          ['Tueste claro', 'Notas florales y cítricas. Para filtrado.'],
          ['Tueste medio', 'Chocolate y caramelo. Para espresso y leche.'],
          ['Descafeinado', 'Proceso al agua. Todo el sabor, nada de insomnio.'],
        ].map(([title, body]) => (
          <div key={title} className="demo-page__card">
            <h4>{title}</h4>
            <p>{body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
