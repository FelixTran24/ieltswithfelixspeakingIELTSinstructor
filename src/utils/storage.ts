import { DEFAULT_TOPIC_BANK } from '../data/defaultQuestions';
import { SEED_HISTORY_SESSIONS } from '../data/seedHistory';
import type { PracticeSession, TopicSet } from '../types/ielts';
import { calculateOverallBand, normalizeCriterionBand } from './ieltsLogic';

const TOPICS_STORAGE_KEY = 'orato_ielts_topics_v1';
const TOPICS_DEFAULTS_VERSION_KEY = 'orato_ielts_defaults_version';
const CURRENT_DEFAULTS_VERSION = 'focus-speaking-2026-11-17';
const HISTORY_STORAGE_KEY = 'orato_ielts_history_v1';

const DB_NAME = 'orato_ielts_audio_db';
const DB_VERSION = 1;
const AUDIO_STORE = 'recordings';

function openAudioDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB unavailable'));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(AUDIO_STORE)) {
        db.createObjectStore(AUDIO_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('Failed to open IndexedDB'));
  });
}

export async function saveRecordingBlob(sessionId: string, blob: Blob): Promise<void> {
  try {
    const db = await openAudioDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(AUDIO_STORE, 'readwrite');
      tx.objectStore(AUDIO_STORE).put(blob, sessionId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    // Gracefully degrade if IndexedDB is blocked in private mode
  }
}

export async function loadRecordingBlob(sessionId: string): Promise<Blob | null> {
  try {
    const db = await openAudioDb();
    const blob = await new Promise<Blob | null>((resolve, reject) => {
      const tx = db.transaction(AUDIO_STORE, 'readonly');
      const req = tx.objectStore(AUDIO_STORE).get(sessionId);
      req.onsuccess = () => resolve((req.result as Blob) ?? null);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return blob;
  } catch {
    return null;
  }
}

export async function deleteRecordingBlob(sessionId: string): Promise<void> {
  try {
    const db = await openAudioDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(AUDIO_STORE, 'readwrite');
      tx.objectStore(AUDIO_STORE).delete(sessionId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    // Ignore storage cleanup errors
  }
}

export function loadTopics(): TopicSet[] {
  try {
    const raw = localStorage.getItem(TOPICS_STORAGE_KEY);
    const savedVersion = localStorage.getItem(TOPICS_DEFAULTS_VERSION_KEY);
    if (!raw) {
      localStorage.setItem(TOPICS_DEFAULTS_VERSION_KEY, CURRENT_DEFAULTS_VERSION);
      return DEFAULT_TOPIC_BANK;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const storedTopics = parsed as TopicSet[];
      if (savedVersion !== CURRENT_DEFAULTS_VERSION) {
        const existingIds = new Set(storedTopics.map((t) => t.id));
        const customTopics = storedTopics.filter((t) => t.isCustom);
        const remainingStored = storedTopics.filter((t) => !t.isCustom);
        const newDefaultTopics = DEFAULT_TOPIC_BANK.filter((t) => !existingIds.has(t.id));
        const merged = [...customTopics, ...newDefaultTopics, ...remainingStored];
        localStorage.setItem(TOPICS_STORAGE_KEY, JSON.stringify(merged));
        localStorage.setItem(TOPICS_DEFAULTS_VERSION_KEY, CURRENT_DEFAULTS_VERSION);
        return merged;
      }
      return storedTopics;
    }
  } catch {
    // Fall back to default curated bank
  }
  return DEFAULT_TOPIC_BANK;
}

export function saveTopics(topics: TopicSet[]): void {
  try {
    localStorage.setItem(TOPICS_STORAGE_KEY, JSON.stringify(topics));
    localStorage.setItem(TOPICS_DEFAULTS_VERSION_KEY, CURRENT_DEFAULTS_VERSION);
  } catch {
    // Ignore quota errors
  }
}

const SEED_BY_ID = new Map(SEED_HISTORY_SESSIONS.map((s) => [s.id, s]));

function normalizeLoadedSession(session: PracticeSession): PracticeSession {
  // Refresh bundled seed sessions so they always reflect whole-integer bands + coherenceBoost
  if (session.isSeed && SEED_BY_ID.has(session.id)) {
    return SEED_BY_ID.get(session.id)!;
  }
  if (!session.analysis?.criteria) return session;

  const fc = normalizeCriterionBand(session.analysis.criteria.fluencyCoherence.band);
  const lr = normalizeCriterionBand(session.analysis.criteria.lexicalResource.band);
  const gra = normalizeCriterionBand(session.analysis.criteria.grammaticalRange.band);
  const pr = normalizeCriterionBand(session.analysis.criteria.pronunciation.band);

  return {
    ...session,
    analysis: {
      ...session.analysis,
      overallBand: calculateOverallBand(fc, lr, gra, pr),
      criteria: {
        fluencyCoherence: { ...session.analysis.criteria.fluencyCoherence, band: fc },
        lexicalResource: { ...session.analysis.criteria.lexicalResource, band: lr },
        grammaticalRange: { ...session.analysis.criteria.grammaticalRange, band: gra },
        pronunciation: { ...session.analysis.criteria.pronunciation, band: pr },
      },
    },
  };
}

export function loadHistory(): PracticeSession[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return SEED_HISTORY_SESSIONS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return (parsed as PracticeSession[]).map(normalizeLoadedSession);
    }
  } catch {
    // Fall back to seed history
  }
  return SEED_HISTORY_SESSIONS;
}

export function saveHistory(sessions: PracticeSession[]): void {
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(sessions));
  } catch {
    // Ignore quota errors
  }
}
