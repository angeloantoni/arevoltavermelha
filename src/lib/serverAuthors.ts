import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { revalidatePath } from 'next/cache';
import { Author } from './types';
import { supabase, isSupabaseConfigured } from './supabase';
import { CONSELHO_EDITORIAL_UUID, isValidUuid } from './uuid';

const DATA_DIR = path.join(process.cwd(), 'data');
const AUTHORS_FILE = path.join(DATA_DIR, 'authors.json');

export const DEFAULT_AUTHORS_WITH_UUIDS: Author[] = [
  {
    id: CONSELHO_EDITORIAL_UUID,
    name: 'Conselho Editorial',
    slug: 'conselho-editorial',
    role: 'Direção Política e Editorial',
    bio: 'Órgão colegiado de direção política, teórica e editorial da revista A Revolta Vermelha.',
    avatar_url: '/logo.webp',
    articles_count: 5,
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    name: 'Dinarco Reis',
    slug: 'dinarco-reis',
    role: 'Memorialista e Militante Histórico',
    bio: 'Militar comunista, participante do movimento de 1935 no Nordeste e figura central na resistência antifascista brasileira.',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop',
    articles_count: 3,
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    name: 'Alexandra Kollontai',
    slug: 'alexandra-kollontai',
    role: 'Teórica & Articulista Convidada',
    bio: 'Revolucionária russa, precursora da teoria sobre a moral proletária, família trabalhadora e emancipação integral das mulheres no socialismo.',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop',
    articles_count: 2,
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    name: 'Vladimir I. Lenin',
    slug: 'vladimir-lenin',
    role: 'Teórico Marxista Clássico',
    bio: 'Formulador das teses sobre o imperialismo, a natureza de classe do Estado burguês e a organização do partido revolucionário de vanguarda.',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop',
    articles_count: 4,
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    name: 'Praxedes da Silva',
    slug: 'praxedes-da-silva',
    role: 'Pesquisador da Questão Agrária Potiguar',
    bio: 'Pesquisador potiguar dedicado aos conflitos de terra, impactos do agronegócio e energia eólica no Rio Grande do Norte.',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=600&auto=format&fit=crop',
    articles_count: 2,
  },
  {
    id: '00000000-0000-0000-0000-000000000006',
    name: 'Dra. Helena Marcondes',
    slug: 'helena-marcondes',
    role: 'Historiadora & Membro do Conselho',
    bio: 'Doutora em História Social pela UFRN e pesquisadora do movimento operário e dos levantes populares no Nordeste do Brasil.',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
    articles_count: 4,
  },
  {
    id: '00000000-0000-0000-0000-000000000007',
    name: 'Lucas Ferreira',
    slug: 'lucas-ferreira',
    role: 'Tradutor e Articulista Sindical',
    bio: 'Sociólogo do trabalho e tradutor de documentos históricos das lutas anticoloniais e operárias.',
    avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=600&auto=format&fit=crop',
    articles_count: 3,
  },
];

function ensureLocalAuthorsStore(): Author[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(AUTHORS_FILE)) {
      fs.writeFileSync(AUTHORS_FILE, JSON.stringify(DEFAULT_AUTHORS_WITH_UUIDS, null, 2), 'utf-8');
      return DEFAULT_AUTHORS_WITH_UUIDS;
    }
    const raw = fs.readFileSync(AUTHORS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Migra IDs que não sejam UUIDs para UUIDs válidos
      let modified = false;
      const validAuthors = parsed.map((a: Author, idx: number) => {
        if (!isValidUuid(a.id)) {
          modified = true;
          return {
            ...a,
            id: a.slug === 'conselho-editorial'
              ? CONSELHO_EDITORIAL_UUID
              : `00000000-0000-0000-0000-${String(idx + 1).padStart(12, '0')}`,
          };
        }
        return a;
      });
      if (modified) {
        fs.writeFileSync(AUTHORS_FILE, JSON.stringify(validAuthors, null, 2), 'utf-8');
      }
      return validAuthors;
    }
    fs.writeFileSync(AUTHORS_FILE, JSON.stringify(DEFAULT_AUTHORS_WITH_UUIDS, null, 2), 'utf-8');
    return DEFAULT_AUTHORS_WITH_UUIDS;
  } catch (err) {
    console.error('Erro no armazenamento local de autores:', err);
    return DEFAULT_AUTHORS_WITH_UUIDS;
  }
}

function saveLocalAuthors(authors: Author[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(AUTHORS_FILE, JSON.stringify(authors, null, 2), 'utf-8');
  } catch (err) {
    console.error('Erro ao salvar autores locais:', err);
  }
}

/**
 * Garante que o Conselho Editorial existe no Supabase como registro padrão.
 */
export async function ensureConselhoEditorialInSupabase(): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;

  try {
    const { error } = await supabase.from('authors').upsert(
      {
        id: CONSELHO_EDITORIAL_UUID,
        name: 'Conselho Editorial',
        slug: 'conselho-editorial',
        role: 'Direção Política e Editorial',
        bio: 'Órgão de direção política e teórica da revista A Revolta Vermelha.',
        avatar_url: '/logo.webp',
      },
      { onConflict: 'id' }
    );
    if (error) {
      console.warn('Aviso: Não foi possível realizar upsert do Conselho Editorial no Supabase:', error.message);
    }
  } catch (err) {
    console.warn('Erro ao verificar Conselho Editorial no Supabase:', err);
  }
}

function safeRevalidateAuthors(): void {
  try {
    revalidatePath('/admin/autores');
    revalidatePath('/autores');
  } catch {
    // Ignora quando chamado fora de contexto de requisição HTTP
  }
}


/**
 * Obtém todos os autores da tabela authors do Supabase com fallback seguro.
 */
export async function getAllAuthors(): Promise<Author[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      await ensureConselhoEditorialInSupabase();

      const { data, error } = await supabase
        .from('authors')
        .select('*')
        .order('name', { ascending: true });

      if (!error && data && data.length > 0) {
        return data as Author[];
      }
      if (error) {
        console.warn('Supabase erro ao carregar autores:', error.message);
      }
    } catch (err) {
      console.warn('Falha de conexão ao carregar autores do Supabase:', err);
    }
  }

  return ensureLocalAuthorsStore();
}

/**
 * Obtém um autor pelo slug diretamente do Supabase ou do armazenamento local.
 */
export async function getAuthorBySlug(slug: string): Promise<Author | undefined> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('authors')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (!error && data) {
        return data as Author;
      }
    } catch (err) {
      console.warn('Erro ao buscar autor por slug no Supabase:', err);
    }
  }

  const authors = ensureLocalAuthorsStore();
  return authors.find((a) => a.slug === slug);
}

/**
 * Obtém um autor por ID UUID.
 */
export async function getAuthorById(id: string): Promise<Author | undefined> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('authors')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (!error && data) {
        return data as Author;
      }
    } catch (err) {
      console.warn('Erro ao buscar autor por ID no Supabase:', err);
    }
  }

  const authors = ensureLocalAuthorsStore();
  return authors.find((a) => a.id === id);
}

/**
 * Criação de autor no banco com ID UUID gerado pelo PostgreSQL ou crypto.randomUUID().
 */
export async function createAuthor(payload: {
  name: string;
  role: string;
  bio?: string;
  avatar_url?: string;
  slug?: string;
}): Promise<Author> {
  const name = payload.name.trim();
  const slug =
    payload.slug?.trim() ||
    name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');

  const role = payload.role.trim();
  const bio = payload.bio?.trim() || '';
  const avatar_url = payload.avatar_url?.trim() || '/logo.webp';

  if (isSupabaseConfigured && supabase) {
    // Insere sem ID para o PostgreSQL gerar gen_random_uuid() nativamente
    const { data, error } = await supabase
      .from('authors')
      .insert({
        name,
        slug,
        role,
        bio,
        avatar_url,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao cadastrar autor no Supabase: ${error.message}`);
    }

    if (data) {
      const created = data as Author;
      // Salva cópia local
      const current = ensureLocalAuthorsStore();
      saveLocalAuthors([...current.filter((a) => a.id !== created.id), created]);
      safeRevalidateAuthors();
      return created;
    }
  }

  // Persistência local com UUID gerado
  const localId = crypto.randomUUID();
  const newAuthor: Author = {
    id: localId,
    name,
    slug,
    role,
    bio,
    avatar_url,
    articles_count: 0,
  };

  const current = ensureLocalAuthorsStore();
  const updated = [...current, newAuthor];
  saveLocalAuthors(updated);

  safeRevalidateAuthors();

  return newAuthor;
}

/**
 * Atualização de autor existente.
 */
export async function updateAuthor(
  id: string,
  payload: Partial<Author>
): Promise<Author> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('authors')
      .update({
        name: payload.name,
        slug: payload.slug,
        role: payload.role,
        bio: payload.bio,
        avatar_url: payload.avatar_url,
      })
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao atualizar autor no Supabase: ${error.message}`);
    }
  }

  const current = ensureLocalAuthorsStore();
  const idx = current.findIndex((a) => a.id === id);
  if (idx >= 0) {
    current[idx] = { ...current[idx], ...payload };
    saveLocalAuthors(current);
  }

  safeRevalidateAuthors();

  return current[idx] || (payload as Author);
}

/**
 * Exclusão de autor por UUID.
 */
export async function deleteAuthor(id: string): Promise<boolean> {
  if (id === CONSELHO_EDITORIAL_UUID) {
    throw new Error('O Conselho Editorial é o registro institucional permanente e não pode ser excluído.');
  }

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('authors').delete().eq('id', id);
    if (error) {
      throw new Error(`Erro ao excluir autor no Supabase: ${error.message}`);
    }
  }

  const current = ensureLocalAuthorsStore();
  const filtered = current.filter((a) => a.id !== id);
  saveLocalAuthors(filtered);

  safeRevalidateAuthors();

  return true;
}
