import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateOverallBand,
  computeProgressStats,
  drawRandomQuestion,
  drawRandomTopic,
  formatCountdown,
  formatDurationUp,
  getPronunciationStatus,
  normalizeCriterionBand,
  parseImportedTopics,
} from './ieltsLogic';
import type { PracticeSession, TopicSet } from '../types/ielts';

test('formatDurationUp formats count-up time strictly as M:SS', () => {
  assert.equal(formatDurationUp(0), '0:00');
  assert.equal(formatDurationUp(7), '0:07');
  assert.equal(formatDurationUp(59), '0:59');
  assert.equal(formatDurationUp(60), '1:00');
  assert.equal(formatDurationUp(125), '2:05');
  assert.equal(formatDurationUp(-5), '0:00');
  assert.equal(formatCountdown(-10), '0:00');
});

test('normalizeCriterionBand enforces whole-integer 0..9 IELTS criteria scores', () => {
  assert.equal(normalizeCriterionBand(6.4), 6);
  assert.equal(normalizeCriterionBand(6.5), 7);
  assert.equal(normalizeCriterionBand(7.0), 7);
  assert.equal(normalizeCriterionBand(10.2), 9);
  assert.equal(normalizeCriterionBand(-2), 0);
});

test('calculateOverallBand follows official IELTS 0.5 rounding rules from integer criteria', () => {
  // Average = 6.25 -> rounds up to 6.5
  assert.equal(calculateOverallBand(6, 6, 6, 7), 6.5);
  // Average = 6.75 -> rounds up to 7.0
  assert.equal(calculateOverallBand(7, 7, 7, 6), 7);
  // Average = 6.5 -> stays 6.5
  assert.equal(calculateOverallBand(6, 7, 7, 6), 6.5);
  // Clamping boundaries
  assert.equal(calculateOverallBand(9, 9, 9, 9), 9);
  assert.equal(calculateOverallBand(10, 10, 10, 10), 9);
});

test('getPronunciationStatus classifies accuracy percentages properly', () => {
  assert.equal(getPronunciationStatus(92), 'good');
  assert.equal(getPronunciationStatus(85), 'good');
  assert.equal(getPronunciationStatus(75), 'fair');
  assert.equal(getPronunciationStatus(65), 'fair');
  assert.equal(getPronunciationStatus(64), 'needs_work');
  assert.equal(getPronunciationStatus(20), 'needs_work');
});

test('drawRandomTopic and drawRandomQuestion respect part filtering and non-repetition', () => {
  const sampleTopics: TopicSet[] = [
    {
      id: 't1',
      title: 'Holiday',
      part: 1,
      category: 'Lifestyle',
      createdAt: '2026-01-01T00:00:00Z',
      questions: [
        { id: 'q1', text: 'Do you like holidays?', recommendedSeconds: 45 },
        { id: 'q2', text: 'Where do you usually go?', recommendedSeconds: 45 },
      ],
    },
    {
      id: 't2',
      title: 'Work & Study',
      part: 1,
      category: 'Personal',
      createdAt: '2026-01-01T00:00:00Z',
      questions: [{ id: 'q3', text: 'Do you work or study?', recommendedSeconds: 45 }],
    },
    {
      id: 't3',
      title: 'A Memorable Trip',
      part: 2,
      category: 'Travel',
      createdAt: '2026-01-01T00:00:00Z',
      questions: [{ id: 'q4', text: 'Describe a memorable trip.', recommendedSeconds: 120, prepSeconds: 60 }],
    },
  ];

  // Exclude t1 -> must pick t2 for Part 1
  const drawnTopic = drawRandomTopic(sampleTopics, 1, 't1', () => 0);
  assert.equal(drawnTopic?.id, 't2');

  // Part 2 must pick t3
  const part2Topic = drawRandomTopic(sampleTopics, 2, undefined, () => 0.5);
  assert.equal(part2Topic?.id, 't3');

  // Part 3 empty -> null
  assert.equal(drawRandomTopic(sampleTopics, 3), null);

  // Single random question avoids excluded question id
  const drawnQ = drawRandomQuestion(sampleTopics, 1, 'q1', () => 0);
  assert.notEqual(drawnQ?.question.id, 'q1');
  assert.equal(drawnQ?.topic.part, 1);
});

test('parseImportedTopics parses valid JSON and plain-text outlines and rejects empty input', () => {
  const emptyRes = parseImportedTopics('   ');
  assert.equal(emptyRes.topics.length, 0);
  assert.ok(emptyRes.errors.length > 0);

  const jsonInput = JSON.stringify([
    {
      title: 'Coffee & Tea',
      part: 1,
      category: 'Food & Drink',
      questions: ['Do you prefer coffee or tea?', 'When do you usually drink it?'],
    },
  ]);
  const jsonRes = parseImportedTopics(jsonInput);
  assert.equal(jsonRes.errors.length, 0);
  assert.equal(jsonRes.topics.length, 1);
  assert.equal(jsonRes.topics[0].title, 'Coffee & Tea');
  assert.equal(jsonRes.topics[0].questions.length, 2);

  const textInput = `
Part 1: Reading Habits
- Do you enjoy reading books?
- What kind of books did you read as a child?

Part 2: A Book You Enjoyed
- Describe a book that you enjoyed reading recently.
> What the book was about
> Why you chose to read it
  `;
  const textRes = parseImportedTopics(textInput);
  assert.equal(textRes.errors.length, 0);
  assert.equal(textRes.topics.length, 2);
  assert.equal(textRes.topics[0].part, 1);
  assert.equal(textRes.topics[0].questions.length, 2);
  assert.equal(textRes.topics[1].part, 2);
  assert.deepEqual(textRes.topics[1].questions[0].cuePoints, [
    'What the book was about',
    'Why you chose to read it',
  ]);
});

test('computeProgressStats calculates averages and longitudinal delta accurately', () => {
  const mkSession = (id: string, createdAt: string, band: number, durationSeconds: number): PracticeSession => ({
    id,
    createdAt,
    part: 1,
    topicId: 't1',
    topicTitle: 'Holiday',
    questionId: 'q1',
    questionText: 'Do you like holidays?',
    durationSeconds,
    hasAudio: false,
    analysis: {
      transcript: 'Sample',
      audioEvaluated: true,
      overallBand: band,
      criteria: {
        fluencyCoherence: { band, summaryVi: '', strengthsVi: [], improvementsVi: [] },
        lexicalResource: { band, summaryVi: '', strengthsVi: [], improvementsVi: [] },
        grammaticalRange: { band, summaryVi: '', strengthsVi: [], improvementsVi: [] },
        pronunciation: { band, summaryVi: '', strengthsVi: [], improvementsVi: [] },
      },
      pronunciationAnalysis: {
        overallAccuracyPercent: 80,
        summaryVi: '',
        words: [],
      },
      errorCorrections: [],
      vocabularyUpgrades: [],
      improvedAnswer: { bandTarget: '8.0', text: '', keyTakeawaysVi: [] },
      generalFeedbackVi: '',
    },
  });

  const stats = computeProgressStats([
    mkSession('s2', '2026-11-20T10:00:00Z', 7.0, 90),
    mkSession('s1', '2026-11-10T10:00:00Z', 6.0, 60),
  ]);

  assert.equal(stats.totalSessions, 2);
  assert.equal(stats.totalSpeakingSeconds, 150);
  assert.equal(stats.averageBand, 6.5);
  assert.equal(stats.latestBand, 7.0);
  assert.equal(stats.bandDelta, 1.0);
  assert.equal(stats.averagePronunciationAccuracy, 80);
});
