'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Author, Article } from '@/lib/types';
import { getStoredAuthors } from '@/lib/authorStore';
import { ArrowLeft, Clock, ArrowRight, BookOpen } from 'lucide-react';
import { getAuthorInitials } from '@/components/AuthorAvatar';

interface AuthorDetailClientProps {
  initialAuthor?: Author;
  slug: string;
  initialArticles?: Article[];
}

export default function AuthorDetailClient({
  initialAuthor,
  slug,
  initialArticles = [],
}: AuthorDetailClientProps) {
  const [author, setAuthor] = useState<Author | undefined>(initialAuthor);
  const [isReady, setIsReady] = useState(!!initialAuthor);

  useEffect(() => {
    if (!author) {
      const stored = getStoredAuthors();
      const found = stored.find((a) => a.slug === slug);
      if (found) {
        setAuthor(found);
      }
    }
    setIsReady(true);
  }, [author, slug]);

  if (!isReady) {
    return (
      <div className="w-full bg-rev-white min-h-[60vh] flex items-center justify-center font-mono text-xs text-neutral-500">
        CARREGANDO PERFIL EDITORIAL...
      </div>
    );
  }

  if (!author) {
    return (
      <div className="w-full bg-rev-white min-h-[60vh] flex flex-col items-center justify-center font-mono py-20 px-4 text-center">
        <h1 className="font-display font-black text-2xl uppercase text-rev-black mb-3">
          AUTOR NÃO LOCALIZADO
        </h1>
        <p className="text-xs text-neutral-600 mb-6 max-w-md">
          O perfil editorial solicitado não foi encontrado no acervo ativo da revista.
        </p>
        <Link href="/autores" className="btn-brutalist !py-2 !px-4 !text-xs">
          ← VOLTAR AO QUADRO DE AUTORES
        </Link>
      </div>
    );
  }

  const articles: Article[] = initialArticles;

  return (
    <div className="w-full bg-rev-white min-h-screen py-12">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        {/* Voltar */}
        <div className="mb-6">
          <Link
            href="/autores"
            className="btn-brutalist !py-1.5 !px-3 !text-xs inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>TODOS OS AUTORES</span>
          </Link>
        </div>

        {/* Bloco de Ficha do Autor */}
        <div className="border-2 border-rev-black bg-neutral-100 p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 mb-12 shadow-[4px_4px_0px_#111111]">
          <div
            className={`md:col-span-4 relative aspect-square w-full border border-rev-black overflow-hidden ${
              author.avatar_url && author.avatar_url.includes('logo')
                ? 'bg-white p-4'
                : 'bg-neutral-900'
            }`}
          >
            {author.avatar_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={author.avatar_url}
                alt={author.name}
                className={`w-full h-full ${
                  author.avatar_url.includes('logo')
                    ? 'object-contain p-2'
                    : 'object-cover'
                } filter grayscale contrast-125`}
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
            ) : null}

            {/* Fallback de iniciais apenas quando não houver foto salva */}
            {!author.avatar_url && (
              <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-900 text-white font-mono select-none p-6 text-center">
                <span className="font-display font-black text-6xl text-neutral-100 tracking-wider">
                  {getAuthorInitials(author.name)}
                </span>
                <span className="text-[11px] text-rev-red uppercase font-bold tracking-widest mt-3 border-t border-neutral-800 pt-1">
                  QUADRO EDITORIAL
                </span>
              </div>
            )}
          </div>

          <div className="md:col-span-8 flex flex-col justify-between">
            <div>
              <span className="bg-rev-red text-white text-[10px] font-mono font-bold uppercase px-2.5 py-1 border border-rev-black">
                {author.role}
              </span>
              <h1 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-rev-black mt-3">
                {author.name}
              </h1>
              <p className="mt-4 text-sm font-mono text-neutral-700 leading-relaxed max-w-2xl">
                {author.bio}
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-neutral-300 flex items-center gap-6 text-xs font-mono text-rev-muted">
              <span className="flex items-center gap-1.5 font-bold text-rev-black">
                <BookOpen className="w-4 h-4 text-rev-red" />
                {articles.length} TEXTOS NO ACERVO
              </span>
              <span>•</span>
              <span>MARXISMO-LENINISMO • TEORIA & CRÍTICA</span>
            </div>
          </div>
        </div>

        {/* Lista de Artigos Publicados */}
        <div>
          <h2 className="font-display font-black text-2xl uppercase tracking-tight text-rev-black mb-6 border-b border-rev-black pb-2">
            PRODUÇÕES & DOCUMENTOS CATALOGADOS
          </h2>

          {articles.length === 0 ? (
            <div className="p-8 border border-neutral-300 text-center font-mono text-sm text-neutral-500 bg-white">
              Nenhum texto associado diretamente a este perfil até o momento.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((art) => (
                <div
                  key={art.id}
                  className="border border-rev-black bg-white flex flex-col justify-between p-6 group hover:border-rev-red transition-all shadow-[3px_3px_0px_#111111]"
                >
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-rev-muted mb-2">
                      <span
                        className={`px-2 py-0.5 font-bold uppercase text-[9px] border border-rev-black ${
                          art.publication_type === 'ARTIGO EDITORIAL'
                            ? 'bg-rev-red text-white'
                            : 'bg-rev-black text-white'
                        }`}
                      >
                        {art.publication_type}
                      </span>
                      <span className="flex items-center gap-1 font-bold text-rev-black">
                        <Clock className="w-3 h-3 text-rev-red" />
                        {art.reading_time_minutes} MIN
                      </span>
                    </div>

                    <Link href={`/artigo/${art.slug}`}>
                      <h3 className="font-display font-black text-lg uppercase tracking-tight text-rev-black group-hover:text-rev-red transition-colors leading-snug">
                        {art.title}
                      </h3>
                    </Link>

                    <p className="mt-3 text-xs font-mono text-neutral-600 line-clamp-3 leading-relaxed">
                      {art.excerpt}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-neutral-200 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-neutral-400">
                      {new Date(art.published_at).toLocaleDateString('pt-BR')}
                    </span>
                    <Link
                      href={`/artigo/${art.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-mono font-bold text-rev-black group-hover:text-rev-red uppercase"
                    >
                      <span>LER TEXTO</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
