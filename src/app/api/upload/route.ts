import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || '';

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '');
    const fileName = `${folder ? `${folder}/` : ''}${Date.now()}-${cleanName}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Tentar upload no Supabase Storage se configurado
    if (isSupabaseConfigured && supabase) {
      try {
        const { error: uploadError } = await supabase.storage
          .from('midia')
          .upload(fileName, buffer, {
            contentType: file.type || 'image/jpeg',
            cacheControl: '3600',
            upsert: false,
          });

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from('midia')
            .getPublicUrl(fileName);

          if (publicUrlData?.publicUrl) {
            return NextResponse.json({ url: publicUrlData.publicUrl });
          }
        } else {
          console.warn('Aviso: Supabase Storage retornou erro, salvando no disco local:', uploadError.message);
        }
      } catch (err) {
        console.warn('Falha de conexão com Supabase Storage:', err);
      }
    }

    // 2. Armazenamento local persistente em public/uploads como fallback
    const targetFolder = folder ? path.join(process.cwd(), 'public', 'uploads', folder) : path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder, { recursive: true });
    }

    const localFileName = `${Date.now()}-${cleanName}`;
    const localFilePath = path.join(targetFolder, localFileName);
    fs.writeFileSync(localFilePath, buffer);

    const publicUrl = folder
      ? `/uploads/${folder}/${localFileName}`
      : `/uploads/${localFileName}`;

    return NextResponse.json({ url: publicUrl });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao processar upload do arquivo';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
