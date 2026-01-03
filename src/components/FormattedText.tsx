import React from 'react'

interface FormattedTextProps {
  text: string
  className?: string
}

export const FormattedText: React.FC<FormattedTextProps> = ({ text, className = '' }) => {
  // Check if text contains newlines for multiline formatting
  const isMultiline = text.includes('\n')
  
  if (!isMultiline) {
    return <span className={className}>{text}</span>
  }

  // Split text into lines and format
  const lines = text.split('\n').filter(line => line.trim() !== '')
  
  // Check if it looks like structured data (contains colons or equals signs)
  const isStructured = lines.some(line => line.includes(':') || line.includes('='))
  
  if (isStructured) {
    return (
      <div className={`max-w-full overflow-x-auto ${className}`}>
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 font-mono text-sm">
          {lines.map((line, index) => {
            const trimmedLine = line.trim()
            
            // Handle header lines (emojis or special formatting)
            if (trimmedLine.startsWith('🔧') || trimmedLine.match(/^[A-Z][a-zA-Z\s]+$/)) {
              return (
                <div key={index} className="text-white font-semibold mb-2">
                  {trimmedLine}
                </div>
              )
            }
            
            // Handle key-value pairs with colons
            if (trimmedLine.includes(':') && !trimmedLine.startsWith('-')) {
              const [key, ...valueParts] = trimmedLine.split(':')
              const value = valueParts.join(':').trim()
              return (
                <div key={index} className="flex mb-1">
                  <span className="text-zinc-400 font-medium mr-2 min-w-0 flex-shrink-0">
                    {key.trim()}:
                  </span>
                  <span className="text-white break-all">{value}</span>
                </div>
              )
            }
            
            // Handle key-value pairs with equals signs
            if (trimmedLine.includes('=')) {
              const [key, ...valueParts] = trimmedLine.split('=')
              const value = valueParts.join('=').trim()
              return (
                <div key={index} className="flex mb-1">
                  <span className="text-zinc-400 font-medium mr-2 min-w-0 flex-shrink-0">
                    {key.trim()} =
                  </span>
                  <span className="text-white break-all">{value}</span>
                </div>
              )
            }
            
            // Handle command line arguments or list items
            if (trimmedLine.startsWith('-')) {
              return (
                <div key={index} className="text-zinc-500 mb-1 pl-2 border-l-2 border-purple-500">
                  <code className="text-purple-300 bg-purple-500/10 px-1 rounded text-sm">
                    {trimmedLine}
                  </code>
                </div>
              )
            }
            
            // Default line formatting
            return (
              <div key={index} className="text-white mb-1">
                {trimmedLine}
              </div>
            )
          })}
        </div>
      </div>
    )
  }
  
  // Simple multiline text without special formatting
  return (
    <div className={`${className}`}>
      <div className="whitespace-pre-wrap text-zinc-400 bg-zinc-900 border border-zinc-700 rounded p-3 font-mono text-sm leading-6">
        {text}
      </div>
    </div>
  )
}

export default FormattedText