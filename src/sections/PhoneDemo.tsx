import { useEffect, useRef, useState } from 'react'
import { gsap, prefersReducedMotion } from '../lib/motion'
import { es } from '../content/es'

type Step = { screen: 0 | 1 | 2; finger: { x: number; y: number } | null; tap: boolean; hold: number }

// Coordenadas del dedo en porcentaje de la pantalla del teléfono.
const STEPS: Step[] = [
  { screen: 0, finger: null, tap: false, hold: 1200 },
  { screen: 0, finger: { x: 50, y: 46 }, tap: false, hold: 700 },
  { screen: 0, finger: { x: 50, y: 46 }, tap: true, hold: 260 },
  { screen: 1, finger: null, tap: false, hold: 1500 },
  { screen: 1, finger: { x: 50, y: 88 }, tap: false, hold: 700 },
  { screen: 1, finger: { x: 50, y: 88 }, tap: true, hold: 260 },
  { screen: 2, finger: null, tap: false, hold: 2200 },
]

export default function PhoneDemo() {
  const section = useRef<HTMLElement>(null)
  const phone = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState(0)
  const inView = useRef(false)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const io = new IntersectionObserver(([e]) => (inView.current = e.isIntersecting), { threshold: 0, rootMargin: '-10% 0px' })
    if (section.current) io.observe(section.current)
    let cancelled = false
    let i = 0
    const loop = async () => {
      while (!cancelled) {
        if (!inView.current) {
          await new Promise((r) => setTimeout(r, 250))
          continue
        }
        setStep(i)
        await new Promise((r) => setTimeout(r, STEPS[i].hold))
        i = (i + 1) % STEPS.length
      }
    }
    loop()
    return () => {
      cancelled = true
      io.disconnect()
    }
  }, [])

  useEffect(() => {
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.from(phone.current, { y: 80, opacity: 0, rotateY: -18, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: section.current, start: 'top 70%' } })
      gsap.to(phone.current, { y: -14, duration: 2.6, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 1.2 })
      gsap.from('.phone-point', { x: -30, opacity: 0, stagger: 0.15, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: section.current, start: 'top 65%' } })
    }, section)
    return () => ctx.revert()
  }, [])

  // El teléfono se inclina siguiendo el cursor.
  const tilt = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const dx = (e.clientX - r.left) / r.width - 0.5
    const dy = (e.clientY - r.top) / r.height - 0.5
    gsap.to(phone.current, { rotateY: dx * 18, rotateX: -dy * 12, duration: 0.6, ease: 'power2.out' })
  }
  const untilt = () => gsap.to(phone.current, { rotateY: 0, rotateX: 0, duration: 0.8, ease: 'power2.out' })

  const cur = STEPS[step]

  return (
    <section ref={section} className="relative overflow-hidden border-t border-line py-32 md:py-44">
      <div className="mx-auto grid max-w-6xl items-center gap-16 px-6 md:grid-cols-2">
        <div>
          <p className="font-mono text-xs tracking-[0.3em] text-rose uppercase">{es.phone.eyebrow}</p>
          <h2 className="mt-4 font-display text-[clamp(2rem,5.5vw,4rem)] leading-[1.02] font-bold tracking-tight">{es.phone.title}</h2>
          <p className="mt-4 max-w-md text-muted">{es.phone.caption}</p>
          <ul className="mt-10 space-y-4">
            {es.phone.screens.map((name, i) => (
              <li key={name} className={`phone-point flex items-center gap-4 font-display text-lg transition-colors duration-500 ${cur.screen === i ? 'text-ink' : 'text-muted/50'}`}>
                <span className={`flex h-8 w-8 items-center justify-center rounded-full border font-mono text-xs transition-colors duration-500 ${cur.screen === i ? 'border-rose text-rose' : 'border-line'}`}>{i + 1}</span>
                {name}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-center [perspective:1400px]" onMouseMove={tilt} onMouseLeave={untilt}>
          <div ref={phone} className="relative h-[600px] w-[290px] rounded-[46px] border-[6px] border-[#1c1c26] bg-[#06060a] shadow-[0_50px_120px_-30px_rgba(0,0,0,0.9),inset_0_0_0_1px_#2a2a36] [transform-style:preserve-3d]">
            <div className="absolute top-3 left-1/2 z-20 h-6 w-24 -translate-x-1/2 rounded-full bg-[#06060a]" />
            <div className="absolute inset-[2px] overflow-hidden rounded-[40px] bg-[#0f0f18]">
              <Screens screen={cur.screen} />
              {cur.finger && (
                <div
                  className="pointer-events-none absolute z-30 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/70 bg-white/20 backdrop-blur-sm transition-all duration-500 ease-out"
                  style={{ left: `${cur.finger.x}%`, top: `${cur.finger.y}%`, transform: `translate(-50%, -50%) scale(${cur.tap ? 0.7 : 1})` }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Bone({ w, h = 'h-3', className = '' }: { w: string; h?: string; className?: string }) {
  return <div className={`skeleton rounded-md ${w} ${h} ${className}`} />
}

function Screens({ screen }: { screen: 0 | 1 | 2 }) {
  return (
    <div className="relative h-full w-full">
      <div className="flex h-full w-[300%] transition-transform duration-500 ease-[cubic-bezier(.22,.61,.36,1)]" style={{ transform: `translateX(-${screen * (100 / 3)}%)` }}>
        {/* Pantalla 1: lista de pedidos */}
        <div className="flex h-full w-1/3 flex-col px-5 pt-14 pb-20">
          <Bone w="w-28" h="h-5" />
          <Bone w="w-full" h="h-9" className="mt-5 !rounded-xl" />
          <div className="mt-5 space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={`flex items-center gap-3 rounded-2xl border p-3 ${i === 1 ? 'border-rose/60 bg-rose/10' : 'border-line bg-bg-2'}`}>
                <Bone w="w-11" h="h-11" className="!rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Bone w="w-3/4" />
                  <Bone w="w-1/2" h="h-2.5" />
                </div>
                <Bone w="w-8" h="h-5" />
              </div>
            ))}
          </div>
        </div>
        {/* Pantalla 2: detalle */}
        <div className="flex h-full w-1/3 flex-col px-5 pt-14 pb-6">
          <div className="flex items-center gap-3">
            <Bone w="w-6" h="h-6" className="!rounded-full" />
            <Bone w="w-20" h="h-4" />
          </div>
          <Bone w="w-full" h="h-40" className="mt-5 !rounded-2xl" />
          <Bone w="w-4/5" h="h-5" className="mt-5" />
          <Bone w="w-2/5" h="h-3" className="mt-3" />
          <div className="mt-5 space-y-2.5">
            <Bone w="w-full" h="h-2.5" />
            <Bone w="w-11/12" h="h-2.5" />
            <Bone w="w-3/4" h="h-2.5" />
          </div>
          <div className="mt-auto rounded-2xl bg-rose py-3.5 text-center font-display text-sm font-bold text-bg">Confirmar pedido</div>
        </div>
        {/* Pantalla 3: confirmación */}
        <div className="flex h-full w-1/3 flex-col items-center justify-center px-6 text-center">
          <div className={`flex h-20 w-20 items-center justify-center rounded-full bg-green/15 transition-transform duration-700 ${screen === 2 ? 'scale-100' : 'scale-0'}`}>
            <svg viewBox="0 0 24 24" className="h-10 w-10 text-green" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 13l4 4L19 7" className={screen === 2 ? 'check-draw' : ''} />
            </svg>
          </div>
          <p className="mt-6 font-display text-xl font-bold">Pedido confirmado</p>
          <Bone w="w-32" className="mt-4" />
          <Bone w="w-24" h="h-2.5" className="mt-2" />
        </div>
      </div>
      {/* Barra de pestañas */}
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-around border-t border-line bg-[#0c0c14]/90 px-6 pt-3 pb-6 backdrop-blur">
        {[0, 1, 2].map((i) => (
          <span key={i} className={`h-2 w-7 rounded-full transition-colors duration-500 ${screen === i ? 'bg-rose' : 'bg-line'}`} />
        ))}
      </div>
    </div>
  )
}
