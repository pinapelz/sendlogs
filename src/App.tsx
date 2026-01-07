import { useState, useCallback } from 'react'
import type { UploadState } from './types'
import { analyzeLog, findLogFileType } from './utils/checkLogs'
import { Header, FileUpload, LoadingState, AnalysisResults } from './components'

function App() {
  const [uploadState, setUploadState] = useState<UploadState>({
    isAnalyzing: false,
    uploadedFile: null,
    analysisResult: null,
    dragActive: false
  })

  const handleFileUpload = useCallback(async (file: File) => {
    const logMetadata = await findLogFileType(file)

    if(logMetadata.type === "SPICETOOLS") {
      alert('SpiceTools is deprecated and unsupported. Use spice2x instead https://spice2x.github.io/')
      return
    }

    if (!logMetadata || logMetadata.type === "UNKNOWN") {
      alert('Unknown Log Format')
      return
    }

    setUploadState(prev => ({
      ...prev,
      uploadedFile: file,
      isAnalyzing: true,
      analysisResult: null
    }))

    try {
      const result = await analyzeLog(logMetadata.type, logMetadata.lineCount, file)
      setUploadState(prev => ({
        ...prev,
        analysisResult: result,
        isAnalyzing: false
      }))
    } catch (error) {
      console.error('Analysis failed:', error)
      alert('Failed to analyze log file. Please try again.')
      setUploadState(prev => ({
        ...prev,
        isAnalyzing: false
      }))
    }
  }, [])

  const handleDragStateChange = useCallback((active: boolean) => {
    setUploadState(prev => ({
      ...prev,
      dragActive: active
    }))
  }, [])

  const resetAnalysis = useCallback(() => {
    setUploadState({
      isAnalyzing: false,
      uploadedFile: null,
      analysisResult: null,
      dragActive: false
    })
  }, [])

  const showUpload = !uploadState.uploadedFile && !uploadState.isAnalyzing && !uploadState.analysisResult
  const showLoading = uploadState.isAnalyzing
  const showResults = uploadState.analysisResult && !uploadState.isAnalyzing

  return (
    <div className="min-h-screen bg-zinc-900">
      <div className="container mx-auto px-4 py-8">
        <Header />

        {showUpload && (
          <FileUpload
            onFileUpload={handleFileUpload}
            dragActive={uploadState.dragActive}
            onDragStateChange={handleDragStateChange}
          />
        )}

        {showLoading && (
          <LoadingState fileName={uploadState.uploadedFile?.name} />
        )}

        {showResults && uploadState.analysisResult && uploadState.uploadedFile && (
          <AnalysisResults
            result={uploadState.analysisResult}
            file={uploadState.uploadedFile}
            onReset={resetAnalysis}
          />
        )}
      </div>
    </div>
  )
}

export default App
