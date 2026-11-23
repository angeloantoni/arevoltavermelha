'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Eye, Edit3, Check, UserPlus } from 'lucide-react';
import { ArticleCategory, PublicationType } from '@/lib/types';
import { useAuthors } from '@/lib/authorStore';

const CATEGORIES: ArticleCategory[] = [
  'EDITORIAL',
  'OPINIÃO',
  'NACIONAL & INTERNACIONAL',
  'RIO GRANDE DO NORTE (RN)',
  'TRADUÇÕES',
];

const PUBLICATION_TYPES: PublicationType[] = [
  'ARTIGO EDITORIAL',
  'ARTIGO DE OPINIÃO',
];

export default function NovoArtigoPage() {
  const { authors } = useAuthors();
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState<ArticleCategory>('EDITORIAL');
  const [publicationType, setPublicationType] = useState<PublicationType>('ARTIGO EDITORIAL');

  const [authorId, setAuthorId] = useState('');

  useEffect(() => {
    if (!authorId && authors.length > 0) {
      setAuthorId(authors[0].id);
    }
  }, [authors, authorId]);
  const [excerpt, setExcerpt] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState(
    'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=1200&auto=format&fit=crop'
  );
  const [coverCaption, setCoverCaption] = useState('');
  const [readingTime, setReadingTime] = useState(12);

  const [content, setContent] = useState(`# Título da Seção Principal

Insira aqui o corpo do ensaio teórico em formato Markdown.

> "A citação revolucionária em destaque aparecerá com borda em vermelho vibrante."

## Subtítulo Conceitual

Análise de conjuntura, dados materiais e fundamentos de classe.`);

  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [published, setPublished] = useState(false);

  // Gerar slug automaticamente baseado no título se vazio
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!slug) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      alert('Preencha ao menos o título e o conteúdo em Markdown.');
      return;
    }

    setPublished(true);
    setTimeout(() => {
      setPublished(false);
      alert(
        'Artigo processado com sucesso pelo editor! Em ambiente integrado com o Supabase, o registro é salvo diretamente na tabela "articles".'
      );
    }, 1500);
  };

  return (
    <div className="w-full bg-rev-white min-h-screen py-12">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        {/* Voltar */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/admin"
            className="btn-brutalist !py-1.5 !px-3 !text-xs inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>VOLTAR AO PAINEL CMS</span>
          </Link>

          <span className="text-xs font-mono text-neutral-500 uppercase">
            EDITOR DE ARTIGOS & ENSAIOS • VANGUARDA 2026
          </span>
        </div>

        {/* Título da Página */}
        <div className="border-b-2 border-rev-black pb-4 mb-8">
          <h1 className="font-display font-black text-2xl sm:text-4xl uppercase tracking-tight text-rev-black">
            NOVO ARTIGO EM MARKDOWN
          </h1>
          <p className="mt-1 text-xs font-mono text-neutral-600">
            Preencha os metadados bibliográficos e redija o texto utilizando formatação Markdown padrão.
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Linha 1: Título, Natureza da Publicação e Categoria */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-6 space-y-1">
              <label className="text-xs font-mono font-bold uppercase text-rev-black block">
                TÍTULO PRINCIPAL (MANCHETE)*:
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={handleTitleChange}
                placeholder="Ex: A INSURREIÇÃO POPULAR E O COMITÊ DE NATAL"
                className="w-full px-3 py-2.5 border border-rev-black font-mono text-xs focus:ring-2 focus:ring-rev-red outline-none"
              />
            </div>

            <div className="md:col-span-3 space-y-1">
              <label className="text-xs font-mono font-bold uppercase text-rev-black block">
                NATUREZA / SELO*:
              </label>
              <select
                value={publicationType}
                onChange={(e) => setPublicationType(e.target.value as PublicationType)}
                className="w-full px-3 py-2.5 border border-rev-black font-mono text-xs bg-white focus:ring-2 focus:ring-rev-red outline-none"
              >
                {PUBLICATION_TYPES.map((pt) => (
                  <option key={pt} value={pt}>
                    {pt}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3 space-y-1">
              <label className="text-xs font-mono font-bold uppercase text-rev-black block">
                CATEGORIA EDITORIAL*:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ArticleCategory)}
                className="w-full px-3 py-2.5 border border-rev-black font-mono text-xs bg-white focus:ring-2 focus:ring-rev-red outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>


          {/* Linha 2: Subtítulo e Slug */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-8 space-y-1">
              <label className="text-xs font-mono font-bold uppercase text-rev-black block">
                SUBTÍTULO / LINHA FINA (COR VERMELHA #C81E1E):
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Ex: Documentos históricos dos sargentos sublevados no 21º Batalhão..."
                className="w-full px-3 py-2.5 border border-rev-black font-mono text-xs focus:ring-2 focus:ring-rev-red outline-none"
              />
            </div>

            <div className="md:col-span-4 space-y-1">
              <label className="text-xs font-mono font-bold uppercase text-rev-black block">
                SLUG DE URL (/artigo/[slug]):
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="a-insurreicao-popular"
                className="w-full px-3 py-2.5 border border-rev-black font-mono text-xs focus:ring-2 focus:ring-rev-red outline-none"
              />
            </div>
          </div>

          {/* Linha 3: Autor, Tempo de Leitura e Imagem */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-4 space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-bold uppercase text-rev-black block">
                  AUTOR / ARTICULISTA:
                </label>
                <Link
                  href="/admin/autores"
                  className="text-[10px] font-mono text-rev-red hover:underline uppercase inline-flex items-center gap-1 font-bold"
                  target="_blank"
                >
                  <UserPlus className="w-3 h-3" />
                  <span>GERENCIAR</span>
                </Link>
              </div>
              <select
                value={authorId}
                onChange={(e) => setAuthorId(e.target.value)}
                className="w-full px-3 py-2.5 border border-rev-black font-mono text-xs bg-white focus:ring-2 focus:ring-rev-red outline-none"
              >
                {authors.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-mono font-bold uppercase text-rev-black block">
                LEITURA (MIN):
              </label>
              <input
                type="number"
                min={1}
                value={readingTime}
                onChange={(e) => setReadingTime(Number(e.target.value))}
                className="w-full px-3 py-2.5 border border-rev-black font-mono text-xs focus:ring-2 focus:ring-rev-red outline-none"
              />
            </div>

            <div className="md:col-span-6 space-y-1">
              <label className="text-xs font-mono font-bold uppercase text-rev-black block">
                URL DA IMAGEM DE CAPA (P&B):
              </label>
              <input
                type="text"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2.5 border border-rev-black font-mono text-xs focus:ring-2 focus:ring-rev-red outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono font-bold uppercase text-rev-black block">
              LEGENDA DA CAPA (CRÉDITOS / FONTE HISTÓRICA):
            </label>
            <input
              type="text"
              value={coverCaption}
              onChange={(e) => setCoverCaption(e.target.value)}
              placeholder="Ex: Registro do Quartel do 21º BC, novembro de 1935."
              className="w-full px-3 py-2.5 border border-rev-black font-mono text-xs focus:ring-2 focus:ring-rev-red outline-none"
            />
          </div>


          {/* Linha 4: Resumo / Excerpt */}
          <div className="space-y-1">
            <label className="text-xs font-mono font-bold uppercase text-rev-black block">
              RESUMO EXECUTIVO (EXCERPT)*:
            </label>
            <textarea
              required
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Síntese concisa das teses e premissas do texto..."
              className="w-full px-3 py-2.5 border border-rev-black font-mono text-xs focus:ring-2 focus:ring-rev-red outline-none"
            />
          </div>

          {/* Abas Editor / Preview */}
          <div className="border border-rev-black bg-white shadow-[4px_4px_0px_#111111]">
            <div className="flex items-center justify-between border-b border-rev-black bg-neutral-100 px-4 py-2">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('editor')}
                  className={`btn-brutalist !py-1 !px-3 !text-[11px] ${
                    activeTab === 'editor' ? '!bg-rev-black !text-white' : ''
                  }`}
                >
                  <Edit3 className="w-3 h-3" />
                  <span>CÓDIGO MARKDOWN</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`btn-brutalist !py-1 !px-3 !text-[11px] ${
                    activeTab === 'preview' ? '!bg-rev-black !text-white' : ''
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  <span>PRÉ-VISUALIZAÇÃO</span>
                </button>
              </div>

              <span className="text-[10px] font-mono text-neutral-500">
                SUPORTA # TÍTULOS, &gt; PULL-QUOTES, - LISTAS
              </span>
            </div>

            <div className="p-4">
              {activeTab === 'editor' ? (
                <textarea
                  rows={14}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-3 font-mono text-xs focus:outline-none focus:ring-0 leading-relaxed border border-neutral-200"
                />
              ) : (
                <div className="p-6 bg-neutral-50 border border-neutral-200 max-w-[68ch] mx-auto font-mono text-xs leading-relaxed space-y-4">
                  <div className="font-display font-black text-xl uppercase text-rev-black">
                    {title || 'TÍTULO DO ARTIGO'}
                  </div>
                  {subtitle && (
                    <div className="font-mono text-rev-red font-bold">{subtitle}</div>
                  )}
                  <div className="whitespace-pre-wrap text-neutral-800">{content}</div>
                </div>
              )}
            </div>
          </div>

          {/* Botão de Envio */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <Link href="/admin" className="text-xs font-mono text-neutral-600 hover:underline">
              Cancelar
            </Link>
            <button
              type="submit"
              className="btn-brutalist !bg-rev-red !text-white hover:!bg-rev-black !px-6 !py-3 !text-sm flex items-center gap-2"
            >
              {published ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>PUBLICANDO DOCUMENTO...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>SALVAR & PUBLICAR NO ACERVO →</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
