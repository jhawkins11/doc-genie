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
        'p-3 border-2 rounded-lg max-w-lg text-gray-300 h-14 bg-black border-gray-500 col-span-2',
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
          backgroundPosition: 'right 10px top 50%',
          backgroundSize: '30px',
          // hide original arrow icon
          '-webkit-appearance': 'none',
        } as React.CSSProperties
      }
    >
      <option value='gpt-4o'>GPT-4o (10s)</option>
      <option value='gpt-3.5-turbo'>GPT-3.5 (10s)</option>
      <option value='gpt-4-turbo-preview'>GPT-4.0 (45s)</option>
    </select>
  )
}

export default ModelSelect
