export type Draft = { id: string; ownerId: string; content: string; revision: number };
export type PracticeAttempt = {
  id: string;
  lessonId: string;
  lessonVersion: number;
  code: string;
  matched: boolean;
};
export type PracticeProgress = {
  lessonId: string;
  lessonVersion: number;
  attempts: number;
  matched: boolean;
  lastPracticedAt: number;
};
export interface PracticeRepository {
  history(
    ownerId: string,
    lessonId: string,
    lessonVersion: number,
  ): Promise<(PracticeAttempt & { createdAt: number })[]>;
  save(
    ownerId: string,
    attempt: PracticeAttempt,
    now: number,
  ): Promise<'saved' | 'conflict' | 'limit'>;
  progress(ownerId: string): Promise<PracticeProgress[]>;
}

// A simple revisit reminder, not an adaptive mastery or spaced-repetition score.
export function reviewDueAt(progress: PracticeProgress): number {
  return progress.lastPracticedAt + (progress.matched ? 24 * 60 * 60 * 1000 : 0);
}
export type LearningPreferences = {
  locale: 'en' | 'es';
  goal: 'foundations' | 'projects' | 'interviews';
  weeklyMinutes: number | null;
};
export interface PreferencesRepository {
  get(ownerId: string): Promise<LearningPreferences | null>;
  save(ownerId: string, preferences: LearningPreferences): Promise<void>;
}
export type SaveDraft = {
  id: string;
  ownerId: string;
  content: string;
  expectedRevision: number;
  operationId: string;
};
export type SaveResult =
  | { kind: 'saved'; revision: number }
  | { kind: 'conflict'; revision: number }
  | { kind: 'missing' }
  | { kind: 'operation-conflict' };

export interface DraftRepository {
  open(
    ownerId: string,
    lessonId: string,
    lessonVersion: number,
    kind?: 'notes' | 'code',
    initialContent?: string,
  ): Promise<Draft>;
  get(id: string, ownerId: string): Promise<Draft | undefined>;
  save(input: SaveDraft): Promise<SaveResult>;
}
