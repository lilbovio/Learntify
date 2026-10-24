/** Deliberately small, explicit preview cohort. No domains, wildcards or implicit admissions. */
export function parsePreviewEmails(value: string | undefined): ReadonlySet<string> | null {
  if (!value || value.length > 5100) return null;
  const entries = value.split(',').map((email) => email.trim().toLowerCase());
  if (
    entries.length > 20 ||
    entries.some(
      (email) =>
        email.includes('*') ||
        !/^[a-z0-9.!#$%&'+/=?^_`{|}~-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)+$/.test(email) ||
        email.length > 254,
    )
  )
    return null;
  return new Set(entries);
}

export type AccountAdmission = (email: string) => boolean;
export function previewAdmission(emails: ReadonlySet<string>): AccountAdmission {
  return (email) => emails.has(email.trim().toLowerCase());
}
