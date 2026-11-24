import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { revalidatePath } from 'next/cache';
import { Article, Author } from './types';
import { INITIAL_ARTICLES } from './data';
import { supabase, isSupabaseConfigured } from './supabase';
import { calculateReadingTime } from './readingTime';
import { CONSELHO_EDITORIAL_UUID, isValidUuid, ensureValidUuid } from './uuid';
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
 * Normaliza uma linha retornada diretamente da consulta Supabase (com join de authors).
 */
function normalizeArticleRow(row: any, authorsList?: Author[]): Article {
  const pool = authorsList && authorsList.length > 0 ? authorsList : DEFAULT_AUTHORS_WITH_UUIDS;
  const authorFromJoin = row.authors;
  const author = authorFromJoin || pool.find((a) => a.id === row.author_id) || pool[0];
  const translator = row.translator_id ? pool.find((a) => a.id === row.translator_id) : undefined;

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
    translator: translator,
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
        .select('*, authors(*)')
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
        .select('*, authors(*)')
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
        .select('*, authors(*)')
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
 * Criação e publicação de novo artigo com validação de UUID e persistência real.
 */
export async function createArticle(
  payload: Omit<Article, 'id' | 'created_at' | 'published_at' | 'reading_time_minutes'> & {
    id?: string;
    reading_time_minutes?: number;
  }
): Promise<Article> {
  if (!payload.title || !payload.title.trim()) {
    throw new Error('O título do artigo é obrigatório.');
  }
  if (!payload.content || !payload.content.trim()) {
    throw new Error('O conteúdo em Markdown é obrigatório.');
  }

  const slug =
    payload.slug?.trim() ||
    payload.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');

  const now = new Date().toISOString();
  const { minutes: calculatedTime } = calculateReadingTime(payload.content);

  // Garante ID UUID válido
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

  const newArticle: Article = {
    id: newId,
    title: payload.title.trim(),
    subtitle: payload.subtitle?.trim() || '',
    slug,
    category: payload.category || 'EDITORIAL',
    publication_type: payload.publication_type || 'ARTIGO EDITORIAL',
    excerpt: payload.excerpt?.trim() || payload.content.slice(0, 160).trim(),
    content: payload.content,
    cover_image_url:
      payload.cover_image_url ||
      'https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=1200&auto=format&fit=crop',
    cover_caption: payload.cover_caption || '',
    is_hero_featured: true,
    hero_order: 1,
    reading_time_minutes: calculatedTime,
    author_id: validAuthorId,
    translator_id: validTranslatorId || undefined,
    tags: cleanTags,
    status: payload.status || 'published',
    published_at: now,
    created_at: now,
  };

  // 1. Tentar salvar no Supabase se configurado
  if (isSupabaseConfigured && supabase) {
    // Garante que o autor com esse UUID existe na tabela authors do Supabase
    await ensureConselhoEditorialInSupabase();

    const { error } = await supabase.from('articles').insert({
      id: newArticle.id,
      title: newArticle.title,
      subtitle: newArticle.subtitle,
      slug: newArticle.slug,
      category: newArticle.category,
      publication_type: newArticle.publication_type,
      excerpt: newArticle.excerpt,
      content: newArticle.content,
      cover_image_url: newArticle.cover_image_url,
      cover_caption: newArticle.cover_caption,
      is_hero_featured: newArticle.is_hero_featured,
      hero_order: newArticle.hero_order,
      reading_time_minutes: newArticle.reading_time_minutes,
      author_id: validAuthorId,
      translator_id: validTranslatorId,
      tags: newArticle.tags,
      status: newArticle.status,
      published_at: newArticle.published_at,
      created_at: newArticle.created_at,
    });

    if (error) {
      console.error('Erro retornado pelo Supabase na inserção:', error);
      throw new Error(`Falha no banco Supabase: ${error.message}`);
    }
  }

  // 2. Persistir no armazenamento local
  const current = ensureLocalStore();
  const updated = [newArticle, ...current.filter((a) => a.id !== newArticle.id && a.slug !== newArticle.slug)];
  saveLocalStore(updated);

  // 3. Revalidar rotas
  revalidateEditorialPaths(newArticle.slug);

  const authors = await getServerAuthors();
  return attachAuthor(newArticle, authors);
}

/**
 * Atualização de artigo existente (UPDATE).
 * Valida o UUID e sanitiza rigorosamente os campos enviados para a tabela do Supabase.
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
  const cleanTags = Array.isArray(payload.tags)
    ? Array.from(new Set(payload.tags.map((t) => t.trim().toUpperCase()).filter(Boolean)))
    : undefined;

  // 2. Sanitização estrita do payload (somente colunas válidas da tabela articles, sem objetos de join)
  const cleanPayload: Record<string, any> = {};
  if (payload.title !== undefined) cleanPayload.title = payload.title.trim();
  if (payload.subtitle !== undefined) cleanPayload.subtitle = payload.subtitle?.trim() || '';
  if (payload.slug !== undefined) cleanPayload.slug = payload.slug.trim();
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

  // 3. Atualizar no Supabase se configurado
  if (isSupabaseConfigured && supabase) {
    await ensureConselhoEditorialInSupabase();

    const { data, error } = await supabase
      .from('articles')
      .update(cleanPayload)
      .eq('id', id)
      .select('*, authors(*)')
      .maybeSingle();

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
    return normalized;
  }

  // 4. Persistir no armazenamento local se não estiver no Supabase ou Supabase offline
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

  return attachAuthor(updatedArticle, authors);
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
