import React from 'react';
import { notFound } from 'next/navigation';
import { getAuthorBySlug } from '@/lib/serverAuthors';
import { getAllArticles } from '@/lib/serverArticles';
import AuthorDetailClient from './AuthorDetailClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface AuthorPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function AuthorDetailPage({ params }: AuthorPageProps) {
  const { slug } = await params;
  const author = await getAuthorBySlug(slug);

  if (!author) {
    notFound();
  }

  const allArticles = await getAllArticles();
  const authorArticles = allArticles.filter(
    (a) => a.author_id === author.id || a.author?.slug === author.slug
  );

  return (
    <AuthorDetailClient
      initialAuthor={author}
      slug={slug}
      initialArticles={authorArticles}
    />
  );
}
