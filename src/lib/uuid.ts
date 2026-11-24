/**
 * Utilitários para validação e padronização de identificadores UUID no PostgreSQL/Supabase.
 */

export const CONSELHO_EDITORIAL_UUID = '00000000-0000-0000-0000-000000000001';

export const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidUuid(val?: string | null): boolean {
  if (!val || typeof val !== 'string') return false;
  return UUID_REGEX.test(val.trim());
}

export function ensureValidUuid(
  val?: string | null,
  fallback: string = CONSELHO_EDITORIAL_UUID
): string {
  if (val && isValidUuid(val)) {
    return val.trim();
  }
  return fallback;
}
