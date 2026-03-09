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
      camera={{ position: [150, 150, 150], fov: 50 }}
    >
      <color attach="background" args={['#1a1a2e']} />

      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1} color="#ffffff" />
      <directionalLight position={[-5, 5, -5]} intensity={0.3} color="#00d4ff" />

      {/* Ground plane grid */}
      <gridHelper args={[200, 20, '#00d4ff', '#2a2a4e']} />

      {/* Camera controls */}
      <OrbitControls makeDefault />

      {/* User content */}
      {children}
    </Canvas>
  )
}
