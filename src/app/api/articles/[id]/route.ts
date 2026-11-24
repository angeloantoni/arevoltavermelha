import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getArticleById, updateArticle, deleteArticle } from '@/lib/serverArticles';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  _request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;
    const article = await getArticleById(id);

    if (!article) {
      return NextResponse.json({ error: 'Artigo não encontrado.' }, { status: 404 });
    }

    return NextResponse.json(article);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao obter artigo';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = await updateArticle(id, body);
    return NextResponse.json(updated);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao atualizar artigo';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;
    await deleteArticle(id);
    return NextResponse.json({ success: true, message: 'Artigo excluído com sucesso.' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao excluir artigo';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
