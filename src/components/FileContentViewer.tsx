import React, { useState, useEffect } from 'react'

const highlightLine = (line: string): string => {
  if (!line) return '&nbsp;'

  let highlighted = line
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

  highlighted = highlighted.replace(
    /(\[)(\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2})(\])/g,
    '$1<span class="text-purple-400">$2</span>$3'
  )

  highlighted = highlighted.replace(
    /\] ([FECX]):/g,
    '] <span class="text-red-400 font-semibold">$1</span>:'
  )
  highlighted = highlighted.replace(
    /\] ([W]):/g,
    '] <span class="text-yellow-400 font-semibold">$1</span>:'
  )
  highlighted = highlighted.replace(
    /\] ([IM]):/g,
    '] <span class="text-blue-400 font-semibold">$1</span>:'
  )
  highlighted = highlighted.replace(
    /\] ([DTG]):/g,
    '] <span class="text-green-400 font-semibold">$1</span>:'
  )

  highlighted = highlighted.replace(
    /([FECWIMDT]):([a-zA-Z0-9_-]+):/g,
    '$1:<span class="text-cyan-400">$2</span>:'
  )

  highlighted = highlighted.replace(
    /\bhttps?:\/\/[^\s<>"]+/gi,
    '<span class="text-blue-300 underline">$&</span>'
  )

  highlighted = highlighted.replace(
    /\b[a-zA-Z0-9_-]+\.dll\b/gi,
    '<span class="text-emerald-400">$&</span>'
  )

  highlighted = highlighted.replace(
    /\s(-[a-zA-Z0-9_-]+)/g,
    ' <span class="text-orange-400">$1</span>'
  )

  highlighted = highlighted.replace(
    /\b(?:\d{1,3}\.){3}\d{1,3}(?::\d+)?\b/g,
    '<span class="text-orange-300">$&</span>'
  )

  // Hex memory addresses
  highlighted = highlighted.replace(
    /\b0x[0-9a-fA-F]+\b/g,
    '<span class="text-violet-400">$&</span>'
  )

  // Version numbers and build info
  highlighted = highlighted.replace(
    /\b\d+\.\d+(?:\.\d+)*(?:-[A-Z])?(?:-\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})?\b/g,
    '<span class="text-lime-400">$&</span>'
  )

  // Masked sensitive data (*****)
  highlighted = highlighted.replace(
    /\*{4,}/g,
    '<span class="text-gray-500">$&</span>'
  )

  // Success/failure keywords
  highlighted = highlighted.replace(
    /\b(succeeded|success|loaded|enabled)\b/gi,
    '<span class="text-green-300">$&</span>'
  )
  highlighted = highlighted.replace(
    /\b(failed|failure|error|disabled|not found)\b/gi,
    '<span class="text-red-300">$&</span>'
  )

  // Priority/performance terms
  highlighted = highlighted.replace(
    /\b(high|priority|performance)\b/gi,
    '<span class="text-yellow-300">$&</span>'
  )

  // Quoted strings
  highlighted = highlighted.replace(
    /(&quot;.*?&quot;)/g,
    '<span class="text-rose-300">$1</span>'
  )

  return highlighted
}


const highlightSearchTerm = (html: string, searchTerm: string): string => {
  if (!searchTerm) return html

  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return html.replace(regex, '<mark class="bg-yellow-400 text-black rounded px-1">$1</mark>')
}

interface FileContentViewerProps {
  file: File
}

export const FileContentViewer: React.FC<FileContentViewerProps> = ({
  file,
}) => {
  const [content, setContent] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [matchingLines, setMatchingLines] = useState<number[]>([])

  useEffect(() => {
    const readFile = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const text = await file.text()
        setContent(text)
      } catch (err) {
        setError('Failed to read file content')
        console.error('Error reading file:', err)
      } finally {
        setIsLoading(false)
      }
    }

    readFile()
  }, [file])

  useEffect(() => {
    const lines = content.split('\n')
    if (searchTerm && content) {
      const matches = lines.map((line, index) =>
        line.toLowerCase().includes(searchTerm.toLowerCase()) ? index : -1
      ).filter(index => index !== -1)
      setMatchingLines(matches)
    } else {
      setMatchingLines([])
    }
  }, [searchTerm, content])

  if (isLoading) {
    return (
      <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-2xl">📄</div>
          <h3 className="text-xl font-semibold text-white">File Content</h3>
        </div>
        <div className="text-center py-8">
          <div className="text-zinc-400">Loading file content...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-2xl">📄</div>
          <h3 className="text-xl font-semibold text-white">File Content</h3>
        </div>
        <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-4">
          <div className="text-red-400">❌ {error}</div>
        </div>
      </div>
    )
  }

  const lines = content.split('\n')

  // Filter lines based on search term
  const filteredLineIndices = searchTerm
    ? lines.map((line, index) =>
        line.toLowerCase().includes(searchTerm.toLowerCase()) ? index : -1
      ).filter(index => index !== -1)
    : lines.map((_, index) => index)

  const displayLineIndices = filteredLineIndices



  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-2xl">📄</div>
          <h3 className="text-xl font-semibold text-white">File Content</h3>
        </div>
        <div className="text-sm text-zinc-400">
          {searchTerm ? (
            `${filteredLineIndices.length} of ${lines.length.toLocaleString()} lines match`
          ) : (
            `${lines.length.toLocaleString()} lines`
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search in file content..."
            className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white placeholder-zinc-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
        {searchTerm && matchingLines.length > 0 && (
          <div className="text-sm text-zinc-400 mt-2">
            Found {matchingLines.length} matches
          </div>
        )}
        {searchTerm && matchingLines.length === 0 && (
          <div className="text-sm text-red-400 mt-2">
            No matches found
          </div>
        )}
      </div>

      <div className="relative">
        <div className="bg-zinc-900 border border-zinc-600 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between bg-zinc-800 px-4 py-2 border-b border-zinc-600">
            <div className="text-sm text-zinc-400 font-mono">{file.name}</div>
            <div className="flex gap-2">
              <button
                onClick={() => navigator.clipboard.writeText(content)}
                className="text-xs text-zinc-400 hover:text-white px-2 py-1 rounded bg-zinc-700 hover:bg-zinc-600 transition-colors"
              >
                Copy All
              </button>
            </div>
          </div>

          <div className="overflow-auto max-h-96">
            <table className="w-full text-sm font-mono">
              <tbody>
                {displayLineIndices.map((lineIndex) => {
                  const line = lines[lineIndex]
                  const highlightedLine = highlightLine(line)
                  const finalLine = searchTerm ? highlightSearchTerm(highlightedLine, searchTerm) : highlightedLine

                  return (
                    <tr key={lineIndex} className="hover:bg-zinc-800/50">
                      <td className="text-zinc-500 text-right px-3 py-1 border-r border-zinc-700 select-none w-16">
                        {lineIndex + 1}
                      </td>
                      <td className="text-zinc-300 px-3 py-1 whitespace-pre-wrap break-all">
                        <span dangerouslySetInnerHTML={{ __html: finalLine }} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FileContentViewer
