import React from 'react'

interface FileInfoBoxProps {
  file: File
  onAnalyze?: () => void
  onChangeFile?: () => void
}

export const FileInfoBox: React.FC<FileInfoBoxProps> = ({ file, onAnalyze, onChangeFile }) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
  }

  return (
    <div className="max-w-4xl mx-auto mb-8">
      <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-3xl">📁</div>
          <h2 className="text-xl font-semibold text-white">
            Uploaded File
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-zinc-700/30 border border-zinc-600 rounded-lg p-4 transition-all duration-200 hover:bg-zinc-700/50 hover:border-zinc-500 hover:-translate-y-0.5">
            <div className="text-sm text-zinc-400 mb-1">File Name</div>
            <div className="font-semibold text-white truncate" title={file.name}>
              {file.name}
            </div>
          </div>
          
          <div className="bg-zinc-700/30 border border-zinc-600 rounded-lg p-4 transition-all duration-200 hover:bg-zinc-700/50 hover:border-zinc-500 hover:-translate-y-0.5">
            <div className="text-sm text-zinc-400 mb-1">File Type</div>
            <div className="font-semibold text-white">
              {file.type || 'Unknown'}
            </div>
          </div>
          
          <div className="bg-zinc-700/30 border border-zinc-600 rounded-lg p-4 transition-all duration-200 hover:bg-zinc-700/50 hover:border-zinc-500 hover:-translate-y-0.5">
            <div className="text-sm text-zinc-400 mb-1">File Size</div>
            <div className="font-semibold text-white">
              {formatFileSize(file.size)}
            </div>
          </div>
          
          <div className="bg-zinc-700/30 border border-zinc-600 rounded-lg p-4 transition-all duration-200 hover:bg-zinc-700/50 hover:border-zinc-500 hover:-translate-y-0.5">
            <div className="text-sm text-zinc-400 mb-1">Last Modified</div>
            <div className="font-semibold text-white text-sm">
              {formatDate(new Date(file.lastModified))}
            </div>
          </div>
        </div>
        
        <div className="mt-4 space-y-3">
          <div className="p-3 bg-green-900/20 border border-green-700/30 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span className="text-green-300 text-sm">
                File successfully uploaded and ready for analysis
              </span>
            </div>
          </div>
          
          <div className="flex justify-center gap-4">
            {onChangeFile && (
              <button
                onClick={onChangeFile}
                className="bg-zinc-600 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:-translate-y-0.5"
              >
                Change File
              </button>
            )}
            {onAnalyze && (
              <button
                onClick={onAnalyze}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
              >
                Start Analysis
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default FileInfoBox