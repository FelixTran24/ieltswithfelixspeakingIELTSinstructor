import { useEffect, useRef, useState } from 'react';
import {
  Download,
  FileAudio,
  FileText,
  Mic,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Square,
  Upload,
} from 'lucide-react';
import { formatCountdown, formatDurationUp } from '../utils/ieltsLogic';

interface AudioRecorderProps {
  targetSeconds: number;
  isAnalyzing: boolean;
  onSubmitAudio: (payload: {
    audioBlob: Blob | null;
    durationSeconds: number;
    transcriptOverride?: string;
  }) => void;
  resetSignal?: string;
}

export function AudioRecorder({
  targetSeconds,
  isAnalyzing,
  onSubmitAudio,
  resetSignal,
}: AudioRecorderProps) {
  const [inputMode, setInputMode] = useState<'mic' | 'text'>('mic');
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const [manualTranscript, setManualTranscript] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const cleanupRecordingHandles = () => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current) {
      void audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    analyserRef.current = null;
  };

  const resetAll = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    cleanupRecordingHandles();
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setIsRecording(false);
    setIsPaused(false);
    setElapsedSeconds(0);
    setAudioBlob(null);
    setAudioUrl(null);
    setMicError(null);
    setValidationError(null);
    setManualTranscript('');
  };

  useEffect(() => {
    resetAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal]);

  useEffect(() => {
    return () => {
      cleanupRecordingHandles();
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const drawWaveform = () => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      if (!analyserRef.current) return;
      analyserRef.current.getByteFrequencyData(dataArray);

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const barCount = 36;
      const step = Math.max(1, Math.floor(bufferLength / barCount));
      const barWidth = Math.max(3, Math.floor(width / barCount) - 3);

      for (let i = 0; i < barCount; i++) {
        const value = dataArray[i * step] ?? 0;
        const barHeight = Math.max(4, (value / 255) * (height - 8));
        const x = i * (barWidth + 3);
        const y = (height - barHeight) / 2;

        ctx.fillStyle = value > 130 ? '#C93B72' : '#E3B2C5';
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 3);
        ctx.fill();
      }

      rafRef.current = window.requestAnimationFrame(render);
    };

    render();
  };

  const startRecording = async () => {
    setMicError(null);
    setValidationError(null);

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setMicError(
        'Trình duyệt không hỗ trợ thu âm trực tiếp. Bạn có thể tải file ghi âm lên hoặc nhập transcript.'
      );
      return;
    }

    try {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }
      setAudioBlob(null);
      setElapsedSeconds(0);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const preferredTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'];
      const supportedType = preferredTypes.find(
        (t) => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(t)
      );

      const recorder = supportedType
        ? new MediaRecorder(stream, { mimeType: supportedType })
        : new MediaRecorder(stream);

      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const finalType = recorder.mimeType || supportedType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: finalType });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        cleanupRecordingHandles();
        setIsRecording(false);
        setIsPaused(false);
      };

      // Live visualizer setup
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const audioCtx = new AudioCtx();
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 128;
        source.connect(analyser);
        audioCtxRef.current = audioCtx;
        analyserRef.current = analyser;
      } catch {
        // Recording still works even if AudioContext visualizer is blocked
      }

      mediaRecorderRef.current = recorder;
      recorder.start(250);
      setIsRecording(true);
      setIsPaused(false);

      timerRef.current = window.setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);

      window.setTimeout(drawWaveform, 60);
    } catch {
      setMicError(
        'Chưa có quyền truy cập micro hoặc không tìm thấy thiết bị thu âm. Bạn có thể tải file audio lên hoặc chuyển sang nhập transcript.'
      );
    }
  };

  const togglePause = () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;

    if (recorder.state === 'recording') {
      recorder.pause();
      setIsPaused(true);
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    } else if (recorder.state === 'paused') {
      recorder.resume();
      setIsPaused(false);
      timerRef.current = window.setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
    }
  };

  const handleUploadAudio = (file: File | undefined) => {
    if (!file) return;
    setMicError(null);
    setValidationError(null);

    if (!file.type.startsWith('audio/')) {
      setValidationError('Vui lòng chọn tệp âm thanh hợp lệ (.mp3, .wav, .webm, .m4a).');
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      setValidationError('Tệp âm thanh vượt quá giới hạn 12MB.');
      return;
    }

    if (audioUrl) URL.revokeObjectURL(audioUrl);
    const url = URL.createObjectURL(file);
    setAudioBlob(file);
    setAudioUrl(url);

    // Inspect duration from audio metadata
    const probe = new Audio(url);
    probe.onloadedmetadata = () => {
      if (Number.isFinite(probe.duration)) {
        setElapsedSeconds(Math.round(probe.duration));
      }
    };
  };

  const handleDownloadRecording = () => {
    if (!audioBlob || !audioUrl) return;
    const ext = audioBlob.type.includes('wav')
      ? 'wav'
      : audioBlob.type.includes('mp4') || audioBlob.type.includes('m4a')
        ? 'm4a'
        : audioBlob.type.includes('mpeg') || audioBlob.type.includes('mp3')
          ? 'mp3'
          : 'webm';
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `ielts-with-felix-speaking-${new Date().toISOString().slice(0, 10)}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleAnalyzeClick = () => {
    setValidationError(null);
    if (inputMode === 'mic') {
      if (!audioBlob || audioBlob.size === 0) {
        setValidationError('Hãy ghi âm bài nói hoặc tải lên file âm thanh trước khi chấm điểm.');
        return;
      }
      onSubmitAudio({
        audioBlob,
        durationSeconds: Math.max(1, elapsedSeconds),
      });
    } else {
      const cleaned = manualTranscript.trim();
      if (cleaned.length < 15) {
        setValidationError('Vui lòng nhập ít nhất 15 ký tự tiếng Anh để đánh giá chính xác.');
        return;
      }
      const estimatedSeconds = Math.max(10, Math.round((cleaned.split(/\s+/).length / 2.2)));
      onSubmitAudio({
        audioBlob: null,
        durationSeconds: estimatedSeconds,
        transcriptOverride: cleaned,
      });
    }
  };

  const remainingSeconds = Math.max(0, targetSeconds - elapsedSeconds);
  const progressPercent = Math.min(100, Math.round((elapsedSeconds / Math.max(1, targetSeconds)) * 100));
  const isOverTime = elapsedSeconds > targetSeconds;

  return (
    <div className="bg-white border border-[#F3DCE5] rounded-xl p-5 sm:p-6 space-y-5">
      {/* Top row: Mode switch + Speaking Count-Up Duration (M:SS) & Exam Countdown */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#F8E8EE]">
        <div
          role="tablist"
          aria-label="Phương thức trả lời"
          className="inline-flex items-center p-1 bg-[#FCEBF1] rounded-lg"
        >
          <button
            type="button"
            role="tab"
            aria-selected={inputMode === 'mic'}
            onClick={() => {
              setInputMode('mic');
              setValidationError(null);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              inputMode === 'mic'
                ? 'bg-white text-[#2A1A22] shadow-sm font-semibold'
                : 'text-[#6E5662] hover:text-[#2A1A22]'
            }`}
          >
            <Mic className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Ghi âm giọng nói</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={inputMode === 'text'}
            onClick={() => {
              setInputMode('text');
              setValidationError(null);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              inputMode === 'text'
                ? 'bg-white text-[#2A1A22] shadow-sm font-semibold'
                : 'text-[#6E5662] hover:text-[#2A1A22]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Nhập transcript</span>
          </button>
        </div>

        {/* Dual Timer Readout: Primary Count-Up M:SS + Allotted Countdown */}
        <div className="flex items-center gap-5 text-sm">
          <div className="flex flex-col items-end">
            <span className="text-[11px] font-medium text-[#7A606D]">Thời lượng đã nói</span>
            <span
              data-testid="speaking-elapsed-timer"
              className="text-2xl font-semibold tracking-tight text-[#2A1A22] font-mono tabular-nums"
            >
              {formatDurationUp(elapsedSeconds)}
            </span>
          </div>

          <div className="h-8 w-px bg-[#F3DCE5]" aria-hidden="true" />

          <div className="flex flex-col items-end">
            <span className="text-[11px] font-medium text-[#7A606D]">
              {isOverTime ? 'Đã vượt mốc quy định' : 'Đếm ngược mục tiêu'}
            </span>
            <span
              data-testid="speaking-countdown-timer"
              className={`text-lg font-medium font-mono tabular-nums ${
                isOverTime
                  ? 'text-amber-600'
                  : remainingSeconds <= 10 && isRecording
                    ? 'text-rose-600'
                    : 'text-[#6E5662]'
              }`}
            >
              {isOverTime
                ? `+${formatDurationUp(elapsedSeconds - targetSeconds)}`
                : formatCountdown(remainingSeconds)}
            </span>
          </div>
        </div>
      </div>

      {/* Slim target duration progress bar */}
      <div className="space-y-1.5">
        <div className="w-full h-1.5 bg-[#FCEBF1] rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              isOverTime ? 'bg-amber-500' : isRecording ? 'bg-[#C93B72]' : 'bg-[#D99BB2]'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-[#7A606D] tabular-nums">
          <span>Bắt đầu 0:00</span>
          <span>Mốc gợi ý {formatDurationUp(targetSeconds)}</span>
        </div>
      </div>

      {inputMode === 'mic' ? (
        <div className="space-y-4">
          {/* Live recording waveform / idle deck */}
          {isRecording && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-[#FFF3F7] border border-[#F3DCE5] rounded-lg">
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className={`w-2.5 h-2.5 rounded-full ${
                    isPaused ? 'bg-amber-500' : 'bg-rose-600 animate-pulse'
                  }`}
                />
                <span className="text-sm font-medium text-[#2A1A22]">
                  {isPaused ? 'Đang tạm dừng thu âm' : 'Đang ghi âm bài nói của bạn...'}
                </span>
              </div>
              <canvas
                ref={canvasRef}
                width={260}
                height={38}
                aria-label="Sóng âm trực tiếp"
                className="w-full sm:w-[260px] h-[38px]"
              />
            </div>
          )}

          {/* Primary recording action row */}
          <div className="flex flex-wrap items-center gap-3">
            {!isRecording ? (
              <>
                <button
                  type="button"
                  onClick={() => void startRecording()}
                  disabled={isAnalyzing}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-lg transition-colors whitespace-nowrap disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-2"
                >
                  <Mic className="w-4 h-4" aria-hidden="true" />
                  <span>{audioBlob ? 'Ghi âm lại' : 'Bắt đầu ghi âm'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isAnalyzing}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#5A424E] bg-white border border-[#F3DCE5] hover:bg-[#FFF3F7] rounded-lg transition-colors whitespace-nowrap disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C93B72]"
                >
                  <Upload className="w-4 h-4 text-[#C93B72]" aria-hidden="true" />
                  <span>Tải file âm thanh</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={(e) => {
                    handleUploadAudio(e.target.files?.[0]);
                    e.target.value = '';
                  }}
                />
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={stopRecording}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#3B1F2B] hover:bg-[#4E2939] rounded-lg transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B1F2B] focus-visible:ring-offset-2"
                >
                  <Square className="w-4 h-4 fill-current" aria-hidden="true" />
                  <span>Dừng ghi âm</span>
                </button>
                <button
                  type="button"
                  onClick={togglePause}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#5A424E] bg-white border border-[#F3DCE5] hover:bg-[#FFF3F7] rounded-lg transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C93B72]"
                >
                  {isPaused ? (
                    <>
                      <Play className="w-4 h-4" aria-hidden="true" />
                      <span>Tiếp tục</span>
                    </>
                  ) : (
                    <>
                      <Pause className="w-4 h-4" aria-hidden="true" />
                      <span>Tạm dừng</span>
                    </>
                  )}
                </button>
              </>
            )}

            {(audioBlob || elapsedSeconds > 0) && !isRecording && (
              <button
                type="button"
                onClick={resetAll}
                disabled={isAnalyzing}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium text-[#6E5662] hover:text-[#2A1A22] rounded-lg transition-colors whitespace-nowrap disabled:opacity-50"
              >
                <RotateCcw className="w-4 h-4" aria-hidden="true" />
                <span>Làm mới</span>
              </button>
            )}
          </div>

          {/* Recorded audio playback + Download + Submit for AI grading */}
          {audioUrl && audioBlob && !isRecording && (
            <div className="p-4 bg-[#FFF3F7] border border-[#F3DCE5] rounded-lg space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-medium text-[#2A1A22]">
                  <FileAudio className="w-4 h-4 text-[#C93B72]" aria-hidden="true" />
                  <span>Bản ghi âm của bạn</span>
                  <span className="text-[#C7A6B5]" aria-hidden="true">·</span>
                  <span className="font-mono text-xs text-[#6E5662] tabular-nums">
                    {formatDurationUp(elapsedSeconds)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadRecording}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#5A424E] bg-white border border-[#F3DCE5] hover:bg-[#FCEBF1] rounded-md transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C93B72]"
                >
                  <Download className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Tải bản ghi âm</span>
                </button>
              </div>

              <audio
                controls
                src={audioUrl}
                className="w-full h-10"
                aria-label="Phát lại bài nói đã ghi âm"
              />
            </div>
          )}

          {micError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3" role="alert">
              {micError}
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <label htmlFor="manual-transcript-input" className="block text-sm font-medium text-[#5A424E]">
            Dán hoặc nhập câu trả lời tiếng Anh của bạn
          </label>
          <textarea
            id="manual-transcript-input"
            rows={5}
            value={manualTranscript}
            onChange={(e) => {
              setManualTranscript(e.target.value);
              setValidationError(null);
            }}
            placeholder="Ví dụ: Honestly, I really enjoy taking short seaside holidays with my family because it helps me unwind after a hectic week..."
            className="w-full rounded-lg border border-[#F3DCE5] bg-white px-4 py-3 text-sm text-[#2A1A22] placeholder:text-[#A48A97] focus:outline-none focus:ring-2 focus:ring-[#C93B72]"
          />
          <p className="text-xs text-[#7A606D]">
            Chế độ nhập chữ phù hợp khi không có micro; hệ thống vẫn chấm đủ 4 tiêu chí (điểm nguyên 0–9), gợi ý Coherence & Connectors và lưu ý các từ dễ sai IPA.
          </p>
        </div>
      )}

      {validationError && (
        <p className="text-sm text-red-600" role="alert">
          {validationError}
        </p>
      )}

      {/* Primary Submit Evaluation CTA */}
      <div className="pt-3 border-t border-[#F8E8EE] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-xs text-[#7A606D] max-w-md leading-relaxed">
          Chấm điểm chuẩn IELTS (4 tiêu chí điểm nguyên 0–9), đánh giá phát âm công tâm theo micro, gợi ý Coherence & Connectors.
        </p>
        <button
          type="button"
          onClick={handleAnalyzeClick}
          disabled={isAnalyzing || isRecording}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#C93B72] hover:bg-[#B12F62] active:bg-[#982552] rounded-lg transition-colors whitespace-nowrap shrink-0 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C93B72] focus-visible:ring-offset-2"
        >
          <Sparkles className="w-4 h-4" aria-hidden="true" />
          <span>{isAnalyzing ? 'Đang chấm điểm & phân tích...' : 'Chấm điểm & Phân tích bài nói'}</span>
        </button>
      </div>
    </div>
  );
}
