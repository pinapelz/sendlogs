import type { AnalysisResult, LogType, LogIssue, InfoBox } from '../types'
import { analyzeSpice2xLogs } from './analyzeSpice2x';

export const analyzeLog = async (logType: LogType, lineCount: number, file: File): Promise<AnalysisResult> => {
  switch(logType){
    case 'SPICE2X': {
      const spiceResults = await analyzeSpice2xLogs(file)
      const issues = spiceResults.filter(result => result.type !== 'info')
      const infoBoxes = spiceResults.filter(result => result.type === 'info')

      return {
        fileName: file.name,
        totalLines: lineCount,
        analysisType: '🌶️ spice2x logs',
        issues: issues as LogIssue[],
        infoBoxes: infoBoxes as InfoBox[],
      }
    }
    default:
      throw new Error(`Unsupported log type: ${logType}`);
  }
}

export const findLogFileType = async (file: File): Promise<{type: LogType, lineCount: number}> => {
  const validTypes = ['text/plain', 'text/log', 'application/octet-stream']
  const hasValidType = validTypes.some(type => file.type.includes(type)) || file.type === ''
  if(!hasValidType) return {type: "UNKNOWN", lineCount: 0};
  const fileContents = await file.text();
  const lineCount = fileContents.split('\n').length;
  const firstLine = fileContents.split('\n')[0];
  if(firstLine.includes('spice2x')) return {type: "SPICE2X", lineCount};
  return {type: "UNKNOWN", lineCount}
}
