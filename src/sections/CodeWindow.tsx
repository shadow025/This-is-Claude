import { useEffect, useRef, useState, type ReactNode } from 'react'
import { gsap, prefersReducedMotion } from '../lib/motion'
import { es } from '../content/es'

type Scene = {
  instruction: string
  file: string
  lines: string[]
  /** línea con el error y su corrección */
  fix: { line: number; code: string }
  test: string
  failure: string
  result: { title: string; rows: string[] }
}

const SCENES: Scene[] = [
  {
    instruction: 'Luis: necesito un endpoint que liste las facturas vencidas.',
    file: 'facturas.ts',
    lines: [
      "import { db } from './db'",
      '',
      'export async function vencidas(hoy: Date) {',
      "  const filas = await db.facturas.where('vence', '<', hoy)",
      '  return filas',
      '}',
    ],
    fix: { line: 4, code: "  return filas.filter((f) => f.estado !== 'pagada')" },
    test: 'vencidas() excluye las ya pagadas',
    failure: 'esperaba 3 facturas, recibió 4',
    result: { title: '3 facturas vencidas', rows: ['#1042 · Hotel Norte · venció 30 oct', '#1057 · Café Lila · venció 2 nov', '#1061 · Taller Ruiz · venció 5 nov'] },
  },
  {
    instruction: 'Luis: un botón que pida confirmación antes de borrar.',
    file: 'Borrar.tsx',
    lines: [
      'export function Borrar({ onConfirm }: Props) {',
      '  const [abierto, setAbierto] = useState(false)',
      '  if (!abierto) return <button onClick={() => setAbierto(true)}>Borrar</button>',
      '  return (',
      '    <Dialogo onOk={onConfirm} onCancel={() => setAbierto(false)} />',
      '  )',
      '}',
    ],
    fix: { line: 4, code: '    <Dialogo onOk={() => { onConfirm(); setAbierto(false) }} onCancel={() => setAbierto(false)} />' },
    test: 'cierra el diálogo después de confirmar',
    failure: 'el diálogo seguía abierto',
    result: { title: 'Componente listo', rows: ['Botón · Borrar', 'Diálogo · ¿Seguro? · Cancelar / Borrar', 'Al confirmar: borra y cierra'] },
  },
]

type TermLine = { kind: 'cmd' | 'ok' | 'fail' | 'dim'; text: string }

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const jitter = (ms: number) => ms * (0.6 + Math.random() * 0.9)

export default function CodeWindow() {
  const section = useRef<HTMLElement>(null)
  const [scene, setScene] = useState(0)
  const [lines, setLines] = useState<string[]>([])
  const [cursor, setCursor] = useState(0)
  const [term, setTerm] = useState<TermLine[]>([])
  const [showResult, setShowResult] = useState(false)
  const [reviewed, setReviewed] = useState(false)
  const [instruction, setInstruction] = useState('')
  const inView = useRef(false)

  useEffect(() => {
    if (prefersReducedMotion()) {
      const s = SCENES[0]
      setInstruction(s.instruction)
      setLines(s.lines.map((l, i) => (i === s.fix.line ? s.fix.code : l)))
      setTerm([{ kind: 'cmd', text: '$ npm test' }, { kind: 'ok', text: `✓ ${s.test}` }])
      setShowResult(true)
      setReviewed(true)
      return
    }
    const io = new IntersectionObserver(([e]) => (inView.current = e.isIntersecting), { threshold: 0, rootMargin: '-10% 0px' })
    if (section.current) io.observe(section.current)

    let cancelled = false
    const waitVisible = async () => {
      while (!cancelled && !inView.current) await sleep(200)
    }
    const typeInto = async (target: string[], lineIdx: number, text: string) => {
      for (let c = 1; c <= text.length; c++) {
        if (cancelled) return
        await waitVisible()
        target[lineIdx] = text.slice(0, c)
        setLines([...target])
        setCursor(lineIdx)
        await sleep(jitter(text[c - 1] === ' ' ? 40 : 22))
      }
    }

    const run = async () => {
      let i = 0
      while (!cancelled) {
        const s = SCENES[i % SCENES.length]
        setScene(i % SCENES.length)
        setLines([])
        setTerm([])
        setShowResult(false)
        setReviewed(false)
        setInstruction('')
        await waitVisible()
        for (let c = 1; c <= s.instruction.length; c++) {
          if (cancelled) return
          setInstruction(s.instruction.slice(0, c))
          await sleep(jitter(16))
        }
        await sleep(700)
        const buf: string[] = []
        for (let l = 0; l < s.lines.length; l++) {
          buf.push('')
          await typeInto(buf, l, s.lines[l])
          await sleep(jitter(160))
        }
        await sleep(500)
        setTerm([{ kind: 'cmd', text: '$ npm test' }])
        await sleep(900)
        setTerm((t) => [...t, { kind: 'fail', text: `✗ ${s.test}` }, { kind: 'dim', text: `  ${s.failure}` }])
        await sleep(1400)
        // Borrar la línea con el error y escribir la corrección.
        const old = buf[s.fix.line]
        for (let c = old.length - 1; c >= 0; c -= 3) {
          if (cancelled) return
          buf[s.fix.line] = old.slice(0, Math.max(0, c))
          setLines([...buf])
          setCursor(s.fix.line)
          await sleep(12)
        }
        await typeInto(buf, s.fix.line, s.fix.code)
        await sleep(500)
        setTerm((t) => [...t, { kind: 'cmd', text: '$ npm test' }])
        await sleep(900)
        setTerm((t) => [...t, { kind: 'ok', text: `✓ ${s.test}` }, { kind: 'dim', text: '  1 prueba · 1 pasó' }])
        await sleep(600)
        setShowResult(true)
        await sleep(1800)
        setReviewed(true)
        await sleep(3200)
        i++
      }
    }
    run()
    return () => {
      cancelled = true
      io.disconnect()
    }
  }, [])

  useEffect(() => {
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.from('.code-frame', { y: 60, opacity: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: section.current, start: 'top 70%' } })
    }, section)
    return () => ctx.revert()
  }, [])

  const s = SCENES[scene]

  return (
    <section ref={section} className="relative py-32 md:py-44">
      <div className="mx-auto max-w-6xl px-6">
        <p className="font-mono text-xs tracking-[0.3em] text-green uppercase">{es.code.eyebrow}</p>
        <h2 className="mt-4 font-display text-[clamp(2rem,5.5vw,4rem)] leading-[1.02] font-bold tracking-tight">{es.code.title}</h2>
        <p className="mt-4 max-w-xl text-muted">{es.code.caption}</p>
      </div>

      <div className="code-frame mx-auto mt-14 grid max-w-6xl gap-6 px-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="overflow-hidden rounded-2xl border border-line bg-[#0c0c14] shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)]">
          <div className="flex items-center gap-2 border-b border-line bg-[#101019] px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
            <span className="ml-4 rounded-t-md border-b-2 border-accent px-3 py-1 font-mono text-xs text-ink">{s.file}</span>
            <span className="px-3 py-1 font-mono text-xs text-muted">{s.file.endsWith('.tsx') ? 'Borrar.test.tsx' : 'facturas.test.ts'}</span>
          </div>

          <div className="border-b border-line px-5 py-3 font-mono text-xs text-muted">
            <span className="text-accent">›</span> {instruction}
            {instruction.length > 0 && instruction.length < s.instruction.length && <Caret />}
          </div>

          <pre className="min-h-[232px] overflow-x-auto px-5 py-4 font-mono text-[13px] leading-6">
            {Array.from({ length: Math.max(lines.length, s.lines.length) }).map((_, i) => (
              <div key={i} className={`flex ${i === s.fix.line && lines[i] === s.fix.code ? 'bg-green/10' : ''}`}>
                <span className="w-8 shrink-0 select-none text-right text-muted/50">{i + 1}</span>
                <span className="ml-4 whitespace-pre">
                  {highlight(lines[i] ?? '')}
                  {i === cursor && lines.length > 0 && !showResult && <Caret />}
                </span>
              </div>
            ))}
          </pre>

          <div className="min-h-[112px] border-t border-line bg-[#09090f] px-5 py-3 font-mono text-xs leading-6">
            {term.map((l, i) => (
              <div
                key={i}
                className={
                  l.kind === 'ok' ? 'text-green' : l.kind === 'fail' ? 'text-rose' : l.kind === 'dim' ? 'text-muted' : 'text-ink'
                }
              >
                {l.text}
              </div>
            ))}
          </div>
        </div>

        <div
          className={`self-end rounded-2xl border border-line bg-bg-2 p-6 transition-all duration-700 ${
            showResult ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
          }`}
        >
          <p className="font-mono text-xs tracking-[0.25em] text-green uppercase">resultado</p>
          <h3 className="mt-3 font-display text-2xl font-bold tracking-tight">{s.result.title}</h3>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            {s.result.rows.map((r) => (
              <li key={r} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-green" />
                {r}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex items-center gap-2 border-t border-line pt-4 font-mono text-xs">
            <span className={`h-2 w-2 rounded-full transition-colors duration-500 ${reviewed ? 'bg-green' : 'animate-pulse bg-accent'}`} />
            <span className={`transition-colors duration-500 ${reviewed ? 'text-ink' : 'text-muted'}`}>
              {reviewed ? 'Revisado y aprobado por Luis' : 'Esperando la revisión de Luis…'}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

function Caret() {
  return <span className="ml-px inline-block h-[1.1em] w-[2px] translate-y-[3px] animate-pulse bg-accent" />
}

const TOKEN = /(\/\/.*$)|('(?:[^'\\]|\\.)*')|(\b(?:import|from|export|async|function|return|const|await|if|new)\b)|(\b(?:useState|Dialogo|Props|Date)\b)|(<\/?[A-Za-z][\w.]*|\/?>)|(\b\d+\b)/g

function highlight(code: string): ReactNode[] {
  const out: ReactNode[] = []
  let last = 0
  let k = 0
  for (const m of code.matchAll(TOKEN)) {
    const start = m.index ?? 0
    if (start > last) out.push(<span key={k++}>{code.slice(last, start)}</span>)
    const cls = m[1] ? 'text-muted/70' : m[2] ? 'text-green' : m[3] ? 'text-violet' : m[4] ? 'text-cyan' : m[5] ? 'text-rose' : 'text-accent'
    out.push(<span key={k++} className={cls}>{m[0]}</span>)
    last = start + m[0].length
  }
  if (last < code.length) out.push(<span key={k++}>{code.slice(last)}</span>)
  return out
}
