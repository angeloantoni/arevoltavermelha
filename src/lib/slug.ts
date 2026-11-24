/**
 * Utilitário de normalização e geração de slugs amigáveis (URL-friendly).
 * Converte caracteres acentuados, remove pontuações indesejadas e padroniza separadores com hífen.
 */
export function generateSlug(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}
