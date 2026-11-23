import React, { Suspense } from 'react';
import HeroSlider from '@/components/HeroSlider';
import EditorialGrid from '@/components/EditorialGrid';
import { getHeroArticles, getArticles } from '@/lib/data';

export default function HomePage() {
  const heroArticles = getHeroArticles();
  const allArticles = getArticles();

  return (
    <div className="w-full flex flex-col">
      {/* 1. Hero Principal com Manchete de Destaque */}
      <HeroSlider articles={heroArticles} />

      {/* 2. Filtro de Categorias & Grid Limpo de Artigos */}
      <Suspense
        fallback={
          <div className="py-12 text-center font-mono text-xs text-neutral-500">
            Carregando publicações...
          </div>
        }
      >
        <EditorialGrid initialArticles={allArticles} />
      </Suspense>
    </div>
  );
}
