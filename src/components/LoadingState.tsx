import React from 'react'

interface LoadingStateProps {
  fileName?: string
  message?: string
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  fileName,
  message = "Scanning for errors, warnings, and optimization opportunities..."
}) => {
  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg p-8">
        <div className="text-6xl mb-4 animate-spin text-purple-500">
          🔍
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">
          {fileName ? `Analyzing ${fileName}` : 'Analyzing your log file'}
        </h3>
        <p className="text-zinc-400 mb-6">
          {message}
        </p>
        <div className="w-full bg-zinc-700 rounded-full h-2">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full animate-pulse w-3/4"></div>
        </div>
      </div>
    </div>
  )
}

export default LoadingState