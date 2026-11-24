import fs from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { ExpedienteData, DEFAULT_EXPEDIENTE } from './expedienteTypes';

export type { ExpedienteData };
export { DEFAULT_EXPEDIENTE };

const DATA_DIR = path.join(process.cwd(), 'data');
const EXPEDIENTE_FILE = path.join(DATA_DIR, 'expediente.json');

export async function getExpediente(): Promise<ExpedienteData> {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(EXPEDIENTE_FILE)) {
      fs.writeFileSync(EXPEDIENTE_FILE, JSON.stringify(DEFAULT_EXPEDIENTE, null, 2), 'utf-8');
      return DEFAULT_EXPEDIENTE;
    }
    const raw = fs.readFileSync(EXPEDIENTE_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_EXPEDIENTE, ...parsed };
  } catch (err) {
    console.error('Erro ao ler expediente:', err);
    return DEFAULT_EXPEDIENTE;
  }
}

export async function saveExpediente(payload: Partial<ExpedienteData>): Promise<ExpedienteData> {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const current = await getExpediente();
    const updated: ExpedienteData = {
      ...current,
      ...payload,
      updated_at: new Date().toISOString(),
    };
    fs.writeFileSync(EXPEDIENTE_FILE, JSON.stringify(updated, null, 2), 'utf-8');

    try {
      revalidatePath('/sobre');
      revalidatePath('/');
      revalidatePath('/admin/expediente');
    } catch {
      // Ignora quando chamado fora de contexto de requisição HTTP
    }

    return updated;
  } catch (err) {
    console.error('Erro ao salvar expediente:', err);
    throw new Error('Falha ao persistir expediente editorial.');
  }
}
