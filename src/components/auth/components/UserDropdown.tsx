import React from 'react'
import { createPortal } from 'react-dom'
import { User } from 'firebase/auth'
import Image from 'next/image'

interface UserDropdownProps {
  user: User
  dropdownPosition: { top: number; left: number }
  dropdownRef: React.RefObject<HTMLDivElement>
  onNavigateToMyDocs: () => void
  onLogout: () => void
}

/**
 * User account dropdown component
 */
const UserDropdown: React.FC<UserDropdownProps> = ({
  user,
  dropdownPosition,
  dropdownRef,
  onNavigateToMyDocs,
  onLogout,
}) => {
  const dropdownContent = (
    <div
      ref={dropdownRef}
      className='fixed z-[200] w-80 bg-black/40 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden'
      style={{
        top: dropdownPosition.top,
        left: dropdownPosition.left,
      }}
    >
      <div className='absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent' />

      <div className='px-6 py-4 border-b border-white/10'>
        <div className='flex items-center space-x-3'>
          <div className='relative'>
            <div className='w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold overflow-hidden'>
              {user.photoURL ? (
                <Image
                  src={user.photoURL}
                  alt='Avatar'
                  width={40}
                  height={40}
                  className='w-full h-full object-cover'
                />
              ) : (
                <span className='text-sm'>
                  {user.email?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className='absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 border border-black/20 rounded-full' />
          </div>
          <div className='flex-1 min-w-0'>
            <p className='text-white font-semibold text-sm truncate'>
              {user.displayName || user.email?.split('@')[0]}
            </p>
            <p className='text-white/60 text-xs truncate'>{user.email}</p>
          </div>
        </div>
      </div>

      <div className='py-2'>
        <button
          onClick={onNavigateToMyDocs}
          className='w-full px-6 py-3 text-left text-white/80 hover:text-white hover:bg-white/5 transition-all duration-200 flex items-center space-x-3 group'
        >
          <div className='w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/10 flex items-center justify-center group-hover:scale-105 transition-transform duration-200'>
            <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
              <path d='M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z' />
              <path d='M6 8h8v2H6V8zm0 3h8v1H6v-1z' />
            </svg>
          </div>
          <div className='flex-1'>
            <p className='font-medium text-sm'>My Documents</p>
            <p className='text-xs text-white/50'>View all your docs</p>
          </div>
          <svg
            className='w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity duration-200'
            fill='currentColor'
            viewBox='0 0 20 20'
          >
            <path
              fillRule='evenodd'
              d='M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z'
              clipRule='evenodd'
            />
          </svg>
        </button>

        <div className='mx-6 my-2 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent' />

        <button
          onClick={onLogout}
          className='w-full px-6 py-3 text-left text-red-300/80 hover:text-red-300 hover:bg-red-500/5 transition-all duration-200 flex items-center space-x-3 group'
        >
          <div className='w-8 h-8 rounded-lg bg-gradient-to-br from-red-500/20 to-pink-500/20 backdrop-blur-sm border border-red-400/20 flex items-center justify-center group-hover:scale-105 transition-transform duration-200'>
            <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
              <path
                fillRule='evenodd'
                d='M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z'
                clipRule='evenodd'
              />
            </svg>
          </div>
          <div className='flex-1'>
            <p className='font-medium text-sm'>Sign Out</p>
            <p className='text-xs text-white/40'>Logout of your account</p>
          </div>
        </button>
      </div>

      <div className='absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent' />
    </div>
  )

  return typeof window !== 'undefined'
    ? createPortal(dropdownContent, document.body)
    : null
}

export default UserDropdown
