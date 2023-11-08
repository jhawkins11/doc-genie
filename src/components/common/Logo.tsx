import { useRouter } from 'next/router'
import React from 'react'

const Logo = () => {
  const router = useRouter()
  return (
    <h1
      className='p-4 logo text-4xl font-bold cursor-pointer'
      onClick={() => {
        router.push('/')
      }}
    >
      🧞 Doc Genie
    </h1>
  )
}

export default Logo
