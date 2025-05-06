import { useRouter } from 'next/router'
import React, { forwardRef } from 'react'

const Logo = forwardRef<HTMLHeadingElement, {}>((props, ref) => {
  const router = useRouter()
  return (
    <h1
      ref={ref}
      aria-label='logo'
      className='p-4 logo text-4xl font-bold cursor-pointer'
      onClick={() => {
        router.push('/')
      }}
    >
      🧞 Doc Genie
    </h1>
  )
})

Logo.displayName = 'Logo'

export default Logo
