export type IssueType = 'error' | 'warning' | 'suggestion'
export type InfoType = 'info'
export type LogType = 'SPICE2X' | 'UNKNOWN' | 'SPICETOOLS'

export interface LogIssue {
  id: number
  type: IssueType
  title: string
  description: string
  lineNumber?: number
  timestamp?: string
}

export interface InfoBox {
  id: number
  type: InfoType
  title: string
  description: string
  lineNumber?: number
  timestamp?: string
}

export type LogEntry = LogIssue | InfoBox

export interface AnalysisResult {
  fileName: string
  totalLines: number
  issues: LogIssue[]
  infoBoxes: InfoBox[]
  analysisType: string
}

export interface UploadState {
  isAnalyzing: boolean
  uploadedFile: File | null
  analysisResult: AnalysisResult | null
  dragActive: boolean
}
