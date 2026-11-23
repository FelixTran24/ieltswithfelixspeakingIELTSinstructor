import { useMemo, useState } from 'react';
import { ArrowLeft, Calendar, Trash2, TrendingUp } from 'lucide-react';
import type { ExaminerVoice, PracticeSession, SpeakingPart } from '../types/ielts';
import { computeProgressStats, formatDurationUp } from '../utils/ieltsLogic';
import { FeedbackReport } from './FeedbackReport';

interface HistoryProgressProps {
  sessions: PracticeSession[];
  voice: ExaminerVoice;
  onDeleteSession: (sessionId: string) => void;
}

export function HistoryProgress({
  sessions,
  voice,
  onDeleteSession,
}: HistoryProgressProps) {
  const [partFilter, setPartFilter] = useState<SpeakingPart | 'all'>('all');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const stats = useMemo(() => computeProgressStats(sessions), [sessions]);

  const sortedNewest = useMemo(
    () =>
      [...sessions].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [sessions]
  );

  const chronological = useMemo(() => [...sortedNewest].reverse(), [sortedNewest]);

  const filteredSessions = useMemo(() => {
    if (partFilter === 'all') return sortedNewest;
    return sortedNewest.filter((s) => s.part === partFilter);
  }, [sortedNewest, partFilter]);

  const inspectedSession = useMemo(
    () => sessions.find((s) => s.id === selectedSessionId) ?? null,
    [sessions, selectedSessionId]
  );

  if (inspectedSession) {
    return (
      <div className="space-y-5">
        <button
          type="button"
          onClick={() => setSelectedSessionId(null)}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#5A424E] hover:text-[#C93B72] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Quay lại Lịch sử & Tiến độ</span>
        </button>

        <FeedbackReport session={inspectedSession} voice={voice} />
      </div>
    );
  }

  // SVG chart coordinates (viewBox 640 x 210)
  const chartW = 640;
  const chartH = 210;
  const padL = 42;
  const padR = 24;
  const padT = 18;
  const padB = 34;
  const minBand = 4;
  const maxBand = 9;

  const chartPoints = chronological.map((s, idx) => {
    const x =
      chronological.length <= 1
        ? padL + (chartW - padL - padR) / 2
        : padL + (idx / (chronological.length - 1)) * (chartW - padL - padR);
    const clamped = Math.min(maxBand, Math.max(minBand, s.analysis.overallBand));
    const y = padT + ((maxBand - clamped) / (maxBand - minBand)) * (chartH - padT - padB);
    return { session: s, x, y };
  });

  const polylinePath = chartPoints.map((p) => `${p.x},${p.y}`).join(' ');

  const formatDateShort = (iso: string) => {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#2A1A22] tracking-tight">
          Lịch sử luyện tập & Tiến độ Band Score
        </h1>
        <p className="text-sm text-[#6E5662]">
          Theo dõi sự cải thiện qua từng lần ghi âm trên cả 4 tiêu chí IELTS Speaking (điểm nguyên 0–9) và độ chuẩn phát âm IPA.
        </p>
      </div>

      {/* 4-Column KPI Summary Strip */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#F3DCE5] rounded-xl p-5 space-y-1">
          <p className="text-xs font-medium text-[#7A606D]">Band gần nhất</p>
          <div className="flex items-baseline gap-2.5">
            <span className="text-3xl font-extrabold text-[#C93B72] font-mono tabular-nums">
              {stats.totalSessions > 0 ? stats.latestBand.toFixed(1) : '—'}
            </span>
            {stats.totalSessions >= 2 && (
              <span
                className={`text-xs font-semibold font-mono tabular-nums ${
                  stats.bandDelta >= 0 ? 'text-emerald-700' : 'text-red-600'
                }`}
              >
                {stats.bandDelta >= 0 ? `+${stats.bandDelta.toFixed(1)}` : stats.bandDelta.toFixed(1)}
              </span>
            )}
          </div>
        </div>

        <div className="bg-white border border-[#F3DCE5] rounded-xl p-5 space-y-1">
          <p className="text-xs font-medium text-[#7A606D]">Band trung bình</p>
          <p className="text-3xl font-extrabold text-[#2A1A22] font-mono tabular-nums">
            {stats.totalSessions > 0 ? stats.averageBand.toFixed(1) : '—'}
          </p>
        </div>

        <div className="bg-white border border-[#F3DCE5] rounded-xl p-5 space-y-1">
          <p className="text-xs font-medium text-[#7A606D]">Phát âm chuẩn trung bình</p>
          <p className="text-3xl font-extrabold text-[#2A1A22] font-mono tabular-nums">
            {stats.totalSessions > 0 ? `${stats.averagePronunciationAccuracy}%` : '—'}
          </p>
        </div>

        <div className="bg-white border border-[#F3DCE5] rounded-xl p-5 space-y-1">
          <p className="text-xs font-medium text-[#7A606D]">Tổng thời lượng nói</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-extrabold text-[#2A1A22] font-mono tabular-nums">
              {formatDurationUp(stats.totalSpeakingSeconds)}
            </p>
            <span className="text-xs text-[#7A606D] tabular-nums">
              ({stats.totalSessions} bài)
            </span>
          </div>
        </div>
      </section>

      {/* Progress Chart + 4 Criteria Breakdown */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 bg-white border border-[#F3DCE5] rounded-xl p-6 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#C93B72]" aria-hidden="true" />
              <h2 className="text-sm font-bold text-[#2A1A22]">Biểu đồ xu hướng Overall Band</h2>
            </div>
            <span className="text-xs text-[#7A606D]">Nhấn vào điểm để xem chi tiết bài chấm</span>
          </div>

          {chronological.length === 0 ? (
            <div className="py-12 text-center text-sm text-[#7A606D]">
              Chưa có dữ liệu luyện tập. Hãy hoàn thành bài nói đầu tiên để bắt đầu vẽ biểu đồ tiến độ.
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <svg
                viewBox={`0 0 ${chartW} ${chartH}`}
                className="w-full h-auto min-w-[420px]"
                role="img"
                aria-label="Biểu đồ tiến bộ Band Score theo thời gian"
              >
                {/* Horizontal Band Grid Lines (4.0 to 9.0) */}
                {[4, 5, 6, 7, 8, 9].map((bandVal) => {
                  const y = padT + ((maxBand - bandVal) / (maxBand - minBand)) * (chartH - padT - padB);
                  return (
                    <g key={bandVal}>
                      <line
                        x1={padL}
                        y1={y}
                        x2={chartW - padR}
                        y2={y}
                        stroke="#F3DCE5"
                        strokeDasharray={bandVal === 7 ? '4 4' : undefined}
                      />
                      <text
                        x={padL - 10}
                        y={y + 4}
                        textAnchor="end"
                        fill="#7A606D"
                        fontSize="11"
                        fontFamily="JetBrains Mono, monospace"
                      >
                        {bandVal.toFixed(1)}
                      </text>
                    </g>
                  );
                })}

                {/* Trend Line */}
                {chartPoints.length >= 2 && (
                  <polyline
                    fill="none"
                    stroke="#C93B72"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={polylinePath}
                  />
                )}

                {/* Interactive Session Nodes */}
                {chartPoints.map(({ session, x, y }) => (
                  <g
                    key={session.id}
                    onClick={() => setSelectedSessionId(session.id)}
                    className="cursor-pointer group"
                  >
                    <circle
                      cx={x}
                      cy={y}
                      r="5.5"
                      fill="#FFFFFF"
                      stroke="#C93B72"
                      strokeWidth="2.5"
                    />
                    <text
                      x={x}
                      y={y - 11}
                      textAnchor="middle"
                      fill="#2A1A22"
                      fontSize="11"
                      fontWeight="600"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      {session.analysis.overallBand.toFixed(1)}
                    </text>
                    <text
                      x={x}
                      y={chartH - 10}
                      textAnchor="middle"
                      fill="#7A606D"
                      fontSize="10"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      {formatDateShort(session.createdAt)}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          )}
        </div>

        {/* 4 Criteria Average Bars */}
        <div className="lg:col-span-5 bg-white border border-[#F3DCE5] rounded-xl p-6 space-y-5">
          <div>
            <h2 className="text-sm font-bold text-[#2A1A22]">Điểm trung bình 4 tiêu chí IELTS</h2>
            <p className="text-xs text-[#7A606D] mt-0.5">
              Xác định tiêu chí đang kéo điểm thấp để tập trung cải thiện.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { label: 'Fluency & Coherence', value: stats.criteriaAverages.fluencyCoherence },
              { label: 'Lexical Resource', value: stats.criteriaAverages.lexicalResource },
              { label: 'Grammatical Range & Accuracy', value: stats.criteriaAverages.grammaticalRange },
              { label: 'Pronunciation', value: stats.criteriaAverages.pronunciation },
            ].map((row) => (
              <div key={row.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[#5A424E]">{row.label}</span>
                  <span className="font-mono font-bold text-[#2A1A22] tabular-nums">
                    {stats.totalSessions > 0 ? row.value.toFixed(1) : '0.0'} / 9
                  </span>
                </div>
                <div className="w-full h-2 bg-[#FCEBF1] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#C93B72] rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (row.value / 9) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Session History List */}
      <section className="bg-white border border-[#F3DCE5] rounded-xl p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F8E8EE] pb-4">
          <h2 className="text-base font-bold text-[#2A1A22]">
            Danh sách các bài đã luyện ({filteredSessions.length})
          </h2>

          <div className="inline-flex items-center p-1 bg-[#FCEBF1] rounded-lg">
            {(
              [
                { id: 'all', label: 'Tất cả' },
                { id: 1, label: 'Part 1' },
                { id: 2, label: 'Part 2' },
                { id: 3, label: 'Part 3' },
              ] as const
            ).map((tab) => (
              <button
                key={String(tab.id)}
                type="button"
                onClick={() => setPartFilter(tab.id)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  partFilter === tab.id
                    ? 'bg-white text-[#2A1A22] shadow-sm font-semibold'
                    : 'text-[#6E5662] hover:text-[#2A1A22]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-[#F8E8EE]" data-testid="history-session-list">
          {filteredSessions.map((session) => (
            <div
              key={session.id}
              className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#7A606D]">
                  <span className="font-semibold text-[#C93B72]">Part {session.part}</span>
                  <span aria-hidden="true">·</span>
                  <span>{session.topicTitle}</span>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                    <Calendar className="w-3 h-3" aria-hidden="true" />
                    {formatDateShort(session.createdAt)}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">
                    Đã nói{' '}
                    <span className="font-mono text-[#5A424E]">
                      {formatDurationUp(session.durationSeconds)}
                    </span>
                  </span>
                  {session.isSeed && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>Bài mẫu minh họa</span>
                    </>
                  )}
                </div>

                <p className="text-sm font-semibold text-[#2A1A22] line-clamp-1">
                  {session.questionText}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[#6E5662] tabular-nums">
                  <span>FC {Math.round(session.analysis.criteria.fluencyCoherence.band)}</span>
                  <span aria-hidden="true">·</span>
                  <span>LR {Math.round(session.analysis.criteria.lexicalResource.band)}</span>
                  <span aria-hidden="true">·</span>
                  <span>GRA {Math.round(session.analysis.criteria.grammaticalRange.band)}</span>
                  <span aria-hidden="true">·</span>
                  <span>PR {Math.round(session.analysis.criteria.pronunciation.band)}</span>
                  <span aria-hidden="true">·</span>
                  <span>IPA {session.analysis.pronunciationAnalysis.overallAccuracyPercent}%</span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right pr-2">
                  <span className="block text-[11px] text-[#7A606D]">Overall</span>
                  <span className="text-xl font-bold text-[#C93B72] font-mono tabular-nums">
                    {session.analysis.overallBand.toFixed(1)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedSessionId(session.id)}
                  className="px-3.5 py-2 text-xs font-semibold text-[#5A424E] bg-[#FCEBF1] hover:bg-[#F8DAE5] rounded-lg transition-colors whitespace-nowrap"
                >
                  Xem báo cáo
                </button>

                <button
                  type="button"
                  onClick={() => onDeleteSession(session.id)}
                  aria-label={`Xóa lịch sử bài ${session.topicTitle}`}
                  className="p-2 text-[#9A7F8D] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}

          {filteredSessions.length === 0 && (
            <p className="py-8 text-center text-sm text-[#7A606D]">
              Chưa có bài luyện nào trong mục này.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
