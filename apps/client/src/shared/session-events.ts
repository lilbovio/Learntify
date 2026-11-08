export const sessionEvent = 'learntify:session-change';

export function notifySessionChange() {
  window.dispatchEvent(new Event(sessionEvent));
}
