export interface ClicheWarning {
  patternId: string;
  pattern: string;
  description: string;
  matchedText: string;
  sentence: string;
  start: number;
  end: number;
  itemCount?: number;
}

export interface ClicheAnalysis {
  warningCount: number;
  warnings: ClicheWarning[];
}

export function analyzeText(text: string): ClicheAnalysis;
