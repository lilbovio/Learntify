import { preferencesSchema, type LearningPreferences } from '@learntify/api-contracts';
const key = 'learntify:guest-preferences:v1';
export function readGuestPreferences(
  storage: Pick<Storage, 'getItem'>,
): LearningPreferences | null {
  try {
    const parsed = preferencesSchema.safeParse(JSON.parse(storage.getItem(key) ?? 'null'));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
export function saveGuestPreferences(
  storage: Pick<Storage, 'setItem'>,
  value: LearningPreferences,
) {
  storage.setItem(key, JSON.stringify(preferencesSchema.parse(value)));
}
