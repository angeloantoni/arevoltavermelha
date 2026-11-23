import React from 'react';
import Link from 'next/link';
import { getArticles } from '@/lib/data';
import { Plus, CheckCircle, ExternalLink, FileText, Users } from 'lucide-react';
import LogoutButton from './LogoutButton';


export const metadata = {
  title: 'Painel Editorial CMS — A Revolta Vermelha',
  description: 'Gestão de publicações, ensaios e traduções do acervo.',
};

export default function AdminDashboardPage() {
  const articles = getArticles();

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
        <div className="flex items-center gap-2 border-b border-rev-black mb-8">
          <Link
            href="/admin"
            className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-rev-red border-b-2 border-rev-red flex items-center gap-2 bg-neutral-100 transition-all"
          >
            <FileText className="w-4 h-4 text-rev-red" />
            <span>GESTÃO DE ARTIGOS</span>
          </Link>

          <Link
            href="/admin/autores"
            className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral-600 hover:text-rev-black flex items-center gap-2 border-b-2 border-transparent transition-all"
          >
            <Users className="w-4 h-4" />
            <span>GESTÃO DE AUTORES & TRADUTORES</span>
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
              <CheckCircle className="w-4 h-4" /> ATIVO (HÍBRIDO)
            </span>
          </div>
          <div className="border border-rev-black p-4 bg-white shadow-[2px_2px_0px_#111111]">
            <span className="text-[10px] font-mono text-neutral-500 uppercase block">DESTAQUES DE HERO</span>
            <span className="font-display font-black text-3xl text-rev-red">
              {articles.filter((a) => a.is_hero_featured).length}
            </span>
          </div>
          <div className="border border-rev-black p-4 bg-white shadow-[2px_2px_0px_#111111]">
            <span className="text-[10px] font-mono text-neutral-500 uppercase block">ARTIGOS EDITORIAIS (ML)</span>
            <span className="font-display font-black text-3xl text-rev-black">
              {articles.filter((a) => a.publication_type === 'ARTIGO EDITORIAL').length}
            </span>
          </div>
        </div>

        {/* Tabela Brutalista de Artigos */}
        <div className="border border-rev-black bg-white overflow-x-auto shadow-[4px_4px_0px_#111111]">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="bg-rev-black text-white uppercase text-[11px] border-b border-rev-black">
                <th className="py-3 px-4">TÍTULO & SLUG</th>
                <th className="py-3 px-4">SELO / TIPO</th>
                <th className="py-3 px-4">CATEGORIA</th>
                <th className="py-3 px-4">AUTOR</th>
                <th className="py-3 px-4">LEITURA</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4 text-right">AÇÕES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {articles.map((art) => (
                <tr key={art.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-rev-black">{art.title}</div>
                    <div className="text-[10px] text-neutral-500">slug: /{art.slug}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 font-bold uppercase text-[9px] border border-rev-black ${
                        art.publication_type === 'ARTIGO EDITORIAL'
                          ? 'bg-rev-red text-white'
                          : 'bg-white text-rev-black'
                      }`}
                    >
                      {art.publication_type}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="bg-neutral-200 text-neutral-800 px-2 py-0.5 font-bold uppercase text-[10px]">
                      {art.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-neutral-700">
                    {art.author?.name || 'CONSELHO EDITORIAL'}
                  </td>

                  <td className="py-3 px-4 text-neutral-600">
                    {art.reading_time_minutes} min
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-green-700 font-bold uppercase flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-600 rounded-none inline-block" />
                      {art.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      href={`/artigo/${art.slug}`}
                      className="btn-brutalist !py-1 !px-2.5 !text-[11px] inline-flex items-center gap-1"
                    >
                      <span>LER</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
