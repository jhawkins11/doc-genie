import { Suspense, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import {
  OrbitControls,
  Preload,
  useGLTF,
  Html,
  useProgress,
} from '@react-three/drei'

const CanvasLoader = () => {
  const { progress } = useProgress()
  return (
    <Html>
      <span className='canvas-load'></span>
      <p
        style={{
          fontSize: 14,
          color: 'f1f1f1',
          fontWeight: 800,
          marginTop: 40,
        }}
      >
        {progress.toFixed(2)}
      </p>
    </Html>
  )
}

const Lamp = () => {
  const lamp = useGLTF('/genie_lamp/scene.gltf')

  return (
    <mesh>
      <hemisphereLight intensity={0.3} groundColor='black' />
      <pointLight intensity={1.8} />
      <spotLight
        position={[45, -32, -10]}
        angle={0.12}
        penumbra={1}
        intensity={1.3}
        castShadow
        shadow-mapSize={1024}
      />
      <primitive
        object={lamp.scene}
        scale={0.07}
        position={[0, -3, -3.2]}
        rotation={[-0.01, -0.2, 0]}
      />
    </mesh>
  )
}

const LampCanvas = () => {
  return (
    <Canvas
      frameloop='demand'
      shadows
      camera={{ position: [3, 3, 5], fov: 25 }}
      gl={{ preserveDrawingBuffer: true }}
    >
      <Suspense fallback={<CanvasLoader />}>
        <OrbitControls
          enableZoom={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
        />
        <Lamp />
      </Suspense>
      <Preload all />
    </Canvas>
  )
}

export default LampCanvas
