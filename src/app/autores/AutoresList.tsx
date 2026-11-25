import React from 'react';
import Link from 'next/link';
import { Author, Article } from '@/lib/types';
import { BookOpen, ArrowRight } from 'lucide-react';

interface AutoresListProps {
  authors: Author[];
  articles?: Article[];
}

function getSafeInitials(name?: string | null): string {
  if (!name || typeof name !== 'string') return 'RV';
  const clean = name.trim().replace(/^Dra?\.\s+/i, '');
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'RV';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function AutoresList({ authors, articles = [] }: AutoresListProps) {
  if (!authors || authors.length === 0) {
    return (
      <div className="p-12 border-2 border-rev-black bg-neutral-100 text-center font-mono">
        <p className="text-sm font-bold text-rev-black uppercase">
          Nenhum autor ou tradutor cadastrado até o momento.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {authors.map((author, index) => {
        const authorId = author?.id || `auth-${index}`;
        const name = author?.name || 'Autor';
        const role = author?.role || 'Colaborador';
        const bio = author?.bio || '';
        const slug = author?.slug || author?.id || `autor-${index}`;
        const avatarUrl = typeof author?.avatar_url === 'string' ? author.avatar_url.trim() : '';
        const isLogo = Boolean(avatarUrl && (avatarUrl.includes('logo') || avatarUrl === '/logo.webp'));

        const authorArticles = (articles || []).filter(
          (a) =>
            a &&
            author?.id &&
            (a.author_id === author.id || a.translator_id === author.id)
        );
        const articlesCount = authorArticles.length;

        return (
          <div
            key={authorId}
            className="border border-rev-black bg-white flex flex-col justify-between group hover:border-rev-red transition-all shadow-[4px_4px_0px_#111111]"
          >
            <div>
              {/* Foto do Autor em P&B com Fallback Visual Construtivista */}
              <div
                className={`relative aspect-[4/3] w-full overflow-hidden border-b border-rev-black ${
                  isLogo ? 'bg-white p-4' : 'bg-neutral-900'
                }`}
              >
                {/* Fallback de iniciais estrutural (visível caso não haja foto ou em falha de carregamento) */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900 text-white font-mono select-none p-4 text-center z-0">
                  <span className="font-display font-black text-4xl sm:text-5xl text-neutral-100 tracking-wider">
                    {getSafeInitials(name)}
                  </span>
                  <span className="text-[10px] text-rev-red uppercase font-bold tracking-widest mt-2 border-t border-neutral-800 pt-1">
                    QUADRO EDITORIAL
                  </span>
                </div>

                {avatarUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={avatarUrl}
                    alt={name}
                    loading="lazy"
                    className={`relative z-1 w-full h-full ${
                      isLogo ? 'object-contain p-2' : 'object-cover'
                    } filter grayscale contrast-125 group-hover:scale-105 transition-transform duration-300`}
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : null}

                <div className="absolute top-3 left-3 z-10">
                  <span className="bg-rev-black text-white text-[10px] font-mono font-bold uppercase px-2.5 py-1 border border-rev-black shadow-sm">
                    {role}
                  </span>
                </div>
              </div>

              {/* Informações */}
              <div className="p-6">
                <h2 className="font-display font-black text-xl uppercase tracking-tight text-rev-black group-hover:text-rev-red transition-colors">
                  {name}
                </h2>
                <p className="mt-3 text-xs font-mono text-neutral-600 leading-relaxed line-clamp-3">
                  {bio}
                </p>
              </div>
            </div>

            {/* Rodapé do Card */}
            <div className="p-6 pt-0 border-t border-neutral-100 flex items-center justify-between mt-4">
              <span className="text-[11px] font-mono text-rev-muted flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-rev-red" />
                <span>
                  {articlesCount} {articlesCount === 1 ? 'TEXTO PUBLICADO' : 'TEXTOS PUBLICADOS'}
                </span>
              </span>

              <Link
                href={`/autores/${encodeURIComponent(slug)}`}
                className="inline-flex items-center gap-1 text-xs font-mono font-bold uppercase text-rev-black group-hover:text-rev-red transition-colors"
              >
                <span>PERFIL</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
