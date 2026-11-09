import { useEffect, useRef, useState } from 'react'
import { gsap, prefersReducedMotion } from '../lib/motion'
import { es } from '../content/es'

/**
 * Flujo de Git animado: rama desde main, tres commits con sus pruebas
 * (una falla y se corrige), PR con descripción y checks, revisión de Luis, merge.
 * Un paso cada cierto tiempo; todo lo demás son transiciones CSS/SVG.
 */
type Ci = 'none' | 'running' | 'pass' | 'fail'
type Commit = { x: number; hash: string; msg: string }

const FEATURE: Commit[] = [
  { x: 240, hash: 'a41f2c', msg: 'feat(facturas): endpoint de vencidas' },
  { x: 330, hash: 'b7d09e', msg: 'test(facturas): excluye las ya pagadas' },
  { x: 420, hash: 'c93a1d', msg: 'fix(facturas): filtra por estado pagada' },
]
const MAIN_Y = 150
const FEAT_Y = 70
const STEP_HOLD = [1100, 900, 1100, 900, 800, 1000, 900, 1100, 1000, 900, 900, 1600, 1300, 1500, 1300, 2800]
const LAST = STEP_HOLD.length - 1

export default function GitFlow() {
  const section = useRef<HTMLElement>(null)
  const [step, setStep] = useState(0)
  const inView = useRef(false)

  useEffect(() => {
    if (prefersReducedMotion()) {
      setStep(LAST)
      return
    }
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
        await new Promise((r) => setTimeout(r, STEP_HOLD[i]))
        i = (i + 1) % STEP_HOLD.length
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
      gsap.from('.git-panel', { y: 60, opacity: 0, duration: 1.1, stagger: 0.15, ease: 'power3.out', scrollTrigger: { trigger: section.current, start: 'top 70%' } })
      gsap.from('.git-rule', { x: -20, opacity: 0, duration: 0.7, stagger: 0.1, ease: 'power2.out', scrollTrigger: { trigger: '.git-rules', start: 'top 85%' } })
    }, section)
    return () => ctx.revert()
  }, [])

  // Qué se ve en cada paso.
  const branched = step >= 1
  const visible = [step >= 2, step >= 5, step >= 8]
  const ci: Ci[] = [
    step < 3 ? 'none' : step === 3 ? 'running' : 'pass',
    step < 6 ? 'none' : step === 6 ? 'running' : 'fail',
    step < 9 ? 'none' : step === 9 ? 'running' : 'pass',
  ]
  const prOpen = step >= 11
  const checks = step >= 12
  const approved = step >= 13
  const merged = step >= 14
  const done = step >= 15

  return (
    <section ref={section} className="relative overflow-hidden border-t border-line bg-bg-2/40 py-32 md:py-44">
      <div className="mx-auto max-w-6xl px-6">
        <p className="font-mono text-xs tracking-[0.3em] text-violet uppercase">{es.git.eyebrow}</p>
        <h2 className="mt-4 max-w-4xl font-display text-[clamp(2rem,5.5vw,4rem)] leading-[1.02] font-bold tracking-tight">{es.git.title}</h2>
        <p className="mt-4 max-w-2xl text-muted">{es.git.caption}</p>
      </div>

      <div className="mx-auto mt-14 grid max-w-6xl gap-6 px-6 lg:grid-cols-5">
        {/* Grafo + registro de commits */}
        <div className="git-panel overflow-hidden rounded-2xl border border-line bg-[#0c0c14] lg:col-span-3">
          <div className="flex items-center justify-between border-b border-line px-5 py-3 font-mono text-xs text-muted">
            <span>git log --graph</span>
            <span className={`transition-colors duration-500 ${done ? 'text-green' : ''}`}>{done ? 'main · verde' : merged ? 'mezclando…' : branched ? 'feat/facturas-vencidas' : 'main'}</span>
          </div>

          <svg viewBox="0 0 640 200" className="w-full" role="img" aria-label="Rama, commits con pruebas, PR y merge a main">
            <defs>
              <linearGradient id="feat" x1="0" x2="1">
                <stop offset="0" stopColor="#8b5cf6" />
                <stop offset="1" stopColor="#22d3ee" />
              </linearGradient>
            </defs>
            {/* main */}
            <line x1="20" y1={MAIN_Y} x2="620" y2={MAIN_Y} stroke="#2a2a38" strokeWidth="3" />
            <line x1="20" y1={MAIN_Y} x2="620" y2={MAIN_Y} stroke="#34d399" strokeWidth="3" pathLength={1} strokeDasharray={1} strokeDashoffset={done ? 0 : 1} className="transition-[stroke-dashoffset] duration-[1200ms] ease-out" />
            <text x="24" y={MAIN_Y + 28} fill="#9a9aa8" fontSize="11" fontFamily="var(--font-mono)">main</text>

            {/* rama desde main */}
            <path d={`M140 ${MAIN_Y} C 190 ${MAIN_Y}, 190 ${FEAT_Y}, 240 ${FEAT_Y} L 420 ${FEAT_Y}`} fill="none" stroke="url(#feat)" strokeWidth="3" pathLength={1} strokeDasharray={1} strokeDashoffset={branched ? 0 : 1} className="transition-[stroke-dashoffset] duration-[900ms] ease-out" />
            <text x="150" y={FEAT_Y + 46} fill="#8b5cf6" fontSize="11" fontFamily="var(--font-mono)" className="transition-opacity duration-500" style={{ opacity: branched ? 1 : 0 }}>feat/facturas-vencidas</text>

            {/* merge de vuelta */}
            <path d={`M420 ${FEAT_Y} C 470 ${FEAT_Y}, 470 ${MAIN_Y}, 520 ${MAIN_Y}`} fill="none" stroke="url(#feat)" strokeWidth="3" pathLength={1} strokeDasharray={1} strokeDashoffset={merged ? 0 : 1} className="transition-[stroke-dashoffset] duration-[900ms] ease-out" />

            {/* commits en main */}
            {[60, 140].map((x) => (
              <circle key={x} cx={x} cy={MAIN_Y} r="8" fill="#0c0c14" stroke="#9a9aa8" strokeWidth="3" />
            ))}
            {/* merge commit */}
            <g style={{ transform: `scale(${merged ? 1 : 0})`, transformBox: 'fill-box', transformOrigin: 'center' }} className="transition-transform duration-500 ease-out">
              <circle cx="520" cy={MAIN_Y} r="10" fill={done ? '#34d399' : '#0c0c14'} stroke={done ? '#34d399' : '#8b5cf6'} strokeWidth="3" className="transition-colors duration-500" />
              <text x="520" y={MAIN_Y + 32} textAnchor="middle" fill="#9a9aa8" fontSize="11" fontFamily="var(--font-mono)" style={{ opacity: merged ? 1 : 0 }} className="transition-opacity duration-500">merge #42</text>
            </g>

            {/* commits de la rama + estado de CI */}
            {FEATURE.map((c, i) => (
              <g key={c.hash} style={{ transform: `scale(${visible[i] ? 1 : 0})`, transformBox: 'fill-box', transformOrigin: 'center' }} className="transition-transform duration-500 ease-out">
                <circle cx={c.x} cy={FEAT_Y} r="9" fill="#0c0c14" stroke={ci[i] === 'fail' ? '#fb7185' : ci[i] === 'pass' ? '#34d399' : '#8b5cf6'} strokeWidth="3" className="transition-colors duration-500" />
                <text x={c.x} y={FEAT_Y + 4} textAnchor="middle" fill="#f4f1ea" fontSize="9" fontFamily="var(--font-mono)">{i + 1}</text>
                <CiBadge x={c.x} y={FEAT_Y - 50 + 40} state={ci[i]} />
              </g>
            ))}
          </svg>

          <div className="border-t border-line px-5 py-4 font-mono text-xs leading-7">
            {FEATURE.map((c, i) => (
              <div key={c.hash} className={`flex items-center gap-3 transition-all duration-500 ${visible[i] ? 'translate-x-0 opacity-100' : '-translate-x-3 opacity-0'}`}>
                <span className="text-violet">{c.hash}</span>
                <span className="text-ink">{c.msg}</span>
                <span className={`ml-auto ${ci[i] === 'pass' ? 'text-green' : ci[i] === 'fail' ? 'text-rose' : ci[i] === 'running' ? 'animate-pulse text-accent' : 'text-transparent'}`}>
                  {ci[i] === 'pass' ? '✓ pruebas' : ci[i] === 'fail' ? '✗ 1 falla' : ci[i] === 'running' ? '● corriendo' : '·'}
                </span>
              </div>
            ))}
            <div className={`flex items-center gap-3 transition-all duration-500 ${merged ? 'translate-x-0 opacity-100' : '-translate-x-3 opacity-0'}`}>
              <span className="text-green">e12f88</span>
              <span className="text-ink">Merge pull request #42 from feat/facturas-vencidas</span>
            </div>
          </div>
        </div>

        {/* Pull request */}
        <div className="git-panel lg:col-span-2">
        <div className={`h-full rounded-2xl border bg-[#0c0c14] p-6 transition-all duration-700 ${prOpen ? 'border-line opacity-100' : 'border-line/40 opacity-40'}`}>
          <div className="flex items-center gap-2 font-mono text-xs text-muted">
            <span className={`rounded-full px-2 py-0.5 font-medium transition-colors duration-500 ${merged ? 'bg-violet/20 text-violet' : prOpen ? 'bg-green/15 text-green' : 'bg-line text-muted'}`}>
              {merged ? 'Mezclado' : prOpen ? 'Abierto' : 'Borrador'}
            </span>
            <span>#42</span>
          </div>
          <h3 className={`mt-3 font-display text-xl font-bold tracking-tight transition-opacity duration-500 ${prOpen ? 'opacity-100' : 'opacity-0'}`}>feat: endpoint de facturas vencidas</h3>
          <p className="mt-1 font-mono text-[11px] text-muted">feat/facturas-vencidas → main</p>

          <div className={`mt-5 space-y-3 text-sm transition-all duration-700 ${prOpen ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'}`}>
            <PrLine k="Qué" v="Nuevo endpoint que lista facturas vencidas, excluyendo las pagadas." />
            <PrLine k="Por qué" v="Cobranza las buscaba a mano en Excel cada lunes." />
            <PrLine k="Cómo probar" v="npm test · GET /facturas/vencidas devuelve 3 en los datos de prueba." />
          </div>

          <ul className="mt-5 space-y-1.5 font-mono text-xs">
            {['pruebas · 12 pasaron', 'lint · sin avisos', 'build · 1.2 s'].map((c, i) => (
              <li key={c} className={`flex items-center gap-2 transition-all duration-500 ${checks ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0'}`} style={{ transitionDelay: `${i * 150}ms` }}>
                <span className="text-green">✓</span>
                <span className="text-muted">{c}</span>
              </li>
            ))}
          </ul>

          <div className={`mt-5 flex items-center gap-3 rounded-xl border border-line p-3 transition-all duration-500 ${approved ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent font-display text-sm font-bold text-bg">L</span>
            <div className="text-sm">
              <p className="text-ink">Luis aprobó los cambios</p>
              <p className="text-xs text-muted">"Bien. Agrega el índice en vence antes de producción."</p>
            </div>
          </div>

          <div className={`mt-5 rounded-xl py-3 text-center font-display text-sm font-bold transition-colors duration-700 ${merged ? 'bg-violet text-white' : approved ? 'bg-green text-bg' : 'bg-line text-muted'}`}>
            {merged ? 'Mezclado en main' : approved ? 'Listo para mezclar' : 'Esperando revisión'}
          </div>
        </div>
        </div>
      </div>

      <ul className="git-rules mx-auto mt-10 flex max-w-6xl flex-wrap gap-x-8 gap-y-3 px-6 font-mono text-xs text-muted">
        {es.git.rules.map((r) => (
          <li key={r} className="git-rule flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-violet" />
            {r}
          </li>
        ))}
      </ul>
    </section>
  )
}

function CiBadge({ x, y, state }: { x: number; y: number; state: Ci }) {
  const color = state === 'pass' ? '#34d399' : state === 'fail' ? '#fb7185' : '#f5a524'
  return (
    <g style={{ opacity: state === 'none' ? 0 : 1 }} className="transition-opacity duration-400">
      <circle cx={x} cy={y - 28} r="8" fill="#0c0c14" stroke={color} strokeWidth="2" className={state === 'running' ? 'animate-pulse' : ''} />
      <text x={x} y={y - 24.5} textAnchor="middle" fill={color} fontSize="10" fontWeight="700" fontFamily="var(--font-mono)">
        {state === 'pass' ? '✓' : state === 'fail' ? '✗' : '…'}
      </text>
    </g>
  )
}

function PrLine({ k, v }: { k: string; v: string }) {
  return (
    <p>
      <span className="font-mono text-xs tracking-wider text-violet uppercase">{k}</span>
      <span className="mt-0.5 block text-ink/90">{v}</span>
    </p>
  )
}
