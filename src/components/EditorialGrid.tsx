'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, Clock } from 'lucide-react';
import { Article, ArticleCategory } from '@/lib/types';
import AuthorAvatar from '@/components/AuthorAvatar';

interface EditorialGridProps {
  initialArticles: Article[];
}

const CATEGORIES: (ArticleCategory | 'TODOS')[] = [
  'TODOS',
  'EDITORIAL',
  'OPINIÃO',
  'NACIONAL & INTERNACIONAL',
  'RIO GRANDE DO NORTE (RN)',
  'TRADUÇÕES',
];

export default function EditorialGrid({ initialArticles }: EditorialGridProps) {
  const searchParams = useSearchParams();
  const catParam = searchParams.get('cat') as ArticleCategory | null;
  const tagParam = searchParams.get('tag')?.toUpperCase();

  const [activeTab, setActiveTab] = useState<ArticleCategory | 'TODOS'>('TODOS');
  const [selectedTag, setSelectedTag] = useState<string | null>(tagParam || null);
  const [visibleCount, setVisibleCount] = useState(8);

  useEffect(() => {
    if (catParam && CATEGORIES.includes(catParam)) {
      setActiveTab(catParam);
    }
  }, [catParam]);

  useEffect(() => {
    if (tagParam) {
      setSelectedTag(tagParam);
    }
  }, [tagParam]);

  const filteredArticles = initialArticles.filter((art) => {
    const matchesCat = activeTab === 'TODOS' || art.category === activeTab;
    if (!matchesCat) return false;
    if (!selectedTag) return true;
    return art.tags?.some(
      (t) => t.toUpperCase() === selectedTag || selectedTag.includes(t.toUpperCase())
    );
  });

  const visibleArticles = filteredArticles.slice(0, visibleCount);

  return (
    <section id="artigos" className="w-full bg-rev-white border-b border-rev-black py-10">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        {/* Barra Limpa de Editorias / Abas de Navegação */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b-2 border-rev-black pb-4 mb-8 gap-4">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 bg-rev-red inline-block" />
            <h2 className="font-display font-black text-xl sm:text-2xl uppercase tracking-tight text-rev-black">
              CADERNO DE PUBLICAÇÕES
            </h2>
          </div>

          {/* Abas Oficiais */}
          <div className="flex flex-wrap items-center gap-1.5">
            {CATEGORIES.map((cat) => {
              const isActive = activeTab === cat;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveTab(cat);
                    setVisibleCount(8);
                  }}
                  className={`text-xs font-mono uppercase px-3 py-2 transition-all cursor-pointer border border-rev-black ${
                    isActive
                      ? 'bg-rev-red text-white font-bold shadow-[2px_2px_0px_#111111]'
                      : 'bg-white text-rev-black hover:bg-neutral-100 font-medium'
                  }`}
                >
                  {cat === 'TODOS' ? '[ TODOS ]' : cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Indicador de Filtro Ativo por Tag */}
        {selectedTag && (
          <div className="mb-8 p-3.5 bg-neutral-100 border border-rev-black flex flex-wrap items-center justify-between gap-3 shadow-[2px_2px_0px_#111111]">
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="font-bold text-rev-red uppercase tracking-wider">FILTRANDO POR TEMA:</span>
              <span className="bg-rev-red text-white px-2.5 py-0.5 font-bold uppercase">
                #{selectedTag}
              </span>
              <span className="text-neutral-500">
                ({filteredArticles.length} publicações encontradas)
              </span>
            </div>
            <button
              onClick={() => setSelectedTag(null)}
              className="text-xs font-mono font-bold text-rev-red hover:underline cursor-pointer"
            >
              [REMOVER FILTRO DE TAG ✕]
            </button>
          </div>
        )}

        {/* Grid Limpo de Artigos com Linhas Rígidas de 1px */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l border-rev-black">
          {visibleArticles.map((art) => {
            const isEditorial = art.publication_type === 'ARTIGO EDITORIAL';

            return (
              <article
                key={art.id}
                className="border-r border-b border-rev-black flex flex-col justify-between group article-card bg-white"
              >
                <div>
                  {/* Foto P&B com hover duotone */}
                  <Link
                    href={`/artigo/${art.slug}`}
                    className="block relative overflow-hidden aspect-[16/10] w-full bg-neutral-200 duotone-box"
                  >
                    <Image
                      src={art.cover_image_url}
                      alt={art.title}
                      fill
                      className="duotone-img object-cover"
                    />
                    <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                      <span
                        className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 border border-rev-black ${
                          isEditorial ? 'bg-rev-red text-white' : 'bg-white text-rev-black'
                        }`}
                      >
                        {art.publication_type}
                      </span>
                    </div>
                  </Link>

                  {/* Conteúdo Focado: Selo, Categoria, Título e Autor */}
                  <div className="p-5">
                    {/* Metadados: Categoria e Tempo */}
                    <div className="flex items-center justify-between text-[10px] font-mono text-rev-muted mb-2">
                      <span className="font-bold text-rev-black uppercase">
                        {art.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-rev-red" />
                        {art.reading_time_minutes} MIN
                      </span>
                    </div>

                    {/* Título Principal */}
                    <Link href={`/artigo/${art.slug}`}>
                      <h3 className="font-display font-black text-base sm:text-lg uppercase tracking-tight text-rev-black group-hover:text-rev-red transition-colors leading-snug">
                        {art.title}
                      </h3>
                    </Link>

                    {/* Resumo Enxuto */}
                    <p className="mt-2.5 text-xs text-neutral-600 font-mono line-clamp-2 leading-relaxed">
                      {art.excerpt}
                    </p>

                    {/* Tags do Artigo no Card */}
                    {art.tags && art.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {art.tags.slice(0, 3).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setSelectedTag(t.toUpperCase());
                            }}
                            className={`px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase border transition-colors cursor-pointer ${
                              selectedTag === t.toUpperCase()
                                ? 'bg-rev-red text-white border-rev-red'
                                : 'bg-neutral-100 text-neutral-800 border-neutral-300 hover:bg-rev-red hover:text-white'
                            }`}
                          >
                            #{t}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Rodapé do Card: Autor e Acesso Direto */}
                <div className="p-5 pt-0 mt-3 border-t border-neutral-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0 pr-1">
                    <AuthorAvatar
                      name={art.author?.name || 'Conselho Editorial'}
                      avatarUrl={art.author?.avatar_url}
                      size="custom"
                      className="w-11 h-11 border-2 border-rev-black text-xs shadow-[1px_1px_0px_#111111]"
                    />
                    <span className="text-[11px] sm:text-xs font-mono text-neutral-800 uppercase font-bold truncate">
                      {art.author?.name || 'CONSELHO EDITORIAL'}
                    </span>
                  </div>

                  <Link
                    href={`/artigo/${art.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-mono font-bold text-rev-black group-hover:text-rev-red uppercase flex-shrink-0"
                  >
                    <span>LER</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        {/* Botão Carregar Mais */}
        {visibleCount < filteredArticles.length && (
          <div className="mt-10 flex justify-center">
            <button
              onClick={() => setVisibleCount((prev) => prev + 6)}
              className="btn-brutalist !text-xs !px-8 !py-3"
            >
              CARREGAR MAIS PUBLICAÇÕES +
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
