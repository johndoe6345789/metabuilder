'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

interface ThreeCanvasProps {
  children: React.ReactNode
}

export default function ThreeCanvas({ children }: ThreeCanvasProps) {
  return (
    <Canvas
      style={{ width: '100%', height: '100%' }}
      camera={{ position: [5, 5, 5], fov: 50 }}
    >
      <color attach="background" args={['#f0f0f0']} />

      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />

      {/* Ground plane grid */}
      <gridHelper args={[20, 20, '#888888', '#cccccc']} />

      {/* Camera controls */}
      <OrbitControls makeDefault />

      {/* User content */}
      {children}
    </Canvas>
  )
}
