import React from 'react'

interface StyledInputProps {
  label: string
  type: string
  value: string
  onChange: (value: string) => void
  onKeyDown?: (e: React.KeyboardEvent) => void
  placeholder?: string
}

const StyledInput: React.FC<StyledInputProps> = ({
  label,
  type,
  value,
  onChange,
  onKeyDown,
  placeholder,
}) => (
  <div className='space-y-2'>
    <label className='block text-sm font-medium text-white/80'>{label}</label>
    <div className='relative group'>
      <div className='absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-xl blur opacity-20 group-hover:opacity-30 group-focus-within:opacity-40 transition duration-300' />
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className='relative w-full px-4 py-3 bg-black/40 backdrop-blur-xl border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 outline-none placeholder-gray-400 transition-all duration-300 hover:bg-black/50 text-white'
      />
    </div>
  </div>
)

export default StyledInput
