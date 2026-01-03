import React from 'react'
import type { InfoBox } from '../types'
import FormattedText from './FormattedText'

interface InfoGridProps {
  infoBoxes: InfoBox[]
}

export const InfoGrid: React.FC<InfoGridProps> = ({ infoBoxes }) => {
  if (infoBoxes.length === 0) {
    return null
  }

  const getInfoIcon = (title: string): string => {
    if (title.toLowerCase().includes('game')) return '🎮'
    if (title.toLowerCase().includes('version') || title.toLowerCase().includes('spice')) return '📦'
    if (title.toLowerCase().includes('patch')) return '🔧'
    if (title.toLowerCase().includes('argument') || title.toLowerCase().includes('launch')) return '⚙️'
    if (title.toLowerCase().includes('config')) return '📋'
    if (title.toLowerCase().includes('hardware')) return '🖥️'
    return '💡'
  }

  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold text-white mb-4">Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {infoBoxes.map((info) => (
          <div
            key={info.id}
            className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 hover:bg-zinc-750 hover:border-zinc-600 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl flex-shrink-0">
                {getInfoIcon(info.title)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-white truncate">
                    {info.title}
                  </h4>
                  <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded uppercase font-medium border border-purple-500/30">
                    info
                  </span>
                </div>
                <div className="mb-3">
                  <FormattedText 
                    text={info.description} 
                    className="text-zinc-300" 
                  />
                </div>
                {(info.lineNumber || info.timestamp) && (
                  <div className="flex items-center gap-4 text-sm text-zinc-500">
                    {info.lineNumber && (
                      <span>Line {info.lineNumber}</span>
                    )}
                    {info.timestamp && (
                      <span>{info.timestamp}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default InfoGrid