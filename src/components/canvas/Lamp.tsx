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
    <Html center>
      {progress < 100 ? <div className='spinner'></div> : null}
    </Html>
  )
}

const Lamp = () => {
  const lamp = useGLTF('/genie_lamp/scene.gltf')
  return (
    <mesh>
      <hemisphereLight intensity={0.2} groundColor='black' />
      <pointLight intensity={0.2} position={[0, 5, 0]} />
      <spotLight
        position={[0, 50, 0]}
        angle={0.2}
        penumbra={0.1}
        intensity={2}
        castShadow
        shadow-mapSize={2048}
      />
      <rectAreaLight
        intensity={1}
        position={[0, -5, -5]}
        width={15}
        height={15}
        color={'#ffffff'}
      />
      <directionalLight intensity={0.5} position={[50, -140, -30]} />
      <directionalLight intensity={0.5} position={[-50, -140, -30]} />
      <directionalLight intensity={0.5} position={[0, -140, 50]} />
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
