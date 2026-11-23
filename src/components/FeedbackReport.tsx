import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Download,
  FileAudio,
  Info,
  Lightbulb,
  Link2,
} from 'lucide-react';
import type {
  ExaminerVoice,
  PracticeSession,
  PronunciationWord,
} from '../types/ielts';
import { formatDurationUp } from '../utils/ieltsLogic';
import { loadRecordingBlob } from '../utils/storage';
import { ExaminerPlayer } from './ExaminerPlayer';

interface FeedbackReportProps {
  session: PracticeSession;
  voice: ExaminerVoice;
  liveAudioBlob?: Blob | null;
}

const CRITERIA_LABELS = [
  { key: 'fluencyCoherence', title: 'Fluency & Coherence', subtitleVi: 'Độ trôi chảy & mạch lạc' },
  { key: 'lexicalResource', title: 'Lexical Resource', subtitleVi: 'Vốn từ vựng & diễn đạt' },
  { key: 'grammaticalRange', title: 'Grammatical Range & Accuracy', subtitleVi: 'Ngữ pháp & độ chính xác' },
  { key: 'pronunciation', title: 'Pronunciation', subtitleVi: 'Phát âm & ngữ điệu' },
] as const;

function getStatusBadgeMeta(status: PronunciationWord['status']) {
  if (status === 'good') {
    return {
      label: 'Chuẩn',
      textClass: 'text-emerald-700',
      underlineClass: 'border-emerald-400 bg-emerald-50/70 hover:bg-emerald-100/70',
      barClass: 'bg-emerald-600',
    };
  }
  if (status === 'fair') {
    return {
      label: 'Khá · Cần tinh chỉnh',
      textClass: 'text-amber-700',
      underlineClass: 'border-amber-400 bg-amber-50/80 hover:bg-amber-100/80',
      barClass: 'bg-amber-500',
    };
  }
  return {
    label: 'Cần sửa ngay',
    textClass: 'text-red-700',
    underlineClass: 'border-red-400 bg-red-50/90 hover:bg-red-100/90',
    barClass: 'bg-red-600',
  };
}

export function FeedbackReport({ session, voice, liveAudioBlob }: FeedbackReportProps) {
  const { analysis } = session;
  const [wordFilter, setWordFilter] = useState<'all' | 'needs_fix'>('all');
  const [selectedWord, setSelectedWord] = useState<PronunciationWord | null>(
    analysis.pronunciationAnalysis.words.find((w) => w.status !== 'good') ??
      analysis.pronunciationAnalysis.words[0] ??
      null
  );
  const [storedAudioUrl, setStoredAudioUrl] = useState<string | null>(null);
  const [storedBlob, setStoredBlob] = useState<Blob | null>(null);

  useEffect(() => {
    setSelectedWord(
      analysis.pronunciationAnalysis.words.find((w) => w.status !== 'good') ??
        analysis.pronunciationAnalysis.words[0] ??
        null
    );
  }, [session.id, analysis.pronunciationAnalysis.words]);

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;

    async function hydrateAudio() {
      if (liveAudioBlob) {
        objectUrl = URL.createObjectURL(liveAudioBlob);
        if (active) {
          setStoredBlob(liveAudioBlob);
          setStoredAudioUrl(objectUrl);
        }
        return;
      }

      if (session.hasAudio) {
        const blob = await loadRecordingBlob(session.id);
        if (blob && active) {
          objectUrl = URL.createObjectURL(blob);
          setStoredBlob(blob);
          setStoredAudioUrl(objectUrl);
        }
      } else if (active) {
        setStoredBlob(null);
        setStoredAudioUrl(null);
      }
    }

    void hydrateAudio();
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [session.id, session.hasAudio, liveAudioBlob]);

  const wordMap = useMemo(() => {
    const map = new Map<string, PronunciationWord>();
    for (const item of analysis.pronunciationAnalysis.words) {
      map.set(item.word.toLowerCase().replace(/[^a-z']/g, ''), item);
    }
    return map;
  }, [analysis.pronunciationAnalysis.words]);

  const filteredWords = useMemo(() => {
    if (wordFilter === 'needs_fix') {
      return analysis.pronunciationAnalysis.words.filter((w) => w.accuracyPercent < 85);
    }
    return analysis.pronunciationAnalysis.words;
  }, [analysis.pronunciationAnalysis.words, wordFilter]);

  const handleDownloadAudio = () => {
    if (!storedBlob || !storedAudioUrl) return;
    const ext = storedBlob.type.includes('wav')
      ? 'wav'
      : storedBlob.type.includes('mp4')
        ? 'm4a'
        : 'webm';
    const link = document.createElement('a');
    link.href = storedAudioUrl;
    link.download = `ielts-with-felix-part${session.part}-${session.topicTitle.toLowerCase().replace(/\s+/g, '-')}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Tokenize transcript so analyzed words become clickable buttons
  const transcriptTokens = useMemo(() => {
    return analysis.transcript.split(/(\s+)/);
  }, [analysis.transcript]);

  return (
    <div className="space-y-8" data-testid="feedback-report">
      {/* Header Summary + Overall Band */}
      <section className="bg-white border border-[#F3DCE5] rounded-xl p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#F8E8EE]">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#7A606D]">
              <span className="font-semibold text-[#C93B72]">Part {session.part}</span>
              <span aria-hidden="true">·</span>
              <span>{session.topicTitle}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">
                Thời lượng{' '}
                <span className="font-mono text-[#5A424E]">
                  {formatDurationUp(session.durationSeconds)}
                </span>
              </span>
              <span aria-hidden="true">·</span>
              <span>{analysis.audioEvaluated ? 'Đánh giá trực tiếp từ âm thanh' : 'Đánh giá từ transcript'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#2A1A22] leading-snug">
              {session.questionText}
            </h2>
            <p className="text-sm text-[#5A424E] leading-relaxed">{analysis.generalFeedbackVi}</p>
          </div>

          <div className="flex items-center gap-6 shrink-0 bg-[#FFF3F7] border border-[#F3DCE5] rounded-xl px-6 py-4">
            <div>
              <p className="text-xs font-medium text-[#7A606D]">IELTS Overall Band</p>
              <p
                data-testid="overall-band-score"
                className="text-4xl font-extrabold text-[#C93B72] font-mono tabular-nums tracking-tight"
              >
                {analysis.overallBand.toFixed(1)}
              </p>
            </div>
            <div className="h-12 w-px bg-[#F3DCE5]" aria-hidden="true" />
            <div>
              <p className="text-xs font-medium text-[#7A606D]">Độ chuẩn phát âm</p>
              <p className="text-2xl font-bold text-[#2A1A22] font-mono tabular-nums">
                {analysis.pronunciationAnalysis.overallAccuracyPercent}%
              </p>
            </div>
          </div>
        </div>

        {/* Saved Audio Playback & Download bar */}
        {storedAudioUrl && (
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-[#FFF3F7] border border-[#F3DCE5] rounded-lg">
            <div className="flex items-center gap-2 text-sm font-medium text-[#2A1A22] shrink-0">
              <FileAudio className="w-4 h-4 text-[#C93B72]" aria-hidden="true" />
              <span>Bản ghi bài nói</span>
            </div>
            <audio
              controls
              src={storedAudioUrl}
              className="flex-1 h-9 min-w-[200px]"
              aria-label="Phát lại bài nói của phiên luyện tập này"
            />
            <button
              type="button"
              onClick={handleDownloadAudio}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#5A424E] bg-white border border-[#F3DCE5] hover:bg-[#FCEBF1] rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Tải xuống</span>
            </button>
          </div>
        )}

        {/* 4 Official IELTS Criteria Grid (Strict Whole-Integer 0-9 Scale) */}
        <div className="mt-6 space-y-3">
          <p className="text-xs text-[#7A606D]">
            Điểm từng tiêu chí được chấm theo số nguyên chuẩn IELTS (0–9); phần Pronunciation được cân nhắc công tâm theo chất lượng micro của thiết bị.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {CRITERIA_LABELS.map(({ key, title, subtitleVi }) => {
              const item = analysis.criteria[key];
              const wholeBand = Math.round(item.band);
              return (
                <div
                  key={key}
                  className="p-5 bg-[#FFF8FA] border border-[#F3DCE5] rounded-xl space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-[#2A1A22]">{title}</h3>
                      <p className="text-xs text-[#7A606D]">{subtitleVi}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span
                        data-testid={`criterion-band-${key}`}
                        className="text-2xl font-bold text-[#C93B72] font-mono tabular-nums"
                      >
                        {wholeBand}
                      </span>
                      <span className="text-xs font-mono text-[#9A7F8D] ml-0.5">/9</span>
                    </div>
                  </div>

                  <p className="text-sm text-[#4A3440] leading-relaxed">{item.summaryVi}</p>

                  {item.strengthsVi.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-emerald-700">Điểm mạnh</p>
                      <ul className="space-y-1 text-xs text-[#5A424E]">
                        {item.strengthsVi.map((s, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {item.improvementsVi.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-amber-700">Cần cải thiện</p>
                      <ul className="space-y-1 text-xs text-[#5A424E]">
                        {item.improvementsVi.map((imp, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
                            <span>{imp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 2: Transcript & Word-by-Word Pronunciation + IPA Inspector */}
      <section className="bg-white border border-[#F3DCE5] rounded-xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#F8E8EE] pb-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-[#2A1A22]">
              Transcript & Phân tích phát âm từng từ (IPA)
            </h3>
            <p className="text-sm text-[#5A424E]">
              {analysis.pronunciationAnalysis.summaryVi}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs text-[#5A424E]">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" aria-hidden="true" />
              Chuẩn (85–100%)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" aria-hidden="true" />
              Khá (65–84%)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-red-500" aria-hidden="true" />
              Cần sửa (&lt;65%)
            </span>
          </div>
        </div>

        {/* Interactive Transcript + Selected Word Detail Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 space-y-3">
            <p className="text-xs font-medium text-[#7A606D]">
              Nhấn vào các từ được đánh dấu trong transcript để xem phiên âm IPA, phần trăm chuẩn và mẹo sửa:
            </p>
            <div className="p-5 bg-[#FFF8FA] border border-[#F3DCE5] rounded-xl text-base leading-8 text-[#2A1A22]">
              {transcriptTokens.map((token, idx) => {
                const clean = token.toLowerCase().replace(/[^a-z']/g, '');
                const matched = clean ? wordMap.get(clean) : undefined;
                if (!matched) {
                  return <span key={idx}>{token}</span>;
                }
                const meta = getStatusBadgeMeta(matched.status);
                const isSelected = selectedWord?.word === matched.word;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedWord(matched)}
                    className={`inline px-1 py-0.5 rounded border-b-2 transition-colors font-medium text-[#2A1A22] ${meta.underlineClass} ${
                      isSelected ? 'ring-2 ring-[#C93B72] ring-offset-1' : ''
                    }`}
                  >
                    {token}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Focused Word Pronunciation Inspector */}
          <div className="lg:col-span-5">
            {selectedWord ? (
              <div className="p-5 bg-white border border-[#F3DCE5] rounded-xl space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-[#7A606D]">Từ chuẩn cần đọc</p>
                    <p className="text-2xl font-bold text-[#2A1A22]">{selectedWord.word}</p>
                    <p className="text-sm font-mono text-[#B12F62] mt-0.5">{selectedWord.ipa}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#7A606D]">Độ chính xác</p>
                    <p className="text-2xl font-bold font-mono tabular-nums text-[#2A1A22]">
                      {selectedWord.accuracyPercent}%
                    </p>
                    <p className={`text-xs font-semibold ${getStatusBadgeMeta(selectedWord.status).textClass}`}>
                      {getStatusBadgeMeta(selectedWord.status).label}
                    </p>
                  </div>
                </div>

                {selectedWord.heardAs && (
                  <div className="p-3 bg-red-50/70 border border-red-200 rounded-lg text-xs text-[#4A3440] flex items-center gap-2">
                    <Info className="w-4 h-4 text-red-600 shrink-0" aria-hidden="true" />
                    <span>
                      Dự đoán bạn đã đọc gần giống:{' '}
                      <strong className="font-mono text-red-700">&ldquo;{selectedWord.heardAs}&rdquo;</strong>
                      {' '}→ Cần sửa thành{' '}
                      <strong className="text-[#2A1A22]">{selectedWord.word}</strong> ({selectedWord.ipa})
                    </span>
                  </div>
                )}

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-[#5A424E]">Hướng dẫn sửa phát âm</p>
                  <p className="text-sm text-[#5A424E] leading-relaxed">{selectedWord.fixTip}</p>
                </div>

                <ExaminerPlayer
                  text={selectedWord.word}
                  voice={voice}
                  compact
                  label="Nghe phát âm chuẩn"
                />
              </div>
            ) : (
              <div className="p-5 bg-[#FFF8FA] border border-[#F3DCE5] rounded-xl text-sm text-[#7A606D]">
                Chọn một từ bất kỳ để xem chi tiết phát âm IPA.
              </div>
            )}
          </div>
        </div>

        {/* Full Word-by-Word Pronunciation Accuracy Table */}
        {analysis.pronunciationAnalysis.words.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h4 className="text-sm font-bold text-[#2A1A22]">
                Bảng kiểm tra độ chính xác từng từ ({filteredWords.length} từ)
              </h4>
              <div className="inline-flex items-center p-1 bg-[#FCEBF1] rounded-lg">
                <button
                  type="button"
                  onClick={() => setWordFilter('all')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    wordFilter === 'all'
                      ? 'bg-white text-[#2A1A22] shadow-sm font-semibold'
                      : 'text-[#6E5662] hover:text-[#2A1A22]'
                  }`}
                >
                  Tất cả ({analysis.pronunciationAnalysis.words.length})
                </button>
                <button
                  type="button"
                  onClick={() => setWordFilter('needs_fix')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    wordFilter === 'needs_fix'
                      ? 'bg-white text-[#2A1A22] shadow-sm font-semibold'
                      : 'text-[#6E5662] hover:text-[#2A1A22]'
                  }`}
                >
                  Cần sửa ({analysis.pronunciationAnalysis.words.filter((w) => w.accuracyPercent < 85).length})
                </button>
              </div>
            </div>

            <div className="overflow-x-auto border border-[#F3DCE5] rounded-xl">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-[#FFF3F7] border-b border-[#F3DCE5] text-xs font-semibold text-[#5A424E]">
                    <th className="py-3 px-4">Từ chuẩn</th>
                    <th className="py-3 px-4">Phiên âm IPA</th>
                    <th className="py-3 px-4">Dự đoán đã đọc</th>
                    <th className="py-3 px-4">Độ chính xác</th>
                    <th className="py-3 px-4">Gợi ý sửa lỗi</th>
                    <th className="py-3 px-4 text-right">Nghe</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F8E8EE]">
                  {filteredWords.map((w, idx) => {
                    const meta = getStatusBadgeMeta(w.status);
                    return (
                      <tr
                        key={`${w.word}-${idx}`}
                        onClick={() => setSelectedWord(w)}
                        className="hover:bg-[#FFF8FA] transition-colors cursor-pointer"
                      >
                        <td className="py-3 px-4 font-semibold text-[#2A1A22] whitespace-nowrap">
                          {w.word}
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-[#B12F62] whitespace-nowrap">
                          {w.ipa}
                        </td>
                        <td className="py-3 px-4 text-xs text-[#5A424E] whitespace-nowrap">
                          {w.heardAs ? (
                            <span className="font-mono text-red-700">{w.heardAs}</span>
                          ) : (
                            <span className="text-[#9A7F8D]">Rõ ràng</span>
                          )}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className="w-16 h-1.5 bg-[#FCEBF1] rounded-full overflow-hidden">
                              <div
                                className={`h-full ${meta.barClass}`}
                                style={{ width: `${w.accuracyPercent}%` }}
                              />
                            </div>
                            <span className={`font-mono text-xs font-semibold tabular-nums ${meta.textClass}`}>
                              {w.accuracyPercent}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-xs text-[#5A424E] max-w-xs">
                          {w.fixTip}
                        </td>
                        <td
                          className="py-3 px-4 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExaminerPlayer text={w.word} voice={voice} compact label="Nghe" />
                        </td>
                      </tr>
                    );
                  })}
                  {filteredWords.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-sm text-[#7A606D]">
                        Tuyệt vời — không có từ nào dưới ngưỡng 85% trong bài nói này.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Section 3: Coherence Booster — Idea Extensions & Natural Spoken Connectors */}
      {analysis.coherenceBoost &&
        (analysis.coherenceBoost.ideaExtensions.length > 0 ||
          analysis.coherenceBoost.recommendedConnectors.length > 0) && (
          <section
            data-testid="coherence-boost-section"
            className="bg-white border border-[#F3DCE5] rounded-xl p-6 sm:p-8 space-y-6"
          >
            <div className="space-y-1 border-b border-[#F8E8EE] pb-4">
              <h3 className="text-lg font-bold text-[#2A1A22]">
                Tăng độ mạch lạc (Coherence) — Gợi ý mở rộng ý tưởng & Từ nối (Connectors)
              </h3>
              <p className="text-sm text-[#5A424E]">
                Các hướng triển khai ý sâu hơn cùng từ nối văn nói tự nhiên giúp câu trả lời liền mạch và dễ đạt Band 7–8+ tiêu chí Fluency & Coherence.
              </p>
            </div>

            {analysis.coherenceBoost.ideaExtensions.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-[#2A1A22]">
                  <Lightbulb className="w-4 h-4 text-[#C93B72]" aria-hidden="true" />
                  <span>Gợi ý mở rộng ý tưởng cho câu trả lời</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analysis.coherenceBoost.ideaExtensions.map((idea, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-[#FFF8FA] border border-[#F3DCE5] rounded-xl space-y-2"
                    >
                      <p className="text-xs font-semibold text-[#C93B72]">
                        0{idx + 1}. {idea.angleVi}
                      </p>
                      <p className="text-sm font-medium text-[#2A1A22] leading-relaxed">
                        {idea.ideaEn}
                      </p>
                      <p className="text-xs text-[#6E5662] leading-relaxed">
                        {idea.explanationVi}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analysis.coherenceBoost.recommendedConnectors.length > 0 && (
              <div className="space-y-3 pt-2 border-t border-[#F8E8EE]">
                <div className="flex items-center gap-2 text-sm font-bold text-[#2A1A22]">
                  <Link2 className="w-4 h-4 text-[#C93B72]" aria-hidden="true" />
                  <span>Từ nối (Spoken Connectors) nên áp dụng ngay</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysis.coherenceBoost.recommendedConnectors.map((conn, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-[#FFF3F7] border border-[#F3DCE5] rounded-xl space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-base font-bold text-[#2A1A22]">{conn.connector}</p>
                          <p className="text-xs font-medium text-[#B12F62] mt-0.5">
                            {conn.functionVi}
                          </p>
                        </div>
                        <ExaminerPlayer
                          text={conn.exampleInContext}
                          voice={voice}
                          compact
                          label="Nghe câu"
                        />
                      </div>
                      <p className="text-xs text-[#5A424E] italic leading-relaxed">
                        &ldquo;{conn.exampleInContext}&rdquo;
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

      {/* Section 4: Detailed Error Corrections & Naturalness Fixes */}
      <section className="bg-white border border-[#F3DCE5] rounded-xl p-6 sm:p-8 space-y-5">
        <div className="space-y-1 border-b border-[#F8E8EE] pb-4">
          <h3 className="text-lg font-bold text-[#2A1A22]">
            Sửa lỗi sai chi tiết & Tăng độ tự nhiên
          </h3>
          <p className="text-sm text-[#5A424E]">
            So sánh trực tiếp câu bạn đã nói với cách diễn đạt chuẩn tự nhiên của giám khảo bản xứ.
          </p>
        </div>

        {analysis.errorCorrections.length === 0 ? (
          <p className="text-sm text-[#5A424E]">
            Không ghi nhận lỗi ngữ pháp hay diễn đạt đáng kể nào trong bài nói này.
          </p>
        ) : (
          <div className="divide-y divide-[#F8E8EE]">
            {analysis.errorCorrections.map((item, idx) => (
              <div key={idx} className="py-4 first:pt-0 last:pb-0 space-y-2">
                <div className="text-xs font-semibold text-[#7A606D]">
                  0{idx + 1}. {item.category}
                </div>
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 text-sm">
                  <span className="line-through text-red-700 bg-red-50 px-2.5 py-1 rounded-md">
                    {item.original}
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#B592A3] shrink-0 hidden md:block" aria-hidden="true" />
                  <span className="font-medium text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md">
                    {item.corrected}
                  </span>
                </div>
                <p className="text-sm text-[#5A424E] leading-relaxed">{item.explanationVi}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Section 5: High-Value Collocations, Idioms, Phrases & Band 8.0+ Upgrade */}
      <section className="bg-white border border-[#F3DCE5] rounded-xl p-6 sm:p-8 space-y-6">
        <div className="space-y-1 border-b border-[#F8E8EE] pb-4">
          <h3 className="text-lg font-bold text-[#2A1A22]">
            Gợi ý phát triển câu trả lời — Collocations, Idioms & Cụm từ đắt giá
          </h3>
          <p className="text-sm text-[#5A424E]">
            Các cụm từ chọn lọc phù hợp trực tiếp với ý tưởng của bạn để đẩy điểm Lexical Resource lên Band 7–8+.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analysis.vocabularyUpgrades.map((vocab, idx) => (
            <div
              key={idx}
              className="p-4 bg-[#FFF8FA] border border-[#F3DCE5] rounded-xl space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-xs text-[#7A606D]">
                    {vocab.type} <span aria-hidden="true">·</span>{' '}
                    <span className="font-mono text-[#B12F62]">{vocab.ipa}</span>
                  </div>
                  <p className="text-base font-bold text-[#2A1A22] mt-0.5">{vocab.expression}</p>
                </div>
                <ExaminerPlayer text={vocab.expression} voice={voice} compact label="Nghe" />
              </div>
              <p className="text-sm font-medium text-[#4A3440]">{vocab.meaningVi}</p>
              <p className="text-xs text-[#6E5662] italic leading-relaxed">
                &ldquo;{vocab.usageExample}&rdquo;
              </p>
            </div>
          ))}
        </div>

        {/* Model Upgraded Answer */}
        <div className="pt-4 border-t border-[#F8E8EE] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#C93B72]" aria-hidden="true" />
              <h4 className="text-base font-bold text-[#2A1A22]">
                Bài trả lời nâng cấp ({analysis.improvedAnswer.bandTarget})
              </h4>
            </div>
            <ExaminerPlayer
              text={analysis.improvedAnswer.text}
              voice={voice}
              compact
              label="Nghe bài mẫu"
            />
          </div>

          <p className="p-5 bg-[#FFF3F7] border border-[#F3DCE5] rounded-xl text-sm sm:text-base text-[#2A1A22] leading-relaxed">
            {analysis.improvedAnswer.text}
          </p>

          {analysis.improvedAnswer.keyTakeawaysVi.length > 0 && (
            <ul className="space-y-1.5 text-sm text-[#5A424E]">
              {analysis.improvedAnswer.keyTakeawaysVi.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#C93B72] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
