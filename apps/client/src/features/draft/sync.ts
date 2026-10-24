import { ApiError } from '@learntify/api-client';
import type { LessonDraft } from '@learntify/api-contracts';

export interface DraftPort {
  openDraft(lessonId: string, lessonVersion: number): Promise<LessonDraft>;
  getDraft(id: string): Promise<LessonDraft>;
  saveDraft(input: {
    id: string;
    content: string;
    expectedRevision: number;
    operationId: string;
  }): Promise<{ revision: number }>;
}
export type DraftState = {
  opened?: true;
  content: string;
  status: 'loading' | 'saved' | 'pending' | 'saving' | 'error' | 'conflict';
  dirty: boolean;
  remote?: LessonDraft;
};

/** One serialized save stream per mounted lesson/account. Failed requests retain their operation ID. */
export class DraftSync {
  private draft?: LessonDraft;
  private pending: Parameters<DraftPort['saveDraft']>[0] | undefined;
  private timer?: ReturnType<typeof setTimeout>;
  private disposed = false;
  private busy = false;
  state: DraftState = { content: '', status: 'loading', dirty: false };
  constructor(
    private readonly api: DraftPort,
    private readonly lessonId: string,
    private readonly version: number,
    private readonly changed: (state: DraftState) => void,
  ) {}

  private emit(update: Partial<DraftState>) {
    if (this.disposed) return;
    this.state = { ...this.state, ...update };
    this.changed(this.state);
  }
  async start() {
    if (this.busy || this.disposed) return;
    this.busy = true;
    this.emit({ status: 'loading' });
    try {
      const draft = await this.api.openDraft(this.lessonId, this.version);
      if (this.disposed) return;
      this.draft = draft;
      this.emit({ content: draft.content, status: 'saved', dirty: false, opened: true });
    } catch {
      this.emit({ status: 'error' });
    } finally {
      this.busy = false;
    }
  }
  edit(content: string) {
    if (!this.draft || this.disposed || this.state.status === 'loading') return;
    const blocked = this.state.status === 'error' || this.state.status === 'conflict';
    this.emit({
      content,
      dirty: Boolean(this.pending) || content !== this.draft.content,
      status: blocked ? this.state.status : this.busy ? 'saving' : 'pending',
    });
    if (!blocked) this.schedule();
  }
  private schedule() {
    clearTimeout(this.timer);
    if (this.disposed || this.busy) return;
    if (this.state.content === this.draft?.content && !this.pending) {
      this.emit({ status: 'saved', dirty: false });
      return;
    }
    this.timer = setTimeout(() => {
      void this.save();
    }, 1200);
  }
  async retry() {
    if (!this.draft) return this.start();
    if (this.state.status === 'conflict') return;
    return this.save();
  }
  private async save() {
    if (!this.draft || this.busy || this.disposed) return;
    if (!this.pending && this.state.content === this.draft.content) {
      this.emit({ status: 'saved', dirty: false });
      return;
    }
    this.busy = true;
    this.pending ??= {
      id: this.draft.id,
      content: this.state.content,
      expectedRevision: this.draft.revision,
      operationId: crypto.randomUUID(),
    };
    const operation = this.pending;
    this.emit({ status: 'saving', dirty: true });
    try {
      const result = await this.api.saveDraft(operation);
      if (this.disposed) return;
      this.draft = { id: operation.id, content: operation.content, revision: result.revision };
      this.pending = undefined;
      const dirty = this.state.content !== operation.content;
      this.emit({ status: dirty ? 'pending' : 'saved', dirty });
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        try {
          const remote = await this.api.getDraft(operation.id);
          this.emit({ status: 'conflict', remote, dirty: true });
        } catch {
          this.emit({ status: 'error', dirty: true });
        }
      } else this.emit({ status: 'error', dirty: true });
    } finally {
      this.busy = false;
      if (this.state.status === 'pending') this.schedule();
    }
  }
  resolve(choice: 'local' | 'remote') {
    if (this.state.status !== 'conflict' || !this.state.remote || this.busy || this.disposed)
      return;
    const remote = this.state.remote;
    this.draft = remote;
    this.pending = undefined;
    const content = choice === 'remote' ? remote.content : this.state.content;
    // Drop the comparison snapshot after an explicit choice.
    this.state = {
      opened: true,
      content,
      status: content === remote.content ? 'saved' : 'pending',
      dirty: content !== remote.content,
    };
    this.emit({});
    if (this.state.dirty) this.schedule();
  }
  async refresh() {
    if (
      !this.draft ||
      this.busy ||
      this.state.dirty ||
      this.disposed ||
      this.state.status !== 'saved'
    )
      return;
    this.busy = true;
    this.emit({ status: 'loading' });
    try {
      const draft = await this.api.getDraft(this.draft.id);
      if (this.disposed) return;
      this.draft = draft;
      this.emit({ content: draft.content, status: 'saved', dirty: false });
    } catch {
      this.emit({ status: 'error' });
    } finally {
      this.busy = false;
    }
  }
  dispose() {
    this.disposed = true;
    clearTimeout(this.timer);
  }
}
