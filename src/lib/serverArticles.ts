import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { revalidatePath } from 'next/cache';
import { Article, Author } from './types';
import { INITIAL_ARTICLES } from './data';
import { supabase, isSupabaseConfigured } from './supabase';
import { calculateReadingTime } from './readingTime';
import { CONSELHO_EDITORIAL_UUID, isValidUuid, ensureValidUuid } from './uuid';
import { generateSlug } from './slug';
import {
  ensureConselhoEditorialInSupabase,
  getAllAuthors as getServerAuthors,
  DEFAULT_AUTHORS_WITH_UUIDS,
} from './serverAuthors';

const DATA_DIR = path.join(process.cwd(), 'data');
const ARTICLES_FILE = path.join(DATA_DIR, 'articles.json');

/**
 * Garante a existência do arquivo local de persistência.
 * Retorna exclusivamente registros com UUID válido, sem injetar dados fictícios/mockados.
 */
function ensureLocalStore(): Article[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(ARTICLES_FILE)) {
      fs.writeFileSync(ARTICLES_FILE, '[]', 'utf-8');
      return [];
    }

    const raw = fs.readFileSync(ARTICLES_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.filter((art: any) => isValidUuid(art.id));
    }

    return [];
  } catch (err) {
    console.error('Erro ao acessar armazenamento local de artigos:', err);
    return [];
  }
}

/**
 * Salva a lista de artigos no armazenamento local permanente.
 */
function saveLocalStore(articles: Article[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(ARTICLES_FILE, JSON.stringify(articles, null, 2), 'utf-8');
  } catch (err) {
    console.error('Erro ao salvar artigos no disco local:', err);
  }
}

/**
 * Anexa o objeto de autor correspondente ao artigo com busca nos autores conhecidos.
 */
function attachAuthor(art: Article, authorsList?: Author[]): Article {
  const pool = authorsList && authorsList.length > 0 ? authorsList : DEFAULT_AUTHORS_WITH_UUIDS;
  const author = pool.find((a) => a.id === art.author_id) || pool[0];
  const translator = art.translator_id
    ? pool.find((a) => a.id === art.translator_id)
    : undefined;

  return {
    ...art,
    author: art.author || author,
    translator: art.translator || translator,
    tags: Array.isArray(art.tags) ? art.tags : [],
  };
}

/**
 * Consulta de seleção com foreign key explícita na sintaxe PostgREST / Supabase.
 * Como a tabela articles possui duas chaves estrangeiras referenciando authors (author_id e translator_id),
 * a sintaxe explícita author:authors!author_id(*) e translator:authors!translator_id(*) elimina a ambiguidade
 * e impede o erro "Could not embed because more than one relationship was found for 'articles' and 'authors'".
 */
export const ARTICLE_SELECT_QUERY =
  '*, author:authors!author_id(*), translator:authors!translator_id(*)';

/**
 * Normaliza uma linha retornada diretamente da consulta Supabase (com join explícito de author e translator).
 */
function normalizeArticleRow(row: any, authorsList?: Author[]): Article {
  const pool = authorsList && authorsList.length > 0 ? authorsList : DEFAULT_AUTHORS_WITH_UUIDS;

  // Trata autor principal vindo do embed explícito (author:authors!author_id) ou fallback
  const rawAuthor = Array.isArray(row.author) ? row.author[0] : row.author;
  const legacyAuthor = Array.isArray(row.authors) ? row.authors[0] : row.authors;
  const authorFromEmbed = rawAuthor || legacyAuthor;
  const author = authorFromEmbed || pool.find((a) => a.id === row.author_id) || pool[0];

  // Trata tradutor vindo do embed explícito (translator:authors!translator_id) com fallback seguro caso translator_id seja nulo
  const rawTranslator = Array.isArray(row.translator) ? row.translator[0] : row.translator;
  const translator =
    rawTranslator ||
    (row.translator_id ? pool.find((a) => a.id === row.translator_id) : undefined);

  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle || '',
    slug: row.slug,
    category: row.category,
    publication_type: row.publication_type,
    excerpt: row.excerpt,
    content: row.content,
    cover_image_url: row.cover_image_url,
    cover_caption: row.cover_caption || '',
    is_hero_featured: Boolean(row.is_hero_featured),
    hero_order: row.hero_order || 0,
    reading_time_minutes: row.reading_time_minutes || 10,
    author_id: row.author_id,
    author: author,
    translator_id: row.translator_id || undefined,
    translator: translator || undefined,
    tags: Array.isArray(row.tags) ? row.tags : [],
    status: row.status || 'published',
    published_at: row.published_at || new Date().toISOString(),
    created_at: row.created_at || new Date().toISOString(),
  };
}

/**
 * Revalida o cache do Next.js para refletir imediatamente as alterações na capa e páginas.
 */
export function revalidateEditorialPaths(slug?: string): void {
  try {
    revalidatePath('/', 'page');
    revalidatePath('/admin', 'page');
    revalidatePath('/busca', 'page');
    if (slug) {
      revalidatePath(`/artigo/${slug}`, 'page');
    }
    revalidatePath('/artigo/[slug]', 'page');
  } catch {
    // Ignora quando executado fora de request HTTP
  }
}

/**
 * Obtém todos os artigos ordenados por data de criação/publicação decrescente.
 * No ambiente de produção/Supabase, carrega exclusivamente os dados reais do banco.
 */
export async function getAllArticles(): Promise<Article[]> {
  const authors = await getServerAuthors();

  // 1. Consulta exclusiva ao Supabase se configurado
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select(ARTICLE_SELECT_QUERY)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro na consulta de artigos no Supabase:', error.message);
        return [];
      }

      return (data || []).map((row: any) => normalizeArticleRow(row, authors));
    } catch (err) {
      console.error('Falha de conexão com o Supabase ao listar artigos:', err);
      return [];
    }
  }

  // 2. Consulta ao armazenamento local persistente (apenas desenvolvimento offline sem Supabase)
  const localArticles = ensureLocalStore();
  return [...localArticles]
    .sort(
      (a, b) =>
        new Date(b.created_at || b.published_at).getTime() -
        new Date(a.created_at || a.published_at).getTime()
    )
    .map((art) => attachAuthor(art, authors));
}

/**
 * Obtém um artigo pelo slug com autor anexado.
 */
export async function getArticleBySlug(slug: string): Promise<Article | undefined> {
  const authors = await getServerAuthors();

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select(ARTICLE_SELECT_QUERY)
        .eq('slug', slug)
        .maybeSingle();

      if (!error && data) {
        return normalizeArticleRow(data, authors);
      }
      return undefined;
    } catch (err) {
      console.error(`Erro ao consultar artigo pelo slug "${slug}" no Supabase:`, err);
      return undefined;
    }
  }

  const localArticles = ensureLocalStore();
  const found = localArticles.find((a) => a.slug === slug);
  return found ? attachAuthor(found, authors) : undefined;
}

/**
 * Obtém um artigo pelo ID único.
 */
export async function getArticleById(id: string): Promise<Article | undefined> {
  if (!isValidUuid(id)) {
    return undefined;
  }

  const authors = await getServerAuthors();

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select(ARTICLE_SELECT_QUERY)
        .eq('id', id)
        .maybeSingle();

      if (!error && data) {
        return normalizeArticleRow(data, authors);
      }
      return undefined;
    } catch (err) {
      console.error(`Erro ao consultar artigo "${id}" no Supabase:`, err);
      return undefined;
    }
  }

  const localArticles = ensureLocalStore();
  const found = localArticles.find((a) => a.id === id);
  return found ? attachAuthor(found, authors) : undefined;
}

/**
 * Criação e publicação de novo artigo com validação de UUID e persistência real no Supabase.
 * Pre-check de unicidade de slug e retry automático com tratamento de erro PostgreSQL 23505.
 */
export async function createArticle(
  payload: Omit<Article, 'id' | 'created_at' | 'published_at' | 'reading_time_minutes'> & {
    id?: string;
    reading_time_minutes?: number;
    published_at?: string;
  }
): Promise<Article> {
  // 0. Se possuir id UUID de artigo existente, delega estritamente para updateArticle
  if (payload.id && isValidUuid(payload.id)) {
    const existing = await getArticleById(payload.id);
    if (existing) {
      return updateArticle(payload.id, payload);
    }
  }

  if (!payload.title || !payload.title.trim()) {
    throw new Error('O título do artigo é obrigatório.');
  }
  if (!payload.content || !payload.content.trim()) {
    throw new Error('O conteúdo em Markdown é obrigatório.');
  }

  // 1. Gera o slug limpo a partir do título (ou slug customizado)
  const rawCandidate = payload.slug?.trim() || payload.title.trim();
  const baseSlug = generateSlug(rawCandidate) || 'artigo';

  let targetSlug = baseSlug;

  // 2. Pré-consulta no Supabase para verificar colisão de slug
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: existingSlugs, error: searchError } = await supabase
        .from('articles')
        .select('slug')
        .ilike('slug', `${baseSlug}%`);

      if (!searchError && existingSlugs && existingSlugs.length > 0) {
        const slugSet = new Set(existingSlugs.map((s: { slug: string }) => s.slug.toLowerCase()));
        if (slugSet.has(baseSlug.toLowerCase())) {
          targetSlug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
          while (slugSet.has(targetSlug.toLowerCase())) {
            targetSlug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
          }
        }
      }
    } catch (searchErr) {
      console.warn('Aviso: Falha ao consultar slugs existentes no Supabase:', searchErr);
    }
  } else {
    const current = ensureLocalStore();
    if (current.some((a) => a.slug.toLowerCase() === baseSlug.toLowerCase())) {
      targetSlug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }
  }

  const now = new Date().toISOString();
  const { minutes: calculatedTime } = calculateReadingTime(payload.content);

  // Garante ID UUID válido para o novo artigo
  const newId = payload.id && isValidUuid(payload.id) ? payload.id : crypto.randomUUID();

  // Garante UUID válido para autor (padrão: Conselho Editorial)
  const validAuthorId = ensureValidUuid(payload.author_id, CONSELHO_EDITORIAL_UUID);

  // Garante UUID válido para tradutor ou null
  const validTranslatorId =
    payload.translator_id && isValidUuid(payload.translator_id)
      ? payload.translator_id
      : null;

  // Normaliza tags para caixa alta sem duplicidades
  const cleanTags = Array.isArray(payload.tags)
    ? Array.from(new Set(payload.tags.map((t) => t.trim().toUpperCase()).filter(Boolean)))
    : [];

  const cleanPayload = {
    id: newId,
    title: payload.title.trim(),
    subtitle: payload.subtitle?.trim() || '',
    slug: targetSlug,
    category: payload.category || 'EDITORIAL',
    publication_type: payload.publication_type || 'ARTIGO EDITORIAL',
    excerpt: payload.excerpt?.trim() || payload.content.slice(0, 160).trim(),
    content: payload.content,
    cover_image_url:
      payload.cover_image_url ||
      'https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=1200&auto=format&fit=crop',
    cover_caption: payload.cover_caption || '',
    is_hero_featured: Boolean(payload.is_hero_featured),
    hero_order: Number(payload.hero_order) || 1,
    reading_time_minutes: calculatedTime,
    author_id: validAuthorId,
    translator_id: validTranslatorId,
    tags: cleanTags,
    status: payload.status || 'published',
    published_at: payload.published_at || now,
    created_at: now,
  };

  const authors = await getServerAuthors();

  // 3. Tentar persistência no Supabase com tratamento de retry automático para erro 23505 (articles_slug_key)
  if (isSupabaseConfigured && supabase) {
    await ensureConselhoEditorialInSupabase();

    let { data, error } = await supabase
      .from('articles')
      .insert(cleanPayload)
      .select(ARTICLE_SELECT_QUERY)
      .maybeSingle();

    // Retry automático caso ocorra código 23505 (articles_slug_key)
    if (
      error &&
      (error.code === '23505' ||
        error.message?.includes('articles_slug_key') ||
        error.message?.includes('duplicate key value'))
    ) {
      console.warn(`Colisão de slug detectada (${error.message}). Executando retry automático com sufixo temporal...`);
      const retrySlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
      cleanPayload.slug = retrySlug;

      const retryResult = await supabase
        .from('articles')
        .insert(cleanPayload)
        .select(ARTICLE_SELECT_QUERY)
        .maybeSingle();

      data = retryResult.data;
      error = retryResult.error;

      // Fallback final se colidir no mesmo milissegundo
      if (
        error &&
        (error.code === '23505' ||
          error.message?.includes('articles_slug_key') ||
          error.message?.includes('duplicate key value'))
      ) {
        const fallbackSlug = `${baseSlug}-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
        cleanPayload.slug = fallbackSlug;

        const fallbackResult = await supabase
          .from('articles')
          .insert(cleanPayload)
          .select(ARTICLE_SELECT_QUERY)
          .maybeSingle();

        data = fallbackResult.data;
        error = fallbackResult.error;
      }
    }

    if (error) {
      console.error('Erro retornado pelo Supabase na inserção:', error);
      throw new Error(`Falha no banco Supabase: ${error.message}`);
    }

    if (data) {
      const createdArticle = normalizeArticleRow(data, authors);
      const current = ensureLocalStore();
      const updated = [
        createdArticle,
        ...current.filter((a) => a.id !== createdArticle.id && a.slug !== createdArticle.slug),
      ];
      saveLocalStore(updated);
      revalidateEditorialPaths(createdArticle.slug);
      return createdArticle;
    }
  }

  // 4. Persistir no armazenamento local
  const fallbackArticle: Article = {
    ...cleanPayload,
    translator_id: validTranslatorId || undefined,
  };
  const current = ensureLocalStore();
  const updated = [
    fallbackArticle,
    ...current.filter((a) => a.id !== fallbackArticle.id && a.slug !== fallbackArticle.slug),
  ];
  saveLocalStore(updated);
  revalidateEditorialPaths(fallbackArticle.slug);
  return attachAuthor(fallbackArticle, authors);
}

/**
 * Atualização de artigo existente (UPDATE).
 * Executa exclusivamente .update(cleanPayload).eq('id', id).select(ARTICLE_SELECT_QUERY).
 * Mantém o slug original ou atualiza apenas se o novo slug não pertencer a outro id (.neq('id', id)).
 */
export async function updateArticle(
  id: string,
  payload: Partial<Article>
): Promise<Article> {
  // 1. Validação estrita do UUID primário
  if (!isValidUuid(id)) {
    throw new Error('Este item é um exemplo local e não existe no banco de dados');
  }

  const authors = await getServerAuthors();

  // 2. Busca o slug atual do artigo para controle de unicidade
  let originalSlug: string | undefined;
  if (isSupabaseConfigured && supabase) {
    const { data: currentData } = await supabase
      .from('articles')
      .select('slug')
      .eq('id', id)
      .maybeSingle();
    if (currentData?.slug) {
      originalSlug = currentData.slug;
    }
  }
  if (!originalSlug) {
    const current = ensureLocalStore();
    const existing = current.find((a) => a.id === id);
    if (existing) originalSlug = existing.slug;
  }

  const cleanTags = Array.isArray(payload.tags)
    ? Array.from(new Set(payload.tags.map((t) => t.trim().toUpperCase()).filter(Boolean)))
    : undefined;

  // 3. Sanitização estrita do payload (somente colunas válidas da tabela articles, sem objetos de join)
  const cleanPayload: Record<string, any> = {};
  if (payload.title !== undefined) cleanPayload.title = payload.title.trim();
  if (payload.subtitle !== undefined) cleanPayload.subtitle = payload.subtitle?.trim() || '';

  // Tratamento do slug na atualização:
  // Mantenha o slug original do artigo ou atualize-o apenas se o novo slug não pertencer a outro id (.neq('id', id))
  if (payload.slug !== undefined) {
    const candidateSlug = generateSlug(payload.slug.trim());
    if (candidateSlug && candidateSlug !== originalSlug) {
      let isDuplicate = false;
      if (isSupabaseConfigured && supabase) {
        const { data: duplicate } = await supabase
          .from('articles')
          .select('id')
          .eq('slug', candidateSlug)
          .neq('id', id)
          .maybeSingle();

        if (duplicate) {
          isDuplicate = true;
        }
      } else {
        const current = ensureLocalStore();
        if (current.some((a) => a.id !== id && a.slug.toLowerCase() === candidateSlug.toLowerCase())) {
          isDuplicate = true;
        }
      }

      if (isDuplicate) {
        console.warn(`O slug "${candidateSlug}" já pertence a outro artigo. Mantendo slug original "${originalSlug}".`);
        if (originalSlug) {
          cleanPayload.slug = originalSlug;
        }
      } else {
        cleanPayload.slug = candidateSlug;
      }
    } else if (originalSlug) {
      cleanPayload.slug = originalSlug;
    }
  } else if (originalSlug) {
    // Se o slug não foi explicitamente alterado, preserva o slug original
    cleanPayload.slug = originalSlug;
  }

  if (payload.category !== undefined) cleanPayload.category = payload.category;
  if (payload.publication_type !== undefined) cleanPayload.publication_type = payload.publication_type;
  if (payload.excerpt !== undefined) cleanPayload.excerpt = payload.excerpt.trim();
  if (payload.content !== undefined) {
    cleanPayload.content = payload.content;
    cleanPayload.reading_time_minutes = calculateReadingTime(payload.content).minutes;
  }
  if (payload.cover_image_url !== undefined) cleanPayload.cover_image_url = payload.cover_image_url.trim();
  if (payload.cover_caption !== undefined) cleanPayload.cover_caption = payload.cover_caption?.trim() || '';
  if (payload.is_hero_featured !== undefined) cleanPayload.is_hero_featured = Boolean(payload.is_hero_featured);
  if (payload.hero_order !== undefined) cleanPayload.hero_order = Number(payload.hero_order) || 0;
  if (payload.author_id !== undefined) {
    cleanPayload.author_id = ensureValidUuid(payload.author_id, CONSELHO_EDITORIAL_UUID);
  }
  if (payload.translator_id !== undefined) {
    cleanPayload.translator_id =
      payload.translator_id && isValidUuid(payload.translator_id)
        ? payload.translator_id
        : null;
  }
  if (payload.original_title !== undefined) cleanPayload.original_title = payload.original_title;
  if (payload.original_year !== undefined) cleanPayload.original_year = payload.original_year;
  if (payload.original_source !== undefined) cleanPayload.original_source = payload.original_source;
  if (payload.status !== undefined) cleanPayload.status = payload.status;
  if (cleanTags !== undefined) cleanPayload.tags = cleanTags;
  if (payload.published_at !== undefined) cleanPayload.published_at = payload.published_at;

  // Remoção explícita de propriedades indesejadas
  delete cleanPayload.id;
  delete cleanPayload.author;
  delete cleanPayload.authors;
  delete cleanPayload.translator;

  // 4. Executa exclusivamente .update(cleanPayload).eq('id', id).select(ARTICLE_SELECT_QUERY)
  if (isSupabaseConfigured && supabase) {
    await ensureConselhoEditorialInSupabase();

    let { data, error } = await supabase
      .from('articles')
      .update(cleanPayload)
      .eq('id', id)
      .select(ARTICLE_SELECT_QUERY)
      .maybeSingle();

    // Tratamento de segurança contra erro 23505 no update
    if (
      error &&
      (error.code === '23505' ||
        error.message?.includes('articles_slug_key') ||
        error.message?.includes('duplicate key value'))
    ) {
      console.warn('Conflito de slug no UPDATE. Revertendo para slug original ou gerando sufixo único...');
      if (originalSlug && cleanPayload.slug !== originalSlug) {
        cleanPayload.slug = originalSlug;
      } else {
        cleanPayload.slug = `${cleanPayload.slug || 'artigo'}-${Date.now().toString().slice(-4)}`;
      }

      const retryUpdate = await supabase
        .from('articles')
        .update(cleanPayload)
        .eq('id', id)
        .select(ARTICLE_SELECT_QUERY)
        .maybeSingle();

      data = retryUpdate.data;
      error = retryUpdate.error;
    }

    if (error) {
      console.error('Erro retornado pelo Supabase na atualização:', error);
      throw new Error(`Falha no banco Supabase: ${error.message}`);
    }

    if (!data) {
      throw new Error(`Artigo com ID "${id}" não foi encontrado para atualização.`);
    }

    const normalized = normalizeArticleRow(data, authors);

    // Sincroniza também no armazenamento local caso o artigo exista lá
    const current = ensureLocalStore();
    const existingIndex = current.findIndex((a) => a.id === id);
    if (existingIndex >= 0) {
      current[existingIndex] = { ...current[existingIndex], ...normalized };
      saveLocalStore(current);
    }

    // Revalida rotas imediatamente
    revalidateEditorialPaths(normalized.slug);
    if (originalSlug && originalSlug !== normalized.slug) {
      revalidateEditorialPaths(originalSlug);
    }
    return normalized;
  }

  // 5. Persistir no armazenamento local se Supabase offline
  const current = ensureLocalStore();
  const existingIndex = current.findIndex((a) => a.id === id);

  if (existingIndex < 0) {
    throw new Error(`Artigo com ID "${id}" não foi encontrado para atualização.`);
  }

  const existing = current[existingIndex];
  const updatedArticle: Article = {
    ...existing,
    ...cleanPayload,
    id: existing.id,
  };

  current[existingIndex] = updatedArticle;
  saveLocalStore(current);

  // Revalida rotas
  revalidateEditorialPaths(updatedArticle.slug);
  if (originalSlug && originalSlug !== updatedArticle.slug) {
    revalidateEditorialPaths(originalSlug);
  }

  return attachAuthor(updatedArticle, authors);
}

/**
 * Função de persistência segura para /admin.
 * Separa rigorosamente criação (INSERT) de edição (UPDATE).
 */
export async function saveArticle(
  payload: Partial<Article> & { title: string; content: string }
): Promise<Article> {
  if (payload.id && isValidUuid(payload.id)) {
    const existing = await getArticleById(payload.id);
    if (existing) {
      return updateArticle(payload.id, payload);
    }
  }
  return createArticle(payload as any);
}

/**
 * Exclusão definitiva de artigo (DELETE).
 */
export async function deleteArticle(id: string): Promise<boolean> {
  // 1. Validação estrita do UUID primário
  if (!isValidUuid(id)) {
    throw new Error('Este item é um exemplo local e não existe no banco de dados');
  }

  let deletedSlug: string | undefined;

  // 2. Tentar excluir no Supabase se configurado
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id)
      .select('slug')
      .maybeSingle();

    if (error) {
      console.error('Erro retornado pelo Supabase na exclusão:', error);
      throw new Error(`Falha no banco Supabase: ${error.message}`);
    }

    if (data?.slug) {
      deletedSlug = data.slug;
    }
  }

  // 3. Remover do armazenamento local
  const current = ensureLocalStore();
  const existing = current.find((a) => a.id === id);

  if (existing) {
    deletedSlug = deletedSlug || existing.slug;
    const filtered = current.filter((a) => a.id !== id);
    saveLocalStore(filtered);
  } else if (!isSupabaseConfigured && !deletedSlug) {
    throw new Error(`Artigo com ID "${id}" não encontrado.`);
  }

  // 4. Revalidar rotas
  revalidateEditorialPaths(deletedSlug);

  return true;
}
