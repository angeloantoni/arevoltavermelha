-- ============================================================
-- A REVOLTA VERMELHA — ESQUEMA DO BANCO DE DADOS (SUPABASE/POSTGRESQL)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabela de Autores e Colunistas
CREATE TABLE IF NOT EXISTS authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Artigos, Ensaios e Traduções
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('EDITORIAL', 'OPINIÃO', 'NACIONAL & INTERNACIONAL', 'RIO GRANDE DO NORTE (RN)', 'TRADUÇÕES')),
  publication_type TEXT NOT NULL DEFAULT 'ARTIGO EDITORIAL' CHECK (publication_type IN ('ARTIGO EDITORIAL', 'ARTIGO DE OPINIÃO')),
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  cover_image_url TEXT NOT NULL,
  cover_caption TEXT,
  is_hero_featured BOOLEAN DEFAULT FALSE,
  hero_order INT DEFAULT 0,
  reading_time_minutes INT NOT NULL DEFAULT 10,
  author_id UUID REFERENCES authors(id) ON DELETE SET NULL,
  translator_id UUID REFERENCES authors(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}'::TEXT[],
  original_title TEXT,
  original_year INT,
  original_source TEXT,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'review', 'published')),
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Garantir coluna tags em bancos já existentes
ALTER TABLE articles ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}'::TEXT[];

-- Índices de consulta rápida
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_pub_type ON articles(publication_type);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_hero ON articles(is_hero_featured, hero_order);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_tags ON articles USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_authors_slug ON authors(slug);

-- ============================================================
-- POLÍTICAS DE ROW LEVEL SECURITY (RLS)
-- Bloqueio estrito de escrita (INSERT, UPDATE, DELETE) para usuários não autenticados
-- ============================================================

ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- 1. LEITURA PÚBLICA (SELECT)
CREATE POLICY "Leitura pública de autores" 
  ON authors FOR SELECT 
  USING (true);

CREATE POLICY "Leitura pública de artigos publicados" 
  ON articles FOR SELECT 
  USING (status = 'published');

CREATE POLICY "Leitura irrestrita de artigos para editores autenticados" 
  ON articles FOR SELECT 
  TO authenticated 
  USING (true);

-- 2. BLOQUEIO DE ESCRITA PARA NÃO-AUTENTICADOS & PERMISSÃO RESTRITA A AUTENTICADOS

-- AUTORES: INSERT, UPDATE, DELETE apenas para autenticados
CREATE POLICY "Inserção de autores restrita a autenticados" 
  ON authors FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Atualização de autores restrita a autenticados" 
  ON authors FOR UPDATE 
  TO authenticated 
  USING (auth.role() = 'authenticated') 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Exclusão de autores restrita a autenticados" 
  ON authors FOR DELETE 
  TO authenticated 
  USING (auth.role() = 'authenticated');

-- ARTIGOS: INSERT, UPDATE, DELETE apenas para autenticados
CREATE POLICY "Inserção de artigos restrita a autenticados" 
  ON articles FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Atualização de artigos restrita a autenticados" 
  ON articles FOR UPDATE 
  TO authenticated 
  USING (auth.role() = 'authenticated') 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Exclusão de artigos restrita a autenticados" 
  ON articles FOR DELETE 
  TO authenticated 
  USING (auth.role() = 'authenticated');

-- 3. PERMISSÕES EXPLÍCITAS NOS PAPÉIS (PRIVILÉGIOS POSTGRES)
REVOKE INSERT, UPDATE, DELETE ON TABLE authors, articles FROM anon, public;
GRANT SELECT ON TABLE authors, articles TO anon, authenticated;
GRANT ALL ON TABLE authors, articles TO authenticated;
GRANT ALL ON TABLE authors, articles TO service_role;
GRANT ALL ON TABLE authors, articles TO postgres;

-- 4. REGISTRO INSTITUCIONAL PADRÃO (CONSELHO EDITORIAL)
INSERT INTO authors (id, name, slug, role, bio, avatar_url)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Conselho Editorial',
  'conselho-editorial',
  'Direção Política e Editorial',
  'Órgão de direção política e teórica da revista A Revolta Vermelha, responsável pelas posições editoriais e manifestos.',
  '/logo.webp'
)
ON CONFLICT (id) DO NOTHING;

-- 5. BUCKETS DE ARMAZENAMENTO PÚBLICO (IMAGENS_ARTIGOS E IMAGENS_AUTORES)
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('imagens_artigos', 'imagens_artigos', true),
  ('imagens_autores', 'imagens_autores', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Leitura pública dos arquivos
CREATE POLICY "Acesso público aos arquivos de imagens_artigos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'imagens_artigos');

CREATE POLICY "Acesso público aos arquivos de imagens_autores"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'imagens_autores');

-- Upload permitido nos buckets de imagens
CREATE POLICY "Upload permitido no bucket imagens_artigos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'imagens_artigos');

CREATE POLICY "Upload permitido no bucket imagens_autores"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'imagens_autores');

-- Atualização permitida
CREATE POLICY "Atualização permitida no bucket imagens_artigos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'imagens_artigos')
  WITH CHECK (bucket_id = 'imagens_artigos');

CREATE POLICY "Atualização permitida no bucket imagens_autores"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'imagens_autores')
  WITH CHECK (bucket_id = 'imagens_autores');

-- Exclusão permitida
CREATE POLICY "Exclusão permitida no bucket imagens_artigos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'imagens_artigos');

CREATE POLICY "Exclusão permitida no bucket imagens_autores"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'imagens_autores');
