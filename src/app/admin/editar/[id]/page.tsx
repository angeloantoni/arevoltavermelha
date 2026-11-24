import React from 'react';
import { notFound } from 'next/navigation';
import ArticleForm from '@/components/ArticleForm';
import { getArticleById } from '@/lib/serverArticles';

export const dynamic = 'force-dynamic';

interface EditarArtigoPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const metadata = {
  title: 'Editar Artigo — Painel Editorial A Revolta Vermelha',
  description: 'Edição de publicação do acervo histórico.',
};

export default async function EditarArtigoPage({ params }: EditarArtigoPageProps) {
  const { id } = await params;
  const article = await getArticleById(id);

  if (!article) {
    notFound();
  }

  return <ArticleForm initialArticle={article} mode="edit" />;
}
