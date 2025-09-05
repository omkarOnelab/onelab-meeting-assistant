import { useState, useEffect, useCallback } from 'react';
import { transcriptsService } from '../services/transcriptsService';
import type { Transcript, ParsedTranscript, TranscriptionItem, ActionItem } from '../types/transcripts';

export const useTranscripts = (userId: string | null) => {
  const [transcripts, setTranscripts] = useState<ParsedTranscript[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper function to parse JSON strings safely
  const parseJsonSafely = <T>(jsonString: string, fallback: T): T => {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return fallback;
    }
  };

  // Helper function to convert Transcript to ParsedTranscript
  const parseTranscript = (transcript: Transcript): ParsedTranscript => {
    return {
      ...transcript,
      transcription: parseJsonSafely<TranscriptionItem[]>(transcript.transcription, []),
      actionItem: parseJsonSafely<ActionItem[]>(transcript.actionItem, [])
    };
  };

  const fetchTranscripts = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await transcriptsService.getTranscripts(userId);
      const parsedTranscripts = response.data.map(parseTranscript);
      setTranscripts(parsedTranscripts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transcripts');
      setTranscripts([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchTranscripts();
  }, [fetchTranscripts]);

  return {
    transcripts,
    loading,
    error,
    refetch: fetchTranscripts
  };
};
