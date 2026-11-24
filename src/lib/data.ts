import { Article, Author, ArticleCategory, PublicationType } from './types';

export const AUTHORS: Author[] = [
  {
    id: 'auth-editorial',
    name: 'Conselho Editorial',
    slug: 'conselho-editorial',
    role: 'Linha Marxista-Leninista Oficial',
    bio: 'Órgão de direção política e teórica da revista A Revolta Vermelha, responsável pelas posições editoriais, manifestos e análise de conjuntura orientada pelo marxismo-leninismo.',
    avatar_url: '/logo.webp',
    articles_count: 5,
  },
  {
    id: 'auth-1',
    name: 'Dinarco Reis',
    slug: 'dinarco-reis',
    role: 'Memorialista e Militante Histórico',
    bio: 'Militar comunista, participante do movimento de 1935 no Nordeste e figura central na resistência antifascista brasileira. Autor de memórias fundamentais sobre estratégia revolucionária.',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop',
    articles_count: 3,
  },
  {
    id: 'auth-2',
    name: 'Alexandra Kollontai',
    slug: 'alexandra-kollontai',
    role: 'Teórica & Articulista Convidada',
    bio: 'Revolucionária russa, precursora da teoria sobre a moral proletária, família trabalhadora e emancipação integral das mulheres no socialismo.',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop',
    articles_count: 2,
  },
  {
    id: 'auth-3',
    name: 'Vladimir I. Lenin',
    slug: 'vladimir-lenin',
    role: 'Teórico Marxista Clássico',
    bio: 'Formulador das teses sobre o imperialismo, a natureza de classe do Estado burguês e a organização do partido revolucionário de vanguarda.',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop',
    articles_count: 4,
  },
  {
    id: 'auth-4',
    name: 'Praxedes da Silva',
    slug: 'praxedes-da-silva',
    role: 'Pesquisador da Questão Agrária Potiguar',
    bio: 'Pesquisador potiguar dedicado aos conflitos de terra, impactos do agronegócio e energia eólica no Rio Grande do Norte.',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=600&auto=format&fit=crop',
    articles_count: 2,
  },
  {
    id: 'auth-5',
    name: 'Dra. Helena Marcondes',
    slug: 'helena-marcondes',
    role: 'Historiadora & Membro do Conselho',
    bio: 'Doutora em História Social pela UFRN e pesquisadora do movimento operário e dos levantes populares no Nordeste do Brasil.',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
    articles_count: 4,
  },
  {
    id: 'auth-6',
    name: 'Lucas Ferreira',
    slug: 'lucas-ferreira',
    role: 'Tradutor e Articulista Sindical',
    bio: 'Sociólogo do trabalho e tradutor de documentos históricos das lutas anticoloniais e operárias.',
    avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=600&auto=format&fit=crop',
    articles_count: 3,
  },
];

export const INITIAL_ARTICLES: Article[] = [];

export function getArticles(): Article[] {
  return INITIAL_ARTICLES.map((article) => ({
    ...article,
    author: AUTHORS.find((a) => a.id === article.author_id),
    translator: AUTHORS.find((a) => a.id === article.translator_id),
  }));
}

export function getHeroArticles(articles: Article[] = []): Article[] {
  return [...articles]
    .sort(
      (a, b) =>
        new Date(b.created_at || b.published_at).getTime() -
        new Date(a.created_at || a.published_at).getTime()
    )
    .slice(0, 4);
}

export function getArticleBySlug(slug: string): Article | undefined {
  return getArticles().find((a) => a.slug === slug);
}

export function getArticlesByCategory(category: ArticleCategory): Article[] {
  return getArticles().filter((a) => a.category === category);
}

export function getArticlesByPublicationType(pubType: PublicationType): Article[] {
  return getArticles().filter((a) => a.publication_type === pubType);
}

export function getArticlesByAuthor(authorSlug: string): Article[] {
  const author = AUTHORS.find((a) => a.slug === authorSlug);
  if (!author) return [];
  return getArticles().filter((a) => a.author_id === author.id);
}

export function getAuthorBySlug(slug: string): Author | undefined {
  return AUTHORS.find((a) => a.slug === slug);
}

export function searchArticles(query: string, category?: string): Article[] {
  const cleanQ = query.trim().replace(/^#/, '').toLowerCase();
  return getArticles().filter((art) => {
    const matchesCat = !category || category === 'TODOS' || art.category === category;
    if (!matchesCat) return false;
    if (!cleanQ) return true;
    return (
      art.title.toLowerCase().includes(cleanQ) ||
      art.subtitle?.toLowerCase().includes(cleanQ) ||
      art.excerpt.toLowerCase().includes(cleanQ) ||
      art.publication_type.toLowerCase().includes(cleanQ) ||
      art.author?.name.toLowerCase().includes(cleanQ) ||
      art.tags?.some((t) => t.toLowerCase().includes(cleanQ) || cleanQ.includes(t.toLowerCase()))
    );
  });
}
