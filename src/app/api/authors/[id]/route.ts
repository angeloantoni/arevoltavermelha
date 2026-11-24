import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateAuthor, deleteAuthor } from '@/lib/serverAuthors';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = await updateAuthor(id, body);
    return NextResponse.json(updated);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao atualizar autor';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;
    await deleteAuthor(id);
    return NextResponse.json({ success: true, message: 'Autor excluído com sucesso.' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao excluir autor';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
