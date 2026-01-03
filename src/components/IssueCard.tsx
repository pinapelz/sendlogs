import React from 'react'
import type { LogIssue } from '../types'
import { getIssueIcon } from '../utils/issueHelpers'
import FormattedText from './FormattedText'

interface IssueCardProps {
  issue: LogIssue
}

export const IssueCard: React.FC<IssueCardProps> = ({ issue }) => {
  const getIssueColorClasses = (type: LogIssue['type']): string => {
    switch (type) {
      case 'error':
        return 'border-l-4 border-l-red-500 bg-red-500/5 hover:bg-red-500/10'
      case 'warning':
        return 'border-l-4 border-l-yellow-500 bg-yellow-500/5 hover:bg-yellow-500/10'
      case 'suggestion':
        return 'border-l-4 border-l-blue-500 bg-blue-500/5 hover:bg-blue-500/10'
      default:
        return 'border-l-4 border-l-gray-500 bg-gray-500/5 hover:bg-gray-500/10'
    }
  }

  const getIssueTypeColor = (type: LogIssue['type']): string => {
    switch (type) {
      case 'error':
        return 'bg-red-500/20 text-red-300 border-red-500/30'
      case 'warning':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      case 'suggestion':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    }
  }

  return (
    <div
      className={`
        bg-zinc-800 border border-zinc-700 rounded-lg p-6 transition-all duration-200
        hover:-translate-y-1 hover:shadow-lg hover:border-zinc-600
        ${getIssueColorClasses(issue.type)}
      `}
    >
      <div className="flex items-start gap-4">
        <div className="text-2xl flex-shrink-0">
          {getIssueIcon(issue.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold text-white">
              {issue.title}
            </h4>
            <span className={`
              text-xs px-2 py-1 rounded uppercase font-medium border
              ${getIssueTypeColor(issue.type)}
            `}>
              {issue.type}
            </span>
          </div>
          <div className="mb-3">
            <FormattedText text={issue.description} className="text-zinc-300" />
          </div>
          <div className="flex items-center gap-4 text-sm text-zinc-500">
            {issue.lineNumber && (
              <span>Line {issue.lineNumber}</span>
            )}
            {issue.timestamp && (
              <span>{issue.timestamp}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default IssueCard