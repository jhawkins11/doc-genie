import React from 'react'
import { createPortal } from 'react-dom'
import FloatingParticles from './FloatingParticles'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null

  const modalContent = (
    <div className='fixed inset-0 z-[300] flex items-center justify-center p-4'>
      <div
        className='absolute inset-0 bg-black/60 backdrop-blur-md'
        onClick={onClose}
      >
        <div className='absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-pink-900/20' />
        <FloatingParticles />
      </div>

      <div className='relative w-full max-w-md mx-auto'>
        <div className='absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl blur opacity-30 animate-pulse-slow' />

        <div className='relative bg-black/40 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden'>
          <div className='absolute top-0 left-1/2 transform -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent' />

          <div className='px-8 py-6 border-b border-white/10'>
            <div className='flex items-center justify-between'>
              <h2 className='text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent'>
                {title}
              </h2>
              <button
                onClick={onClose}
                className='p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 group'
              >
                <svg
                  className='w-5 h-5 text-white/60 group-hover:text-white transition-colors duration-300'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path
                    fillRule='evenodd'
                    d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                    clipRule='evenodd'
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className='px-8 py-6'>{children}</div>

          <div className='absolute bottom-0 left-1/2 transform -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent' />
        </div>
      </div>
    </div>
  )

  return typeof window !== 'undefined'
    ? createPortal(modalContent, document.body)
    : null
}

export default Modal
