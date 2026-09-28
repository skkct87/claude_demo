export function baseUsernameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "";
  const sanitized = local.replace(/[^a-zA-Z0-9_.-]/g, "").toLowerCase();
  return sanitized.length > 0 ? sanitized : "user";
}

export async function generateUniqueUsername(
  email: string,
  isTaken: (candidate: string) => Promise<boolean>
): Promise<string> {
  const base = baseUsernameFromEmail(email);
  let candidate = base;
  let suffix = 2;

  while (await isTaken(candidate)) {
    candidate = `${base}-${suffix}`;
    suffix++;
  }

  return candidate;
}
