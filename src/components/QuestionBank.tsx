import { useMemo, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Download,
  Edit3,
  EyeOff,
  FileUp,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { DEFAULT_TOPIC_BANK } from '../data/defaultQuestions';
import type { SpeakingPart, SpeakingQuestion, TopicSet } from '../types/ielts';
import { getDefaultTimingForPart, parseImportedTopics } from '../utils/ieltsLogic';

interface QuestionBankProps {
  topics: TopicSet[];
  onSaveTopics: (updated: TopicSet[]) => void;
  onPracticeTopicBlind: (topicId: string) => void;
}

const SAMPLE_IMPORT_JSON = JSON.stringify(
  [
    {
      title: 'Coffee & Cafés',
      part: 1,
      category: 'Lifestyle',
      questions: [
        'Do you enjoy spending time in coffee shops?',
        'What kind of drinks do you usually order when you visit a café?',
        'Why do you think cafés have become popular places to study or work?',
      ],
    },
    {
      title: 'A Historical Place You Visited',
      part: 2,
      category: 'Culture',
      questions: [
        {
          text: 'Describe a historical place that you have visited.',
          cuePoints: [
            'Where it is located',
            'When you went there',
            'What you saw and learned there',
            'And explain why you found it memorable',
          ],
          prepSeconds: 60,
          recommendedSeconds: 120,
        },
      ],
    },
  ],
  null,
  2
);

export function QuestionBank({
  topics,
  onSaveTopics,
  onPracticeTopicBlind,
}: QuestionBankProps) {
  const [partFilter, setPartFilter] = useState<SpeakingPart | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Add / Edit modal state
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formPart, setFormPart] = useState<SpeakingPart>(1);
  const [formCategory, setFormCategory] = useState('');
  const [formQuestionsText, setFormQuestionsText] = useState('');
  const [formCuePointsText, setFormCuePointsText] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Import modal state
  const [importOpen, setImportOpen] = useState(false);
  const [importRaw, setImportRaw] = useState('');
  const [importDefaultPart, setImportDefaultPart] = useState<SpeakingPart>(1);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const filteredTopics = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return topics.filter((t) => {
      if (partFilter !== 'all' && t.part !== partFilter) return false;
      if (!q) return true;
      return (
        t.title.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.questions.some((item) => item.text.toLowerCase().includes(q))
      );
    });
  }, [topics, partFilter, searchQuery]);

  const countsByPart = useMemo(() => {
    return {
      all: topics.length,
      1: topics.filter((t) => t.part === 1).length,
      2: topics.filter((t) => t.part === 2).length,
      3: topics.filter((t) => t.part === 3).length,
    };
  }, [topics]);

  const openCreateModal = () => {
    setEditingTopicId(null);
    setFormTitle('');
    setFormPart(partFilter === 'all' ? 1 : partFilter);
    setFormCategory('');
    setFormQuestionsText('');
    setFormCuePointsText('');
    setFormError(null);
    setEditorOpen(true);
  };

  const openEditModal = (topic: TopicSet) => {
    setEditingTopicId(topic.id);
    setFormTitle(topic.title);
    setFormPart(topic.part);
    setFormCategory(topic.category);
    setFormQuestionsText(topic.questions.map((q) => q.text).join('\n'));
    setFormCuePointsText(
      topic.part === 2 && topic.questions[0]?.cuePoints
        ? topic.questions[0].cuePoints.join('\n')
        : ''
    );
    setFormError(null);
    setEditorOpen(true);
  };

  const handleSaveEditor = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanTitle = formTitle.trim();
    if (!cleanTitle) {
      setFormError('Vui lòng nhập tên chủ đề (ví dụ: Holiday, Environment...).');
      return;
    }

    const questionLines = formQuestionsText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    if (questionLines.length === 0) {
      setFormError('Vui lòng nhập ít nhất 1 câu hỏi tiếng Anh (mỗi câu một dòng).');
      return;
    }

    const timing = getDefaultTimingForPart(formPart);
    const cuePoints =
      formPart === 2
        ? formCuePointsText
            .split(/\r?\n/)
            .map((l) => l.trim())
            .filter(Boolean)
        : undefined;

    const builtQuestions: SpeakingQuestion[] = questionLines.map((text, idx) => ({
      id: `q-${Date.now().toString(36)}-${idx}`,
      text,
      cuePoints: formPart === 2 && idx === 0 && cuePoints && cuePoints.length > 0 ? cuePoints : undefined,
      recommendedSeconds: timing.recommendedSeconds,
      prepSeconds: timing.prepSeconds,
    }));

    if (editingTopicId) {
      const updated = topics.map((t) =>
        t.id === editingTopicId
          ? {
              ...t,
              title: cleanTitle,
              part: formPart,
              category: formCategory.trim() || 'General',
              questions: builtQuestions,
              isCustom: true,
            }
          : t
      );
      onSaveTopics(updated);
    } else {
      const newTopic: TopicSet = {
        id: `topic-${Date.now().toString(36)}`,
        title: cleanTitle,
        part: formPart,
        category: formCategory.trim() || 'Custom Topic',
        questions: builtQuestions,
        isCustom: true,
        createdAt: new Date().toISOString(),
      };
      onSaveTopics([newTopic, ...topics]);
    }

    setEditorOpen(false);
  };

  const handleDeleteTopic = (topicId: string) => {
    const updated = topics.filter((t) => t.id !== topicId);
    onSaveTopics(updated);
    if (expandedId === topicId) setExpandedId(null);
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(topics, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ielts-with-felix-question-bank-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleResetDefaults = () => {
    onSaveTopics(DEFAULT_TOPIC_BANK);
  };

  const handleImportFileRead = (file: File | undefined) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setImportErrors(['Tệp import quá lớn (tối đa 2MB).']);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImportRaw(typeof reader.result === 'string' ? reader.result : '');
      setImportErrors([]);
      setImportSuccessMsg(null);
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    setImportErrors([]);
    setImportSuccessMsg(null);
    const result = parseImportedTopics(importRaw, importDefaultPart);
    if (result.topics.length === 0) {
      setImportErrors(
        result.errors.length > 0 ? result.errors : ['Không thể đọc dữ liệu bộ đề.']
      );
      return;
    }

    onSaveTopics([...result.topics, ...topics]);
    setImportSuccessMsg(`Đã import thành công ${result.topics.length} bộ đề mới vào ngân hàng!`);
    setImportRaw('');
    if (result.errors.length > 0) {
      setImportErrors(result.errors);
    } else {
      window.setTimeout(() => {
        setImportOpen(false);
        setImportSuccessMsg(null);
      }, 600);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Utility Actions */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2A1A22] tracking-tight">
            Ngân hàng bộ đề IELTS Speaking
          </h1>
          <p className="text-sm text-[#6E5662]">
            Tự do cập nhật, chỉnh sửa, thêm mới hoặc import bộ đề riêng theo chuẩn Part 1, Part 2 và Part 3.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-[#C93B72] hover:bg-[#B12F62] rounded-lg transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Thêm chủ đề</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setImportErrors([]);
              setImportSuccessMsg(null);
              setImportOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#2A1A22] bg-white border border-[#F3DCE5] hover:bg-[#FFF3F7] rounded-lg transition-colors whitespace-nowrap"
          >
            <FileUp className="w-4 h-4 text-[#C93B72]" aria-hidden="true" />
            <span>Import bộ đề</span>
          </button>

          <button
            type="button"
            onClick={handleExportJson}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-[#5A424E] bg-white border border-[#F3DCE5] hover:bg-[#FFF3F7] rounded-lg transition-colors whitespace-nowrap"
          >
            <Download className="w-4 h-4 text-[#7A606D]" aria-hidden="true" />
            <span>Xuất JSON</span>
          </button>

          <button
            type="button"
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#6E5662] hover:text-[#2A1A22] rounded-lg transition-colors whitespace-nowrap"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            <span>Đề mặc định</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-[#F3DCE5] rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div
          role="tablist"
          aria-label="Lọc bộ đề theo Part"
          className="inline-flex items-center p-1 bg-[#FCEBF1] rounded-lg self-start overflow-x-auto max-w-full"
        >
          {(
            [
              { id: 'all', label: `Tất cả (${countsByPart.all})` },
              { id: 1, label: `Part 1 · Intro (${countsByPart[1]})` },
              { id: 2, label: `Part 2 · Long-turn (${countsByPart[2]})` },
              { id: 3, label: `Part 3 · Discussion (${countsByPart[3]})` },
            ] as const
          ).map((tab) => (
            <button
              key={String(tab.id)}
              type="button"
              role="tab"
              aria-selected={partFilter === tab.id}
              onClick={() => setPartFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap tabular-nums ${
                partFilter === tab.id
                  ? 'bg-white text-[#2A1A22] shadow-sm font-semibold'
                  : 'text-[#6E5662] hover:text-[#2A1A22]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <label className="relative flex-1 max-w-sm">
          <span className="sr-only">Tìm kiếm chủ đề hoặc câu hỏi</span>
          <Search
            className="w-4 h-4 text-[#9A7F8D] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm chủ đề, từ khóa câu hỏi..."
            className="w-full pl-9 pr-3.5 py-2 text-sm bg-[#FFF8FA] border border-[#F3DCE5] rounded-lg text-[#2A1A22] placeholder:text-[#A48A97] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C93B72]"
          />
        </label>
      </div>

      {/* Topic Sets List */}
      <div className="space-y-3" data-testid="question-bank-list">
        {filteredTopics.map((topic) => {
          const isExpanded = expandedId === topic.id;
          return (
            <article
              key={topic.id}
              className="bg-white border border-[#F3DCE5] rounded-xl transition-colors"
            >
              <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#7A606D]">
                    <span className="font-semibold text-[#C93B72]">Part {topic.part}</span>
                    <span aria-hidden="true">·</span>
                    <span>{topic.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{topic.questions.length} câu hỏi</span>
                    {topic.isCustom && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-[#5A424E]">Tự tạo / Import</span>
                      </>
                    )}
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-[#2A1A22] truncate">
                    {topic.title}
                  </h2>
                  {topic.description && (
                    <p className="text-xs text-[#7A606D] line-clamp-1">{topic.description}</p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onPracticeTopicBlind(topic.id)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#3B1F2B] hover:bg-[#4E2939] rounded-lg transition-colors whitespace-nowrap"
                  >
                    <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Thi ẩn đề</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : topic.id)}
                    aria-expanded={isExpanded}
                    aria-label={`${isExpanded ? 'Thu gọn' : 'Xem câu hỏi'} chủ đề ${topic.title}`}
                    className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-[#5A424E] bg-white border border-[#F3DCE5] hover:bg-[#FFF3F7] rounded-lg transition-colors whitespace-nowrap"
                  >
                    <span>{isExpanded ? 'Ẩn câu hỏi' : 'Xem câu hỏi'}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => openEditModal(topic)}
                    aria-label={`Chỉnh sửa chủ đề ${topic.title}`}
                    className="p-2 text-[#6E5662] hover:text-[#C93B72] hover:bg-[#FCEBF1] rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" aria-hidden="true" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteTopic(topic.id)}
                    aria-label={`Xóa chủ đề ${topic.title}`}
                    className="p-2 text-[#7A606D] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="px-5 pb-5 pt-3 border-t border-[#F8E8EE] space-y-2.5 bg-[#FFF8FA] rounded-b-xl">
                  {topic.questions.map((q, idx) => (
                    <div key={q.id} className="text-sm text-[#2A1A22] space-y-1">
                      <p>
                        <span className="font-mono text-xs text-[#9A7F8D] mr-2">
                          {String(idx + 1).padStart(2, '0')}.
                        </span>
                        {q.text}
                      </p>
                      {q.cuePoints && q.cuePoints.length > 0 && (
                        <ul className="pl-7 list-disc text-xs text-[#6E5662] space-y-0.5">
                          {q.cuePoints.map((pt, pIdx) => (
                            <li key={pIdx}>{pt}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </article>
          );
        })}

        {filteredTopics.length === 0 && (
          <div className="bg-white border border-[#F3DCE5] rounded-xl p-10 text-center space-y-2">
            <p className="text-sm font-semibold text-[#2A1A22]">Không tìm thấy chủ đề phù hợp</p>
            <p className="text-xs text-[#7A606D]">
              Thử đổi từ khóa tìm kiếm hoặc thêm bộ đề mới của riêng bạn.
            </p>
          </div>
        )}
      </div>

      {/* Add / Edit Topic Modal */}
      {editorOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="topic-editor-title"
          className="fixed inset-0 z-50 bg-[#2A1A22]/40 backdrop-blur-[1px] flex items-center justify-center p-4"
        >
          <form
            onSubmit={handleSaveEditor}
            className="bg-white border border-[#F3DCE5] rounded-xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-xl"
          >
            <div className="flex items-center justify-between gap-3 border-b border-[#F8E8EE] pb-3">
              <h2 id="topic-editor-title" className="text-lg font-bold text-[#2A1A22]">
                {editingTopicId ? 'Chỉnh sửa chủ đề' : 'Thêm chủ đề Speaking mới'}
              </h2>
              <button
                type="button"
                onClick={() => setEditorOpen(false)}
                aria-label="Đóng hộp thoại"
                className="p-1.5 text-[#7A606D] hover:text-[#2A1A22] rounded-lg"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="topic-title-input" className="block text-xs font-semibold text-[#5A424E]">
                  Tên chủ đề *
                </label>
                <input
                  id="topic-title-input"
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Ví dụ: Holiday, Artificial Intelligence..."
                  className="w-full px-3.5 py-2 text-sm border border-[#F3DCE5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C93B72]"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="topic-part-select" className="block text-xs font-semibold text-[#5A424E]">
                  Phần thi *
                </label>
                <select
                  id="topic-part-select"
                  value={formPart}
                  onChange={(e) => setFormPart(Number(e.target.value) as SpeakingPart)}
                  className="w-full px-3.5 py-2 text-sm border border-[#F3DCE5] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#C93B72]"
                >
                  <option value={1}>Part 1 — Introduction</option>
                  <option value={2}>Part 2 — Long-turn (Cue Card)</option>
                  <option value={3}>Part 3 — Discussion</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="topic-category-input" className="block text-xs font-semibold text-[#5A424E]">
                Nhóm chủ đề
              </label>
              <input
                id="topic-category-input"
                type="text"
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                placeholder="Ví dụ: Travel & Leisure, Education, Technology..."
                className="w-full px-3.5 py-2 text-sm border border-[#F3DCE5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C93B72]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="topic-questions-textarea" className="block text-xs font-semibold text-[#5A424E]">
                Danh sách câu hỏi (mỗi câu một dòng) *
              </label>
              <textarea
                id="topic-questions-textarea"
                rows={5}
                value={formQuestionsText}
                onChange={(e) => setFormQuestionsText(e.target.value)}
                placeholder={
                  formPart === 2
                    ? 'Describe a trip that did not go as planned.'
                    : 'Do you like going on holiday?\nWhere did you go on your last holiday?'
                }
                className="w-full px-3.5 py-2.5 text-sm border border-[#F3DCE5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C93B72]"
              />
            </div>

            {formPart === 2 && (
              <div className="space-y-1.5">
                <label htmlFor="topic-cuepoints-textarea" className="block text-xs font-semibold text-[#5A424E]">
                  Các ý gợi ý trong Cue Card (You should say — mỗi ý một dòng)
                </label>
                <textarea
                  id="topic-cuepoints-textarea"
                  rows={4}
                  value={formCuePointsText}
                  onChange={(e) => setFormCuePointsText(e.target.value)}
                  placeholder={'Where you went\nWho you travelled with\nWhat happened\nAnd explain how you felt about it'}
                  className="w-full px-3.5 py-2.5 text-sm border border-[#F3DCE5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C93B72]"
                />
              </div>
            )}

            {formError && (
              <p className="text-xs text-red-600" role="alert">
                {formError}
              </p>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#F8E8EE]">
              <button
                type="button"
                onClick={() => setEditorOpen(false)}
                className="px-4 py-2 text-sm font-medium text-[#6E5662] hover:text-[#2A1A22] rounded-lg"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-sm font-semibold text-white bg-[#C93B72] hover:bg-[#B12F62] rounded-lg transition-colors"
              >
                {editingTopicId ? 'Lưu thay đổi' : 'Tạo chủ đề'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Import Topics Modal */}
      {importOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="import-modal-title"
          className="fixed inset-0 z-50 bg-[#2A1A22]/40 backdrop-blur-[1px] flex items-center justify-center p-4"
        >
          <div className="bg-white border border-[#F3DCE5] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between gap-3 border-b border-[#F8E8EE] pb-3">
              <h2 id="import-modal-title" className="text-lg font-bold text-[#2A1A22]">
                Import bộ đề IELTS Speaking (.json hoặc văn bản)
              </h2>
              <button
                type="button"
                onClick={() => setImportOpen(false)}
                aria-label="Đóng hộp thoại import"
                className="p-1.5 text-[#7A606D] hover:text-[#2A1A22] rounded-lg"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#5A424E] bg-[#FCEBF1] hover:bg-[#F8DAE5] rounded-lg transition-colors"
                >
                  <FileUp className="w-3.5 h-3.5 text-[#C93B72]" aria-hidden="true" />
                  <span>Chọn tệp .json / .txt</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.txt,.md"
                  className="hidden"
                  onChange={(e) => {
                    handleImportFileRead(e.target.files?.[0]);
                    e.target.value = '';
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setImportRaw(SAMPLE_IMPORT_JSON);
                    setImportErrors([]);
                  }}
                  className="text-xs font-medium text-[#C93B72] hover:text-[#B12F62] px-2 py-1"
                >
                  Chèn JSON mẫu
                </button>
              </div>

              <label className="flex items-center gap-2 text-xs text-[#6E5662]">
                <span>Part mặc định (khi dùng văn bản):</span>
                <select
                  value={importDefaultPart}
                  onChange={(e) => setImportDefaultPart(Number(e.target.value) as SpeakingPart)}
                  className="border border-[#F3DCE5] rounded-md px-2 py-1 text-xs bg-white"
                >
                  <option value={1}>Part 1</option>
                  <option value={2}>Part 2</option>
                  <option value={3}>Part 3</option>
                </select>
              </label>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="import-textarea" className="block text-xs font-semibold text-[#5A424E]">
                Dán JSON hoặc danh sách đề theo cú pháp nhanh
              </label>
              <textarea
                id="import-textarea"
                rows={10}
                value={importRaw}
                onChange={(e) => setImportRaw(e.target.value)}
                placeholder={`Cách 1 (Văn bản nhanh):\nPart 1: Reading Habits\n- Do you enjoy reading books?\n- What kind of books do you prefer?\n\nPart 2: A Memorable Book\n- Describe a book that you enjoyed reading.\n> What the book was about\n> Why you liked it\n\nCách 2: Dán mảng JSON chuẩn (bấm "Chèn JSON mẫu" để xem).`}
                className="w-full px-3.5 py-2.5 text-xs font-mono border border-[#F3DCE5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C93B72]"
              />
            </div>

            {importErrors.length > 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg space-y-1" role="alert">
                {importErrors.map((err, idx) => (
                  <p key={idx} className="text-xs text-red-700">
                    {err}
                  </p>
                ))}
              </div>
            )}

            {importSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-medium">
                {importSuccessMsg}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#F8E8EE]">
              <button
                type="button"
                onClick={() => setImportOpen(false)}
                className="px-4 py-2 text-sm font-medium text-[#6E5662] hover:text-[#2A1A22] rounded-lg"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                className="px-5 py-2 text-sm font-semibold text-white bg-[#C93B72] hover:bg-[#B12F62] rounded-lg transition-colors"
              >
                Xác nhận Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
