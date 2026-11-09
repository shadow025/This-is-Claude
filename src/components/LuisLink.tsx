import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { es } from '../content/es'

/**
 * Enlace al portafolio de Luis. Cuando el portafolio esté publicado (`live: true`)
 * va directo a la URL externa; mientras tanto pasa por la pantalla /luis.
 */
export default function LuisLink({ className, children }: { className?: string; children: ReactNode }) {
  if (es.luis.live) {
    return (
      <a href={es.luis.url} className={className} rel="noopener">
        {children}
      </a>
    )
  }
  return (
    <Link to="/luis" className={className}>
      {children}
    </Link>
  )
}
