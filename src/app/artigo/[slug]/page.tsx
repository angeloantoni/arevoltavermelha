import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ArticleReader from '@/components/ArticleReader';
import { getArticleBySlug, getAllArticles } from '@/lib/serverArticles';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return {
      title: 'Artigo Não Encontrado — A Revolta Vermelha',
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://arevoltavermelha.com.br';
  const articleUrl = `${siteUrl}/artigo/${article.slug}`;
  const description = article.subtitle || article.excerpt;

  return {
    title: `${article.title} — A Revolta Vermelha`,
    description: description,
    openGraph: {
      title: article.title,
      description: description,
      url: articleUrl,
      siteName: 'A Revolta Vermelha — Revista Política',
      locale: 'pt_BR',
      type: 'article',
      publishedTime: article.published_at,
      authors: [article.author?.name || 'A Revolta Vermelha'],
      images: [
        {
          url: article.cover_image_url,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: description,
      images: [article.cover_image_url],
      site: '@arevoltavermelha',
      creator: '@arevoltavermelha',
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const allArticles = await getAllArticles();
  const related = allArticles.filter(
    (a) => a.category === article.category && a.id !== article.id
  );

  return <ArticleReader article={article} relatedArticles={related} />;
}
