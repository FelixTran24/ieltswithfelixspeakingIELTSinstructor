import type {
  PracticeSession,
  PronunciationStatus,
  SpeakingPart,
  SpeakingQuestion,
  TopicSet,
} from '../types/ielts';

/**
 * Formats elapsed speaking duration (count-up) strictly as M:SS (e.g. 0:00, 0:42, 1:05, 12:08).
 */
export function formatDurationUp(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(Number.isFinite(totalSeconds) ? totalSeconds : 0));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Formats remaining exam countdown duration as M:SS, clamping at 0:00.
 */
export function formatCountdown(remainingSeconds: number): string {
  return formatDurationUp(Math.max(0, remainingSeconds));
}

/**
 * Official IELTS Speaking individual criteria are strictly whole integers (0 to 9).
 */
export function normalizeCriterionBand(val: unknown): number {
  const n = typeof val === 'number' && Number.isFinite(val) ? val : Number(val);
  if (!Number.isFinite(n)) return 6;
  return Math.min(9, Math.max(0, Math.round(n)));
}

/**
 * Official IELTS Band Score rounding:
 * Average of 4 whole-integer criteria rounded to nearest 0.5 (.25 -> .5, .75 -> next whole band).
 */
export function calculateOverallBand(
  fluencyCoherence: number,
  lexicalResource: number,
  grammaticalRange: number,
  pronunciation: number
): number {
  const clamp = (n: number) => Math.min(9, Math.max(0, Number.isFinite(n) ? n : 0));
  const avg = (clamp(fluencyCoherence) + clamp(lexicalResource) + clamp(grammaticalRange) + clamp(pronunciation)) / 4;
  return Math.round(avg * 2) / 2;
}

/**
 * Classifies a word-level pronunciation accuracy percentage into semantic buckets.
 */
export function getPronunciationStatus(accuracyPercent: number): PronunciationStatus {
  const pct = Math.min(100, Math.max(0, accuracyPercent));
  if (pct >= 85) return 'good';
  if (pct >= 65) return 'fair';
  return 'needs_work';
}

/**
 * Draws a random TopicSet for Blind Exam Mode without leaking questions up front.
 * Avoids repeating excludeTopicId whenever another candidate exists.
 */
export function drawRandomTopic(
  topics: TopicSet[],
  part: SpeakingPart | 'all',
  excludeTopicId?: string,
  rng: () => number = Math.random
): TopicSet | null {
  const eligible = topics.filter(
    (t) => (part === 'all' || t.part === part) && t.questions.length > 0
  );
  if (eligible.length === 0) return null;
  if (eligible.length === 1) return eligible[0];

  const nonRepeating = excludeTopicId
    ? eligible.filter((t) => t.id !== excludeTopicId)
    : eligible;
  const pool = nonRepeating.length > 0 ? nonRepeating : eligible;
  const idx = Math.floor(Math.min(0.999999, Math.max(0, rng())) * pool.length);
  return pool[idx];
}

/**
 * Draws a single random question across the filtered topic bank.
 */
export function drawRandomQuestion(
  topics: TopicSet[],
  part: SpeakingPart | 'all',
  excludeQuestionId?: string,
  rng: () => number = Math.random
): { topic: TopicSet; question: SpeakingQuestion } | null {
  const pairs: Array<{ topic: TopicSet; question: SpeakingQuestion }> = [];
  for (const topic of topics) {
    if (part !== 'all' && topic.part !== part) continue;
    for (const question of topic.questions) {
      pairs.push({ topic, question });
    }
  }
  if (pairs.length === 0) return null;
  if (pairs.length === 1) return pairs[0];

  const nonRepeating = excludeQuestionId
    ? pairs.filter((p) => p.question.id !== excludeQuestionId)
    : pairs;
  const pool = nonRepeating.length > 0 ? nonRepeating : pairs;
  const idx = Math.floor(Math.min(0.999999, Math.max(0, rng())) * pool.length);
  return pool[idx];
}

export function getDefaultTimingForPart(part: SpeakingPart): {
  recommendedSeconds: number;
  prepSeconds?: number;
} {
  if (part === 1) return { recommendedSeconds: 45 };
  if (part === 2) return { recommendedSeconds: 120, prepSeconds: 60 };
  return { recommendedSeconds: 75 };
}

export interface ParsedImportResult {
  topics: TopicSet[];
  errors: string[];
}

function normalizePart(val: unknown, fallback: SpeakingPart): SpeakingPart {
  if (val === 1 || val === '1' || String(val).toLowerCase().includes('part 1')) return 1;
  if (val === 2 || val === '2' || String(val).toLowerCase().includes('part 2')) return 2;
  if (val === 3 || val === '3' || String(val).toLowerCase().includes('part 3')) return 3;
  return fallback;
}

/**
 * Parses imported IELTS speaking topics from either:
 * 1) Structured JSON (array of TopicSets or single TopicSet object)
 * 2) Plain text / Markdown outline format:
 *    Part 1 | Holiday
 *    - Do you like holidays?
 *    - Where did you go on your last holiday?
 */
export function parseImportedTopics(
  rawInput: string,
  defaultPart: SpeakingPart = 1
): ParsedImportResult {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return { topics: [], errors: ['Nội dung import đang trống. Vui lòng dán JSON hoặc danh sách câu hỏi.'] };
  }

  const now = new Date().toISOString();
  const makeId = (prefix: string, idx: number) =>
    `${prefix}-${Date.now().toString(36)}-${idx}-${Math.random().toString(36).slice(2, 6)}`;

  // 1. Try JSON parsing if it starts with [ or {
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed);
      const list = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed.topics)
          ? parsed.topics
          : [parsed];

      const topics: TopicSet[] = [];
      const errors: string[] = [];

      list.forEach((item: Record<string, unknown>, tIdx: number) => {
        if (!item || typeof item !== 'object') {
          errors.push(`Mục #${tIdx + 1} không đúng định dạng đối tượng.`);
          return;
        }
        const title = String(item.title ?? item.topic ?? '').trim();
        if (!title) {
          errors.push(`Mục #${tIdx + 1} thiếu tên chủ đề (title).`);
          return;
        }
        const part = normalizePart(item.part, defaultPart);
        const timing = getDefaultTimingForPart(part);
        const rawQuestions = Array.isArray(item.questions) ? item.questions : [];
        const questions: SpeakingQuestion[] = [];

        rawQuestions.forEach((q: unknown, qIdx: number) => {
          if (typeof q === 'string' && q.trim()) {
            questions.push({
              id: makeId('q', qIdx),
              text: q.trim(),
              recommendedSeconds: timing.recommendedSeconds,
              prepSeconds: timing.prepSeconds,
            });
          } else if (q && typeof q === 'object') {
            const qObj = q as Record<string, unknown>;
            const text = String(qObj.text ?? qObj.question ?? '').trim();
            if (text) {
              const cuePoints = Array.isArray(qObj.cuePoints)
                ? qObj.cuePoints.map((c) => String(c).trim()).filter(Boolean)
                : undefined;
              questions.push({
                id: typeof qObj.id === 'string' && qObj.id.trim() ? qObj.id.trim() : makeId('q', qIdx),
                text,
                cuePoints: cuePoints && cuePoints.length > 0 ? cuePoints : undefined,
                recommendedSeconds:
                  typeof qObj.recommendedSeconds === 'number' && qObj.recommendedSeconds >= 15
                    ? Math.round(qObj.recommendedSeconds)
                    : timing.recommendedSeconds,
                prepSeconds:
                  typeof qObj.prepSeconds === 'number'
                    ? Math.round(qObj.prepSeconds)
                    : timing.prepSeconds,
              });
            }
          }
        });

        if (questions.length === 0) {
          errors.push(`Chủ đề "${title}" chưa có câu hỏi hợp lệ nào.`);
          return;
        }

        topics.push({
          id: typeof item.id === 'string' && item.id.trim() ? item.id.trim() : makeId('topic', tIdx),
          title,
          part,
          category: String(item.category ?? 'Custom Import').trim() || 'Custom Import',
          description: typeof item.description === 'string' ? item.description.trim() : undefined,
          questions,
          isCustom: true,
          createdAt: now,
        });
      });

      return { topics, errors };
    } catch {
      return {
        topics: [],
        errors: ['JSON không hợp lệ. Vui lòng kiểm tra dấu ngoặc kép, dấu phẩy hoặc dùng định dạng văn bản thường.'],
      };
    }
  }

  // 2. Plain text / Markdown outline parser
  const lines = trimmed.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const topics: TopicSet[] = [];
  let currentTopic: TopicSet | null = null;
  let activePart: SpeakingPart = defaultPart;
  let topicCounter = 0;

  const createTopic = (title: string, part: SpeakingPart): TopicSet => {
    const t: TopicSet = {
      id: makeId('topic', topicCounter++),
      title: title.trim() || `Custom Topic ${topicCounter}`,
      part,
      category: 'Imported',
      questions: [],
      isCustom: true,
      createdAt: now,
    };
    topics.push(t);
    return t;
  };

  for (const line of lines) {
    // Match header like "Part 1: Holiday", "# Part 2 | Travel", "Topic: Environment"
    const headerMatch = line.match(
      /^(?:#+\s*)?(?:part\s*([123])\s*[:|\-–]\s*(.+)|topic\s*[:|\-–]\s*(.+))$/i
    );
    if (headerMatch) {
      if (headerMatch[1] && headerMatch[2]) {
        activePart = Number(headerMatch[1]) as SpeakingPart;
        currentTopic = createTopic(headerMatch[2], activePart);
      } else if (headerMatch[3]) {
        currentTopic = createTopic(headerMatch[3], activePart);
      }
      continue;
    }

    // Bullet / numbered question line
    const cleanQ = line.replace(/^(?:[-*•]|\d+[.)])\s+/, '').trim();
    if (!cleanQ) continue;

    // For Part 2, lines starting with ">" or "Cue:" attach as cuePoints to last question
    if (
      currentTopic !== null &&
      currentTopic.part === 2 &&
      currentTopic.questions.length > 0 &&
      (line.startsWith('>') || /^cue\s*:/i.test(cleanQ))
    ) {
      const point = cleanQ.replace(/^>\s*|^cue\s*:\s*/i, '').trim();
      if (point) {
        const lastQ = currentTopic.questions[currentTopic.questions.length - 1];
        lastQ.cuePoints = [...(lastQ.cuePoints ?? []), point];
      }
      continue;
    }

    if (currentTopic === null) {
      currentTopic = createTopic(`Chủ đề mới (Part ${activePart})`, activePart);
    }

    const timing = getDefaultTimingForPart(currentTopic.part);
    currentTopic.questions.push({
      id: makeId('q', currentTopic.questions.length),
      text: cleanQ,
      recommendedSeconds: timing.recommendedSeconds,
      prepSeconds: timing.prepSeconds,
    });
  }

  const validTopics = topics.filter((t) => t.questions.length > 0);
  if (validTopics.length === 0) {
    return {
      topics: [],
      errors: ['Không tìm thấy câu hỏi hợp lệ nào trong nội dung đã dán.'],
    };
  }

  return { topics: validTopics, errors: [] };
}

export interface ProgressStats {
  totalSessions: number;
  totalSpeakingSeconds: number;
  averageBand: number;
  latestBand: number;
  bandDelta: number;
  criteriaAverages: {
    fluencyCoherence: number;
    lexicalResource: number;
    grammaticalRange: number;
    pronunciation: number;
  };
  averagePronunciationAccuracy: number;
}

/**
 * Computes longitudinal IELTS progress statistics from practice session history.
 */
export function computeProgressStats(sessions: PracticeSession[]): ProgressStats {
  if (sessions.length === 0) {
    return {
      totalSessions: 0,
      totalSpeakingSeconds: 0,
      averageBand: 0,
      latestBand: 0,
      bandDelta: 0,
      criteriaAverages: {
        fluencyCoherence: 0,
        lexicalResource: 0,
        grammaticalRange: 0,
        pronunciation: 0,
      },
      averagePronunciationAccuracy: 0,
    };
  }

  // Sort oldest -> newest for trend delta
  const chronological = [...sessions].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  let sumOverall = 0;
  let sumFC = 0;
  let sumLR = 0;
  let sumGRA = 0;
  let sumPR = 0;
  let sumAcc = 0;
  let totalSec = 0;

  for (const s of chronological) {
    sumOverall += s.analysis.overallBand;
    sumFC += s.analysis.criteria.fluencyCoherence.band;
    sumLR += s.analysis.criteria.lexicalResource.band;
    sumGRA += s.analysis.criteria.grammaticalRange.band;
    sumPR += s.analysis.criteria.pronunciation.band;
    sumAcc += s.analysis.pronunciationAnalysis.overallAccuracyPercent;
    totalSec += s.durationSeconds;
  }

  const count = chronological.length;
  const round1 = (n: number) => Math.round(n * 10) / 10;
  const firstBand = chronological[0].analysis.overallBand;
  const latestBand = chronological[count - 1].analysis.overallBand;

  return {
    totalSessions: count,
    totalSpeakingSeconds: totalSec,
    averageBand: round1(sumOverall / count),
    latestBand,
    bandDelta: count >= 2 ? round1(latestBand - firstBand) : 0,
    criteriaAverages: {
      fluencyCoherence: round1(sumFC / count),
      lexicalResource: round1(sumLR / count),
      grammaticalRange: round1(sumGRA / count),
      pronunciation: round1(sumPR / count),
    },
    averagePronunciationAccuracy: Math.round(sumAcc / count),
  };
}
