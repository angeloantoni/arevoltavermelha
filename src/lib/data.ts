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

export const INITIAL_ARTICLES: Article[] = [
  {
    id: 'art-1',
    title: 'A REVOLTA VERMELHA: O MARXISMO-LENINISMO CONTRA A CONCILIAÇÃO E O REVISIONISMO',
    subtitle:
      'Por que assumimos sem vacilação a herança revolucionária e o método científico sem dogmatismo para intervir na luta de classes.',
    slug: 'a-revolta-vermelha-marxismo-leninismo-editorial',
    category: 'EDITORIAL',
    publication_type: 'ARTIGO EDITORIAL',
    excerpt:
      'Não há revolução sem teoria revolucionária. Em tempos de capitulação ideológica e reformismo estéril, afirmamos a atualidade do leninismo para desvendar as contradições do capitalismo periférico.',
    content: `
# A Linha Política de A Revolta Vermelha

A crise estrutural do modo de produção capitalista se aprofunda. No Brasil e no mundo, a burguesia intensifica a extração da mais-valia absoluta e relativa, desmonta direitos históricos conquistados com sangue pelo operariado e recorre, sempre que necessário, ao militarismo e à violência do Estado para conter a insurgência das massas.

Diante desse quadro, grande parte da esquerda institucional abandonou o horizonte da ruptura socialista. Refugiou-se na gestão burocrática da miséria, no eleitoralismo rasteiro e na ilusão de que as instituições do Estado burguês seriam neutras e reformáveis por dentro.

> "A emancipação da classe trabalhadora deve ser obra da própria classe trabalhadora. Não haverá conciliação duradoura entre o capital que explora e o trabalho que produz."

## Análise Concreta Sem Dogmatismo

*A Revolta Vermelha* não busca o marxismo como liturgia sagrada ou catecismo fossilizado. Pelo contrário: para nós, o materialismo histórico-dialético é um bisturi de precisão. Exige o balanço franco, desassombrado e rigoroso das vitórias e dos erros do movimento comunista internacional.

Reconhecemos os avanços monumentais da União Soviética, das revoluções anticoloniais do século XX e dos levantes populares no Brasil — como o heroico Levante de 1935 em Natal. Mas recusamos a apologia cega: examinar onde se falhou é o único caminho para não repetir tragédias e construir a vitória estratégica no século XXI.
    `,
    cover_image_url:
      'https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=1200&auto=format&fit=crop',
    cover_caption: 'Edição fundacional: a teoria revolucionária como instrumento de ação de massas.',
    is_hero_featured: true,
    hero_order: 1,
    reading_time_minutes: 12,
    author_id: 'auth-editorial',
    tags: ['MARXISMO-LENINISMO', 'TEORIA', 'EDITORIAL', 'REVOLUÇÃO', 'PARTIDO'],
    status: 'published',
    published_at: '2026-11-23T08:00:00Z',
    created_at: '2026-11-23T08:00:00Z',
  },
  {
    id: 'art-2',
    title: 'A COMUNA DE NATAL DE 1935: ERROS, ACERTOS E LIÇÕES DO PRIMEIRO GOVERNO POPULAR',
    subtitle:
      'O balanço crítico e materialista dos quatro dias em que soldados do 21º BC e trabalhadores potiguares tomaram o poder em Natal.',
    slug: 'comuna-de-natal-1935-balanco-critico',
    category: 'RIO GRANDE DO NORTE (RN)',
    publication_type: 'ARTIGO EDITORIAL',
    excerpt:
      'Em 23 de novembro de 1935, Natal foi palco do único governo popular instalado pela insurreição antifascista no Brasil. Analisamos a logística dos rebeldes, o controle de abastecimento e as limitações do isolamento militar.',
    content: `
# Quatro Dias Sob Controle do Povo

Ao cair da tarde de 23 de novembro de 1935, os soldados e sargentos do 21º Batalhão de Caçadores (21º BC) sublevaram o quartel de Natal. O governador oligárquico Rafael Fernandes fugiu precipitadamente. Durante noventa e seis horas, instalou-se o Comitê Popular Revolucionário, apoiado pela Aliança Nacional Libertadora (ANL).

Não houve desordem: o Comitê tabelou os preços dos alimentos, requisitou os depósitos dos especuladores na Ribeira, garantiu passe livre nos trens da Great Western e protegeu a população mais humilde das Rocas e do Alecrim.

> "A experiência de Natal demonstrou na prática: as classes trabalhadoras e as praças armadas são capazes de governar melhor que as oligarquias corruptas."

## As Lições Estratégicas do Desfecho

Por que o movimento foi sufocado quatro dias depois? A análise científica impõe encarar a realidade sem rodeios:
1. **O isolamento geográfico e temporal**: A revolta em Natal eclodiu antes do planejado, sem coordenação simultânea com os levantes de Recife e Rio de Janeiro.
2. **A hesitação no avanço militar para o interior**: A falta de transporte pesado impediu consolidar posições sólidas nas serras antes da chegada das tropas estaduais vizinhas.
3. **A falta de armamento popular massivo**: Embora o povo apoiasse entusiasticamente, a estrutura militar permaneceu restrita às armas capturadas no batalhão.

Resgatar 1935 não é alimentar nostalgia estéril, mas compreender a dinâmica da insurreição armada em território brasileiro.
    `,
    cover_image_url:
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=1200&auto=format&fit=crop',
    cover_caption: 'Fachada histórica e destacamentos de patrulha operária, Natal/RN, 1935.',
    is_hero_featured: true,
    hero_order: 2,
    reading_time_minutes: 16,
    author_id: 'auth-5',
    tags: ['1935', 'NATAL-RN', 'HISTÓRIA', 'MILITARES', 'INSURREIÇÃO', 'ANL'],
    status: 'published',
    published_at: '2026-11-20T10:00:00Z',
    created_at: '2026-11-20T10:00:00Z',
  },
  {
    id: 'art-3',
    title: 'O IMPERIALISMO CONTEMPORÂNEO, A DRENAGEM DA MAIS-VALIA E A GUERRA HÍBRIDA',
    subtitle:
      'Da rapina dos minerais estratégicos ao lawfare: o papel subserviente reservado à América Latina pelo centro hegemônico.',
    slug: 'imperialismo-contemporaneo-mais-valia-guerra-hibrida',
    category: 'NACIONAL & INTERNACIONAL',
    publication_type: 'ARTIGO EDITORIAL',
    excerpt:
      'O declínio da hegemonia do dólar não se dará pacificamente. A OTAN e os monopólios transnacionais aceleram ofensivas desestabilizadoras contra a soberania do Sul Global.',
    content: `
# A Fase Atual da Rapina Monopolista

O imperialismo no século XXI não se apoia apenas na força naval tradicional, mas num tripé conjugado: dívida pública dolarizada, monopólio tecnológico de patentes e guerra cognitiva de desestabilização institucional (a guerra híbrida).

No Brasil, os ataques à Petrobras, aos reservatórios do pré-sal e aos minerais críticos para a transição energética comprovam que o imperialismo não tolera sequer soberanias tímidas.
    `,
    cover_image_url:
      'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=1200&auto=format&fit=crop',
    cover_caption: 'Logística de cargas transoceânicas: a circulação de capitais sob disputa geopolítica global.',
    is_hero_featured: true,
    hero_order: 3,
    reading_time_minutes: 14,
    author_id: 'auth-1',
    tags: ['IMPERIALISMO', 'PALESTINA', 'GEOPOLÍTICA', 'ANTI-IMPERIALISMO', 'SOBERANIA'],
    status: 'published',
    published_at: '2026-11-18T14:00:00Z',
    created_at: '2026-11-18T14:00:00Z',
  },
  {
    id: 'art-4',
    title: 'OS DESAFIOS DA REORGANIZAÇÃO SINDICAL DIANTE DA UBERIZAÇÃO DO TRABALHO',
    subtitle:
      'Como a fragmentação do chão de fábrica impõe novos métodos de agitação, greve e solidariedade classista.',
    slug: 'desafios-reorganizacao-sindical-uberizacao',
    category: 'OPINIÃO',
    publication_type: 'ARTIGO DE OPINIÃO',
    excerpt:
      'O discurso das plataformas sobre "empreendedorismo" oculta jornadas de 16 horas sem previdência ou proteção. Como articular a revolta dos entregadores e condutores contra o algoritmo patronal.',
    content: `
# O Proletariado de Duas Rodas

*(Nota Editorial: Este texto representa a opinião pessoal do autor, publicada em conformidade com o princípio de pluralidade e debate crítico de A Revolta Vermelha).*

A dispersão geográfica dos trabalhadores mediados por aplicativos gerou a ilusão de que o capital havia liquidado a luta de classes nas cidades. Engano profundo: o motoboy que dorme sobre o guidão na calçada da avenida paulista ou na orla de Natal vivencia a extração mais crua da mais-valia.
    `,
    cover_image_url:
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1200&auto=format&fit=crop',
    cover_caption: 'Tráfego urbano noturno e circulação ininterrupta da força de trabalho proletária.',
    is_hero_featured: false,
    reading_time_minutes: 10,
    author_id: 'auth-6',
    tags: ['SINDICALISMO', 'TRABALHO', 'UBERIZAÇÃO', 'CLASSE OPERÁRIA', 'GREVE'],
    status: 'published',
    published_at: '2026-11-15T09:30:00Z',
    created_at: '2026-11-15T09:30:00Z',
  },
  {
    id: 'art-5',
    title: 'SOBRE O PAPEL DO ESTADO NA FASE MONOPOLISTA E A DESTRUIÇÃO DA MÁQUINA BURGUESA',
    subtitle:
      'Tradução anotada das notas preparatórias de Lenin para O Estado e a Revolução (caderno O Marxismo sobre o Estado).',
    slug: 'papel-do-estado-destruicao-maquina-burguesa-lenin',
    category: 'TRADUÇÕES',
    publication_type: 'ARTIGO EDITORIAL',
    excerpt:
      'O Estado não é um árbitro neutro acima da sociedade, mas o comitê executivo da classe dominante. Sua máquina repressiva deve ser quebrada para que floresça a democracia dos trabalhadores.',
    content: `
# Cadernos Inéditos de Zurique (1916-1917)

A ilusão parlamentarista crê que a conquista do poder executivo por via eleitoral basta para transmutar a natureza de classe do Estado. Lenin demonstra, com base estrita na Comuna de Paris analisada por Marx, que as forças armadas permanentes, o judiciário de casta e a burocracia dos bancos estatais existem para esmagar qualquer tentativa de insubordinação operária.
    `,
    cover_image_url:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1200&auto=format&fit=crop',
    cover_caption: 'Arquivo de manuscritos: as anotações conceituais de Vladimir Lenin sobre a quebra da máquina burocrático-militar.',
    is_hero_featured: false,
    reading_time_minutes: 22,
    author_id: 'auth-3',
    translator_id: 'auth-6',
    tags: ['LENIN', 'ESTADO', 'TRADUÇÃO', 'COMUNA DE PARIS', 'TEORIA'],
    original_title: 'Марксизм о государстве',
    original_year: 1917,
    original_source: 'Instituto de Marxismo-Leninismo de Moscou',
    status: 'published',
    published_at: '2026-11-12T11:00:00Z',
    created_at: '2026-11-12T11:00:00Z',
  },
  {
    id: 'art-6',
    title: 'A FRONTEIRA DA ENERGIA EÓLICA NO SERTÃO POTIGUAR E A NOVA GRILAGEM VERDE',
    subtitle:
      'Como a expansão desenfreada dos aerogeradores corporativos no RN encurrala comunidades tradicionais de pescadores e agricultores.',
    slug: 'fronteira-eolica-rn-grilagem-verde',
    category: 'RIO GRANDE DO NORTE (RN)',
    publication_type: 'ARTIGO DE OPINIÃO',
    excerpt:
      'Sob a propaganda sedutora da "energia limpa", corporações multinacionais impõem contratos abusivos de arrendamento no litoral e semiárido potiguar, privatizando terras comunais.',
    content: `
# O Vento Que Não Pertence ao Povo

*(Nota: Artigo assinado contendo a opinião e apuração de campo do pesquisador).*

O Rio Grande do Norte ostenta o título de maior gerador de energia eólica do Brasil. Contudo, nas comunidades rurais de Galinhos, Touros e João Câmara, o som incessante das turbinas e o fechamento de acessos a pastagens tradicionais desenham um cenário de espoliação territorial colonialista em pleno século XXI.
    `,
    cover_image_url:
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
    cover_caption: 'Aerogeradores industriais sobre as dunas do litoral setentrional potiguar.',
    is_hero_featured: false,
    reading_time_minutes: 13,
    author_id: 'auth-4',
    tags: ['RN', 'ENERGIA EÓLICA', 'QUESTÃO AGRÁRIA', 'NORDESTE', 'CAMPESINATO'],
    status: 'published',
    published_at: '2026-11-08T15:00:00Z',
    created_at: '2026-11-08T15:00:00Z',
  },
  {
    id: 'art-7',
    title: 'A EMANCIPAÇÃO FEMININA COMO PREMISSA INEGOCIÁVEL DA REVOLUÇÃO PROLETÁRIA',
    subtitle:
      'A moral comunista, o fim da servidão doméstica e a construção de laços humanos libertos da lógica mercantil da posse.',
    slug: 'emancipacao-feminina-moral-comunista-kollontai',
    category: 'OPINIÃO',
    publication_type: 'ARTIGO DE OPINIÃO',
    excerpt:
      'Não há como derrubar as bases da propriedade privada sem demolir a estrutura patriarcal que transforma a mulher em escrava do lar e reprodutora barata de força de trabalho.',
    content: `
# A Luta das Mulheres Trabalhadoras

A luta pela libertação da mulher trabalhadora não é um apêndice ou adorno secundário para "depois da tomada do poder". Como dizia Kollontai, a reestruturação da vida cotidiana, a socialização do trabalho doméstico (creches públicas, lavanderias comunitárias, restaurantes populares) é a pedra de toque da sociedade socialista.
    `,
    cover_image_url:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1200&auto=format&fit=crop',
    cover_caption: 'Operárias e militantes da Internacional de Mulheres, 1921.',
    is_hero_featured: false,
    reading_time_minutes: 15,
    author_id: 'auth-2',
    tags: ['KOLLONTAI', 'FEMINISMO', 'MULHERES', 'SOCIALISMO', 'MORAL COMUNISTA'],
    status: 'published',
    published_at: '2026-11-05T12:00:00Z',
    created_at: '2026-11-05T12:00:00Z',
  },
];

export function getArticles(): Article[] {
  return INITIAL_ARTICLES.map((article) => ({
    ...article,
    author: AUTHORS.find((a) => a.id === article.author_id),
    translator: AUTHORS.find((a) => a.id === article.translator_id),
  }));
}

export function getHeroArticles(articles?: Article[]): Article[] {
  const list = articles || getArticles();
  return [...list]
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
