import type {
  ExaminerVoice,
  SpeakingAnalysisResult,
  SpeakingPart,
} from '../types/ielts';

const ttsCache = new Map<string, string>();

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      const commaIdx = result.indexOf(',');
      resolve(commaIdx >= 0 ? result.slice(commaIdx + 1) : result);
    };
    reader.onerror = () => reject(new Error('Không thể đọc dữ liệu ghi âm.'));
    reader.readAsDataURL(blob);
  });
}

export async function fetchExaminerSpeechUrl(params: {
  text: string;
  voiceName: ExaminerVoice;
  style?: string;
}): Promise<string> {
  const cacheKey = `${params.voiceName}::${params.style ?? ''}::${params.text.trim()}`;
  const existing = ttsCache.get(cacheKey);
  if (existing) return existing;

  const response = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.error || `Không thể tạo giọng đọc giám khảo (HTTP ${response.status}).`);
  }

  const data: { audioBase64: string; mimeType: string } = await response.json();
  const binary = atob(data.audioBase64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: data.mimeType || 'audio/wav' });
  const objectUrl = URL.createObjectURL(blob);
  ttsCache.set(cacheKey, objectUrl);
  return objectUrl;
}

export async function analyzeSpeakingSubmission(params: {
  audioBlob?: Blob | null;
  transcriptOverride?: string;
  question: string;
  part: SpeakingPart;
  topic: string;
  durationSeconds: number;
  cuePoints?: string[];
}): Promise<SpeakingAnalysisResult> {
  let audioBase64: string | undefined;
  let mimeType: string | undefined;

  if (params.audioBlob && params.audioBlob.size > 0) {
    audioBase64 = await blobToBase64(params.audioBlob);
    // Normalize codec suffixes like "audio/webm;codecs=opus" -> "audio/webm"
    mimeType = (params.audioBlob.type || 'audio/webm').split(';')[0].trim();
  }

  const response = await fetch('/api/analyze-speaking', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      audioBase64,
      mimeType,
      transcriptOverride: params.transcriptOverride,
      question: params.question,
      part: params.part,
      topic: params.topic,
      durationSeconds: params.durationSeconds,
      cuePoints: params.cuePoints,
    }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.error || `Phân tích bài nói thất bại (HTTP ${response.status}).`);
  }

  return (await response.json()) as SpeakingAnalysisResult;
}
