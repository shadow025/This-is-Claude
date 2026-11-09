import { useEffect, useMemo, useRef, type RefObject } from 'react'
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'
import { buildGraph, CLUSTERS } from './graph'

const PALETTE = ['#f5a524', '#8b5cf6', '#22d3ee', '#fb7185', '#34d399'].map((c) => new THREE.Color(c))
const DIM = new THREE.Color('#2a2a38')

type Props = {
  /** 0 = esfera cerrada en la portada, 1 = esfera abierta, cámara adentro */
  progress: RefObject<number>
  count: number
  bloom: boolean
}

function Graph({ progress, count }: Omit<Props, 'bloom'>) {
  const data = useMemo(() => buildGraph(count), [count])
  const mesh = useRef<THREE.InstancedMesh>(null!)
  const lines = useRef<THREE.LineSegments>(null!)
  const group = useRef<THREE.Group>(null!)
  const hovered = useRef(-1)
  const paintedHover = useRef(-2)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const positions = useMemo(() => new Float32Array(count * 3), [count])
  const linePositions = useMemo(() => new Float32Array(data.links.length * 3), [data])
  const lineColors = useMemo(() => new Float32Array(data.links.length * 3), [data])
  const { camera } = useThree()

  const paintColors = (hover: number) => {
    const color = new THREE.Color()
    const near = hover >= 0 ? new Set([hover, ...data.neighbors[hover]]) : null
    for (let i = 0; i < count; i++) {
      const bright = !near || near.has(i)
      color.copy(bright ? PALETTE[data.cluster[i] % CLUSTERS] : DIM)
      if (bright) color.multiplyScalar(near && i === hover ? 3.2 : near ? 2.2 : 1.5)
      mesh.current.setColorAt(i, color)
    }
    mesh.current.instanceColor!.needsUpdate = true
    for (let l = 0; l < data.links.length; l += 2) {
      const a = data.links[l], b = data.links[l + 1]
      const lit = !near || (near.has(a) && near.has(b))
      for (const [slot, node] of [[l, a], [l + 1, b]] as const) {
        color.copy(lit ? PALETTE[data.cluster[node] % CLUSTERS] : DIM)
        if (lit && near) color.multiplyScalar(1.8)
        if (!lit) color.multiplyScalar(0.35)
        lineColors.set([color.r, color.g, color.b], slot * 3)
      }
    }
    ;(lines.current.geometry.attributes.color as THREE.BufferAttribute).needsUpdate = true
  }

  useEffect(() => {
    paintColors(-1)
    paintedHover.current = -1
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    const p = THREE.MathUtils.clamp(progress.current ?? 0, 0, 1)
    const eased = p * p * (3 - 2 * p)
    const spread = eased * 0.75

    group.current.rotation.y += dt * (0.07 + eased * 0.05)
    group.current.rotation.x = Math.sin(t * 0.11) * 0.08

    const radiusScale = 2.3
    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const s = data.seed[i]
      const wobble = 0.03 * Math.sin(t * 0.7 + s * 12.0)
      const x = (data.base[i3] + data.dir[i3] * spread * (0.6 + 0.4 * s)) * radiusScale + wobble
      const y = (data.base[i3 + 1] + data.dir[i3 + 1] * spread * (0.6 + 0.4 * s)) * radiusScale + wobble
      const z = (data.base[i3 + 2] + data.dir[i3 + 2] * spread * (0.6 + 0.4 * s)) * radiusScale
      positions[i3] = x; positions[i3 + 1] = y; positions[i3 + 2] = z
      const pulse = 1 + 0.22 * Math.sin(t * 1.6 + s * Math.PI * 2)
      const hot = hovered.current === i ? 1.9 : 1
      dummy.position.set(x, y, z)
      dummy.scale.setScalar(0.028 * data.size[i] * pulse * hot)
      dummy.updateMatrix()
      mesh.current.setMatrixAt(i, dummy.matrix)
    }
    mesh.current.instanceMatrix.needsUpdate = true

    for (let l = 0; l < data.links.length; l++) {
      const n = data.links[l] * 3
      linePositions[l * 3] = positions[n]
      linePositions[l * 3 + 1] = positions[n + 1]
      linePositions[l * 3 + 2] = positions[n + 2]
    }
    ;(lines.current.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true

    if (hovered.current !== paintedHover.current) {
      paintColors(hovered.current)
      paintedHover.current = hovered.current
    }

    // La cámara entra en la esfera a medida que bajas.
    const targetZ = 7.2 - eased * 3.1
    camera.position.z += (targetZ - camera.position.z) * Math.min(1, dt * 4)
    camera.lookAt(0, 0, 0)
  })

  const onMove = (e: ThreeEvent<PointerEvent>) => {
    hovered.current = e.instanceId ?? -1
  }
  const onOut = () => {
    hovered.current = -1
  }

  return (
    <group ref={group}>
      <instancedMesh ref={mesh} args={[undefined, undefined, count]} onPointerMove={onMove} onPointerOut={onOut}>
        <sphereGeometry args={[1, 10, 10]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      <lineSegments ref={lines} raycast={() => null}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[lineColors, 3]} />
        </bufferGeometry>
        <lineBasicMaterial vertexColors transparent opacity={0.32} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </lineSegments>
    </group>
  )
}

export default function NeuralSphere({ progress, count, bloom }: Props) {
  return (
    <Canvas
      camera={{ position: [0, 0, 7.2], fov: 48, near: 0.1, far: 50 }}
      dpr={[1, 1.75]}
      gl={{ antialias: false, powerPreference: 'high-performance', alpha: false }}
      onCreated={({ gl }) => gl.setClearColor('#09090f')}
    >
      <Graph progress={progress} count={count} />
      {bloom && (
        <EffectComposer multisampling={0}>
          <Bloom luminanceThreshold={0.35} luminanceSmoothing={0.4} intensity={1.15} mipmapBlur radius={0.6} />
        </EffectComposer>
      )}
    </Canvas>
  )
}
