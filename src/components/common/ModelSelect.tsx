import React from 'react'
import cn from 'classnames'
const ModelSelect = ({
  model,
  setModel,
  className,
  disabled,
}: {
  model: string
  setModel: (model: string) => void
  className?: string
  disabled?: boolean
}) => {
  return (
    <select
      className={cn(
        'p-3 border rounded-lg max-w-lg text-white h-14 bg-black bg-opacity-40 border-gray-700 col-span-2 hover-lift transition-all duration-300 focus:border-accent-gold backdrop-blur-sm shadow-inner text-sm',
        className
      )}
      name='model'
      value={model}
      placeholder='Select AI model'
      onChange={(e) => setModel(e.target.value)}
      disabled={disabled}
      style={
        {
          background:
            "url(\"data:image/svg+xml;utf8,<svg fill='%236b7280' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='20' height='20'><path d='M7 10l5 5 5-5z'/></svg>\") no-repeat",
          backgroundPosition: 'right 12px top 50%',
          backgroundSize: '20px',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          // hide original arrow icon
          '-webkit-appearance': 'none',
          appearance: 'none',
        } as React.CSSProperties
      }
    >
      <option value='perplexity/sonar-pro' className='bg-gray-900'>
        Perplexity Sonar Pro
      </option>
      <option value='google/gemini-2.5-flash-preview' className='bg-gray-900'>
        Gemini 2.5 Flash
      </option>
      <option value='google/gemini-2.5-pro-exp-03-25' className='bg-gray-900'>
        Gemini 2.5 Pro
      </option>
      <option value='openai/gpt-4.1' className='bg-gray-900'>
        GPT-4.1
      </option>
      <option value='openai/chatgpt-4o-latest' className='bg-gray-900'>
        GPT-4o Latest
      </option>
      <option value='deepseek/deepseek-chat-v3-0324' className='bg-gray-900'>
        DeepSeek Chat v3
      </option>
      <option value='anthropic/claude-3.7-sonnet' className='bg-gray-900'>
        Claude 3.7 Sonnet
      </option>
      <option value='anthropic/claude-3.5-haiku' className='bg-gray-900'>
        Claude 3.5 Haiku
      </option>
    </select>
  )
}

export default ModelSelect
