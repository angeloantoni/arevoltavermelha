'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Edit2, Trash2, Search, Loader2 } from 'lucide-react';
import { Article } from '@/lib/types';

interface AdminArticlesTableProps {
  initialArticles: Article[];
}

export default function AdminArticlesTable({ initialArticles }: AdminArticlesTableProps) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredArticles = articles.filter((art) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase().replace(/^#/, '');
    return (
      art.title.toLowerCase().includes(term) ||
      art.slug.toLowerCase().includes(term) ||
      art.category.toLowerCase().includes(term) ||
      art.author?.name.toLowerCase().includes(term) ||
      art.tags?.some((t) => t.toLowerCase().includes(term))
    );
  });

  const handleDelete = async (art: Article) => {
    const confirmed = window.confirm(
      `ATENÇÃO: Confirma a exclusão definitiva do artigo do acervo?\n\n"${art.title}"\n(slug: /artigo/${art.slug})\n\nEsta ação removerá o registro do banco de dados e atualizará a capa imediatamente.`
    );

    if (!confirmed) return;

    setDeletingId(art.id);

    try {
      const res = await fetch(`/api/articles/${art.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Falha ao excluir o artigo.');
      }

      // Atualiza a tabela imediatamente
      setArticles((prev) => prev.filter((a) => a.id !== art.id));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao processar exclusão.';
      alert(`Erro: ${msg}`);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Barra de Filtro Rápido no CMS */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-neutral-100 p-3 border border-rev-black">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtrar por título, autor, slug..."
            className="w-full pl-9 pr-3 py-1.5 border border-rev-black font-mono text-xs bg-white focus:outline-none focus:ring-1 focus:ring-rev-red"
          />
        </div>

        <div className="text-[11px] font-mono text-neutral-600">
          EXIBINDO <strong>{filteredArticles.length}</strong> DE <strong>{articles.length}</strong> PUBLICAÇÕES
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
            {filteredArticles.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-neutral-500 font-mono">
                  Nenhum artigo encontrado com o termo informado.
                </td>
              </tr>
            ) : (
              filteredArticles.map((art) => {
                const isDeleting = deletingId === art.id;

                return (
                  <tr
                    key={art.id}
                    className={`hover:bg-neutral-50 transition-colors ${
                      isDeleting ? 'opacity-40 pointer-events-none' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-rev-black line-clamp-1 max-w-[320px]">
                        {art.title}
                      </div>
                      <div className="text-[10px] text-neutral-500">slug: /{art.slug}</div>
                      {art.tags && art.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {art.tags.map((t) => (
                            <span
                              key={t}
                              className="px-1 text-[8px] font-mono uppercase bg-neutral-100 text-neutral-600 border border-neutral-300"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
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
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Botão Ler */}
                        <Link
                          href={`/artigo/${art.slug}`}
                          className="btn-brutalist !py-1 !px-2 !text-[11px] inline-flex items-center gap-1 hover:!bg-neutral-200 !text-neutral-800"
                          title="Visualizar artigo publicado"
                        >
                          <span>LER</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>

                        {/* Botão Editar */}
                        <Link
                          href={`/admin/editar/${art.id}`}
                          className="btn-brutalist !py-1 !px-2 !text-[11px] inline-flex items-center gap-1 !bg-rev-black !text-white hover:!bg-rev-red"
                          title="Editar metadados e conteúdo em Markdown"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>EDITAR</span>
                        </Link>

                        {/* Botão Excluir */}
                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={() => handleDelete(art)}
                          className="btn-brutalist !py-1 !px-2 !text-[11px] inline-flex items-center gap-1 !bg-white !text-rev-red border-rev-red hover:!bg-rev-red hover:!text-white cursor-pointer transition-colors"
                          title="Excluir definitivamente do acervo"
                        >
                          {isDeleting ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Trash2 className="w-3 h-3" />
                          )}
                          <span>EXCLUIR</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
