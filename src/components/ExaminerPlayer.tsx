import { useEffect, useRef, useState } from 'react';
import { Loader2, Square, Volume2 } from 'lucide-react';
import { fetchExaminerSpeechUrl } from '../services/api';
import type { ExaminerVoice } from '../types/ielts';

interface ExaminerPlayerProps {
  text: string;
  voice: ExaminerVoice;
  onVoiceChange?: (voice: ExaminerVoice) => void;
  autoPlayKey?: string;
  compact?: boolean;
  label?: string;
}

const VOICE_OPTIONS: Array<{ value: ExaminerVoice; label: string }> = [
  { value: 'Kore', label: 'Giám khảo Nữ · Kore' },
  { value: 'Charon', label: 'Giám khảo Nam · Charon' },
  { value: 'Zephyr', label: 'Giám khảo Nữ · Zephyr' },
  { value: 'Puck', label: 'Giám khảo Nam · Puck' },
];

export function ExaminerPlayer({
  text,
  voice,
  onVoiceChange,
  autoPlayKey,
  compact = false,
  label = 'Nghe giám khảo đọc',
}: ExaminerPlayerProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'playing'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastAutoPlayedRef = useRef<string | undefined>(undefined);

  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setStatus('idle');
  };

  useEffect(() => {
    return () => {
      stopPlayback();
    };
  }, []);

  const playSpeech = async (silentFallback = false) => {
    if (!text.trim()) return;
    stopPlayback();
    setErrorMsg(null);
    setStatus('loading');

    try {
      const url = await fetchExaminerSpeechUrl({
        text,
        voiceName: voice,
      });

      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => setStatus('idle');
      audio.onerror = () => {
        setStatus('idle');
        setErrorMsg('Không thể phát tệp âm thanh.');
      };

      await audio.play();
      setStatus('playing');
    } catch (err) {
      // Fallback gracefully to browser SpeechSynthesis so examiner audio always works
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-GB';
        utterance.rate = 0.94;
        utterance.onend = () => setStatus('idle');
        utterance.onerror = () => {
          setStatus('idle');
          if (!silentFallback) {
            setErrorMsg(
              err instanceof Error ? err.message : 'Không thể phát giọng đọc giám khảo.'
            );
          }
        };
        window.speechSynthesis.speak(utterance);
        setStatus('playing');
      } else {
        setStatus('idle');
        if (!silentFallback) {
          setErrorMsg(
            err instanceof Error ? err.message : 'Không thể phát giọng đọc giám khảo.'
          );
        }
      }
    }
  };

  useEffect(() => {
    if (autoPlayKey && autoPlayKey !== lastAutoPlayedRef.current) {
      lastAutoPlayedRef.current = autoPlayKey;
      void playSpeech(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlayKey]);

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => (status === 'playing' ? stopPlayback() : void playSpeech())}
        disabled={status === 'loading'}
        aria-label={status === 'playing' ? 'Dừng phát âm' : `${label}: ${text}`}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#5A424E] bg-[#FCEBF1] hover:bg-[#F8DAE5] rounded-md transition-colors whitespace-nowrap shrink-0 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C93B72]"
      >
        {status === 'loading' ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C93B72]" aria-hidden="true" />
        ) : status === 'playing' ? (
          <Square className="w-3 h-3 fill-current text-[#C93B72]" aria-hidden="true" />
        ) : (
          <Volume2 className="w-3.5 h-3.5 text-[#C93B72]" aria-hidden="true" />
        )}
        <span>{status === 'playing' ? 'Dừng' : label}</span>
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={() => (status === 'playing' ? stopPlayback() : void playSpeech())}
        disabled={status === 'loading'}
        className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C93B72] ${
          status === 'playing'
            ? 'bg-[#FCEBF1] text-[#A6285A] border-[#EBB8CC] hover:bg-[#F8DAE5]'
            : 'bg-white text-[#2A1A22] border-[#F3DCE5] hover:bg-[#FFF3F7]'
        }`}
      >
        {status === 'loading' ? (
          <Loader2 className="w-4 h-4 animate-spin text-[#C93B72]" aria-hidden="true" />
        ) : status === 'playing' ? (
          <Square className="w-3.5 h-3.5 fill-current text-[#C93B72]" aria-hidden="true" />
        ) : (
          <Volume2 className="w-4 h-4 text-[#C93B72]" aria-hidden="true" />
        )}
        <span>
          {status === 'loading'
            ? 'Đang tải giọng đọc...'
            : status === 'playing'
              ? 'Đang đọc câu hỏi · Dừng'
              : label}
        </span>
      </button>

      {onVoiceChange && (
        <label className="inline-flex items-center gap-2 text-xs text-[#7A606D]">
          <span className="sr-only">Chọn giọng giám khảo</span>
          <select
            value={voice}
            onChange={(e) => onVoiceChange(e.target.value as ExaminerVoice)}
            aria-label="Chọn giọng giám khảo"
            className="bg-white border border-[#F3DCE5] rounded-lg px-3 py-2 text-xs font-medium text-[#5A424E] focus:outline-none focus:ring-2 focus:ring-[#C93B72]"
          >
            {VOICE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      )}

      {errorMsg && (
        <span className="text-xs text-red-600" role="alert">
          {errorMsg}
        </span>
      )}
    </div>
  );
}
