import type { Locale } from '@learntify/api-contracts';
type ChoiceContext = { id: string; version: number; exercise: { choices: { id: string }[] } };
const key = (lesson: ChoiceContext) => 'learntify:prediction:' + lesson.id + ':v' + lesson.version;

export function readChoice(storage: Pick<Storage, 'getItem'>, lesson: ChoiceContext): string {
  try {
    const value = storage.getItem(key(lesson));
    return value && lesson.exercise.choices.some((choice) => choice.id === value) ? value : '';
  } catch {
    return '';
  }
}
export function saveChoice(
  storage: Pick<Storage, 'setItem'>,
  lesson: ChoiceContext,
  choice: string,
): boolean {
  if (!lesson.exercise.choices.some((option) => option.id === choice)) return false;
  try {
    storage.setItem(key(lesson), choice);
    return true;
  } catch {
    return false;
  }
}
export function localeFromSearch(search: string): Locale {
  return new URLSearchParams(search).get('lang') === 'es' ? 'es' : 'en';
}
