import { useEffect } from 'react'
import LuisLink from '../components/LuisLink'
import Hero from '../sections/Hero'
import Manifesto from '../sections/Manifesto'
import ResponsiveDemo from '../sections/ResponsiveDemo'
import Tool from '../sections/Tool'
import CodeWindow from '../sections/CodeWindow'
import PhoneDemo from '../sections/PhoneDemo'
import GitFlow from '../sections/GitFlow'
import Conclusion from '../sections/Conclusion'
import { startSmoothScroll } from '../lib/motion'

export default function Home() {
  useEffect(() => startSmoothScroll(), [])
  return (
    <main>
      <Hero />
      <Manifesto />
      <Tool />
      <CodeWindow />
      <GitFlow />
      <PhoneDemo />
      <ResponsiveDemo />
      <Conclusion />
      <footer className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 border-t border-line px-6 py-10 text-sm text-muted md:flex-row md:items-center">
        <span>This is Claude · en construcción · hecho por Claude, dirigido por Luis</span>
        <LuisLink className="transition hover:text-accent">Portafolio de Luis →</LuisLink>
      </footer>
    </main>
  )
}
