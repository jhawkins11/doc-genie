import { useRouter } from 'next/router'
import React, { forwardRef } from 'react'

const Logo = forwardRef<HTMLHeadingElement, {}>((props, ref) => {
  const router = useRouter()
  return (
    <h1
      ref={ref}
      aria-label='logo'
      className='p-5 logo text-4xl font-bold cursor-pointer animate-float transition-all duration-300 hover:scale-105 select-none'
      onClick={() => {
        router.push('/')
      }}
    >
      <span className='mr-2 text-4xl transform inline-block'>🧞</span>
      <span className='relative text-white'>
        Doc Genie
        <span className='absolute inset-0 animate-shimmer opacity-0 hover:opacity-30'></span>
      </span>
    </h1>
  )
})

Logo.displayName = 'Logo'

export default Logo
