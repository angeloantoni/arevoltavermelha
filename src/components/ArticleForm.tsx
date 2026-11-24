'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Eye, Edit3, Check, UserPlus, AlertCircle, Clock, Tag, X } from 'lucide-react';
import { ArticleCategory, PublicationType, Article, Author } from '@/lib/types';
import { calculateReadingTime } from '@/lib/readingTime';
import { CONSELHO_EDITORIAL_UUID, isValidUuid, ensureValidUuid } from '@/lib/uuid';
import { generateSlug } from '@/lib/slug';
import ImageUploadField from '@/components/ImageUploadField';
import MarkdownRenderer from '@/components/MarkdownRenderer';

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

interface ArticleFormProps {
  initialArticle?: Article;
  mode: 'create' | 'edit';
}

export default function ArticleForm({ initialArticle, mode }: ArticleFormProps) {
  const router = useRouter();
  const [authors, setAuthors] = useState<Author[]>([]);

  const [title, setTitle] = useState(initialArticle?.title || '');
  const [subtitle, setSubtitle] = useState(initialArticle?.subtitle || '');
  const [slug, setSlug] = useState(initialArticle?.slug || '');
  const [category, setCategory] = useState<ArticleCategory>(
    initialArticle?.category || 'EDITORIAL'
  );
  const [publicationType, setPublicationType] = useState<PublicationType>(
    initialArticle?.publication_type || 'ARTIGO EDITORIAL'
  );

  const [authorId, setAuthorId] = useState(
    initialArticle?.author_id && isValidUuid(initialArticle.author_id)
      ? initialArticle.author_id
      : CONSELHO_EDITORIAL_UUID
  );

  useEffect(() => {
    fetch('/api/authors')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAuthors(data);
          setAuthorId((prev) => {
            if (prev && isValidUuid(prev)) return prev;
            if (initialArticle?.author_id && isValidUuid(initialArticle.author_id)) {
              return initialArticle.author_id;
            }
            return data[0]?.id || CONSELHO_EDITORIAL_UUID;
          });
        }
      })
      .catch((err) => console.error('Erro ao carregar autores:', err));
  }, [initialArticle]);

  const [excerpt, setExcerpt] = useState(initialArticle?.excerpt || '');
  const [coverImageUrl, setCoverImageUrl] = useState(
    initialArticle?.cover_image_url ||
      'https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=1200&auto=format&fit=crop'
  );
  const [coverCaption, setCoverCaption] = useState(initialArticle?.cover_caption || '');
  const [tags, setTags] = useState<string[]>(initialArticle?.tags || []);
  const [tagInput, setTagInput] = useState('');

  const [content, setContent] = useState(
    initialArticle?.content ||
      `# Título da Seção Principal\n\nInsira aqui o corpo do ensaio teórico em formato Markdown.\n\n> "A teoria revolucionária transforma-se em força material quando penetra as massas."\n\n## Subtítulo Conceitual\n\nAnálise de conjuntura, dados materiais e fundamentos de classe.`
  );

  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Cálculo dinâmico do tempo de leitura em tempo real
  const { minutes: readingTimeMinutes, wordCount } = calculateReadingTime(content);

  const addTag = (raw: string) => {
    const clean = raw.trim().toUpperCase().replace(/^#/, '');
    if (clean && !tags.includes(clean)) {
      setTags((prev) => [...prev, clean]);
    }
    setTagInput('');
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  // Gerar slug automaticamente se for novo artigo e slug estiver em branco
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (mode === 'create' && !initialArticle) {
      setSlug(generateSlug(val));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!title.trim() || !content.trim()) {
      setErrorMessage('Preencha os campos obrigatórios: Título e Conteúdo em Markdown.');
      return;
    }

    setSubmitting(true);

    try {
      const payload: Record<string, any> = {
        title: title.trim(),
        subtitle: subtitle.trim(),
        slug: slug.trim(),
        category,
        publication_type: publicationType,
        author_id: ensureValidUuid(authorId, CONSELHO_EDITORIAL_UUID),
        cover_image_url: coverImageUrl.trim(),
        cover_caption: coverCaption.trim(),
        tags,
        excerpt: excerpt.trim(),
        content,
        reading_time_minutes: readingTimeMinutes,
        status: 'published' as const,
      };

      if (mode === 'edit' && initialArticle?.id) {
        payload.id = initialArticle.id;
      }

      const url =
        mode === 'edit' && initialArticle?.id
          ? `/api/articles/${initialArticle.id}`
          : '/api/articles';

      const method = mode === 'edit' ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro inesperado ao salvar no banco de dados.');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/admin');
        router.refresh();
      }, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha na comunicação com o banco.';
      setErrorMessage(msg);
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-rev-white min-h-screen py-12">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        {/* Barra Superior / Voltar */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/admin"
            className="btn-brutalist !py-1.5 !px-3 !text-xs inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>VOLTAR AO PAINEL CMS</span>
          </Link>

          <span className="text-xs font-mono text-neutral-500 uppercase">
            {mode === 'edit' ? 'EDIÇÃO DE PUBLICAÇÃO' : 'NOVA PUBLICAÇÃO'} • VANGUARDA 2026
          </span>
        </div>

        {/* Título da Página */}
        <div className="border-b-2 border-rev-black pb-4 mb-8">
          <div className="flex items-center gap-2 text-xs font-mono text-rev-red font-bold uppercase tracking-wider mb-1">
            <span className="w-2.5 h-2.5 bg-rev-red inline-block" />
            <span>{mode === 'edit' ? 'EDITAR ARTIGO NO ACERVO' : 'REDAÇÃO EDITORIAL'}</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-4xl uppercase tracking-tight text-rev-black">
            {mode === 'edit' ? 'EDITAR ARTIGO' : 'NOVO ARTIGO EM MARKDOWN'}
          </h1>
          <p className="mt-1 text-xs font-mono text-neutral-600">
            {mode === 'edit'
              ? 'Atualize os metadados bibliográficos ou o conteúdo do ensaio. As alterações serão salvas imediatamente.'
              : 'Preencha os metadados bibliográficos e redija o texto utilizando formatação Markdown padrão.'}
          </p>
        </div>

        {/* Feedback de Erro Real */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-rev-red text-rev-red text-xs font-mono flex items-start gap-3 shadow-[3px_3px_0px_#111111]">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold uppercase tracking-wider">FALHA AO PERSISTIR ARTIGO:</div>
              <div className="mt-1 leading-relaxed">{errorMessage}</div>
            </div>
          </div>
        )}

        {/* Feedback de Sucesso */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border-2 border-green-700 text-green-900 text-xs font-mono flex items-center gap-3 shadow-[3px_3px_0px_#111111]">
            <Check className="w-5 h-5 shrink-0 text-green-700" />
            <div>
              <div className="font-bold uppercase tracking-wider">OPERAÇÃO REALIZADA COM SUCESSO!</div>
              <div className="mt-0.5">
                Artigo gravado e publicado no acervo. Redirecionando para o painel...
              </div>
            </div>
          </div>
        )}

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
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="a-insurreicao-popular"
                className="w-full px-3 py-2.5 border border-rev-black font-mono text-xs focus:ring-2 focus:ring-rev-red outline-none"
              />
            </div>
          </div>

          {/* Linha 3: Autor, Tempo de Leitura Calculado e Imagem */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-7 space-y-1">
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
                {authors.length === 0 ? (
                  <option value={CONSELHO_EDITORIAL_UUID}>
                    Conselho Editorial (Direção Política e Editorial)
                  </option>
                ) : (
                  authors.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.role})
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Cálculo Automático do Tempo de Leitura (Somente Leitura) */}
            <div className="md:col-span-5 space-y-1">
              <label className="text-xs font-mono font-bold uppercase text-rev-black flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-rev-red" />
                <span>LEITURA (CALCULADO):</span>
              </label>
              <div className="px-3 py-2.5 border border-rev-black bg-neutral-100 font-mono text-xs text-rev-black flex items-center justify-between">
                <span className="font-bold text-rev-red">{readingTimeMinutes} MIN</span>
                <span className="text-[10px] text-neutral-500">({wordCount} palavras)</span>
              </div>
            </div>
          </div>

          {/* Upload Direto da Imagem de Capa */}
          <ImageUploadField
            label="IMAGEM DE CAPA DO ARTIGO (P&B / ALTO CONTRASTE)*:"
            value={coverImageUrl}
            onChange={setCoverImageUrl}
            folder="artigos"
            aspectRatio="video"
            helpText="Envie um arquivo de imagem do dispositivo para o bucket 'midia' do Supabase Storage ou informe uma URL externa."
          />

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

          {/* Campo de Tags (Palavras-chave em caixa alta) */}
          <div className="space-y-2 border border-rev-black p-3.5 bg-neutral-50 shadow-[2px_2px_0px_#111111]">
            <label className="text-xs font-mono font-bold uppercase text-rev-black flex flex-wrap items-center justify-between gap-1">
              <span className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-rev-red" />
                <span>TAGS & TEMAS DO ARTIGO (SEPARADOS POR VÍRGULA OU ENTER)*:</span>
              </span>
              <span className="text-[10px] text-neutral-500 font-normal">
                Normalização automática em CAIXA ALTA
              </span>
            </label>

            {/* Tags já adicionadas */}
            {tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pb-1">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-bold bg-white text-rev-black border border-rev-black shadow-[1px_1px_0px_#111111]"
                  >
                    <span className="text-rev-red">#</span>
                    <span>{t}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(t)}
                      className="text-neutral-400 hover:text-rev-red transition-colors ml-0.5 cursor-pointer"
                      title={`Remover tag #${t}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="Digite uma tag (ex: PALESTINA, 1935, CULTURA, SINDICATO, TEORIA) e aperte Enter..."
                  className="w-full px-3 py-2 border border-rev-black font-mono text-xs focus:ring-2 focus:ring-rev-red outline-none bg-white uppercase"
                />
              </div>
              <button
                type="button"
                onClick={() => addTag(tagInput)}
                className="btn-brutalist !py-2 !px-3 !text-xs !bg-rev-black !text-white hover:!bg-rev-red whitespace-nowrap"
              >
                + ADICIONAR TAG
              </button>
            </div>
          </div>

          {/* Resumo / Excerpt */}
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
                  <span>PRÉ-VISUALIZAÇÃO DA LEITURA</span>
                </button>
              </div>

              <span className="text-[10px] font-mono text-neutral-500">
                TEMPO ESTIMADO: {readingTimeMinutes} MIN ({wordCount} PALAVRAS)
              </span>
            </div>

            <div className="p-4">
              {activeTab === 'editor' ? (
                <textarea
                  rows={16}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-3 font-mono text-xs focus:outline-none focus:ring-0 leading-relaxed border border-neutral-200"
                />
              ) : (
                <div className="bg-white border border-rev-black overflow-hidden shadow-[3px_3px_0px_#111111]">
                  {/* Top Banner Fotográfico P&B da Pré-visualização */}
                  {coverImageUrl && (
                    <div className="relative w-full h-52 sm:h-72 bg-rev-black overflow-hidden border-b border-rev-black">
                      <img
                        src={coverImageUrl}
                        alt={title || 'Pré-visualização da capa'}
                        className="w-full h-full object-cover filter grayscale contrast-125"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                      {coverCaption && (
                        <div className="absolute bottom-2 right-3 max-w-md text-right text-[10px] text-neutral-300 font-mono bg-black/80 px-2.5 py-1 border border-neutral-700">
                          {coverCaption}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Barra de Metadados / Breadcrumb idêntica ao Reader público */}
                  <div className="bg-neutral-100 border-b border-rev-black py-2.5 px-4 sm:px-6 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                    <div className="flex items-center gap-2 text-[11px]">
                      <span
                        className={`px-2 py-0.5 font-bold uppercase text-white ${
                          publicationType === 'ARTIGO EDITORIAL' ? 'bg-rev-red' : 'bg-rev-black'
                        }`}
                      >
                        {publicationType}
                      </span>
                      <span>•</span>
                      <span className="font-bold text-rev-black uppercase">{category}</span>
                      <span>•</span>
                      <span className="font-bold text-neutral-700 uppercase">
                        {authors.find((a) => a.id === authorId)?.name || 'CONSELHO EDITORIAL'}
                      </span>
                      <span>•</span>
                      <span className="text-rev-red font-bold">{readingTimeMinutes} MINUTOS</span>
                    </div>

                    <div className="text-[10px] text-neutral-500 font-mono">
                      PRÉVIA FIEL AO LAYOUT PÚBLICO
                    </div>
                  </div>

                  {/* Área Editorial do Texto */}
                  <div className="max-w-[760px] mx-auto px-4 sm:px-6 pt-8 pb-8">
                    <h1 className="font-display font-black text-2xl sm:text-4xl uppercase tracking-tight text-rev-black leading-tight mb-3">
                      {title || 'TÍTULO PRINCIPAL DO ARTIGO'}
                    </h1>

                    {subtitle && (
                      <h2 className="font-mono text-sm sm:text-lg font-medium text-rev-red leading-relaxed mb-4 border-l-4 border-rev-red pl-3">
                        {subtitle}
                      </h2>
                    )}

                    {/* Tags da Publicação */}
                    {tags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 mb-6">
                        <span className="text-[10px] font-mono text-neutral-500 uppercase font-bold mr-1">
                          TAGS:
                        </span>
                        {tags.map((t) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase bg-white border border-rev-black shadow-[1px_1px_0px_#111111]"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Resumo Executivo / Excerpt */}
                    {excerpt && (
                      <div className="bg-neutral-100 border-l-4 border-rev-black p-4 mb-8 text-neutral-700 italic text-xs sm:text-sm font-sans leading-relaxed">
                        <span className="font-mono font-bold not-italic text-rev-black text-xs block mb-1">
                          SUMÁRIO EXECUTIVO:
                        </span>
                        {excerpt}
                      </div>
                    )}

                    {/* Conteúdo Renderizado com Tipografia Brutalista Idêntica */}
                    <div className="max-w-[68ch] mx-auto">
                      <MarkdownRenderer content={content} />
                    </div>
                  </div>
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
              disabled={submitting}
              className="btn-brutalist !bg-rev-red !text-white hover:!bg-rev-black !px-6 !py-3 !text-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Check className="w-4 h-4 animate-spin" />
                  <span>SALVANDO DOCUMENTO NO BANCO...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>
                    {mode === 'edit'
                      ? 'SALVAR ALTERAÇÕES NO ACERVO →'
                      : 'SALVAR & PUBLICAR NO ACERVO →'}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
