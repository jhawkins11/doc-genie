import { useRouter } from 'next/router'
import React, { forwardRef } from 'react'
import { useDarkMode } from '@/contexts/DarkModeContext'

const Logo = forwardRef<HTMLHeadingElement, {}>((props, ref) => {
  const router = useRouter()
  const { isDarkMode } = useDarkMode()

  return (
    <h1
      ref={ref}
      aria-label='logo'
      className='p-5 logo text-4xl font-bold cursor-pointer transition-all duration-300 hover:opacity-80 select-none'
      onClick={() => {
        router.push('/')
      }}
    >
      <span className='mr-2 text-4xl transform inline-block'>🧞</span>
      <span className='relative text-white'>Doc Genie</span>
    </h1>
  )
})

Logo.displayName = 'Logo'

export default Logo
