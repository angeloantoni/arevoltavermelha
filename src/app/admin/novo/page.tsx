import React from 'react';
import ArticleForm from '@/components/ArticleForm';

export const metadata = {
  title: 'Novo Artigo — Painel Editorial A Revolta Vermelha',
  description: 'Publicação de novo ensaio, tradução ou artigo de conjuntura.',
};

export default function NovoArtigoPage() {
  return <ArticleForm mode="create" />;
}
