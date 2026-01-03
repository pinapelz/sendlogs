import React from 'react'

interface FileUploadProps {
  onFileUpload: (file: File) => void
  dragActive: boolean
  onDragStateChange: (active: boolean) => void
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileUpload,
  dragActive,
  onDragStateChange
}) => {
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      onDragStateChange(true)
    } else if (e.type === 'dragleave') {
      onDragStateChange(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onDragStateChange(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileUpload(e.dataTransfer.files[0])
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0])
    }
  }

  const handleButtonClick = () => {
    const input = document.getElementById('file-upload') as HTMLInputElement
    if (input) {
      input.click()
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div
        className={`
          relative overflow-hidden
          bg-zinc-800 border-2 border-dashed border-zinc-600 rounded-xl p-12 text-center
          transition-all duration-300 ease-in-out
          hover:border-zinc-500 hover:bg-zinc-750
          ${dragActive
            ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/25'
            : 'hover:shadow-md'
          }
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {dragActive && (
          <div className="absolute inset-0 bg-gradient-radial from-purple-500/20 via-transparent to-transparent pointer-events-none" />
        )}

        <div className="relative z-10">
          <div className="text-6xl mb-4">📁</div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Drop files to be analyzed here!
          </h3>
          <p className="text-zinc-400 mb-6">
            Or click to browse and select files
          </p>

          <input
            type="file"
            onChange={handleInputChange}
            accept=".log,.txt,.out"
            className="hidden"
            id="file-upload"
          />

          <button
            onClick={handleButtonClick}
            className="
              inline-block bg-gradient-to-r from-purple-500 to-purple-600
              text-white px-6 py-3 rounded-lg font-semibold
              transition-all duration-200 ease-in-out
              hover:from-purple-600 hover:to-purple-700 hover:-translate-y-0.5 hover:shadow-lg
              active:translate-y-0 active:shadow-md
              focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-zinc-800
            "
            type="button"
          >
            Choose File
          </button>

        </div>
      </div>
    </div>
  )
}

export default FileUpload
