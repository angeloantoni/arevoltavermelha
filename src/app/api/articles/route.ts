import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAllArticles, createArticle, updateArticle, getArticleById } from '@/lib/serverArticles';
import { isValidUuid } from '@/lib/uuid';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const articles = await getAllArticles();
    return NextResponse.json(articles);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao listar artigos';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. Se possuir id UUID de artigo existente, executa estritamente UPDATE
    if (body.id && isValidUuid(body.id)) {
      const existing = await getArticleById(body.id);
      if (existing) {
        const updated = await updateArticle(body.id, body);
        return NextResponse.json(updated, { status: 200 });
      }
    }

    // 2. Se NÃO possuir id (novo artigo), executa criação segura
    const created = await createArticle(body);
    return NextResponse.json(created, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao cadastrar artigo no acervo';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
