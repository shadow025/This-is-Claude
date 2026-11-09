import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const isMobile = () => typeof window !== 'undefined' && window.innerWidth < 768

/**
 * Lenis y GSAP comparten un solo reloj: Lenis avanza dentro del ticker de GSAP
 * y avisa a ScrollTrigger en cada scroll. Un solo requestAnimationFrame para todo.
 */
export function startSmoothScroll(): () => void {
  if (prefersReducedMotion()) return () => {}
  const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.9 })
  lenis.on('scroll', ScrollTrigger.update)
  const tick = (time: number) => lenis.raf(time * 1000)
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)
  return () => {
    gsap.ticker.remove(tick)
    lenis.destroy()
  }
}

export { gsap, ScrollTrigger }
