import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabase as defaultSupabase, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * Obtém o cliente Supabase para uploads no servidor.
 * Se houver SUPABASE_SERVICE_ROLE_KEY configurada (ex: na Vercel),
 * utiliza para contornar políticas restritivas de RLS no bucket público 'Midia'.
 */
function getStorageClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (url && serviceKey) {
    return createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  if (defaultSupabase && isSupabaseConfigured) {
    return defaultSupabase;
  }

  if (url && anonKey) {
    return createClient(url, anonKey);
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || '';
    const customFilePath = (formData.get('filePath') as string) || '';
    const slug = (formData.get('slug') as string) || '';

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    const storageClient = getStorageClient();

    if (!storageClient) {
      return NextResponse.json(
        {
          error:
            'Supabase Storage não está configurado. Verifique as variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no painel da Vercel.',
        },
        { status: 500 }
      );
    }

    // 1. O bucket é sempre 'Midia', categorizado pelas subpastas 'imagens_artigos/' e 'imagens_autores/'
    const isAuthor =
      folder === 'autores' ||
      folder === 'imagens_autores' ||
      Boolean(slug && folder !== 'artigos' && folder !== 'imagens_artigos');

    // 2. Determina o caminho com a subpasta exata dentro do bucket 'Midia'
    let filePath: string;
    let contentType = file.type || 'image/jpeg';

    if (customFilePath && customFilePath.trim()) {
      filePath = customFilePath.trim();
    } else if (isAuthor) {
      // Para fotos de autores & tradutores: imagens_autores/${Date.now()}-${slug}.jpg
      const cleanSlug = (slug || file.name)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') || 'autor';
      filePath = `imagens_autores/${Date.now()}-${cleanSlug}.jpg`;
      contentType = 'image/jpeg';
    } else {
      // Para capas de artigos: imagens_artigos/${Date.now()}-${cleanName}
      const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '-') || 'capa.jpg';
      filePath = `imagens_artigos/${Date.now()}-${cleanName}`;
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3. Envia diretamente para o bucket 'Midia' com upsert: true
    const { data: uploadData, error: uploadError } = await storageClient.storage
      .from('Midia')
      .upload(filePath, buffer, {
        contentType,
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.error("Erro ao enviar imagem para o bucket 'Midia':", uploadError);
      return NextResponse.json(
        { error: `Erro no Supabase Storage (Midia): ${uploadError.message}` },
        { status: 500 }
      );
    }

    // 4. Obtém a URL pública do bucket 'Midia'
    const { data: publicUrlData } = storageClient.storage
      .from('Midia')
      .getPublicUrl(filePath);

    if (!publicUrlData?.publicUrl) {
      return NextResponse.json(
        { error: "Não foi possível gerar a URL pública no bucket 'Midia'." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url: publicUrlData.publicUrl,
      path: filePath,
      bucket: 'Midia',
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao processar upload do arquivo';
    console.error('Exceção capturada na rota /api/upload:', err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
