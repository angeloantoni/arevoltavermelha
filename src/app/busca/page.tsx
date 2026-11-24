'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, Clock, ArrowRight, X, Tag } from 'lucide-react';
import { ArticleCategory, Article } from '@/lib/types';

const CATEGORIES: (ArticleCategory | 'TODOS')[] = [
  'TODOS',
  'EDITORIAL',
  'OPINIÃO',
  'NACIONAL & INTERNACIONAL',
  'RIO GRANDE DO NORTE (RN)',
  'TRADUÇÕES',
];


function BuscaContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || searchParams.get('tag') || '';

  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<ArticleCategory | 'TODOS'>('TODOS');
  const [articles, setArticles] = useState<Article[]>([]);
  const [results, setResults] = useState<Article[]>([]);

  useEffect(() => {
    const fromParam = searchParams.get('q') || searchParams.get('tag');
    if (fromParam !== null) {
      setQuery(fromParam);
    }
  }, [searchParams]);

  useEffect(() => {
    fetch('/api/articles')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setArticles(data);
        }
      })
      .catch((err) => console.error('Erro ao buscar acervo:', err));
  }, []);

  // Coleta todas as tags únicas presentes nos artigos
  const allTags = Array.from(
    new Set(articles.flatMap((a) => a.tags || []).filter(Boolean))
  ).sort();

  useEffect(() => {
    const q = query.trim().replace(/^#/, '').toLowerCase();
    const filtered = articles.filter((art) => {
      const matchesCat =
        !selectedCategory || selectedCategory === 'TODOS' || art.category === selectedCategory;
      if (!matchesCat) return false;
      if (!q) return true;
      return (
        art.title.toLowerCase().includes(q) ||
        art.subtitle?.toLowerCase().includes(q) ||
        art.excerpt.toLowerCase().includes(q) ||
        art.publication_type.toLowerCase().includes(q) ||
        art.author?.name.toLowerCase().includes(q) ||
        art.tags?.some((t) => t.toLowerCase().includes(q) || q.includes(t.toLowerCase()))
      );
    });
    setResults(filtered);
  }, [query, selectedCategory, articles]);

  return (
    <div className="w-full bg-rev-white min-h-screen py-12">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        {/* Cabeçalho */}
        <div className="border-b-2 border-rev-black pb-6 mb-8">
          <div className="flex items-center gap-2 text-xs font-mono text-rev-red font-bold uppercase tracking-wider mb-2">
            <Search className="w-4 h-4 text-rev-red" />
            <span>ARQUIVO DIGITAL & BANCO DE DADOS</span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-rev-black">
            BUSCA NO ACERVO HISTÓRICO
          </h1>
          <p className="mt-2 text-sm font-mono text-neutral-600 max-w-2xl">
            Pesquise por títulos, sargentos de 1935, teóricos marxistas, termos conceituais (ex: &apos;Estado&apos;, &apos;Imperialismo&apos;, &apos;Kollontai&apos;) ou categorias.
          </p>
        </div>

        {/* Barra de Pesquisa Brutalista */}
        <div className="border border-rev-black p-4 sm:p-6 bg-neutral-100 shadow-[4px_4px_0px_#111111] mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Digite termos de busca..."
                className="w-full pl-11 pr-10 py-3 border border-rev-black font-mono text-sm focus:outline-none focus:ring-2 focus:ring-rev-red bg-white"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-rev-black"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Abas Rápidas no Formulário */}
            <div className="w-full sm:w-auto flex flex-wrap gap-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs font-mono uppercase px-3 py-2 border border-rev-black transition-all ${
                    selectedCategory === cat
                      ? 'bg-rev-red text-white font-bold'
                      : 'bg-white text-rev-black hover:bg-neutral-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback de Contagem e Nuvem de Tags */}
          <div className="mt-4 pt-4 border-t border-neutral-300 flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono text-neutral-600 gap-2">
            <span>
              ENCONTRADOS: <strong className="text-rev-red">{results.length}</strong> REGISTROS
            </span>
            {query && (
              <span className="flex items-center gap-1.5">
                FILTRANDO POR: &quot;<strong>{query}</strong>&quot;
                <button
                  onClick={() => setQuery('')}
                  className="text-rev-red hover:underline font-bold text-[11px]"
                >
                  [LIMPAR]
                </button>
              </span>
            )}
          </div>

          {/* Nuvem de Tags Rápidas */}
          {allTags.length > 0 && (
            <div className="mt-4 pt-3 border-t border-neutral-300 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-mono text-neutral-500 uppercase font-bold mr-1 flex items-center gap-1">
                <Tag className="w-3 h-3 text-rev-red" />
                FILTRAR POR TAG:
              </span>
              {allTags.map((tag) => {
                const cleanTag = tag.toUpperCase();
                const isSelected = query.toUpperCase() === cleanTag || query.toUpperCase() === `#${cleanTag}`;
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setQuery(isSelected ? '' : cleanTag)}
                    className={`px-2 py-0.5 text-[11px] font-mono uppercase border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-rev-red text-white border-rev-red font-bold shadow-[2px_2px_0px_#111111]'
                        : 'bg-white text-rev-black border-rev-black hover:bg-neutral-200'
                    }`}
                  >
                    #{cleanTag}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Lista de Resultados */}
        {results.length === 0 ? (
          <div className="border-2 border-dashed border-neutral-300 p-12 text-center font-mono">
            <p className="text-sm text-neutral-500 uppercase">
              Nenhum documento encontrado com os critérios informados.
            </p>
            <p className="text-xs text-neutral-400 mt-2">
              Tente termos mais amplos como &quot;Natal&quot;, &quot;Lenin&quot;, &quot;Estado&quot; ou limpe os filtros de categoria.
            </p>
          </div>
        ) : (

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((art) => (
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

                  {/* Tags do Artigo no Card */}
                  {art.tags && art.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {art.tags.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setQuery(t);
                          }}
                          className="px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase bg-neutral-100 hover:bg-rev-red hover:text-white border border-neutral-300 transition-colors cursor-pointer"
                          title={`Filtrar por #${t}`}
                        >
                          #{t}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-6 border-t border-neutral-200 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-neutral-500 uppercase">
                    POR: {art.author?.name || 'EDITORIAL'}
                  </span>
                  <Link
                    href={`/artigo/${art.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-mono font-bold text-rev-black group-hover:text-rev-red uppercase"
                  >
                    <span>LER</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function BuscaPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center font-mono text-sm text-neutral-500">
          Carregando acervo de busca...
        </div>
      }
    >
      <BuscaContent />
    </Suspense>
  );
}
