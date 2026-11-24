/**
 * Utilitário para cálculo automático do tempo estimado de leitura (em minutos).
 * Limpa marcações Markdown e divide a contagem de palavras por 200 PPM,
 * com limite mínimo de 1 minuto e arredondamento superior.
 */
export function calculateReadingTime(content: string): {
  minutes: number;
  wordCount: number;
} {
  if (!content || typeof content !== 'string') {
    return { minutes: 1, wordCount: 0 };
  }

  // Remove blocos de código cercados
  let clean = content.replace(/```[\s\S]*?```/g, '');

  // Remove código inline
  clean = clean.replace(/`([^`]+)`/g, '$1');

  // Remove imagens: ![alt](url)
  clean = clean.replace(/!\[[^\]]*\]\([^)]*\)/g, '');

  // Converte links para texto: [texto](url) -> texto
  clean = clean.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');

  // Remove cabeçalhos Markdown (# ... ######)
  clean = clean.replace(/^#{1,6}\s+/gm, '');

  // Remove blockquotes (>)
  clean = clean.replace(/^>\s+/gm, '');

  // Remove formatações de negrito e itálico (***, **, *, ___, __, _)
  clean = clean.replace(/(\*{1,3}|_{1,3})(.*?)\1/g, '$2');

  // Remove marcadores de listas (- , * , + , 1. )
  clean = clean.replace(/^[\s]*[-*+]\s+/gm, '');
  clean = clean.replace(/^[\s]*\d+\.\s+/gm, '');

  // Remove linhas horizontais (---, ***, ___)
  clean = clean.replace(/^[-*_]{3,}\s*$/gm, '');

  // Divide por espaços em branco e filtra vazios
  const words = clean
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0);

  const wordCount = words.length;
  const minutes = Math.max(1, Math.ceil(wordCount / 200));

  return { minutes, wordCount };
}
