import React from 'react';
import Link from 'next/link';
import { getAllArticles } from '@/lib/serverArticles';
import { Plus, CheckCircle, FileText, Users, BookOpen } from 'lucide-react';
import LogoutButton from './LogoutButton';
import AdminArticlesTable from '@/components/AdminArticlesTable';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Painel Editorial CMS — A Revolta Vermelha',
  description: 'Gestão de publicações, ensaios e traduções do acervo.',
};

export default async function AdminDashboardPage() {
  const articles = await getAllArticles();

  return (
    <div className="w-full bg-rev-white min-h-screen py-12">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        {/* Cabeçalho do CMS */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b-2 border-rev-black pb-6 mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-rev-red font-bold uppercase tracking-wider mb-2">
              <span className="w-2.5 h-2.5 bg-rev-red inline-block" />
              <span>PAINEL DE CONTROLE EDITORIAL</span>
            </div>
            <h1 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-rev-black">
              GESTÃO DO ACERVO
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/autores"
              className="btn-brutalist !bg-white !text-rev-black hover:!bg-rev-black hover:!text-white flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              <span>GERENCIAR AUTORES</span>
            </Link>
            <Link
              href="/admin/novo"
              className="btn-brutalist !bg-rev-red !text-white hover:!bg-rev-black flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>NOVO ARTIGO EM MARKDOWN</span>
            </Link>
            <LogoutButton />
          </div>
        </div>

        {/* Abas de Navegação do CMS */}
        <div className="flex items-center gap-2 border-b border-rev-black mb-8 overflow-x-auto">
          <Link
            href="/admin"
            className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-rev-red border-b-2 border-rev-red flex items-center gap-2 bg-neutral-100 transition-all whitespace-nowrap"
          >
            <FileText className="w-4 h-4 text-rev-red" />
            <span>GESTÃO DE ARTIGOS</span>
          </Link>

          <Link
            href="/admin/autores"
            className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral-600 hover:text-rev-black flex items-center gap-2 border-b-2 border-transparent transition-all whitespace-nowrap"
          >
            <Users className="w-4 h-4" />
            <span>GESTÃO DE AUTORES & TRADUTORES</span>
          </Link>

          <Link
            href="/admin/expediente"
            className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral-600 hover:text-rev-black flex items-center gap-2 border-b-2 border-transparent transition-all whitespace-nowrap"
          >
            <BookOpen className="w-4 h-4" />
            <span>GESTÃO DO EXPEDIENTE</span>
          </Link>
        </div>

        {/* Resumo Estatístico */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="border border-rev-black p-4 bg-white shadow-[2px_2px_0px_#111111]">
            <span className="text-[10px] font-mono text-neutral-500 uppercase block">TOTAL DE ARTIGOS</span>
            <span className="font-display font-black text-3xl text-rev-black">{articles.length}</span>
          </div>
          <div className="border border-rev-black p-4 bg-white shadow-[2px_2px_0px_#111111]">
            <span className="text-[10px] font-mono text-neutral-500 uppercase block">STATUS DO BANCO</span>
            <span className="font-display font-black text-base text-green-700 flex items-center gap-1.5 mt-2">
              <CheckCircle className="w-4 h-4" /> ATIVO (PERSISTENTE)
            </span>
          </div>
          <div className="border border-rev-black p-4 bg-white shadow-[2px_2px_0px_#111111]">
            <span className="text-[10px] font-mono text-neutral-500 uppercase block">DESTAQUES RECENTES</span>
            <span className="font-display font-black text-3xl text-rev-red">
              {Math.min(articles.length, 4)}
            </span>
          </div>
          <div className="border border-rev-black p-4 bg-white shadow-[2px_2px_0px_#111111]">
            <span className="text-[10px] font-mono text-neutral-500 uppercase block">ARTIGOS EDITORIAIS (ML)</span>
            <span className="font-display font-black text-3xl text-rev-black">
              {articles.filter((a) => a.publication_type === 'ARTIGO EDITORIAL').length}
            </span>
          </div>
        </div>

        {/* Tabela Interativa de Artigos com Ações (LER, EDITAR, EXCLUIR) */}
        <AdminArticlesTable initialArticles={articles} />
      </div>
    </div>
  );
}
