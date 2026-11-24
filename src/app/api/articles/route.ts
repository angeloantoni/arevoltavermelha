import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAllArticles, createArticle } from '@/lib/serverArticles';

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
    const created = await createArticle(body);
    return NextResponse.json(created, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao cadastrar artigo no acervo';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
