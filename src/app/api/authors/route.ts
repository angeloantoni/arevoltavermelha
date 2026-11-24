import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAllAuthors, createAuthor } from '@/lib/serverAuthors';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const authors = await getAllAuthors();
    return NextResponse.json(authors);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao listar autores';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const created = await createAuthor(body);
    return NextResponse.json(created, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao cadastrar autor';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
