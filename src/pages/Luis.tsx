import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { es } from '../content/es'

/**
 * El portafolio de Luis vive en su propio repositorio. Esta ruta solo redirige.
 * Mientras la URL pública no exista (`live: false`), muestra una pantalla de espera.
 */
export default function Luis() {
  const { url, live } = es.luis

  useEffect(() => {
    if (!live) return
    const t = setTimeout(() => window.location.replace(url), 900)
    return () => clearTimeout(t)
  }, [live, url])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="font-mono text-xs tracking-[0.3em] text-accent uppercase">{live ? 'redirigiendo' : 'próximamente'}</p>
      <h1 className="mt-5 font-display text-[clamp(2.2rem,6vw,4.5rem)] leading-tight font-bold tracking-tight">
        {live ? es.luis.redirecting : es.luis.title}
      </h1>
      {!live && <p className="mt-6 max-w-lg text-muted">{es.luis.body}</p>}
      <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
        {live && (
          <a href={url} className="rounded-full bg-accent px-6 py-3 font-display text-sm font-bold text-bg transition hover:brightness-110">
            {es.luis.open} →
          </a>
        )}
        <Link to="/" className="rounded-full border border-line px-5 py-2.5 text-sm text-ink transition hover:border-accent hover:text-accent">
          {es.luis.back}
        </Link>
      </div>
    </main>
  )
}
