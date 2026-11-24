import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ArticleForm from '@/components/ArticleForm';
import { getArticleById } from '@/lib/serverArticles';
import { isValidUuid } from '@/lib/uuid';
import { AlertCircle, ArrowLeft } from 'lucide-react';

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

  if (!isValidUuid(id)) {
    return (
      <div className="w-full bg-rev-white min-h-[60vh] flex flex-col items-center justify-center font-mono py-20 px-4 text-center">
        <div className="max-w-md border-2 border-rev-red bg-red-50 p-6 shadow-[4px_4px_0px_#111111]">
          <div className="flex items-center justify-center gap-2 text-rev-red font-bold text-sm uppercase mb-3">
            <AlertCircle className="w-5 h-5 text-rev-red" />
            <span>IDENTIFICADOR NÃO LOCALIZADO</span>
          </div>
          <p className="text-xs text-neutral-800 leading-relaxed mb-6">
            Este item é um exemplo local e não existe no banco de dados. Apenas publicações registradas no Supabase podem ser editadas.
          </p>
          <Link
            href="/admin"
            className="btn-brutalist !bg-rev-black !text-white hover:!bg-rev-red inline-flex items-center gap-2 !text-xs !py-2 !px-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>RETORNAR À GESTÃO DO ACERVO</span>
          </Link>
        </div>
      </div>
    );
  }

  const article = await getArticleById(id);

  if (!article) {
    notFound();
  }

  return <ArticleForm initialArticle={article} mode="edit" />;
}
