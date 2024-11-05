/**
 * Generates a UUID v4
 */
export function generateUUID(): string {
  return crypto.randomUUID();
}

/**
 * Generates a secure hash of a string using SHA-256
 */
export async function generateHash(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
