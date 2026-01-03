import React from 'react'
import type { AnalysisResult } from '../types'
import { getIssueStats } from '../utils/issueHelpers'
import IssueCard from './IssueCard'
import InfoGrid from './InfoGrid'
import FileContentViewer from './FileContentViewer'

interface AnalysisResultsProps {
  result: AnalysisResult
  file: File
  onReset: () => void
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({ result, file, onReset }) => {
  const issueStats = getIssueStats(result.issues)

  return (
    <div className="max-w-6xl mx-auto">
      {/* Summary */}
      <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            Analysis Results
          </h2>
          <button
            onClick={onReset}
            className="bg-transparent text-purple-400 border border-purple-500 px-4 py-2 rounded-md font-medium hover:bg-purple-500 hover:text-white transition-all duration-200 hover:-translate-y-0.5"
          >
            Analyze Another File
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-zinc-700/30 border border-zinc-600 rounded-lg p-4 text-center transition-all duration-200 hover:bg-zinc-700/50 hover:border-zinc-500 hover:-translate-y-0.5">
            <div className="text-sm text-zinc-400">File Name</div>
            <div className="font-semibold text-white truncate" title={result.fileName}>
              {result.fileName}
            </div>
          </div>
          <div className="bg-zinc-700/30 border border-zinc-600 rounded-lg p-4 text-center transition-all duration-200 hover:bg-zinc-700/50 hover:border-zinc-500 hover:-translate-y-0.5">
            <div className="text-sm text-zinc-400">Total Lines</div>
            <div className="font-semibold text-white">{result.totalLines.toLocaleString()}</div>
          </div>
          <div className="bg-zinc-700/30 border border-zinc-600 rounded-lg p-4 text-center transition-all duration-200 hover:bg-zinc-700/50 hover:border-zinc-500 hover:-translate-y-0.5">
            <div className="text-sm text-zinc-400">Issues Found</div>
            <div className="font-semibold text-white">{issueStats.total}</div>
          </div>
          <div className="bg-zinc-700/30 border border-zinc-600 rounded-lg p-4 text-center transition-all duration-200 hover:bg-zinc-700/50 hover:border-zinc-500 hover:-translate-y-0.5">
            <div className="text-sm text-zinc-400">Analysis Type</div>
            <div className="font-semibold text-white">{result.analysisType}</div>
          </div>
        </div>

        {/* Issue Counter */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-1">
            <span className="text-red-400">●</span>
            <span className="text-zinc-300">{issueStats.errors} Errors</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-yellow-400">●</span>
            <span className="text-zinc-300">{issueStats.warnings} Warnings</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-blue-400">●</span>
            <span className="text-zinc-300">{issueStats.suggestions} Suggestions</span>
          </div>
        </div>
      </div>

      <FileContentViewer file={file} />

      {result.infoBoxes && result.infoBoxes.length > 0 && (
        <InfoGrid infoBoxes={result.infoBoxes} />
      )}

      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white">Issues & Suggestions</h3>
        {result.issues.length > 0 ? (
          result.issues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))
        ) : (
          <div className="bg-zinc-800 border rounded-lg p-8 text-center" style={{background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.3)'}}>
            <div className="text-4xl mb-4">🎉</div>
            <h4 className="text-lg font-semibold text-white mb-2">
              No Issues Found!
            </h4>
            <p className="text-zinc-400">
              Your log file appears to be clean with no errors, warnings, or issues detected.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AnalysisResults
