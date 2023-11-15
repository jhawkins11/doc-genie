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

const getLampProps = (screenSize: number) => {
  if (screenSize < 900) {
    return {
      position: [0, -1.5, -1],
      rotation: [-0.01, -0.2, 0],
      scale: 0.03,
    }
  } else if (screenSize < 1200) {
    return {
      position: [0, -1.8, -1.8],
      rotation: [-0.01, -0.2, 0],
      scale: 0.04,
    }
  } else {
    return {
      position: [0, -3, -3.2],
      rotation: [-0.01, -0.2, 0],
      scale: 0.07,
    }
  }
}

const Lamp = () => {
  const lamp = useGLTF('/genie_lamp/scene.gltf')
  const [lampProps, setLampProps] = useState<{
    position: number[]
    rotation: number[]
    scale: number
  }>(getLampProps(window.innerWidth))

  useEffect(() => {
    const handleResize = () => {
      const screenSize = window.innerWidth
      setLampProps(getLampProps(screenSize))
    }

    window.addEventListener('resize', handleResize)

    handleResize()

    return () => window.removeEventListener('resize', handleResize)
  }, [])

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
      <primitive object={lamp.scene} {...lampProps} />
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
