export type Draft = { id: string; ownerId: string; content: string; revision: number };
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
  open(ownerId: string, lessonId: string, lessonVersion: number): Promise<Draft>;
  get(id: string, ownerId: string): Promise<Draft | undefined>;
  save(input: SaveDraft): Promise<SaveResult>;
}
