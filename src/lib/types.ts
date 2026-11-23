export type ArticleCategory =
  | 'EDITORIAL'
  | 'OPINIÃO'
  | 'NACIONAL & INTERNACIONAL'
  | 'RIO GRANDE DO NORTE (RN)'
  | 'TRADUÇÕES';

export type PublicationType =
  | 'ARTIGO EDITORIAL'
  | 'ARTIGO DE OPINIÃO';

export interface Author {
  id: string;
  name: string;
  slug: string;
  role: string;
  bio: string;
  avatar_url: string;
  articles_count?: number;
}

export interface Article {
  id: string;
  title: string;
  subtitle?: string;
  slug: string;
  category: ArticleCategory;
  publication_type: PublicationType;
  excerpt: string;
  content: string;
  cover_image_url: string;
  cover_caption?: string;
  is_hero_featured?: boolean;
  hero_order?: number;
  reading_time_minutes: number;
  author_id?: string;
  author?: Author;
  translator_id?: string;
  translator?: Author;
  original_title?: string;
  original_year?: number;
  original_source?: string;
  status: 'draft' | 'review' | 'published';
  published_at: string;
  created_at: string;
}
