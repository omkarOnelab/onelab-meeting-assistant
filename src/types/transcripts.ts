export interface TranscriptionItem {
  socket: number;
  text: string;
  highlight: boolean;
}

export interface ActionItem {
  item: string;
  owner: string;
  deadline: string;
}

export interface Transcript {
  id: number;
  userId: string;
  meetingid: string;
  transcription: string; // JSON string that needs to be parsed
  summary: string;
  actionItem: string; // JSON string that needs to be parsed
  created_at: string;
}

export interface ParsedTranscript {
  id: number;
  userId: string;
  meetingid: string;
  transcription: TranscriptionItem[];
  summary: string;
  actionItem: ActionItem[];
  created_at: string;
}
