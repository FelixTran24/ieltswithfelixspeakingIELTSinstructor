import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { RUBRIC_PROMPT_SUMMARY } from './src/data/bandDescriptors.ts';
import {
  calculateOverallBand,
  getPronunciationStatus,
  normalizeCriterionBand,
} from './src/utils/ieltsLogic.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

const ALLOWED_AUDIO_MIMES = new Set([
  'audio/webm',
  'audio/wav',
  'audio/wave',
  'audio/x-wav',
  'audio/mp3',
  'audio/mpeg',
  'audio/ogg',
  'audio/mp4',
  'audio/m4a',
  'audio/aac',
]);

const ALLOWED_VOICES = new Set(['Kore', 'Charon', 'Zephyr', 'Puck', 'Fenrir']);
const MAX_AUDIO_BASE64_CHARS = 16 * 1024 * 1024; // ~12MB raw audio

function createGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }
  return new GoogleGenAI({
    apiKey,
    apiVersion: 'v1beta',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function isQuotaOrRateLimitError(err: unknown): boolean {
  const raw = err instanceof Error ? err.message : String(err);
  return raw.includes('429') || raw.includes('RESOURCE_EXHAUSTED') || raw.includes('quota');
}

function isTransientGeminiError(err: unknown): boolean {
  const raw = err instanceof Error ? err.message : String(err);
  return (
    raw.includes('503') ||
    raw.includes('UNAVAILABLE') ||
    raw.includes('high demand') ||
    raw.includes('overloaded') ||
    raw.includes('DEADLINE_EXCEEDED') ||
    raw.includes('ECONNRESET') ||
    raw.includes('fetch failed')
  );
}

async function withRetry<T>(fn: () => Promise<T>, maxAttempts = 3): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt < maxAttempts && isTransientGeminiError(err)) {
        const delayMs = 700 * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
}

function getFriendlyGeminiError(err: unknown): { status: number; message: string } {
  const raw = err instanceof Error ? err.message : String(err);
  // Log non-sensitive error summary for diagnostics
  console.error('[IELTS WITH FELIX Gemini API error]', raw.slice(0, 400));

  let parsedMsg = '';
  try {
    const start = raw.indexOf('{');
    if (start >= 0) {
      const obj = JSON.parse(raw.slice(start));
      if (typeof obj?.error?.message === 'string') {
        parsedMsg = obj.error.message;
      }
    }
  } catch {
    // fallback to raw snippet
  }
  const safeDetail = (parsedMsg || raw).replace(/AIza[0-9A-Za-z_-]+/g, '[redacted]').slice(0, 220);

  if (raw.includes('GEMINI_API_KEY is not configured') || raw.includes('API key not valid')) {
    return {
      status: 503,
      message: 'Hệ thống chưa được cấu hình GEMINI_API_KEY hợp lệ trong Settings > Secrets.',
    };
  }
  if (raw.includes('API_KEY_INVALID') || raw.includes('PERMISSION_DENIED') || raw.includes('403')) {
    return {
      status: 403,
      message: 'API key không hợp lệ hoặc bị từ chối quyền truy cập. Vui lòng kiểm tra trong Settings > Secrets.',
    };
  }
  if (raw.includes('RESOURCE_EXHAUSTED') || raw.includes('429')) {
    return {
      status: 429,
      message: 'Hệ thống đang đạt giới hạn lượt gọi tạm thời. Vui lòng đợi vài giây rồi bấm "Thử chấm lại".',
    };
  }
  if (isTransientGeminiError(err)) {
    return {
      status: 503,
      message: 'Máy chủ chấm điểm đang quá tải tạm thời. Bản ghi âm của bạn vẫn được giữ nguyên — hãy bấm "Thử chấm lại" sau vài giây.',
    };
  }
  if (raw.includes('INVALID_ARGUMENT') || raw.includes('"code":400')) {
    return {
      status: 400,
      message: `Dữ liệu âm thanh hoặc yêu cầu chưa hợp lệ (${safeDetail}).`,
    };
  }
  if (raw.includes('NOT_FOUND') || raw.includes('"code":404')) {
    return {
      status: 404,
      message: `Mô hình AI không khả dụng (${safeDetail}).`,
    };
  }
  return {
    status: 502,
    message: 'Không thể hoàn tất phân tích bài nói lúc này. Bản ghi âm vẫn được giữ nguyên — vui lòng bấm "Thử chấm lại".',
  };
}

const criterionSchema = {
  type: Type.OBJECT,
  properties: {
    band: {
      type: Type.INTEGER,
      description: 'Strict whole-number integer IELTS band score for this criterion: 0, 1, 2, 3, 4, 5, 6, 7, 8, or 9 (NEVER decimals like 6.5 or 7.5)',
    },
    summaryVi: { type: Type.STRING, description: 'Concise Vietnamese evaluation referencing the official IELTS Band Descriptors' },
    strengthsVi: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '1 to 3 concrete strengths observed in Vietnamese',
    },
    improvementsVi: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '1 to 3 concrete improvements needed to reach the next band in Vietnamese',
    },
  },
  required: ['band', 'summaryVi', 'strengthsVi', 'improvementsVi'],
};

const analysisResponseSchema = {
  type: Type.OBJECT,
  properties: {
    transcript: {
      type: Type.STRING,
      description: 'Accurate verbatim English transcript of what the speaker said',
    },
    criteria: {
      type: Type.OBJECT,
      properties: {
        fluencyCoherence: criterionSchema,
        lexicalResource: criterionSchema,
        grammaticalRange: criterionSchema,
        pronunciation: criterionSchema,
      },
      required: ['fluencyCoherence', 'lexicalResource', 'grammaticalRange', 'pronunciation'],
    },
    pronunciationAnalysis: {
      type: Type.OBJECT,
      properties: {
        overallAccuracyPercent: {
          type: Type.INTEGER,
          description: 'Estimated overall word-level pronunciation accuracy percentage from 0 to 100',
        },
        summaryVi: {
          type: Type.STRING,
          description: 'Summary in Vietnamese of phonetic strengths, stress, rhythm, and recurring pronunciation errors',
        },
        words: {
          type: Type.ARRAY,
          description:
            'Up to 24 key content words from the answer, prioritizing any mispronounced or slightly unclear words first, followed by notable well-pronounced words',
          items: {
            type: Type.OBJECT,
            properties: {
              word: { type: Type.STRING, description: 'Correct intended English target word' },
              heardAs: {
                type: Type.STRING,
                description: 'If mispronounced or unclear (<85%), what it sounded like; empty string if clear',
              },
              ipa: { type: Type.STRING, description: 'Standard IPA phonetic transcription enclosed in slashes, e.g. /ˈhɒl.ə.deɪ/' },
              accuracyPercent: { type: Type.INTEGER, description: 'Estimated pronunciation accuracy 0 to 100 for this word' },
              fixTip: {
                type: Type.STRING,
                description: 'Actionable Vietnamese tip on articulators, stress, vowel length, or ending sound',
              },
            },
            required: ['word', 'ipa', 'accuracyPercent', 'fixTip'],
          },
        },
      },
      required: ['overallAccuracyPercent', 'summaryVi', 'words'],
    },
    errorCorrections: {
      type: Type.ARRAY,
      description: 'Detailed naturalness, grammar, collocation, fluency, or pronunciation fixes based on the transcript',
      items: {
        type: Type.OBJECT,
        properties: {
          original: { type: Type.STRING, description: 'Exact phrase or error from the candidate speech' },
          corrected: { type: Type.STRING, description: 'More natural, accurate English phrasing' },
          category: {
            type: Type.STRING,
            description: 'One of: Grammar, Vocabulary, Collocation, Fluency, Pronunciation',
          },
          explanationVi: { type: Type.STRING, description: 'Clear Vietnamese explanation of why the correction sounds more natural' },
        },
        required: ['original', 'corrected', 'category', 'explanationVi'],
      },
    },
    vocabularyUpgrades: {
      type: Type.ARRAY,
      description: '5 to 7 high-value IELTS Collocations, Idioms, Natural Phrases, and Topic Vocabulary tailored to expand this answer',
      items: {
        type: Type.OBJECT,
        properties: {
          expression: { type: Type.STRING },
          type: {
            type: Type.STRING,
            description: 'One of: Collocation, Idiom, Natural Phrase, Topic Vocabulary',
          },
          ipa: { type: Type.STRING, description: 'IPA transcription of the expression or key headword' },
          meaningVi: { type: Type.STRING, description: 'Vietnamese meaning' },
          usageExample: { type: Type.STRING, description: 'Natural example sentence directly usable for this speaking question' },
        },
        required: ['expression', 'type', 'ipa', 'meaningVi', 'usageExample'],
      },
    },
    coherenceBoost: {
      type: Type.OBJECT,
      description: 'Actionable ideas to extend coherence & logical flow plus natural spoken connectors tailored to this answer',
      properties: {
        ideaExtensions: {
          type: Type.ARRAY,
          description: '2 to 4 concrete angles/ideas to expand this specific answer logically and boost Coherence',
          items: {
            type: Type.OBJECT,
            properties: {
              angleVi: {
                type: Type.STRING,
                description: 'Short Vietnamese label of the expansion strategy, e.g. "So sánh trước và sau", "Đưa ví dụ cá nhân cụ thể", "Nêu góc nhìn đối lập"',
              },
              ideaEn: {
                type: Type.STRING,
                description: 'Natural 1-2 sentence English idea the learner can add right into their speech',
              },
              explanationVi: {
                type: Type.STRING,
                description: 'Concise Vietnamese explanation of why this idea deepens coherence and topic development',
              },
            },
            required: ['angleVi', 'ideaEn', 'explanationVi'],
          },
        },
        recommendedConnectors: {
          type: Type.ARRAY,
          description: '4 to 6 natural spoken IELTS connectors / discourse markers suited to this response',
          items: {
            type: Type.OBJECT,
            properties: {
              connector: { type: Type.STRING, description: 'The English connector or discourse marker, e.g. "That being said,", "On top of that,", "To put it simply,"' },
              functionVi: { type: Type.STRING, description: 'Vietnamese function label, e.g. "Mở rộng thêm ý", "Chuyển hướng phản biện nhẹ nhàng"' },
              exampleInContext: { type: Type.STRING, description: 'Natural English sentence demonstrating this connector inside the candidate own topic' },
            },
            required: ['connector', 'functionVi', 'exampleInContext'],
          },
        },
      },
      required: ['ideaExtensions', 'recommendedConnectors'],
    },
    improvedAnswer: {
      type: Type.OBJECT,
      properties: {
        bandTarget: { type: Type.STRING, description: 'Target band label such as Band 8.0 or Band 8.5' },
        text: {
          type: Type.STRING,
          description: 'A natural, upgraded Band 8.0+ spoken version preserving and expanding the user own ideas',
        },
        keyTakeawaysVi: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: '2 to 4 concise Vietnamese takeaways explaining how the upgraded response achieves a higher band',
        },
      },
      required: ['bandTarget', 'text', 'keyTakeawaysVi'],
    },
    generalFeedbackVi: {
      type: Type.STRING,
      description: 'Encouraging, honest 2-3 sentence examiner coaching summary in Vietnamese',
    },
  },
  required: [
    'transcript',
    'criteria',
    'pronunciationAnalysis',
    'errorCorrections',
    'vocabularyUpgrades',
    'coherenceBoost',
    'improvedAnswer',
    'generalFeedbackVi',
  ],
};

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '20mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  /**
   * Realistic IELTS Examiner Text-to-Speech via Gemini 3.8 Flash Lite TTS
   */
  app.post('/api/tts', async (req, res) => {
    try {
      const { text, voiceName, style } = req.body ?? {};
      if (typeof text !== 'string' || text.trim().length === 0) {
        return res.status(400).json({ error: 'Vui lòng cung cấp nội dung văn bản để đọc.' });
      }
      if (text.length > 1800) {
        return res.status(400).json({ error: 'Đoạn văn bản quá dài (tối đa 1800 ký tự).' });
      }

      const safeVoice =
        typeof voiceName === 'string' && ALLOWED_VOICES.has(voiceName) ? voiceName : 'Kore';
      const safeStyle =
        typeof style === 'string' && style.trim().length > 0 && style.length <= 200
          ? style.trim()
          : 'Warm, calm, articulate British IELTS speaking examiner speaking naturally at a clear moderate pace';

      const ai = createGeminiClient();
      const ttsConfig = {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: safeVoice },
          },
        },
      };

      let response;
      try {
        response = await withRetry(
          () =>
            ai.models.generateContent({
              model: 'gemini-3.8-flash-lite-tts',
              contents: [
                {
                  role: 'user',
                  parts: [
                    {
                      text: text.trim(),
                      speechMetadata: {
                        style: safeStyle,
                      },
                    },
                  ],
                },
              ],
              config: ttsConfig,
            }),
          2
        );
      } catch (firstErr) {
        const msg = firstErr instanceof Error ? firstErr.message : String(firstErr);
        if (msg.includes('speechMetadata')) {
          response = await withRetry(
            () =>
              ai.models.generateContent({
                model: 'gemini-3.8-flash-lite-tts',
                contents: [
                  {
                    role: 'user',
                    parts: [{ text: text.trim() }],
                  },
                ],
                config: ttsConfig,
              }),
            2
          );
        } else {
          throw firstErr;
        }
      }

      const candidateParts = response.candidates?.[0]?.content?.parts ?? [];
      const audioPart = candidateParts.find((p) => p.inlineData?.data);
      const base64Audio = audioPart?.inlineData?.data;
      if (!base64Audio) {
        return res.status(502).json({ error: 'Không nhận được dữ liệu âm thanh từ máy chủ giọng nói.' });
      }

      return res.json({
        audioBase64: base64Audio,
        mimeType: audioPart?.inlineData?.mimeType || 'audio/wav',
      });
    } catch (err) {
      const friendly = getFriendlyGeminiError(err);
      return res.status(friendly.status).json({ error: friendly.message });
    }
  });

  /**
   * Multimodal IELTS Speaking Transcription + Pronunciation IPA Analysis + Official Rubric Grading
   */
  app.post('/api/analyze-speaking', async (req, res) => {
    try {
      const {
        audioBase64,
        mimeType,
        transcriptOverride,
        question,
        part,
        topic,
        durationSeconds,
        cuePoints,
      } = req.body ?? {};

      if (typeof question !== 'string' || !question.trim()) {
        return res.status(400).json({ error: 'Thiếu nội dung câu hỏi IELTS.' });
      }

      const safePart = part === 1 || part === 2 || part === 3 ? part : 1;
      const safeTopic = typeof topic === 'string' && topic.trim() ? topic.trim().slice(0, 120) : 'General';
      const safeDuration =
        typeof durationSeconds === 'number' && Number.isFinite(durationSeconds)
          ? Math.max(0, Math.min(600, Math.round(durationSeconds)))
          : 0;
      const safeCuePoints = Array.isArray(cuePoints)
        ? cuePoints.map((c) => String(c).trim()).filter(Boolean).slice(0, 6)
        : [];

      const hasAudio = typeof audioBase64 === 'string' && audioBase64.trim().length > 0;
      const hasTranscriptOverride =
        typeof transcriptOverride === 'string' && transcriptOverride.trim().length > 0;

      if (!hasAudio && !hasTranscriptOverride) {
        return res
          .status(400)
          .json({ error: 'Vui lòng ghi âm bài nói hoặc nhập transcript để bắt đầu chấm điểm.' });
      }

      let cleanMime = 'audio/webm';
      if (hasAudio) {
        if (audioBase64.length > MAX_AUDIO_BASE64_CHARS) {
          return res.status(413).json({ error: 'File ghi âm quá lớn (tối đa 12MB).' });
        }
        cleanMime = String(mimeType || 'audio/webm').split(';')[0].trim().toLowerCase();
        if (!ALLOWED_AUDIO_MIMES.has(cleanMime)) {
          return res.status(400).json({ error: `Định dạng âm thanh không được hỗ trợ (${cleanMime}).` });
        }
      }

      const ai = createGeminiClient();
      let verbatimTranscript = hasTranscriptOverride ? transcriptOverride.trim().slice(0, 6000) : '';
      let transcribeError: string | null = null;

      // Step 1: Use dedicated gemini-3.5-transcribe model for accurate verbatim English transcription when audio is provided
      if (hasAudio) {
        try {
          const transcribeResponse = await withRetry(
            () =>
              ai.models.generateContent({
                model: 'gemini-3.5-transcribe',
                contents: [
                  {
                    role: 'user',
                    parts: [
                      {
                        inlineData: {
                          mimeType: cleanMime,
                          data: audioBase64,
                        },
                      },
                      {
                        text: 'Transcribe this English IELTS Speaking response verbatim. Keep natural spoken words, hesitations, and exact spoken phrasing accurately in English without translating or fixing grammar.',
                      },
                    ],
                  },
                ],
              }),
            2
          );
          const transcribed = (transcribeResponse.text ?? '').trim();
          if (transcribed) {
            verbatimTranscript = transcribed;
          }
        } catch (tErr) {
          transcribeError = tErr instanceof Error ? tErr.message.slice(0, 220) : String(tErr);
          console.error('[IELTS WITH FELIX Transcribe warning]', transcribeError);
        }
      }

      // Step 2: Comprehensive IELTS Speaking evaluation with multimodal audio + official Band Descriptors
      const systemInstruction = `You are a certified Senior IELTS Speaking Examiner and English Phonetics Coach helping Vietnamese learners achieve high IELTS Speaking bands.
Evaluate strictly according to the official IELTS Speaking Band Descriptors below:
${RUBRIC_PROMPT_SUMMARY}

Important rules:
1. WHOLE-INTEGER CRITERIA SCORES ONLY: Just like real official IELTS examiners, EVERY individual criterion band (Fluency and Coherence, Lexical Resource, Grammatical Range and Accuracy, Pronunciation) MUST be a strict whole integer from 0 to 9 (e.g., 5, 6, 7, 8, 9 — NEVER decimals like 5.5, 6.5, or 7.5).
2. FAIR & SLIGHTLY LENIENT PRONUNCIATION SCORING: Candidates record on diverse consumer laptops, phones, and headsets with varying microphone quality, room echo, and browser audio compression. Be slightly lenient and fair on Pronunciation (give the candidate the benefit of the doubt on borderline bands and word accuracy percentages). Do NOT penalize muted frequencies, soft ending consonants lost to low-cost mic compression, or background noise as mispronunciations; focus constructive corrections only on clear, unmistakable vowel, stress, or phoneme issues.
3. Predict which target English word the candidate intended when a word clearly sounds mispronounced, record what it sounded like in "heardAs", provide accurate IPA (British/International standard in /.../), assign a fair accuracyPercent (0-100), and give a concrete Vietnamese articulatory tip in "fixTip".
4. Provide rich, directly usable Collocations, Idioms, Natural Phrases, and Topic Vocabulary tailored specifically to expand the candidate's own ideas.
5. In "coherenceBoost", suggest 2-4 specific idea expansion angles (e.g., past vs. present contrast, personal anecdote, cause-and-effect, counter-perspective) and 4-6 natural spoken IELTS connectors / discourse markers with full in-context examples showing how to connect sentences smoothly.
6. Keep all explanations, summaries, and tips in clear, natural Vietnamese; keep transcripts, corrections, vocabulary items, IPA, coherence ideas/examples, and improved model answers in natural English.`;

      const buildContextLines = (includeAudioNotice: boolean) =>
        [
          `IELTS Speaking Part: Part ${safePart}`,
          `Topic: ${safeTopic}`,
          `Question: ${question.trim()}`,
          safeCuePoints.length > 0 ? `Cue Card Points:\n- ${safeCuePoints.join('\n- ')}` : '',
          `Recorded Speaking Duration: ${safeDuration} seconds`,
          verbatimTranscript
            ? `Reference Verbatim Transcript:\n"""\n${verbatimTranscript}\n"""`
            : 'No pre-transcript available; please transcribe directly from the attached audio.',
          includeAudioNotice
            ? 'Audio is attached: carefully audit real acoustic pronunciation, word stress, ending sounds, connected speech, and fluency pauses from the recording.'
            : 'Evaluate based on the verbatim transcript above and provide realistic IPA pronunciation guidance and common Vietnamese-speaker articulation watchpoints for key content words.',
        ]
          .filter(Boolean)
          .join('\n\n');

      const runEvaluationModel = async (modelName: string, attachAudio: boolean) => {
        const reqParts: Array<{ inlineData?: { mimeType: string; data: string }; text?: string }> = [];
        if (attachAudio) {
          reqParts.push({
            inlineData: {
              mimeType: cleanMime,
              data: audioBase64,
            },
          });
        }
        reqParts.push({ text: buildContextLines(attachAudio) });

        return withRetry(
          () =>
            ai.models.generateContent({
              model: modelName,
              contents: [{ role: 'user', parts: reqParts }],
              config: {
                systemInstruction,
                responseMimeType: 'application/json',
                responseSchema: analysisResponseSchema,
              },
            }),
          3
        );
      };

      const evaluatorModels = ['gemini-4-hydrogen', 'gemini-3.1-flash-lite'];
      let evalResponse;
      let audioActuallyEvaluated = false;
      let lastEvalErr: unknown = null;

      for (const modelName of evaluatorModels) {
        try {
          if (hasAudio) {
            try {
              evalResponse = await runEvaluationModel(modelName, true);
              audioActuallyEvaluated = true;
              break;
            } catch (audioErr) {
              // If audio modality fails on this model but we already have verbatim transcript, try text evaluation
              if (!isTransientGeminiError(audioErr) && verbatimTranscript) {
                evalResponse = await runEvaluationModel(modelName, false);
                audioActuallyEvaluated = false;
                break;
              }
              throw audioErr;
            }
          } else {
            evalResponse = await runEvaluationModel(modelName, false);
            audioActuallyEvaluated = false;
            break;
          }
        } catch (modelErr) {
          lastEvalErr = modelErr;
          console.error(`[IELTS WITH FELIX Eval ${modelName} failed]`, (modelErr instanceof Error ? modelErr.message : String(modelErr)).slice(0, 220));
          // Fall through to next backup model on transient overload or per-model quota/rate-limit spikes
          if (!isTransientGeminiError(modelErr) && !isQuotaOrRateLimitError(modelErr)) {
            throw modelErr;
          }
        }
      }

      if (!evalResponse) {
        throw lastEvalErr ?? new Error('Evaluation failed across available models.');
      }

      const rawText = (evalResponse.text ?? '').trim();
      const rawJson = rawText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();

      if (!rawJson) {
        return res.status(502).json({ error: 'Không nhận được kết quả chấm điểm từ mô hình.' });
      }

      const parsed = JSON.parse(rawJson);

      const fc = normalizeCriterionBand(parsed.criteria?.fluencyCoherence?.band);
      const lr = normalizeCriterionBand(parsed.criteria?.lexicalResource?.band);
      const gra = normalizeCriterionBand(parsed.criteria?.grammaticalRange?.band);
      const pr = normalizeCriterionBand(parsed.criteria?.pronunciation?.band);
      const overallBand = calculateOverallBand(fc, lr, gra, pr);

      const allowedCategories = new Set([
        'Grammar',
        'Vocabulary',
        'Collocation',
        'Fluency',
        'Pronunciation',
      ]);
      const allowedUpgradeTypes = new Set([
        'Collocation',
        'Idiom',
        'Natural Phrase',
        'Topic Vocabulary',
      ]);

      const normalizedWords = Array.isArray(parsed.pronunciationAnalysis?.words)
        ? parsed.pronunciationAnalysis.words.map((w: Record<string, unknown>) => {
            const pct = Math.min(
              100,
              Math.max(0, Math.round(Number(w.accuracyPercent) || 82))
            );
            const heard = typeof w.heardAs === 'string' && w.heardAs.trim() ? w.heardAs.trim() : undefined;
            return {
              word: String(w.word ?? '').trim(),
              heardAs: pct < 85 ? heard : undefined,
              ipa: String(w.ipa ?? '').trim() || '/.../',
              accuracyPercent: pct,
              status: getPronunciationStatus(pct),
              fixTip: String(w.fixTip ?? '').trim(),
            };
          }).filter((w: { word: string }) => w.word.length > 0)
        : [];

      const overallAcc = Math.min(
        100,
        Math.max(
          0,
          Math.round(
            Number(parsed.pronunciationAnalysis?.overallAccuracyPercent) ||
              (normalizedWords.length > 0
                ? normalizedWords.reduce(
                    (acc: number, item: { accuracyPercent: number }) => acc + item.accuracyPercent,
                    0
                  ) / normalizedWords.length
                : 82)
          )
        )
      );

      const result = {
        transcript: String(parsed.transcript || verbatimTranscript || '').trim(),
        audioEvaluated: audioActuallyEvaluated,
        overallBand,
        criteria: {
          fluencyCoherence: {
            band: fc,
            summaryVi: String(parsed.criteria?.fluencyCoherence?.summaryVi ?? ''),
            strengthsVi: Array.isArray(parsed.criteria?.fluencyCoherence?.strengthsVi)
              ? parsed.criteria.fluencyCoherence.strengthsVi.map(String)
              : [],
            improvementsVi: Array.isArray(parsed.criteria?.fluencyCoherence?.improvementsVi)
              ? parsed.criteria.fluencyCoherence.improvementsVi.map(String)
              : [],
          },
          lexicalResource: {
            band: lr,
            summaryVi: String(parsed.criteria?.lexicalResource?.summaryVi ?? ''),
            strengthsVi: Array.isArray(parsed.criteria?.lexicalResource?.strengthsVi)
              ? parsed.criteria.lexicalResource.strengthsVi.map(String)
              : [],
            improvementsVi: Array.isArray(parsed.criteria?.lexicalResource?.improvementsVi)
              ? parsed.criteria.lexicalResource.improvementsVi.map(String)
              : [],
          },
          grammaticalRange: {
            band: gra,
            summaryVi: String(parsed.criteria?.grammaticalRange?.summaryVi ?? ''),
            strengthsVi: Array.isArray(parsed.criteria?.grammaticalRange?.strengthsVi)
              ? parsed.criteria.grammaticalRange.strengthsVi.map(String)
              : [],
            improvementsVi: Array.isArray(parsed.criteria?.grammaticalRange?.improvementsVi)
              ? parsed.criteria.grammaticalRange.improvementsVi.map(String)
              : [],
          },
          pronunciation: {
            band: pr,
            summaryVi: String(parsed.criteria?.pronunciation?.summaryVi ?? ''),
            strengthsVi: Array.isArray(parsed.criteria?.pronunciation?.strengthsVi)
              ? parsed.criteria.pronunciation.strengthsVi.map(String)
              : [],
            improvementsVi: Array.isArray(parsed.criteria?.pronunciation?.improvementsVi)
              ? parsed.criteria.pronunciation.improvementsVi.map(String)
              : [],
          },
        },
        pronunciationAnalysis: {
          overallAccuracyPercent: overallAcc,
          summaryVi: String(parsed.pronunciationAnalysis?.summaryVi ?? ''),
          words: normalizedWords,
        },
        errorCorrections: Array.isArray(parsed.errorCorrections)
          ? parsed.errorCorrections.map((e: Record<string, unknown>) => ({
              original: String(e.original ?? ''),
              corrected: String(e.corrected ?? ''),
              category: allowedCategories.has(String(e.category))
                ? String(e.category)
                : 'Grammar',
              explanationVi: String(e.explanationVi ?? ''),
            }))
          : [],
        vocabularyUpgrades: Array.isArray(parsed.vocabularyUpgrades)
          ? parsed.vocabularyUpgrades.map((v: Record<string, unknown>) => ({
              expression: String(v.expression ?? ''),
              type: allowedUpgradeTypes.has(String(v.type))
                ? String(v.type)
                : 'Collocation',
              ipa: String(v.ipa ?? ''),
              meaningVi: String(v.meaningVi ?? ''),
              usageExample: String(v.usageExample ?? ''),
            }))
          : [],
        coherenceBoost: {
          ideaExtensions: Array.isArray(parsed.coherenceBoost?.ideaExtensions)
            ? parsed.coherenceBoost.ideaExtensions.map((idea: Record<string, unknown>) => ({
                angleVi: String(idea.angleVi ?? ''),
                ideaEn: String(idea.ideaEn ?? ''),
                explanationVi: String(idea.explanationVi ?? ''),
              }))
            : [],
          recommendedConnectors: Array.isArray(parsed.coherenceBoost?.recommendedConnectors)
            ? parsed.coherenceBoost.recommendedConnectors.map((conn: Record<string, unknown>) => ({
                connector: String(conn.connector ?? ''),
                functionVi: String(conn.functionVi ?? ''),
                exampleInContext: String(conn.exampleInContext ?? ''),
              }))
            : [],
        },
        improvedAnswer: {
          bandTarget: String(parsed.improvedAnswer?.bandTarget || 'Band 8.0'),
          text: String(parsed.improvedAnswer?.text ?? ''),
          keyTakeawaysVi: Array.isArray(parsed.improvedAnswer?.keyTakeawaysVi)
            ? parsed.improvedAnswer.keyTakeawaysVi.map(String)
            : [],
        },
        generalFeedbackVi: String(parsed.generalFeedbackVi ?? ''),
      };

      return res.json(result);
    } catch (err) {
      const friendly = getFriendlyGeminiError(err);
      return res.status(friendly.status).json({ error: friendly.message });
    }
  });

  if (!IS_PROD) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distDir)) {
      app.use(express.static(distDir));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distDir, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`IELTS WITH FELIX server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start IELTS WITH FELIX server:', err);
  process.exit(1);
});
