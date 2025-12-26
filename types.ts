
export interface SubtitleSegment {
  index: number;
  startTime: string;
  endTime: string;
  text: string;
}

export type ProcessingStatus = 'idle' | 'uploading' | 'processing' | 'completed' | 'error';

export interface AppState {
  file: File | null;
  glossary: string[];
  status: ProcessingStatus;
  resultSrt: string | null;
  error: string | null;
}
