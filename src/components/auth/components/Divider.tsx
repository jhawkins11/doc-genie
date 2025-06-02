import React from 'react'

/**
 * Divider component in auth modal
 */
const Divider: React.FC = () => (
  <div className='relative'>
    <div className='absolute inset-0 flex items-center'>
      <div className='w-full border-t border-white/10' />
    </div>
    <div className='relative flex justify-center text-sm'>
      <span className='px-2 bg-black/40 text-white/60'>or</span>
    </div>
  </div>
)

export default Divider
