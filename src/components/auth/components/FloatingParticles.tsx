import React from 'react'

interface FloatingParticlesProps {
  count?: number
}

/**
 * Floating particles component for background animation
 */
const FloatingParticles: React.FC<FloatingParticlesProps> = ({ count = 8 }) => (
  <>
    {[...Array(count)].map((_, i) => (
      <div
        key={i}
        className='absolute animate-float-magical'
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 3}s`,
          animationDuration: `${4 + Math.random() * 2}s`,
        }}
      >
        <div className='w-1 h-1 bg-white/30 rounded-full' />
      </div>
    ))}
  </>
)

export default React.memo(FloatingParticles)
