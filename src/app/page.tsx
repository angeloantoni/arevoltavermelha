import React, { Suspense } from 'react';
import HeroSlider from '@/components/HeroSlider';
import EditorialGrid from '@/components/EditorialGrid';
import { getAllArticles } from '@/lib/serverArticles';
import { getHeroArticles } from '@/lib/data';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  const allArticles = await getAllArticles();
  // Seleciona sempre automaticamente os 4 artigos mais recentes (do mais novo ao mais antigo)
  const heroArticles = getHeroArticles(allArticles);

  return (
    <div className="w-full flex flex-col">
      {/* 1. Hero Principal com os 4 Artigos Mais Recentes */}
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
