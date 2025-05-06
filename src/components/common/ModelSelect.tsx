import React from 'react'
import cn from 'classnames'
const ModelSelect = ({
  model,
  setModel,
  className,
}: {
  model: string
  setModel: (model: string) => void
  className?: string
}) => {
  return (
    <select
      className={cn(
        'p-4 border-2 rounded-lg max-w-lg text-white h-14 bg-black bg-opacity-60 border-gray-600 col-span-2 hover-lift transition-all duration-300 focus:border-accent-gold backdrop-blur-sm shadow-inner',
        className
      )}
      name='model'
      value={model}
      placeholder='Select AI model'
      onChange={(e) => setModel(e.target.value as any)}
      style={
        {
          background:
            "url(\"data:image/svg+xml;utf8,<svg fill='white' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'><path d='M7 10l5 5 5-5z'/></svg>\") no-repeat",
          backgroundPosition: 'right 16px top 50%',
          backgroundSize: '24px',
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          // hide original arrow icon
          '-webkit-appearance': 'none',
          appearance: 'none',
        } as React.CSSProperties
      }
    >
      <option value='gpt-4o' className='bg-gray-900'>
        GPT-4o (10s)
      </option>
      <option value='gpt-3.5-turbo' className='bg-gray-900'>
        GPT-3.5 (10s)
      </option>
      <option value='gpt-4-turbo-preview' className='bg-gray-900'>
        GPT-4.0 (45s)
      </option>
    </select>
  )
}

export default ModelSelect
