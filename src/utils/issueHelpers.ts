import type { IssueType } from '../types'

export const getIssueIcon = (type: IssueType): string => {
  switch (type) {
    case 'error':
      return '🔴'
    case 'warning':
      return '🟡'
    case 'suggestion':
      return '💡'
    default:
      return '❓'
  }
}

export const getIssueColor = (type: IssueType): string => {
  switch (type) {
    case 'error':
      return 'border-l-4 border-l-red-500'
    case 'warning':
      return 'border-l-4 border-l-yellow-500'
    case 'suggestion':
      return 'border-l-4 border-l-blue-500'
    default:
      return 'border-l-4 border-l-gray-500'
  }
}

export const getIssueTypeColor = (type: IssueType): string => {
  switch (type) {
    case 'error':
      return 'text-red-400'
    case 'warning':
      return 'text-yellow-400'
    case 'suggestion':
      return 'text-blue-400'
    default:
      return 'text-gray-400'
  }
}

export const getIssueStats = (issues: Array<{ type: IssueType }>) => {
  return {
    errors: issues.filter(issue => issue.type === 'error').length,
    warnings: issues.filter(issue => issue.type === 'warning').length,
    suggestions: issues.filter(issue => issue.type === 'suggestion').length,
    total: issues.length
  }
}
