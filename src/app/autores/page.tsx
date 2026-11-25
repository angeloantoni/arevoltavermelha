import React from 'react';
import Link from 'next/link';
import { Users, BookOpen, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Autores & Tradutores — A Revolta Vermelha',
  description: 'Quadro de articulistas, pesquisadores históricos, tradutores e militantes da revista A Revolta Vermelha.',
};

/**
 * Fallback seguro para Conselho Editorial caso a conexão com o banco
 * falhe ou o banco esteja temporariamente inacessível.
 */
const DEFAULT_FALLBACK_AUTHORS = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Conselho Editorial',
    slug: 'conselho-editorial',
    role: 'Direção Política e Editorial',
    bio: 'Órgão de direção política e teórica da revista A Revolta Vermelha.',
    avatar_url: '/logo.webp',
  },
];

/**
 * Extrai as iniciais do autor de forma 100% blindada contra campos nulos ou indefinidos.
 */
function getSafeInitials(name?: string | null): string {
  if (!name || typeof name !== 'string') return 'RV';
  const clean = name.trim().replace(/^Dra?\.\s+/i, '');
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'RV';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface AuthorRecord {
  id?: string | null;
  name?: string | null;
  slug?: string | null;
  role?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
}

interface ArticleRecord {
  id?: string | null;
  title?: string | null;
  slug?: string | null;
  author_id?: string | null;
  translator_id?: string | null;
  published?: boolean | null;
}

export default async function AutoresPage() {
  let authors: AuthorRecord[] = [];
  let articles: ArticleRecord[] = [];

  // 1. Consulta resiliente ao Supabase com try/catch e cliente público anônimo
  try {
    if (supabase) {
      const [authorsResult, articlesResult] = await Promise.all([
        supabase
          .from('authors')
          .select('*')
          .order('name', { ascending: true }),
        supabase
          .from('articles')
          .select('id, title, slug, author_id, translator_id, published'),
      ]);

      if (!authorsResult.error && Array.isArray(authorsResult.data)) {
        authors = authorsResult.data;
      } else if (authorsResult.error) {
        console.warn('Aviso: Erro ao listar autores do Supabase:', authorsResult.error.message);
      }

      if (!articlesResult.error && Array.isArray(articlesResult.data)) {
        articles = articlesResult.data;
      } else if (articlesResult.error) {
        console.warn('Aviso: Erro ao listar artigos do Supabase:', articlesResult.error.message);
      }
    }
  } catch (error) {
    console.error('Falha de rede ou consulta ao carregar dados em /autores:', error);
  }

  // Fallback seguro caso a lista venha vazia do banco
  if (!authors || authors.length === 0) {
    authors = DEFAULT_FALLBACK_AUTHORS;
  }

  return (
    <div className="w-full bg-rev-white min-h-screen py-12">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        {/* Cabeçalho */}
        <div className="border-b-2 border-rev-black pb-6 mb-10">
          <div className="flex items-center gap-2 text-xs font-mono text-rev-red font-bold uppercase tracking-wider mb-2">
            <Users className="w-4 h-4 text-rev-red" />
            <span>CORPO EDITORIAL & PESQUISADORES</span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-rev-black">
            AUTORES & TRADUTORES
          </h1>
          <p className="mt-3 text-sm font-mono text-neutral-600 max-w-2xl leading-relaxed">
            Pesquisadores, estudantes, militantes marxistas, tradutores de fontes primárias, ensaístas e analistas da conjuntura local, nacional e internacional.
          </p>
        </div>

        {/* Grid Modular dos Autores Dinâmico */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {authors.map((author, index) => {
            const authorId = author?.id || `auth-${index}`;
            const name = author?.name || 'Autor';
            const role = author?.role || 'Colaborador';
            const bio = author?.bio || '';
            const slug = author?.slug || author?.id || `autor-${index}`;
            const avatarUrl = typeof author?.avatar_url === 'string' ? author.avatar_url.trim() : '';
            const isLogo = Boolean(avatarUrl && (avatarUrl.includes('logo') || avatarUrl === '/logo.webp'));

            // Relacionamento em memória por author_id ou translator_id
            const authorArticles = articles.filter(
              (art) =>
                art &&
                author?.id &&
                (art.author_id === author.id || art.translator_id === author.id)
            );
            const articlesCount = authorArticles.length;

            return (
              <div
                key={authorId}
                className="border border-rev-black bg-white flex flex-col justify-between group hover:border-rev-red transition-all shadow-[4px_4px_0px_#111111]"
              >
                <div>
                  {/* Foto do Autor em P&B com Fallback Visual Construtivista */}
                  <div
                    className={`relative aspect-[4/3] w-full overflow-hidden border-b border-rev-black ${
                      isLogo ? 'bg-white p-4' : 'bg-neutral-900'
                    }`}
                  >
                    {/* Fallback de iniciais estrutural (visível caso não haja foto ou em falha de carregamento) */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900 text-white font-mono select-none p-4 text-center z-0">
                      <span className="font-display font-black text-4xl sm:text-5xl text-neutral-100 tracking-wider">
                        {getSafeInitials(name)}
                      </span>
                      <span className="text-[10px] text-rev-red uppercase font-bold tracking-widest mt-2 border-t border-neutral-800 pt-1">
                        QUADRO EDITORIAL
                      </span>
                    </div>

                    {/* Imagem nativa <img> para evitar erros de domínio externo do next/image */}
                    {avatarUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={avatarUrl}
                        alt={name}
                        loading="lazy"
                        className={`relative z-1 w-full h-full ${
                          isLogo ? 'object-contain p-2' : 'object-cover'
                        } filter grayscale contrast-125 group-hover:scale-105 transition-transform duration-300`}
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : null}

                    <div className="absolute top-3 left-3 z-10">
                      <span className="bg-rev-black text-white text-[10px] font-mono font-bold uppercase px-2.5 py-1 border border-rev-black shadow-sm">
                        {role}
                      </span>
                    </div>
                  </div>

                  {/* Informações */}
                  <div className="p-6">
                    <h2 className="font-display font-black text-xl uppercase tracking-tight text-rev-black group-hover:text-rev-red transition-colors">
                      {name}
                    </h2>
                    <p className="mt-3 text-xs font-mono text-neutral-600 leading-relaxed line-clamp-3">
                      {bio}
                    </p>
                  </div>
                </div>

                {/* Rodapé do Card */}
                <div className="p-6 pt-0 border-t border-neutral-100 flex items-center justify-between mt-4">
                  <span className="text-[11px] font-mono text-rev-muted flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-rev-red" />
                    <span>
                      {articlesCount} {articlesCount === 1 ? 'TEXTO PUBLICADO' : 'TEXTOS PUBLICADOS'}
                    </span>
                  </span>

                  <Link
                    href={`/autores/${encodeURIComponent(slug)}`}
                    className="inline-flex items-center gap-1 text-xs font-mono font-bold uppercase text-rev-black group-hover:text-rev-red transition-colors"
                  >
                    <span>PERFIL</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
