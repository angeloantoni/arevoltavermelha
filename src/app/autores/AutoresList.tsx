import React from 'react';
import Link from 'next/link';
import { Author, Article } from '@/lib/types';
import { BookOpen, ArrowRight } from 'lucide-react';
import { getAuthorInitials } from '@/components/AuthorAvatar';

interface AutoresListProps {
  authors: Author[];
  articles?: Article[];
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
      {authors.map((author) => {
        const authorArticles = articles.filter(
          (a) =>
            a.author_id === author.id ||
            a.author?.slug === author.slug ||
            a.translator_id === author.id ||
            a.translator?.slug === author.slug
        );

        return (
          <div
            key={author.id}
            className="border border-rev-black bg-white flex flex-col justify-between group hover:border-rev-red transition-all shadow-[4px_4px_0px_#111111]"
          >
            <div>
              {/* Foto do Autor em P&B com Fallback Visual Construtivista */}
              <div
                className={`relative aspect-[4/3] w-full overflow-hidden border-b border-rev-black ${
                  author.avatar_url && author.avatar_url.includes('logo') ? 'bg-white p-4' : 'bg-neutral-900'
                }`}
              >
                {/* Fallback de iniciais estrutural (visível caso não haja foto ou em falha de carregamento) */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900 text-white font-mono select-none p-4 text-center z-0">
                  <span className="font-display font-black text-4xl sm:text-5xl text-neutral-100 tracking-wider">
                    {getAuthorInitials(author.name)}
                  </span>
                  <span className="text-[10px] text-rev-red uppercase font-bold tracking-widest mt-2 border-t border-neutral-800 pt-1">
                    QUADRO EDITORIAL
                  </span>
                </div>

                {author.avatar_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={author.avatar_url}
                    alt={author.name}
                    className={`relative z-1 w-full h-full ${
                      author.avatar_url.includes('logo') ? 'object-contain p-2' : 'object-cover'
                    } filter grayscale contrast-125 group-hover:scale-105 transition-transform duration-300`}
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : null}

                <div className="absolute top-3 left-3 z-10">
                  <span className="bg-rev-black text-white text-[10px] font-mono font-bold uppercase px-2.5 py-1 border border-rev-black shadow-sm">
                    {author.role}
                  </span>
                </div>
              </div>

              {/* Informações */}
              <div className="p-6">
                <h2 className="font-display font-black text-xl uppercase tracking-tight text-rev-black group-hover:text-rev-red transition-colors">
                  {author.name}
                </h2>
                <p className="mt-3 text-xs font-mono text-neutral-600 leading-relaxed line-clamp-3">
                  {author.bio}
                </p>
              </div>
            </div>

            {/* Rodapé do Card */}
            <div className="p-6 pt-0 border-t border-neutral-100 flex items-center justify-between mt-4">
              <span className="text-[11px] font-mono text-rev-muted flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-rev-red" />
                <span>{authorArticles.length} TEXTOS PUBLICADOS</span>
              </span>

              <Link
                href={`/autores/${author.slug}`}
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
