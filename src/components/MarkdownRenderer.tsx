'use client';

import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Utilitário para formatar elementos inline no texto:
 * - Negrito: **texto**
 * - Itálico: *texto*
 * - Links: [texto](url)
 * - Código inline: `código`
 */
function renderInlineFormatting(text: string): React.ReactNode {
  // Regex combinada para tokens inline
  const inlineRegex = /(\*\*.*?\*\*|\*.*?\*|`.*?`|\[.*?\]\(.*?\))/g;
  const parts = text.split(inlineRegex);

  return parts.map((part, i) => {
    if (!part) return null;

    // Negrito: **texto**
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <strong key={i} className="font-bold text-rev-black">
          {part.slice(2, -2)}
        </strong>
      );
    }

    // Itálico: *texto*
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      return (
        <em key={i} className="italic text-neutral-900">
          {part.slice(1, -1)}
        </em>
      );
    }

    // Código inline: `código`
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 bg-neutral-200 text-rev-red font-mono text-xs font-bold border border-neutral-300 mx-0.5"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Link: [texto](url)
    const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
    if (linkMatch) {
      const [, linkText, linkUrl] = linkMatch;
      return (
        <a
          key={i}
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-rev-red font-bold underline underline-offset-2 hover:text-rev-black transition-colors"
        >
          {linkText}
        </a>
      );
    }

    return part;
  });
}

/**
 * Componente unificado e brutalista de renderização tipográfica e Markdown.
 * Compartilhado identicamente entre a página pública de leitura (/artigo/[slug])
 * e a aba de Pré-visualização do editor administrativo (/admin/novo e /admin/editar).
 */
export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  if (!content || !content.trim()) {
    return (
      <div className="py-12 text-center text-neutral-400 font-mono text-xs uppercase">
        Nenhum conteúdo redigido para pré-visualização.
      </div>
    );
  }

  const lines = content.split('\n');
  const nodes: React.ReactNode[] = [];
  let paragraphBuffer: string[] = [];
  let inCodeBlock = false;
  let codeBlockLines: string[] = [];

  const flushParagraph = (keyPrefix: string | number) => {
    if (paragraphBuffer.length > 0) {
      const text = paragraphBuffer.join(' ').trim();
      if (text) {
        nodes.push(
          <p
            key={`p-${keyPrefix}`}
            className="mb-6 leading-[1.8] text-neutral-800 text-justify font-mono text-sm sm:text-base"
          >
            {renderInlineFormatting(text)}
          </p>
        );
      }
      paragraphBuffer = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Detecção de bloco de código ```
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        // Fecha bloco de código
        flushParagraph(index);
        nodes.push(
          <pre
            key={`code-${index}`}
            className="my-6 p-4 bg-rev-black text-neutral-200 font-mono text-xs overflow-x-auto border-2 border-rev-black shadow-[3px_3px_0px_#111111]"
          >
            <code>{codeBlockLines.join('\n')}</code>
          </pre>
        );
        codeBlockLines = [];
        inCodeBlock = false;
      } else {
        // Abre bloco de código
        flushParagraph(index);
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      return;
    }

    // Título H1 (# Título)
    if (trimmed.startsWith('# ')) {
      flushParagraph(index);
      nodes.push(
        <h2
          key={`h1-${index}`}
          className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-rev-black mt-10 mb-4 border-b-2 border-rev-black pb-2 leading-tight"
        >
          {trimmed.replace('# ', '')}
        </h2>
      );
      return;
    }

    // Título H2 (## Subtítulo)
    if (trimmed.startsWith('## ')) {
      flushParagraph(index);
      nodes.push(
        <h3
          key={`h2-${index}`}
          className="font-display font-black text-xl sm:text-2xl uppercase tracking-tight text-rev-black mt-8 mb-3 leading-snug"
        >
          {trimmed.replace('## ', '')}
        </h3>
      );
      return;
    }

    // Título H3 (### Seção menor)
    if (trimmed.startsWith('### ')) {
      flushParagraph(index);
      nodes.push(
        <h4
          key={`h3-${index}`}
          className="font-display font-black text-lg sm:text-xl uppercase tracking-tight text-rev-red mt-6 mb-2"
        >
          {trimmed.replace('### ', '')}
        </h4>
      );
      return;
    }

    // Citações em destaque / Pull Quotes (> citação)
    if (trimmed.startsWith('> ')) {
      flushParagraph(index);
      const quoteText = trimmed.replace(/^>\s*/, '');

      // Bloco de destaque / nota editorial
      if (
        quoteText.toUpperCase().includes('NOTA EDITORIAL') ||
        quoteText.startsWith('[!') ||
        quoteText.toUpperCase().startsWith('DESTAQUE:')
      ) {
        nodes.push(
          <div
            key={`callout-${index}`}
            className="my-6 p-4 border-2 border-rev-black bg-neutral-100 font-mono text-xs text-neutral-800 shadow-[3px_3px_0px_#111111]"
          >
            <div className="font-bold text-rev-red uppercase flex items-center gap-1.5 mb-1.5">
              <span className="w-2 h-2 bg-rev-red inline-block" />
              <span>NOTA & DESTAQUE EDITORIAL</span>
            </div>
            <div className="leading-relaxed">{renderInlineFormatting(quoteText)}</div>
          </div>
        );
      } else {
        nodes.push(
          <blockquote
            key={`quote-${index}`}
            className="pull-quote my-8 pl-5 py-3 border-l-4 border-rev-red bg-neutral-100 font-serif italic text-rev-black text-base sm:text-lg leading-relaxed shadow-[2px_2px_0px_#111111]"
          >
            &ldquo;{renderInlineFormatting(quoteText)}&rdquo;
          </blockquote>
        );
      }
      return;
    }

    // Imagem em Markdown: ![legenda](url)
    const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
    if (imgMatch) {
      flushParagraph(index);
      const [, imgAlt, imgSrc] = imgMatch;
      nodes.push(
        <figure
          key={`img-${index}`}
          className="my-8 border-2 border-rev-black bg-white p-2 shadow-[4px_4px_0px_#111111]"
        >
          <img
            src={imgSrc}
            alt={imgAlt || 'Imagem do artigo'}
            className="w-full h-auto object-cover max-h-[480px] filter grayscale contrast-125"
            loading="lazy"
          />
          {imgAlt && (
            <figcaption className="text-[11px] font-mono text-neutral-600 mt-2 px-2 py-1 text-center border-t border-neutral-200">
              {imgAlt}
            </figcaption>
          )}
        </figure>
      );
      return;
    }

    // Listas com marcadores (- item ou * item)
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      flushParagraph(index);
      const itemText = trimmed.replace(/^[-*]\s+/, '');
      nodes.push(
        <div key={`li-${index}`} className="flex items-start gap-2.5 mb-2 pl-2 sm:pl-4 font-mono text-xs sm:text-sm">
          <span className="text-rev-red font-bold text-xs mt-0.5 shrink-0 select-none">■</span>
          <span className="leading-relaxed text-neutral-800">{renderInlineFormatting(itemText)}</span>
        </div>
      );
      return;
    }

    // Listas numeradas (1. item)
    const numListMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numListMatch) {
      flushParagraph(index);
      const [, num, itemText] = numListMatch;
      nodes.push(
        <div key={`num-${index}`} className="flex items-start gap-2.5 mb-2 pl-2 sm:pl-4 font-mono text-xs sm:text-sm">
          <span className="text-rev-red font-bold text-xs mt-0.5 shrink-0 select-none">
            {num}.
          </span>
          <span className="leading-relaxed text-neutral-800">{renderInlineFormatting(itemText)}</span>
        </div>
      );
      return;
    }

    // Linha vazia: finaliza o parágrafo acumulado
    if (trimmed === '') {
      flushParagraph(index);
      return;
    }

    // Linha de texto regular: acumula no buffer do parágrafo
    paragraphBuffer.push(trimmed);
  });

  flushParagraph(lines.length);

  return <div className={`article-body font-mono text-neutral-800 ${className}`}>{nodes}</div>;
}
