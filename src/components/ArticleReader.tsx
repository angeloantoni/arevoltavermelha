'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Printer, ArrowLeft, Share2, Calendar } from 'lucide-react';
import { Article } from '@/lib/types';
import CiteButton from '@/components/CiteButton';
import ShareArticle from '@/components/ShareArticle';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import AuthorAvatar from '@/components/AuthorAvatar';



interface ArticleReaderProps {
  article: Article;
  relatedArticles?: Article[];
}

export default function ArticleReader({ article, relatedArticles = [] }: ArticleReaderProps) {
  const [fontSize, setFontSize] = useState<number>(16); // 14px a 20px

  // Unifica a resolução da imagem da capa para uso idêntico na página e no gerador de Stories
  const resolvedImageUrl = (
    article.cover_image_url ||
    article.cover_image ||
    article.coverImage ||
    article.image_url ||
    article.image ||
    ''
  ).trim();

  const increaseFont = () => setFontSize((prev) => Math.min(prev + 1, 22));
  const decreaseFont = () => setFontSize((prev) => Math.max(prev - 1, 14));

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      const el = document.getElementById('compartilhar-artigo');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigator.clipboard?.writeText(window.location.href);
        alert('Link do artigo copiado para a área de transferência!');
      }
    }
  };

  return (
    <article className="w-full bg-rev-white min-h-screen">
      {/* Top Banner Fotográfico P&B */}
      <div className="relative w-full h-[55vh] min-h-[380px] max-h-[550px] bg-rev-black border-b border-rev-black overflow-hidden">
        {resolvedImageUrl ? (
          <Image
            src={resolvedImageUrl}
            alt={article.title}
            fill
            priority
            className="object-cover filter grayscale contrast-125"
          />
        ) : (
          <div className="w-full h-full bg-neutral-900 flex items-center justify-center text-neutral-600 font-mono text-xs">
            [ SEM IMAGEM DE CAPA ]
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        {/* Legenda Técnica da Capa (canto inferior direito) */}
        {article.cover_caption && (
          <div className="absolute bottom-3 right-4 max-w-md text-right text-[10px] text-neutral-300 font-mono bg-black/75 px-3 py-1 border border-neutral-700">
            {article.cover_caption}
          </div>
        )}

        {/* Botão Voltar */}
        <div className="absolute top-6 left-6 z-20">
          <Link
            href="/"
            className="btn-brutalist !bg-rev-black !text-white !border-white hover:!bg-rev-red hover:!text-white flex items-center gap-1.5 !text-xs !py-1.5 !px-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>RETORNAR AO INÍCIO</span>
          </Link>
        </div>
      </div>

      {/* Barra de Ferramentas / Controles de Leitura Fixável */}
      <div className="sticky top-[72px] z-30 bg-rev-white/95 backdrop-blur-sm border-b border-rev-black py-2.5 px-4 sm:px-6 print:hidden">
        <div className="max-w-[1400px] mx-auto flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          {/* Breadcrumb Técnico */}
          <div className="flex items-center gap-2 overflow-x-auto text-[11px] text-rev-muted">
            <span
              className={`px-2 py-0.5 font-bold uppercase text-white ${
                article.publication_type === 'ARTIGO EDITORIAL' ? 'bg-rev-red' : 'bg-rev-black'
              }`}
            >
              {article.publication_type}
            </span>
            <span>•</span>
            <span className="font-bold text-rev-black uppercase">
              {article.category}
            </span>
            <span>•</span>
            <span className="font-bold text-neutral-700 uppercase">
              {article.author?.name || 'EDITORIAL'}
            </span>
            {article.original_year && (
              <>
                <span>•</span>
                <span>ORIGINAL: {article.original_year}</span>
              </>
            )}
            <span>•</span>
            <span>{article.reading_time_minutes} MINUTOS</span>
          </div>


          {/* Botões de Ação */}
          <div className="flex items-center gap-2">
            {/* Ajuste de Tamanho da Fonte */}
            <div className="flex items-center border border-rev-black">
              <button
                onClick={decreaseFont}
                aria-label="Diminuir fonte"
                className="px-2.5 py-1 text-xs hover:bg-neutral-100 border-r border-rev-black font-bold"
                title="Diminuir tamanho da fonte"
              >
                A-
              </button>
              <span className="px-2 text-[10px] text-rev-muted">{fontSize}px</span>
              <button
                onClick={increaseFont}
                aria-label="Aumentar fonte"
                className="px-2.5 py-1 text-xs hover:bg-neutral-100 font-bold"
                title="Aumentar tamanho da fonte"
              >
                A+
              </button>
            </div>

            {/* Citação ABNT */}
            <CiteButton article={article} />

            {/* Imprimir */}
            <button
              onClick={handlePrint}
              aria-label="Imprimir artigo"
              className="btn-brutalist !py-2 !px-3 !text-xs hidden sm:inline-flex"
              title="Versão para impressão / PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>IMPRIMIR</span>
            </button>

            {/* Compartilhar */}
            <button
              onClick={handleShare}
              aria-label="Compartilhar artigo"
              className="btn-brutalist !py-2 !px-3 !text-xs"
              title="Compartilhar link"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Cabeçalho do Artigo */}
      <header className="max-w-[1000px] mx-auto px-4 sm:px-6 pt-10 pb-6">
        {/* Metadados Técnicos de Abertura */}
        <div className="text-xs font-mono text-rev-muted mb-4 border-b border-rev-black pb-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-rev-red font-bold">FASCÍCULO 01</span>
            <span>{"//"}</span>
            <span>NATAL / RN</span>
            <span>{"//"}</span>
            <span>DOCUMENTO REF: #{article.slug.toUpperCase().slice(0, 16)}</span>
          </div>

          <div className="flex items-center gap-1 text-[11px]">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              PUBLICADO EM: {new Date(article.published_at).toLocaleDateString('pt-BR')}
            </span>
          </div>
        </div>

        {/* Título Principal */}
        <h1 className="font-display font-black text-2xl sm:text-4xl md:text-5xl uppercase tracking-tight text-rev-black leading-[1.08] mb-4">
          {article.title}
        </h1>

        {/* Subtítulo em Vermelho Revolucionário #C81E1E */}
        {article.subtitle && (
          <h2 className="font-mono text-base sm:text-xl font-medium text-rev-red leading-relaxed mb-4 border-l-4 border-rev-red pl-4">
            {article.subtitle}
          </h2>
        )}

        {/* Tags da Publicação */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mb-6">
            <span className="text-[10px] font-mono text-neutral-500 uppercase font-bold tracking-wider mr-1">
              TAGS:
            </span>
            {article.tags.map((tag) => (
              <Link
                key={tag}
                href={`/busca?q=${encodeURIComponent(tag)}`}
                className="px-2 py-0.5 text-[11px] font-mono font-bold uppercase bg-white hover:bg-rev-red hover:text-white border border-rev-black transition-colors shadow-[1px_1px_0px_#111111]"
                title={`Pesquisar artigos com #${tag}`}
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* Informações detalhadas de autoria e tradução */}
        <div className="bg-neutral-100 border border-rev-black p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
          <div>
            <span className="text-[10px] uppercase text-neutral-500 block">AUTOR(A):</span>
            {article.author ? (
              <Link
                href={`/autores/${article.author.slug}`}
                className="font-bold text-rev-black hover:text-rev-red underline underline-offset-2"
              >
                {article.author.name}
              </Link>
            ) : (
              <span className="font-bold text-rev-black">CONSELHO EDITORIAL</span>
            )}
            <span className="text-[10px] text-neutral-500 block mt-0.5">
              {article.author?.role || 'Comitê Central'}
            </span>
          </div>

          {article.translator && (
            <div>
              <span className="text-[10px] uppercase text-neutral-500 block">TRADUTOR(A):</span>
              <Link
                href={`/autores/${article.translator.slug}`}
                className="font-bold text-rev-black hover:text-rev-red underline underline-offset-2"
              >
                {article.translator.name}
              </Link>
              <span className="text-[10px] text-neutral-500 block mt-0.5">
                {article.translator.role}
              </span>
            </div>
          )}

          {article.original_source && (
            <div>
              <span className="text-[10px] uppercase text-neutral-500 block">FONTE ORIGINAL:</span>
              <span className="text-neutral-800">{article.original_source}</span>
            </div>
          )}

          <div>
            <span className="text-[10px] uppercase text-neutral-500 block">NATUREZA DO TEXTO:</span>
            <span
              className={`px-2 py-0.5 text-[10px] font-bold uppercase inline-block border border-rev-black ${
                article.publication_type === 'ARTIGO EDITORIAL'
                  ? 'bg-rev-red text-white'
                  : 'bg-white text-rev-black'
              }`}
            >
              {article.publication_type}
            </span>
          </div>
        </div>
      </header>

      {/* ÁREA DE LEITURA (Estrita em 68ch) */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Espaçador à esquerda no desktop */}
        <div className="hidden lg:block lg:col-span-2">
          {/* Caixa lateral fixa com sumário */}
          <div className="sticky top-32 p-4 border border-rev-black bg-neutral-50 space-y-3 text-xs font-mono">
            <span className="font-display text-[11px] font-bold uppercase text-rev-red block border-b border-rev-black pb-1">
              ESTRUTURA EDITORIAL
            </span>
            <p className="text-[10px] text-neutral-600 leading-tight">
              Artigo formatado para leitura crítica com margens confortáveis e tipografia monoespaçada.
            </p>
          </div>
        </div>

        {/* Coluna Central de Leitura com largura máxima de 68 caracteres */}
        <div className="lg:col-span-8 flex justify-center">
          <div
            className="w-full max-w-[68ch] font-mono text-neutral-800 transition-all duration-200"
            style={{ fontSize: `${fontSize}px` }}
          >
            {/* Resumo / Excerpt em destaque */}
            <div className="bg-neutral-100 border-l-4 border-rev-black p-4 mb-8 text-neutral-700 italic text-sm font-sans leading-relaxed">
              <span className="font-mono font-bold not-italic text-rev-black text-xs block mb-1">
                SUMÁRIO EXECUTIVO:
              </span>
              {article.excerpt}
            </div>

            {/* Conteúdo Principal Renderizado */}
            <MarkdownRenderer content={article.content} />

            {/* Compartilhamento para Instagram Stories e Redes */}
            <div id="compartilhar-artigo">
              <ShareArticle
                article={article}
                imageUrl={resolvedImageUrl}
              />
            </div>

            {/* Tags Temáticas do Artigo */}
            {article.tags && article.tags.length > 0 && (
              <div className="mt-8 pt-4 border-t border-neutral-300 flex flex-wrap items-center gap-1.5 font-mono text-xs">
                <span className="text-[10px] text-neutral-500 uppercase font-bold mr-1">TAGS:</span>
                {article.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/busca?tag=${encodeURIComponent(tag)}`}
                    className="text-[10px] bg-neutral-200 text-rev-black px-2 py-0.5 border border-rev-black hover:bg-rev-red hover:text-white transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Ficha do Autor ao Final do Artigo */}
            {article.author && (
              <div className="mt-12 p-6 border-2 border-rev-black bg-neutral-100 flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <AuthorAvatar
                  name={article.author.name}
                  avatarUrl={article.author.avatar_url}
                  size="xl"
                  className="w-20 h-20"
                />

                <div className="flex-1 text-center sm:text-left">
                  <span className="text-[10px] font-mono uppercase text-rev-red font-bold">
                    SOBRE O AUTOR / AUTORA
                  </span>
                  <h4 className="font-display font-black text-lg uppercase text-rev-black">
                    {article.author.name}
                  </h4>
                  <p className="text-xs text-neutral-600 font-mono mt-1 leading-relaxed">
                    {article.author.bio}
                  </p>
                  <Link
                    href={`/autores/${article.author.slug}`}
                    className="inline-block mt-3 text-xs font-mono font-bold text-rev-red hover:underline"
                  >
                    VER TODOS OS TEXTOS DE {article.author.name.toUpperCase()} →
                  </Link>
                </div>
              </div>
            )}

            {/* Ficha do Tradutor ao Final do Artigo (se houver) */}
            {article.translator && (
              <div className="mt-4 p-6 border-2 border-rev-black bg-neutral-50 flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <AuthorAvatar
                  name={article.translator.name}
                  avatarUrl={article.translator.avatar_url}
                  size="lg"
                  className="w-16 h-16"
                />

                <div className="flex-1 text-center sm:text-left">
                  <span className="text-[10px] font-mono uppercase text-neutral-600 font-bold">
                    TRADUÇÃO & EDIÇÃO CRÍTICA
                  </span>
                  <h4 className="font-display font-black text-base uppercase text-rev-black">
                    {article.translator.name}
                  </h4>
                  <p className="text-xs text-neutral-600 font-mono mt-1 leading-relaxed">
                    {article.translator.bio || article.translator.role}
                  </p>
                  <Link
                    href={`/autores/${article.translator.slug}`}
                    className="inline-block mt-2 text-xs font-mono font-bold text-rev-black hover:text-rev-red hover:underline"
                  >
                    VER TODOS OS TEXTOS DE {article.translator.name.toUpperCase()} →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Espaçador à direita */}
        <div className="hidden lg:block lg:col-span-2" />
      </main>

      {/* Artigos Relacionados */}
      {relatedArticles.length > 0 && (
        <section className="w-full bg-neutral-100 border-t border-rev-black py-12 mt-16">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
            <h3 className="font-display font-black text-xl uppercase tracking-tight text-rev-black mb-6 border-b border-rev-black pb-2">
              LEITURAS RELACIONADAS {"//"} {article.category}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.slice(0, 3).map((rel) => (
                <Link
                  key={rel.id}
                  href={`/artigo/${rel.slug}`}
                  className="bg-white border border-rev-black p-4 flex flex-col justify-between hover:border-rev-red transition-all group shadow-[3px_3px_0px_#111111]"
                >
                  <div>
                    <span className="text-[9px] font-mono uppercase text-rev-red font-bold block mb-1">
                      {rel.category} • {rel.reading_time_minutes} MIN
                    </span>
                    <h4 className="font-display font-black text-sm uppercase text-rev-black group-hover:text-rev-red transition-colors line-clamp-2">
                      {rel.title}
                    </h4>
                    <p className="mt-2 text-xs font-mono text-neutral-600 line-clamp-2">
                      {rel.excerpt}
                    </p>
                  </div>
                  <div className="mt-4 pt-2 border-t border-neutral-200 text-xs font-mono font-bold text-rev-black flex items-center justify-between">
                    <span>LER ARTIGO</span>
                    <span>→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
