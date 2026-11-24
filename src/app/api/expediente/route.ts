import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getExpediente, saveExpediente } from '@/lib/serverExpediente';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getExpediente();
    return NextResponse.json(data);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao obter expediente';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const updated = await saveExpediente(body);
    return NextResponse.json(updated);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao salvar expediente';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
