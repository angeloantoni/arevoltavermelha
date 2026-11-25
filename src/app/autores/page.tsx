import React from 'react';
import { Users } from 'lucide-react';
import AutoresList from './AutoresList';
import { getAllAuthors } from '@/lib/serverAuthors';
import { getAllArticles } from '@/lib/serverArticles';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Autores & Tradutores — A Revolta Vermelha',
  description: 'Quadro de articulistas, pesquisadores históricos, tradutores e militantes da revista A Revolta Vermelha.',
};

export default async function AutoresPage() {
  const [authors, articles] = await Promise.all([
    getAllAuthors(),
    getAllArticles(),
  ]);

  return (
    <div className="w-full bg-rev-white min-h-screen py-12">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        {/* Cabeçalho */}
        <div className="border-b-2 border-rev-black pb-6 mb-10">
          <div className="flex items-center gap-2 text-xs font-mono text-rev-red font-bold uppercase tracking-wider mb-2">
            <Users className="w-4 h-4 text-rev-red" />
            <span>CORPO EDITORIAL & PESQUISADORES</span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-rev-black">
            AUTORES & TRADUTORES
          </h1>
          <p className="mt-3 text-sm font-mono text-neutral-600 max-w-2xl leading-relaxed">
            Pesquisadores, estudantes, militantes marxistas, tradutores de fontes primárias, ensaístas e analistas da conjuntura local, nacional e internacional.
          </p>
        </div>

        {/* Grid Modular dos Autores Dinâmico */}
        <AutoresList authors={authors} articles={articles} />
      </div>
    </div>
  );
}
