'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Article } from '@/lib/types';

interface CiteButtonProps {
  article: Article;
}

export default function CiteButton({ article }: CiteButtonProps) {
  const [copied, setCopied] = useState(false);

  const generateAbntCitation = (): string => {
    // Formatar autor no padrão ABNT: SOBRENOME, Nome
    const authorName = article.author?.name || 'CONSELHO EDITORIAL';
    const nameParts = authorName.trim().split(' ');
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1].toUpperCase() : authorName.toUpperCase();
    const firstNames = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : '';
    const abntAuthor = firstNames ? `${lastName}, ${firstNames}.` : `${lastName}.`;

    const title = article.title;
    const subtitle = article.subtitle ? `: ${article.subtitle}` : '';
    const now = new Date();
    const months = [
      'jan.', 'fev.', 'mar.', 'abr.', 'maio', 'jun.',
      'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.',
    ];
    const currentMonth = months[now.getMonth()];
    const currentYear = now.getFullYear();
    const currentDay = String(now.getDate()).padStart(2, '0');

    const publishedDate = new Date(article.published_at);
    const pubMonth = months[publishedDate.getMonth()];
    const pubYear = publishedDate.getFullYear();

    const currentUrl = typeof window !== 'undefined' ? window.location.href : `https://arevoltavermelha.org/artigo/${article.slug}`;

    return `${abntAuthor} ${title}${subtitle}. A Revolta Vermelha — Revista Política, Natal/RN, v. 1, n. 1, ${pubMonth} ${pubYear}. Disponível em: <${currentUrl}>. Acesso em: ${currentDay} ${currentMonth} ${currentYear}.`;
  };

  const handleCopy = async () => {
    try {
      const citation = generateAbntCitation();
      await navigator.clipboard.writeText(citation);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback
      setCopied(false);
    }
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={handleCopy}
        className={`btn-brutalist !py-2 !px-3.5 !text-xs transition-colors ${
          copied ? '!bg-rev-black !text-white' : ''
        }`}
        title="Copiar referência bibliográfica padrão ABNT"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-rev-red" />
            <span className="text-rev-red font-bold">REFERÊNCIA ABNT COPIADA!</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5" />
            <span>[ CITAR (ABNT) ]</span>
          </>
        )}
      </button>

      {copied && (
        <div className="absolute top-full mt-2 left-0 right-0 z-20 bg-rev-black text-white text-[10px] p-2 border border-rev-red shadow-brutalist font-mono">
          Citação copiada para a área de transferência.
        </div>
      )}
    </div>
  );
}
