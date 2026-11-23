import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ChevronRight,
  Clock,
  Dices,
  Eye,
  EyeOff,
  ListChecks,
  Loader2,
  RotateCw,
  Shuffle,
  SkipForward,
  Volume2,
} from 'lucide-react';
import { analyzeSpeakingSubmission } from '../services/api';
import type {
  ExaminerVoice,
  PracticeSession,
  SpeakingPart,
  SpeakingQuestion,
  TopicSet,
} from '../types/ielts';
import {
  drawRandomQuestion,
  drawRandomTopic,
  formatCountdown,
  formatDurationUp,
} from '../utils/ieltsLogic';
import { saveRecordingBlob } from '../utils/storage';
import { AudioRecorder } from './AudioRecorder';
import { ExaminerPlayer } from './ExaminerPlayer';
import { FeedbackReport } from './FeedbackReport';

interface PracticeRoomProps {
  topics: TopicSet[];
  voice: ExaminerVoice;
  onVoiceChange: (voice: ExaminerVoice) => void;
  onSessionCompleted: (session: PracticeSession) => void;
  blindLaunchRequest: { nonce: number; topicId?: string; part?: SpeakingPart | 'all' } | null;
}

type PracticeMode = 'blind_exam' | 'targeted';

const PART_TABS: Array<{ id: SpeakingPart; label: string; subtitle: string }> = [
  { id: 1, label: 'Part 1', subtitle: 'Introduction' },
  { id: 2, label: 'Part 2', subtitle: 'Long-turn' },
  { id: 3, label: 'Part 3', subtitle: 'Discussion' },
];

export function PracticeRoom({
  topics,
  voice,
  onVoiceChange,
  onSessionCompleted,
  blindLaunchRequest,
}: PracticeRoomProps) {
  const [selectedPart, setSelectedPart] = useState<SpeakingPart>(1);
  const [mode, setMode] = useState<PracticeMode>('blind_exam');
  const [autoSpeakExaminer, setAutoSpeakExaminer] = useState(true);

  // Active topic & question state
  const [activeTopic, setActiveTopic] = useState<TopicSet | null>(() => {
    return topics.find((t) => t.part === 1) ?? topics[0] ?? null;
  });

  // In blind_exam mode, revealedIndex = -1 means ONLY topic title is visible (all questions strictly hidden!)
  const [revealedIndex, setRevealedIndex] = useState<number>(-1);
  // In targeted mode, user can browse and select any question directly
  const [targetedQuestionId, setTargetedQuestionId] = useState<string | null>(null);

  // Part 2 1-minute preparation timer & scratchpad
  const [prepRemaining, setPrepRemaining] = useState<number>(0);
  const [isPrepping, setIsPrepping] = useState(false);
  const [prepNotes, setPrepNotes] = useState('');
  const prepTimerRef = useRef<number | null>(null);

  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [latestSession, setLatestSession] = useState<PracticeSession | null>(null);
  const [latestAudioBlob, setLatestAudioBlob] = useState<Blob | null>(null);
  const [autoPlayKey, setAutoPlayKey] = useState<string | undefined>(undefined);
  const lastSubmissionRef = useRef<{
    audioBlob: Blob | null;
    durationSeconds: number;
    transcriptOverride?: string;
  } | null>(null);

  const partTopics = useMemo(
    () => topics.filter((t) => t.part === selectedPart),
    [topics, selectedPart]
  );

  const stopPrepTimer = () => {
    if (prepTimerRef.current !== null) {
      window.clearInterval(prepTimerRef.current);
      prepTimerRef.current = null;
    }
    setIsPrepping(false);
  };

  useEffect(() => {
    return () => stopPrepTimer();
  }, []);

  const startPart2PrepIfNeeded = (question: SpeakingQuestion, topicPart: SpeakingPart) => {
    stopPrepTimer();
    setPrepNotes('');
    if (topicPart === 2 && (question.prepSeconds ?? 60) > 0) {
      const initial = question.prepSeconds ?? 60;
      setPrepRemaining(initial);
      setIsPrepping(true);
      prepTimerRef.current = window.setInterval(() => {
        setPrepRemaining((prev) => {
          if (prev <= 1) {
            stopPrepTimer();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setPrepRemaining(0);
    }
  };

  // Handle external Blind Exam launch (from Header CTA or QuestionBank "Thi ẩn đề")
  useEffect(() => {
    if (!blindLaunchRequest) return;
    stopPrepTimer();
    setLatestSession(null);
    setLatestAudioBlob(null);
    setAnalysisError(null);
    setMode('blind_exam');

    let chosen: TopicSet | null = null;
    if (blindLaunchRequest.topicId) {
      chosen = topics.find((t) => t.id === blindLaunchRequest.topicId) ?? null;
    }
    if (!chosen) {
      const poolPart = blindLaunchRequest.part ?? 'all';
      chosen = drawRandomTopic(topics, poolPart, activeTopic?.id);
    }
    if (chosen) {
      setSelectedPart(chosen.part);
      setActiveTopic(chosen);
      setRevealedIndex(-1); // Strictly hide all questions so user only sees the Topic title!
      setAutoPlayKey(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blindLaunchRequest]);

  // Keep activeTopic valid if topics list changes (e.g., deleted in Question Bank)
  useEffect(() => {
    if (!activeTopic || !topics.some((t) => t.id === activeTopic.id)) {
      const fallback = topics.find((t) => t.part === selectedPart) ?? topics[0] ?? null;
      setActiveTopic(fallback);
      setRevealedIndex(-1);
      setTargetedQuestionId(fallback?.questions[0]?.id ?? null);
    }
  }, [topics, activeTopic, selectedPart]);

  const currentQuestion: SpeakingQuestion | null = useMemo(() => {
    if (!activeTopic || activeTopic.questions.length === 0) return null;
    if (mode === 'blind_exam') {
      if (revealedIndex < 0 || revealedIndex >= activeTopic.questions.length) return null;
      return activeTopic.questions[revealedIndex];
    }
    return (
      activeTopic.questions.find((q) => q.id === targetedQuestionId) ??
      activeTopic.questions[0] ??
      null
    );
  }, [activeTopic, mode, revealedIndex, targetedQuestionId]);

  const handleSelectPart = (part: SpeakingPart) => {
    stopPrepTimer();
    setSelectedPart(part);
    setLatestSession(null);
    setLatestAudioBlob(null);
    setAnalysisError(null);

    const matching = topics.filter((t) => t.part === part);
    const nextTopic = matching[0] ?? null;
    setActiveTopic(nextTopic);
    setRevealedIndex(-1);
    setTargetedQuestionId(nextTopic?.questions[0]?.id ?? null);
    setAutoPlayKey(undefined);
  };

  const handleRandomTopicBlind = (partFilter: SpeakingPart | 'all' = selectedPart) => {
    stopPrepTimer();
    setLatestSession(null);
    setLatestAudioBlob(null);
    setAnalysisError(null);
    setMode('blind_exam');

    const drawn = drawRandomTopic(topics, partFilter, activeTopic?.id);
    if (drawn) {
      setSelectedPart(drawn.part);
      setActiveTopic(drawn);
      setRevealedIndex(-1); // Never reveal questions until user clicks start!
      setAutoPlayKey(undefined);
    }
  };

  const handleRandomSingleQuestion = () => {
    stopPrepTimer();
    setLatestSession(null);
    setLatestAudioBlob(null);
    setAnalysisError(null);

    const drawn = drawRandomQuestion(topics, selectedPart, currentQuestion?.id);
    if (!drawn) return;

    setActiveTopic(drawn.topic);
    const qIdx = drawn.topic.questions.findIndex((q) => q.id === drawn.question.id);
    if (mode === 'blind_exam') {
      setRevealedIndex(qIdx >= 0 ? qIdx : 0);
    } else {
      setTargetedQuestionId(drawn.question.id);
    }
    startPart2PrepIfNeeded(drawn.question, drawn.topic.part);
    if (autoSpeakExaminer) {
      setAutoPlayKey(`${drawn.question.id}-${Date.now()}`);
    }
  };

  const handleRevealNextBlindQuestion = () => {
    if (!activeTopic || activeTopic.questions.length === 0) return;
    const nextIdx = revealedIndex + 1;
    if (nextIdx >= activeTopic.questions.length) return;

    setLatestSession(null);
    setLatestAudioBlob(null);
    setAnalysisError(null);
    setRevealedIndex(nextIdx);

    const nextQ = activeTopic.questions[nextIdx];
    startPart2PrepIfNeeded(nextQ, activeTopic.part);
    if (autoSpeakExaminer) {
      setAutoPlayKey(`${nextQ.id}-${Date.now()}`);
    }
  };

  const handleSelectTargetedTopic = (topic: TopicSet) => {
    stopPrepTimer();
    setActiveTopic(topic);
    setTargetedQuestionId(topic.questions[0]?.id ?? null);
    setRevealedIndex(-1);
    setLatestSession(null);
    setLatestAudioBlob(null);
    setAnalysisError(null);
    setAutoPlayKey(undefined);
  };

  const handleSelectTargetedQuestion = (q: SpeakingQuestion) => {
    stopPrepTimer();
    setTargetedQuestionId(q.id);
    setLatestSession(null);
    setLatestAudioBlob(null);
    setAnalysisError(null);
    if (activeTopic) {
      startPart2PrepIfNeeded(q, activeTopic.part);
    }
  };

  const handleSubmitSpeaking = async (payload: {
    audioBlob: Blob | null;
    durationSeconds: number;
    transcriptOverride?: string;
  }) => {
    if (!activeTopic || !currentQuestion) return;
    lastSubmissionRef.current = payload;
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const analysis = await analyzeSpeakingSubmission({
        audioBlob: payload.audioBlob,
        transcriptOverride: payload.transcriptOverride,
        question: currentQuestion.text,
        part: activeTopic.part,
        topic: activeTopic.title,
        durationSeconds: payload.durationSeconds,
        cuePoints: currentQuestion.cuePoints,
      });

      const sessionId = `session-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
      let hasSavedAudio = false;
      if (payload.audioBlob && payload.audioBlob.size > 0) {
        await saveRecordingBlob(sessionId, payload.audioBlob);
        hasSavedAudio = true;
      }

      const newSession: PracticeSession = {
        id: sessionId,
        createdAt: new Date().toISOString(),
        part: activeTopic.part,
        topicId: activeTopic.id,
        topicTitle: activeTopic.title,
        questionId: currentQuestion.id,
        questionText: currentQuestion.text,
        cuePoints: currentQuestion.cuePoints,
        durationSeconds: payload.durationSeconds,
        hasAudio: hasSavedAudio,
        audioMimeType: payload.audioBlob?.type,
        analysis,
      };

      setLatestSession(newSession);
      setLatestAudioBlob(payload.audioBlob);
      onSessionCompleted(newSession);
    } catch (err) {
      setAnalysisError(
        err instanceof Error ? err.message : 'Có lỗi xảy ra khi phân tích bài nói. Vui lòng thử lại.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const hasMoreBlindQuestions =
    mode === 'blind_exam' &&
    activeTopic !== null &&
    revealedIndex >= 0 &&
    revealedIndex + 1 < activeTopic.questions.length;

  const examinerFullText = currentQuestion
    ? currentQuestion.cuePoints && currentQuestion.cuePoints.length > 0
      ? `${currentQuestion.text} You should say: ${currentQuestion.cuePoints.join('. ')}.`
      : currentQuestion.text
    : '';

  return (
    <div className="space-y-8">
      {/* Compact Workspace Control Strip */}
      <section className="bg-white border border-[#F3DCE5] rounded-xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Part 1 / Part 2 / Part 3 Segmented Selector */}
        <div
          role="tablist"
          aria-label="Chọn phần thi IELTS Speaking"
          className="inline-flex items-center p-1 bg-[#FCEBF1] rounded-lg self-start"
        >
          {PART_TABS.map((pt) => {
            const isActive = selectedPart === pt.id;
            return (
              <button
                key={pt.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => handleSelectPart(pt.id)}
                className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-[#2A1A22] shadow-sm font-semibold'
                    : 'text-[#6E5662] hover:text-[#2A1A22]'
                }`}
              >
                {pt.label}
                <span className="hidden sm:inline text-[#9A7F8D] font-normal"> · {pt.subtitle}</span>
              </button>
            );
          })}
        </div>

        {/* Mode Toggle + Random Exam Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div
            role="group"
            aria-label="Chế độ luyện tập"
            className="inline-flex items-center p-1 bg-[#FCEBF1] rounded-lg"
          >
            <button
              type="button"
              onClick={() => {
                setMode('blind_exam');
                setRevealedIndex(-1);
                setLatestSession(null);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                mode === 'blind_exam'
                  ? 'bg-white text-[#B12F62] shadow-sm font-semibold'
                  : 'text-[#6E5662] hover:text-[#2A1A22]'
              }`}
            >
              <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Phòng thi ẩn đề</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('targeted');
                if (activeTopic && !targetedQuestionId) {
                  setTargetedQuestionId(activeTopic.questions[0]?.id ?? null);
                }
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                mode === 'targeted'
                  ? 'bg-white text-[#2A1A22] shadow-sm font-semibold'
                  : 'text-[#6E5662] hover:text-[#2A1A22]'
              }`}
            >
              <Eye className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Chọn câu tự do</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => handleRandomTopicBlind(selectedPart)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-[#2A1A22] bg-white border border-[#F3DCE5] hover:bg-[#FFF3F7] rounded-lg transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C93B72]"
          >
            <Shuffle className="w-4 h-4 text-[#C93B72]" aria-hidden="true" />
            <span>Random bộ đề</span>
          </button>

          <button
            type="button"
            onClick={handleRandomSingleQuestion}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-[#2A1A22] bg-white border border-[#F3DCE5] hover:bg-[#FFF3F7] rounded-lg transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C93B72]"
          >
            <Dices className="w-4 h-4 text-[#C93B72]" aria-hidden="true" />
            <span>Random 1 câu hỏi</span>
          </button>
        </div>
      </section>

      {/* Main Two-Zone Practice Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sidebar (4 cols on desktop, placed below stage on mobile): Topic selector */}
        <aside className="order-2 lg:order-1 lg:col-span-4 bg-white border border-[#F3DCE5] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#F8E8EE]">
            <div>
              <h2 className="text-sm font-bold text-[#2A1A22]">
                Chủ đề Part {selectedPart}
              </h2>
              <p className="text-xs text-[#7A606D] mt-0.5">
                {mode === 'blind_exam'
                  ? 'Câu hỏi được ẩn hoàn toàn cho đến khi bạn bắt đầu trả lời.'
                  : 'Chọn chủ đề và câu hỏi bạn muốn luyện sâu.'}
              </p>
            </div>
            <span className="text-xs font-medium text-[#7A606D] tabular-nums shrink-0">
              {partTopics.length} bộ đề
            </span>
          </div>

          <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
            {partTopics.map((topic) => {
              const isSelected = activeTopic?.id === topic.id;
              return (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => handleSelectTargetedTopic(topic)}
                  className={`w-full text-left px-3.5 py-3 rounded-lg border transition-colors ${
                    isSelected
                      ? 'bg-[#FDF2F6] border-[#EBB8CC] text-[#2A1A22]'
                      : 'bg-white border-transparent hover:bg-[#FFF8FA] text-[#5A424E]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold truncate">{topic.title}</span>
                    <span className="text-xs text-[#7A606D] tabular-nums shrink-0">
                      {topic.questions.length} câu
                    </span>
                  </div>
                  <div className="text-xs text-[#7A606D] mt-0.5 truncate">
                    {topic.category}
                  </div>
                </button>
              );
            })}
            {partTopics.length === 0 && (
              <p className="text-sm text-[#7A606D] py-4 text-center">
                Chưa có bộ đề nào cho Part {selectedPart}. Hãy thêm hoặc import trong mục Ngân hàng đề.
              </p>
            )}
          </div>

          {/* Targeted Mode: Question List (NEVER shown in Blind Exam Mode!) */}
          {mode === 'targeted' && activeTopic && (
            <div className="pt-4 border-t border-[#F8E8EE] space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5A424E]">
                <ListChecks className="w-3.5 h-3.5 text-[#C93B72]" aria-hidden="true" />
                <span>Danh sách câu hỏi · {activeTopic.title}</span>
              </div>
              <div className="space-y-1.5">
                {activeTopic.questions.map((q, idx) => {
                  const isCurrent = currentQuestion?.id === q.id;
                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => handleSelectTargetedQuestion(q)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-xs leading-relaxed border transition-colors ${
                        isCurrent
                          ? 'bg-[#3B1F2B] text-white border-[#3B1F2B] font-medium'
                          : 'bg-[#FFF3F7] text-[#5A424E] border-[#F3DCE5] hover:bg-[#FCEBF1]'
                      }`}
                    >
                      <span className="font-mono opacity-75 mr-1.5">{idx + 1}.</span>
                      {q.text}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Auto-speak examiner preference */}
          <div className="pt-4 border-t border-[#F8E8EE]">
            <label className="flex items-center justify-between gap-3 cursor-pointer text-xs text-[#5A424E]">
              <span className="flex items-center gap-2 font-medium">
                <Volume2 className="w-4 h-4 text-[#C93B72] shrink-0" aria-hidden="true" />
                <span>Tự động đọc câu hỏi bằng giọng giám khảo</span>
              </span>
              <input
                type="checkbox"
                checked={autoSpeakExaminer}
                onChange={(e) => setAutoSpeakExaminer(e.target.checked)}
                className="w-4 h-4 rounded border-[#EBB8CC] accent-[#C93B72] focus:ring-[#C93B72]"
              />
            </label>
          </div>
        </aside>

        {/* Right Primary Stage (8 cols on desktop, first on mobile): Blind Lobby OR Active Question + Recording Deck */}
        <div className="order-1 lg:order-2 lg:col-span-8 space-y-6">
          {!activeTopic ? (
            <div className="bg-white border border-[#F3DCE5] rounded-xl p-10 text-center space-y-3">
              <h3 className="text-lg font-bold text-[#2A1A22]">Chưa có bộ đề để luyện tập</h3>
              <p className="text-sm text-[#6E5662]">
                Vui lòng thêm hoặc import câu hỏi trong mục Ngân hàng đề.
              </p>
            </div>
          ) : mode === 'blind_exam' && revealedIndex === -1 ? (
            /* BLIND EXAM LOBBY: Strictly shows ONLY the Topic Title — ZERO questions revealed! */
            <section
              data-testid="blind-exam-lobby"
              className="bg-white border border-[#F3DCE5] rounded-xl p-8 sm:p-10 space-y-6"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#7A606D]">
                <span>Chế độ Phòng thi thật (Ẩn câu hỏi)</span>
                <span aria-hidden="true">·</span>
                <span>Part {activeTopic.part}</span>
                <span aria-hidden="true">·</span>
                <span>{activeTopic.category}</span>
              </div>

              <div className="space-y-3 max-w-xl">
                <p className="text-sm font-medium text-[#C93B72]">Chủ đề bạn nhận được</p>
                <h1
                  data-testid="blind-topic-title"
                  className="text-3xl sm:text-4xl font-bold tracking-tight text-[#2A1A22]"
                >
                  {activeTopic.title}
                </h1>
                <p className="text-sm sm:text-base text-[#5A424E] leading-relaxed">
                  Toàn bộ{' '}
                  <strong className="font-semibold text-[#2A1A22] tabular-nums">
                    {activeTopic.questions.length} câu hỏi
                  </strong>{' '}
                  trong chủ đề này đang được ẩn hoàn toàn để mô phỏng phòng thi IELTS thực tế. Câu hỏi
                  chỉ xuất hiện và được giám khảo đọc lên khi bạn bấm bắt đầu.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleRevealNextBlindQuestion}
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#C93B72] hover:bg-[#B12F62] active:bg-[#982552] rounded-lg transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C93B72] focus-visible:ring-offset-2"
                >
                  <span>Bắt đầu · Mở câu hỏi số 1</span>
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  onClick={() => handleRandomTopicBlind(selectedPart)}
                  className="inline-flex items-center gap-2 px-4 py-3 text-sm font-medium text-[#5A424E] bg-white border border-[#F3DCE5] hover:bg-[#FFF3F7] rounded-lg transition-colors whitespace-nowrap"
                >
                  <Shuffle className="w-4 h-4 text-[#C93B72]" aria-hidden="true" />
                  <span>Đổi chủ đề ngẫu nhiên khác</span>
                </button>
              </div>
            </section>
          ) : currentQuestion ? (
            /* ACTIVE QUESTION STAGE */
            <div className="space-y-6">
              <section
                data-testid="active-question-card"
                className="bg-white border border-[#F3DCE5] rounded-xl p-6 sm:p-8 space-y-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#7A606D]">
                    <span className="font-semibold text-[#C93B72]">Part {activeTopic.part}</span>
                    <span aria-hidden="true">·</span>
                    <span>{activeTopic.title}</span>
                    {mode === 'blind_exam' && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">
                          Câu {revealedIndex + 1}/{activeTopic.questions.length} (các câu sau đang ẩn)
                        </span>
                      </>
                    )}
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">
                      Mốc trả lời{' '}
                      <span className="font-mono text-[#5A424E]">
                        {formatDurationUp(currentQuestion.recommendedSeconds)}
                      </span>
                    </span>
                  </div>

                  {hasMoreBlindQuestions && (
                    <button
                      type="button"
                      onClick={handleRevealNextBlindQuestion}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#A6285A] bg-[#FCEBF1] hover:bg-[#F8DAE5] rounded-lg transition-colors whitespace-nowrap"
                    >
                      <span>Câu tiếp theo ({revealedIndex + 2}/{activeTopic.questions.length})</span>
                      <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  )}
                </div>

                {/* Question Prompt */}
                <div className="space-y-4">
                  <h2
                    data-testid="active-question-text"
                    className="text-xl sm:text-2xl font-bold text-[#2A1A22] leading-snug"
                  >
                    {currentQuestion.text}
                  </h2>

                  {/* Part 2 Cue Card Bullet Points */}
                  {currentQuestion.cuePoints && currentQuestion.cuePoints.length > 0 && (
                    <div className="p-5 bg-[#FFF3F7] border border-[#F3DCE5] rounded-xl space-y-2.5">
                      <p className="text-xs font-semibold text-[#7A606D]">You should say:</p>
                      <ul className="space-y-1.5 text-sm text-[#2A1A22] list-disc pl-5">
                        {currentQuestion.cuePoints.map((pt, idx) => (
                          <li key={idx}>{pt}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Realistic Examiner Audio Controls */}
                <div className="pt-2 border-t border-[#F8E8EE]">
                  <ExaminerPlayer
                    text={examinerFullText}
                    voice={voice}
                    onVoiceChange={onVoiceChange}
                    autoPlayKey={autoPlayKey}
                    label="Nghe giám khảo đọc câu hỏi"
                  />
                </div>

                {/* Part 2 1-Minute Preparation Countdown + Scratchpad */}
                {activeTopic.part === 2 && (
                  <div className="p-4 bg-[#FFF3F7] border border-[#F3DCE5] rounded-xl space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-sm font-semibold text-[#2A1A22]">
                        <Clock className="w-4 h-4 text-[#C93B72]" aria-hidden="true" />
                        <span>
                          {isPrepping
                            ? 'Thời gian chuẩn bị Part 2 (1 phút)'
                            : 'Ghi chú dàn ý nhanh (Cue Card Notes)'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        {isPrepping && (
                          <span className="font-mono text-base font-bold text-[#C93B72] tabular-nums">
                            {formatCountdown(prepRemaining)}
                          </span>
                        )}
                        {isPrepping ? (
                          <button
                            type="button"
                            onClick={stopPrepTimer}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#5A424E] bg-white border border-[#F3DCE5] hover:bg-[#FCEBF1] rounded-md whitespace-nowrap"
                          >
                            <SkipForward className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Bỏ qua chuẩn bị, nói ngay</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => startPart2PrepIfNeeded(currentQuestion, 2)}
                            className="text-xs font-medium text-[#C93B72] hover:text-[#B12F62] whitespace-nowrap"
                          >
                            Bắt đầu lại 1:00 chuẩn bị
                          </button>
                        )}
                      </div>
                    </div>

                    <textarea
                      rows={3}
                      value={prepNotes}
                      onChange={(e) => setPrepNotes(e.target.value)}
                      placeholder="Ghi nhanh từ khóa chính (Who, Where, When, Feeling, Idioms) như giấy nháp trong phòng thi..."
                      className="w-full rounded-lg border border-[#F3DCE5] bg-white px-3.5 py-2.5 text-sm text-[#2A1A22] placeholder:text-[#A48A97] focus:outline-none focus:ring-2 focus:ring-[#C93B72]"
                    />
                  </div>
                )}
              </section>

              {/* Audio Recorder with Count-Up M:SS + Exam Target Countdown + Playback + Download */}
              <AudioRecorder
                targetSeconds={currentQuestion.recommendedSeconds}
                isAnalyzing={isAnalyzing}
                onSubmitAudio={(payload) => void handleSubmitSpeaking(payload)}
                resetSignal={`${activeTopic.id}-${currentQuestion.id}`}
              />

              {/* Analyzing Loading Banner */}
              {isAnalyzing && (
                <div
                  role="status"
                  className="bg-white border border-[#EBB8CC] rounded-xl p-6 flex items-center gap-4"
                >
                  <Loader2 className="w-6 h-6 text-[#C93B72] animate-spin shrink-0" aria-hidden="true" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-[#2A1A22]">
                      Giám khảo đang chép transcript và phân tích phát âm từng từ...
                    </p>
                    <p className="text-xs text-[#7A606D]">
                      Đang đối chiếu 4 tiêu chí IELTS (thang điểm nguyên 0–9), phiên âm IPA, gợi ý Coherence & Connectors.
                    </p>
                  </div>
                </div>
              )}

              {/* API Error Banner */}
              {analysisError && (
                <div
                  role="alert"
                  className="bg-red-50 border border-red-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-2.5 text-sm text-red-800">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{analysisError}</span>
                  </div>
                  {lastSubmissionRef.current && (
                    <button
                      type="button"
                      onClick={() => {
                        if (lastSubmissionRef.current) {
                          void handleSubmitSpeaking(lastSubmissionRef.current);
                        }
                      }}
                      disabled={isAnalyzing}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-red-700 bg-white border border-red-200 hover:bg-red-100/60 rounded-lg transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
                    >
                      <RotateCw className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Thử chấm lại</span>
                    </button>
                  )}
                </div>
              )}

              {/* Post-Evaluation Report */}
              {latestSession && (
                <div className="space-y-4">
                  <FeedbackReport
                    session={latestSession}
                    voice={voice}
                    liveAudioBlob={latestAudioBlob}
                  />

                  <div className="flex flex-wrap items-center justify-end gap-3">
                    {hasMoreBlindQuestions ? (
                      <button
                        type="button"
                        onClick={handleRevealNextBlindQuestion}
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#C93B72] hover:bg-[#B12F62] rounded-lg transition-colors whitespace-nowrap"
                      >
                        <span>Chuyển sang câu hỏi ẩn tiếp theo</span>
                        <ChevronRight className="w-4 h-4" aria-hidden="true" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleRandomTopicBlind(selectedPart)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#C93B72] hover:bg-[#B12F62] rounded-lg transition-colors whitespace-nowrap"
                      >
                        <Shuffle className="w-4 h-4" aria-hidden="true" />
                        <span>Random chủ đề mới</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
