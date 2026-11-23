import React from 'react';
import { getAuthorBySlug, AUTHORS } from '@/lib/data';
import AuthorDetailClient from './AuthorDetailClient';

interface AuthorPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return AUTHORS.map((author) => ({
    slug: author.slug,
  }));
}

export default async function AuthorDetailPage({ params }: AuthorPageProps) {
  const { slug } = await params;
  const author = getAuthorBySlug(slug);

  return <AuthorDetailClient initialAuthor={author} slug={slug} />;
}
