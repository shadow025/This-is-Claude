/**
 * Grafo de la esfera: nodos agrupados en racimos sobre una cáscara con
 * profundidad, unidos a sus vecinos más cercanos más unos pocos hilos largos.
 * Cada racimo es una de mis capacidades; la física la hace el layout fijo
 * (determinista por semilla) y el movimiento se añade en tiempo real.
 */
export type Graph = {
  count: number
  /** posición base de cada nodo (x,y,z) */
  base: Float32Array
  /** dirección del racimo de cada nodo, para abrir la esfera con el scroll */
  dir: Float32Array
  cluster: Uint8Array
  /** fase aleatoria 0..1 por nodo, para que cada uno lata distinto */
  seed: Float32Array
  /** tamaño relativo de cada nodo */
  size: Float32Array
  /** pares (a,b) de nodos unidos */
  links: Uint32Array
  /** vecinos por nodo, para iluminar al pasar el cursor */
  neighbors: number[][]
}

export const CLUSTERS = 5

function mulberry32(a: number) {
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function buildGraph(count: number, seedValue = 7): Graph {
  const rand = mulberry32(seedValue)
  const base = new Float32Array(count * 3)
  const dir = new Float32Array(count * 3)
  const cluster = new Uint8Array(count)
  const seed = new Float32Array(count)
  const size = new Float32Array(count)

  // Centros de racimo repartidos en la esfera (puntos de Fibonacci).
  const centers: number[][] = []
  for (let i = 0; i < CLUSTERS; i++) {
    const y = 1 - (2 * (i + 0.5)) / CLUSTERS
    const r = Math.sqrt(1 - y * y)
    const phi = i * Math.PI * (3 - Math.sqrt(5))
    centers.push([Math.cos(phi) * r, y, Math.sin(phi) * r])
  }

  for (let i = 0; i < count; i++) {
    const c = i % CLUSTERS
    const [cx, cy, cz] = centers[c]
    // Dispersión gaussiana alrededor del centro del racimo.
    const g = () => (rand() + rand() + rand() - 1.5) * 0.75
    let x = cx + g()
    let y = cy + g()
    let z = cz + g()
    const len = Math.hypot(x, y, z) || 1
    // Cáscara con profundidad: radio entre 0.55 y 1.0, más denso hacia fuera.
    const radius = 0.68 + 0.32 * Math.sqrt(rand())
    x = (x / len) * radius
    y = (y / len) * radius
    z = (z / len) * radius
    base.set([x, y, z], i * 3)
    dir.set([cx, cy, cz], i * 3)
    cluster[i] = c
    seed[i] = rand()
    size[i] = 0.5 + Math.pow(rand(), 3) * 1.6
  }

  // Enlaces: k vecinos más cercanos + algunos hilos largos al azar.
  const k = 3
  const neighbors: number[][] = Array.from({ length: count }, () => [])
  const pairs = new Set<number>()
  const key = (a: number, b: number) => (a < b ? a * count + b : b * count + a)
  const addLink = (a: number, b: number) => {
    if (a === b) return
    const id = key(a, b)
    if (pairs.has(id)) return
    pairs.add(id)
    neighbors[a].push(b)
    neighbors[b].push(a)
  }
  const dist2 = new Float32Array(count)
  const order = new Uint32Array(count)
  for (let i = 0; i < count; i++) {
    const ix = base[i * 3], iy = base[i * 3 + 1], iz = base[i * 3 + 2]
    for (let j = 0; j < count; j++) {
      const dx = base[j * 3] - ix, dy = base[j * 3 + 1] - iy, dz = base[j * 3 + 2] - iz
      dist2[j] = j === i ? Infinity : dx * dx + dy * dy + dz * dz
      order[j] = j
    }
    // Selección parcial: solo necesitamos los k más cercanos.
    for (let s = 0; s < k; s++) {
      let best = s
      for (let j = s + 1; j < count; j++) if (dist2[order[j]] < dist2[order[best]]) best = j
      const tmp = order[s]; order[s] = order[best]; order[best] = tmp
      addLink(i, order[s])
    }
  }
  const longLinks = Math.floor(count * 0.06)
  for (let n = 0; n < longLinks; n++) addLink(Math.floor(rand() * count), Math.floor(rand() * count))

  const links = new Uint32Array(pairs.size * 2)
  let w = 0
  for (const id of pairs) {
    links[w++] = Math.floor(id / count)
    links[w++] = id % count
  }

  return { count, base, dir, cluster, seed, size, links, neighbors }
}
