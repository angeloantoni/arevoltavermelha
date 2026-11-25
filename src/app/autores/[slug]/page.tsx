import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import AuthorDetailClient from './AuthorDetailClient';
import { Author, Article } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface AuthorPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: AuthorPageProps): Promise<Metadata> {
  const { slug } = await params;
  let author: Author | null = null;

  try {
    if (supabase) {
      const { data } = await supabase
        .from('authors')
        .select('*')
        .or(`slug.eq.${slug},id.eq.${slug}`)
        .maybeSingle();

      if (data) {
        author = data as Author;
      }
    }
  } catch (err) {
    console.warn('Aviso: Falha ao gerar metadados do autor:', err);
  }

  if (!author && (slug === 'conselho-editorial' || slug === '00000000-0000-0000-0000-000000000001')) {
    author = {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Conselho Editorial',
      slug: 'conselho-editorial',
      role: 'Direção Política e Editorial',
      bio: 'Órgão de direção política e teórica da revista A Revolta Vermelha.',
      avatar_url: '/logo.webp',
    };
  }

  if (!author) {
    return {
      title: 'Autor Não Encontrado — A Revolta Vermelha',
    };
  }

  return {
    title: `${author.name || 'Autor'} — A Revolta Vermelha`,
    description: author.bio || 'Quadro editorial e articulistas da revista A Revolta Vermelha.',
  };
}

export default async function AuthorDetailPage({ params }: AuthorPageProps) {
  const { slug } = await params;
  let author: Author | null = null;
  let articles: Article[] = [];

  // Consulta protegida com try/catch e cliente público anônimo (apenas SELECT)
  try {
    if (supabase) {
      // 1. Busca autor por slug ou por ID UUID
      const { data: authorData, error: authorError } = await supabase
        .from('authors')
        .select('*')
        .or(`slug.eq.${slug},id.eq.${slug}`)
        .maybeSingle();

      if (!authorError && authorData) {
        author = authorData as Author;
      }

      // 2. Consulta simples em articles sem joins ambíguos
      const { data: articlesData, error: articlesError } = await supabase
        .from('articles')
        .select('id, title, subtitle, excerpt, slug, cover_image_url, category, published_at, reading_time_minutes, author_id, translator_id, published')
        .order('published_at', { ascending: false });

      if (!articlesError && Array.isArray(articlesData)) {
        articles = articlesData as unknown as Article[];
      }
    }
  } catch (err) {
    console.error('Falha protegida ao carregar autor por slug:', err);
  }

  // Fallback seguro caso seja o Conselho Editorial institucional
  if (!author && (slug === 'conselho-editorial' || slug === '00000000-0000-0000-0000-000000000001')) {
    author = {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Conselho Editorial',
      slug: 'conselho-editorial',
      role: 'Direção Política e Editorial',
      bio: 'Órgão de direção política e teórica da revista A Revolta Vermelha.',
      avatar_url: '/logo.webp',
    };
  }

  if (!author) {
    notFound();
  }

  // Relacionamento em memória por author_id ou translator_id
  const authorId = author.id;
  const authorSlug = author.slug;
  const authorArticles = articles.filter(
    (a) =>
      a &&
      ((authorId && (a.author_id === authorId || a.translator_id === authorId)) ||
        (authorSlug && (a.author?.slug === authorSlug || a.translator?.slug === authorSlug)))
  );

  return (
    <AuthorDetailClient
      initialAuthor={author}
      slug={slug}
      initialArticles={authorArticles}
    />
  );
}
