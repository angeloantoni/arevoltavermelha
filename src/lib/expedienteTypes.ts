export interface ExpedienteData {
  direcao_politica: string;
  direcao_politica_desc: string;
  conselho_editorial: string;
  conselho_editorial_desc: string;
  artigos_opiniao: string;
  artigos_opiniao_desc: string;
  traducoes: string;
  traducoes_desc: string;
  pesquisa_historica: string;
  pesquisa_historica_desc: string;
  contato_submissoes: string;
  contato_submissoes_desc: string;
  notas_finais: string;
  updated_at?: string;
}

export const DEFAULT_EXPEDIENTE: ExpedienteData = {
  direcao_politica: 'Conselho Editorial de A Revolta Vermelha',
  direcao_politica_desc: 'Comitê Permanente — Linha Marxista-Leninista (Natal / RN)',
  conselho_editorial: 'Órgão Colegiado de Orientação Teórica e Política',
  conselho_editorial_desc: 'Responsável pelas posições oficiais, manifestos e análises de conjuntura',
  artigos_opiniao: 'Comissão de Debates & Teoria Política',
  artigos_opiniao_desc: 'Revisão por pares militantes e articulistas convidados',
  traducoes: 'Coletivo de Línguas Estrangeiras & Fontes Históricas',
  traducoes_desc: 'Traduções de obras clássicas do marxismo-leninismo e documentos inéditos',
  pesquisa_historica: 'Núcleo de Memória da Insurreição de 1935',
  pesquisa_historica_desc: 'Resgate documental e memória do levante popular no Nordeste brasileiro',
  contato_submissoes: 'contato@arevoltavermelha.com.br',
  contato_submissoes_desc: 'Recebimento de ensaios e propostas editoriais em fluxo contínuo',
  notas_finais: 'A Revolta Vermelha é mantida exclusivamente pelo trabalho voluntário e sustentação da militância.',
};
