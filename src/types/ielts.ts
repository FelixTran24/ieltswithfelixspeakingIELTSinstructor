export type SpeakingPart = 1 | 2 | 3;

export interface SpeakingQuestion {
  id: string;
  text: string;
  /** Only populated for Part 2 cue card bullet points */
  cuePoints?: string[];
  /** Suggested speaking target duration in seconds */
  recommendedSeconds: number;
  /** Optional preparation duration in seconds (60s for Part 2) */
  prepSeconds?: number;
}

export interface TopicSet {
  id: string;
  title: string;
  part: SpeakingPart;
  category: string;
  description?: string;
  questions: SpeakingQuestion[];
  isCustom?: boolean;
  createdAt: string;
}

export type PronunciationStatus = 'good' | 'fair' | 'needs_work';

export interface PronunciationWord {
  word: string;
  /** Predicted mispronounced sound or word if accuracy < 85 */
  heardAs?: string;
  ipa: string;
  accuracyPercent: number;
  status: PronunciationStatus;
  fixTip: string;
}

export interface CriterionEvaluation {
  band: number;
  summaryVi: string;
  strengthsVi: string[];
  improvementsVi: string[];
}

export interface ErrorCorrection {
  original: string;
  corrected: string;
  category: 'Grammar' | 'Vocabulary' | 'Collocation' | 'Fluency' | 'Pronunciation';
  explanationVi: string;
}

export interface VocabularyUpgrade {
  expression: string;
  type: 'Collocation' | 'Idiom' | 'Natural Phrase' | 'Topic Vocabulary';
  ipa: string;
  meaningVi: string;
  usageExample: string;
}

export interface CoherenceIdea {
  angleVi: string;
  ideaEn: string;
  explanationVi: string;
}

export interface CoherenceConnector {
  connector: string;
  functionVi: string;
  exampleInContext: string;
}

export interface SpeakingAnalysisResult {
  transcript: string;
  audioEvaluated: boolean;
  overallBand: number;
  criteria: {
    fluencyCoherence: CriterionEvaluation;
    lexicalResource: CriterionEvaluation;
    grammaticalRange: CriterionEvaluation;
    pronunciation: CriterionEvaluation;
  };
  pronunciationAnalysis: {
    overallAccuracyPercent: number;
    summaryVi: string;
    words: PronunciationWord[];
  };
  errorCorrections: ErrorCorrection[];
  vocabularyUpgrades: VocabularyUpgrade[];
  coherenceBoost?: {
    ideaExtensions: CoherenceIdea[];
    recommendedConnectors: CoherenceConnector[];
  };
  improvedAnswer: {
    bandTarget: string;
    text: string;
    keyTakeawaysVi: string[];
  };
  generalFeedbackVi: string;
}

export interface PracticeSession {
  id: string;
  createdAt: string;
  part: SpeakingPart;
  topicId: string;
  topicTitle: string;
  questionId: string;
  questionText: string;
  cuePoints?: string[];
  durationSeconds: number;
  hasAudio: boolean;
  audioMimeType?: string;
  analysis: SpeakingAnalysisResult;
  isSeed?: boolean;
}

export type ExaminerVoice = 'Kore' | 'Charon' | 'Zephyr' | 'Puck';

export type ActiveTab = 'practice' | 'bank' | 'history' | 'descriptors';
