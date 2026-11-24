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
 * Garante a existência do arquivo local de persistência inicializado com os dados do acervo.
 * Também normaliza IDs legados para UUIDs válidos.
 */
function ensureLocalStore(): Article[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(ARTICLES_FILE)) {
      const seeded = INITIAL_ARTICLES.map((art, idx) => ({
        ...art,
        id: `00000000-0000-0000-0001-${String(idx + 1).padStart(12, '0')}`,
        author_id: CONSELHO_EDITORIAL_UUID,
      }));
      fs.writeFileSync(ARTICLES_FILE, JSON.stringify(seeded, null, 2), 'utf-8');
      return seeded;
    }

    const raw = fs.readFileSync(ARTICLES_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      let modified = false;
      const validArticles = parsed.map((art: Article, idx: number) => {
        let changed = false;
        let id = art.id;
        let author_id = art.author_id;

        if (!isValidUuid(id)) {
          id = `00000000-0000-0000-0001-${String(idx + 1).padStart(12, '0')}`;
          changed = true;
        }

        if (!isValidUuid(author_id)) {
          author_id = CONSELHO_EDITORIAL_UUID;
          changed = true;
        }

        if (changed) modified = true;
        return { ...art, id, author_id };
      });

      if (modified) {
        fs.writeFileSync(ARTICLES_FILE, JSON.stringify(validArticles, null, 2), 'utf-8');
      }
      return validArticles;
    }

    return INITIAL_ARTICLES;
  } catch (err) {
    console.error('Erro ao acessar armazenamento local de artigos:', err);
    return INITIAL_ARTICLES;
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
 */
export async function getAllArticles(): Promise<Article[]> {
  const authors = await getServerAuthors();

  // 1. Tentar consulta ao Supabase se configurado
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return (data as Article[]).map((art) => attachAuthor(art, authors));
      }
      if (error) {
        console.warn('Aviso: Supabase retornou erro na listagem de artigos, utilizando armazenamento local:', error.message);
      }
    } catch (err) {
      console.warn('Falha de conexão com o Supabase ao listar artigos:', err);
    }
  }

  // 2. Consulta ao armazenamento local persistente (data/articles.json)
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
  const all = await getAllArticles();
  return all.find((a) => a.slug === slug);
}

/**
 * Obtém um artigo pelo ID único.
 */
export async function getArticleById(id: string): Promise<Article | undefined> {
  const all = await getAllArticles();
  return all.find((a) => a.id === id);
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
 */
export async function updateArticle(
  id: string,
  payload: Partial<Article>
): Promise<Article> {
  const current = ensureLocalStore();
  const existingIndex = current.findIndex((a) => a.id === id);

  if (existingIndex < 0) {
    throw new Error(`Artigo com ID "${id}" não foi encontrado para atualização.`);
  }

  const existing = current[existingIndex];
  const newContent = payload.content !== undefined ? payload.content : existing.content;
  const { minutes: calculatedTime } = calculateReadingTime(newContent);

  const validAuthorId = payload.author_id
    ? ensureValidUuid(payload.author_id, existing.author_id || CONSELHO_EDITORIAL_UUID)
    : existing.author_id;

  const validTranslatorId =
    payload.translator_id !== undefined
      ? payload.translator_id && isValidUuid(payload.translator_id)
        ? payload.translator_id
        : null
      : existing.translator_id || null;

  const updatedArticle: Article = {
    ...existing,
    ...payload,
    id: existing.id,
    author_id: validAuthorId,
    translator_id: validTranslatorId || undefined,
    reading_time_minutes: calculatedTime,
    created_at: existing.created_at,
    published_at: payload.published_at || existing.published_at,
  };

  // 1. Tentar atualizar no Supabase se configurado
  if (isSupabaseConfigured && supabase) {
    await ensureConselhoEditorialInSupabase();

    const { error } = await supabase
      .from('articles')
      .update({
        title: updatedArticle.title,
        subtitle: updatedArticle.subtitle,
        slug: updatedArticle.slug,
        category: updatedArticle.category,
        publication_type: updatedArticle.publication_type,
        excerpt: updatedArticle.excerpt,
        content: updatedArticle.content,
        cover_image_url: updatedArticle.cover_image_url,
        cover_caption: updatedArticle.cover_caption,
        reading_time_minutes: updatedArticle.reading_time_minutes,
        author_id: validAuthorId,
        translator_id: validTranslatorId,
        status: updatedArticle.status,
      })
      .eq('id', id);

    if (error) {
      console.error('Erro retornado pelo Supabase na atualização:', error);
      throw new Error(`Falha no banco Supabase: ${error.message}`);
    }
  }

  // 2. Persistir no armazenamento local
  current[existingIndex] = updatedArticle;
  saveLocalStore(current);

  // 3. Revalidar rotas
  revalidateEditorialPaths(updatedArticle.slug);

  const authors = await getServerAuthors();
  return attachAuthor(updatedArticle, authors);
}

/**
 * Exclusão definitiva de artigo (DELETE).
 */
export async function deleteArticle(id: string): Promise<boolean> {
  const current = ensureLocalStore();
  const existing = current.find((a) => a.id === id);

  if (!existing) {
    throw new Error(`Artigo com ID "${id}" não encontrado.`);
  }

  // 1. Tentar excluir no Supabase se configurado
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('articles').delete().eq('id', id);
    if (error) {
      console.error('Erro retornado pelo Supabase na exclusão:', error);
      throw new Error(`Falha no banco Supabase: ${error.message}`);
    }
  }

  // 2. Remover do armazenamento local
  const filtered = current.filter((a) => a.id !== id);
  saveLocalStore(filtered);

  // 3. Revalidar rotas
  revalidateEditorialPaths(existing.slug);

  return true;
}
