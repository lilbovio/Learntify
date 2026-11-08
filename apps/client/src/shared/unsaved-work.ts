/**
 * Tracks whether the current screen holds unsaved work. The account disclosure
 * lives in the shared header, so it needs a small bridge to the page that owns
 * the edits. Pages update this through AccountPanel's `unsavedNotes` prop.
 */
let pending = false;

export function setUnsavedWork(value: boolean) {
  pending = value;
}

export function hasUnsavedWork() {
  return pending;
}

export function confirmSignOut(message: string) {
  return !pending || window.confirm(message);
}
