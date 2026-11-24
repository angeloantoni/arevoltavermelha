import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Flame, ShieldCheck, Scale, Compass } from 'lucide-react';
import { getExpediente } from '@/lib/serverExpediente';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Manifesto Editorial & Expediente — A Revolta Vermelha',
  description:
    'Linha editorial marxista-leninista, balanço histórico de 1935 sem dogmatismo e compromisso com a transformação concreta da realidade.',
};

export default async function SobrePage() {
  const expediente = await getExpediente();
  return (
    <div className="w-full bg-rev-red text-white min-h-screen py-12 selection:bg-rev-black selection:text-white">
      <div className="max-w-[1050px] mx-auto px-4 sm:px-6">
        {/* Cabeçalho do Manifesto sobre Fundo Vermelho Vibrante */}
        <div className="border-b-2 border-white pb-8 mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              {/* Logotipo Oficial em Alto Contraste */}
              <div className="h-12 w-auto flex items-center justify-start">
                <Image
                  src="/logo_horizontal.webp"
                  alt="A Revolta Vermelha - Logotipo Oficial"
                  width={260}
                  height={60}
                  className="h-11 w-auto object-contain filter brightness-0 invert"
                  priority
                />
              </div>
            </div>

            <div className="inline-block bg-rev-black text-white px-3 py-1 text-xs font-mono border border-white">
              EDIÇÃO 2026
            </div>
          </div>

          <h1 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-white leading-tight mt-6">
            MANIFESTO EDITORIAL: TEORIA, HISTÓRIA E AÇÃO CONCRETA
          </h1>
          <p className="mt-3 text-sm sm:text-base font-mono text-white/90 leading-relaxed max-w-3xl">
            Analisar cientificamente o passado e o presente — examinando sem dogmatismo os erros e acertos do movimento comunista — como instrumento indispensável para transformar a realidade material.
          </p>
        </div>

        {/* Bloco de Citação Principal em Preto Carvão */}
        <div className="bg-rev-black text-white p-6 sm:p-8 border-2 border-white shadow-[6px_6px_0px_#111111] mb-12">
          <div className="text-rev-red font-display text-2xl font-black mb-2">«</div>
          <p className="font-display text-lg sm:text-xl font-bold uppercase tracking-tight leading-relaxed">
            «A arma da crítica não pode, é claro, substituir a crítica das armas, o poder material tem de ser derrubado pelo poder material; mas a teoria também se converte em força material quando penetra nas massas.»
          </p>
          <span className="block text-xs font-mono text-neutral-400 mt-4 border-t border-neutral-700 pt-3">
            — Karl Marx, em Crítica da Filosofia do Direito de Hegel (1844)
          </span>
        </div>

        {/* Conteúdo do Manifesto */}
        <div className="font-mono text-white space-y-8 text-sm sm:text-base leading-[1.8] text-justify">
          <section className="bg-rev-black/40 border border-white/40 p-6 sm:p-8 space-y-4 backdrop-blur-sm">
            <h2 className="font-display font-black text-xl sm:text-2xl uppercase text-white border-b border-white pb-2">
              1. A MEMÓRIA DE 1935 E O SENTIDO DA NOSSA DENOMINAÇÃO
            </h2>
            <p>
              O título desta revista homenageia um dos episódios mais ousados e deliberadamente silenciados da história das lutas populares brasileiras: o <strong>Levante de 23 de Novembro de 1935</strong> em Natal, no Rio Grande do Norte. Naquele sábado memorável, soldados e sargentos do 21º Batalhão de Caçadores (21º BC), ao lado de sapateiros, ferroviários da Great Western, alfaiates e tecelões orientados pelo programa da Aliança Nacional Libertadora (ANL), tomaram de assalto as rédeas do poder estadual.
            </p>
            <p>
              Durante noventa e seis horas, instalou-se em terras potiguares o primeiro governo popular de orientação socialista das Américas. O Comitê Popular Revolucionário não espalhou o caos, como mentiu a historiografia da ditadura varguista: tabelou os preços dos gêneros de primeira necessidade, confiscou armazéns de especuladores na Ribeira e distribuiu farinha e carne aos bairros famintos das Rocas e do Alecrim.
            </p>
            <p>
              Contudo, resgatar essa memória não é cultivar um fetiche nostálgico. A derrota da comuna de Natal, cercada pelo isolamento e pela reação implacável das oligarquias vizinhas e das canhoneiras federais, carrega lições cruciais sobre as condições da insurreição, a necessidade de organização prévia das massas e os limites do voluntarismo militar descolado do enraizamento proletário.
            </p>
          </section>

          <section className="bg-rev-black/40 border border-white/40 p-6 sm:p-8 space-y-4 backdrop-blur-sm">
            <h2 className="font-display font-black text-xl sm:text-2xl uppercase text-white border-b border-white pb-2">
              2. O MÉTODO: CIÊNCIA DIALÉTICA E RECUSA AO DOGMATISMO
            </h2>
            <p>
              O objetivo central de <em>A Revolta Vermelha</em> é <strong>analisar cientificamente o passado e o presente — examinando sem dogmatismo os erros e acertos do movimento comunista — como instrumento para transformar a realidade concreta</strong>.
            </p>
            <p>
              Recusamos o dogmatismo e a fossilização do marxismo em catecismos litúrgicos. As experiências de transição ao socialismo no século XX e os movimentos armados anticoloniais alcançaram vitórias monumentais contra o analfabetismo, a miséria e a agressão imperialista.
            </p>
            <p>
              Ocultar os erros é desarmar as novas gerações da classe trabalhadora. Somente o rigor científico, a honestidade intelectual e a crítica materialista desassombrada conferem clareza teórica e capacidade tática aos revolucionários do século XXI.
            </p>
          </section>

          {/* SEÇÃO PRINCIPAL: PILARES DA LINHA EDITORIAL EM CARDS BRUTALISTAS DE ALTO CONTRASTE */}
          <section className="pt-4">
            <div className="border-b-2 border-white pb-3 mb-6">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-white/90">
                DIRETRIZES FUNDAMENTAIS
              </span>
              <h2 className="font-display font-black text-2xl sm:text-3xl uppercase text-white tracking-tight">
                PILARES DA LINHA EDITORIAL
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose">
              {/* PILAR 1: POSIÇÃO DA REVISTA (EDITORIAL) */}
              <div className="bg-rev-black text-white p-6 border-2 border-white shadow-[6px_6px_0px_#111111] flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldCheck className="w-5 h-5 text-rev-red" />
                    <span className="bg-rev-red text-white text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 border border-white">
                      LINHA OFICIAL
                    </span>
                  </div>

                  <h3 className="font-display font-black text-xl uppercase tracking-tight text-white mb-3">
                    POSIÇÃO DA REVISTA (EDITORIAL)
                  </h3>

                  <p className="text-xs sm:text-sm font-mono text-neutral-300 leading-relaxed">
                    As publicações assinadas pelo Conselho Editorial seguem rigorosamente uma linha <strong>marxista-leninista, revolucionária e anti-imperialista</strong>. Estamos comprometidos com a emancipação integral da classe trabalhadora, a denúncia intransigente sobre as limitações dos governos reformistas e na atuação que limita-se ao institucional e eleitoral e a análise concreta da realidade brasileira, potiguar e internacional.
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-neutral-700 text-[11px] font-mono text-rev-red font-bold uppercase">
                  → Compromisso de classe & teoria revolucionária
                </div>
              </div>

              {/* PILAR 2: PLURALIDADE NO DEBATE (OPINIÃO) */}
              <div className="bg-white text-rev-black p-6 border-2 border-rev-black shadow-[6px_6px_0px_#111111] flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Scale className="w-5 h-5 text-rev-red" />
                    <span className="bg-rev-black text-white text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 border border-rev-black">
                      DEBATE ABERTO
                    </span>
                  </div>

                  <h3 className="font-display font-black text-xl uppercase tracking-tight text-rev-black mb-3">
                    PLURALIDADE NO DEBATE (ARTIGOS DE OPINIÃO)
                  </h3>

                  <p className="text-xs sm:text-sm font-mono text-neutral-700 leading-relaxed">
                    A revista abre espaço e aceita artigos de opinião pessoais que <strong>expressam exclusivamente a visão de quem os assina</strong>. Fomentamos o debate franco, crítico e qualificado entre diferentes correntes do pensamento socialista e anticapitalista, entendendo que a polêmica de ideias é o combustível para o amadurecimento estratégico da luta.
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-neutral-300 text-[11px] font-mono text-rev-red font-bold uppercase">
                  → Liberdade de debate com rigor crítico
                </div>
              </div>

              {/* PILAR 3: TERRITÓRIO E ESPECIFICIDADES DO RN */}
              <div className="bg-white text-rev-black p-6 border-2 border-rev-black shadow-[6px_6px_0px_#111111] flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Compass className="w-5 h-5 text-rev-red" />
                    <span className="bg-rev-red text-white text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 border border-rev-black">
                      TERRITÓRIO & ESPECIFICIDADES
                    </span>
                  </div>

                  <h3 className="font-display font-black text-xl uppercase tracking-tight text-rev-black mb-3">
                    O RIO GRANDE DO NORTE NO MAPA DA LUTA
                  </h3>

                  <p className="text-xs sm:text-sm font-mono text-neutral-700 leading-relaxed">
                    Almejamos também o debate sobre a realidade concreta do Rio Grande do Norte e suas especificidades e a relação do estado perante a conjuntura do Brasil; os debates políticos e as lutas locais e o aprofundamento científico das questões político-econômicas e históricas do estado.
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-neutral-300 text-[11px] font-mono text-rev-red font-bold uppercase">
                  → Enraizamento potiguar & perspectiva global
                </div>
              </div>

              {/* PILAR 4: TRADUÇÃO DE FONTES PRIMÁRIAS */}
              <div className="bg-rev-black text-white p-6 border-2 border-white shadow-[6px_6px_0px_#111111] flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Flame className="w-5 h-5 text-rev-red" />
                    <span className="bg-white text-rev-black text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 border border-white">
                      ARSENAL TEÓRICO
                    </span>
                  </div>

                  <h3 className="font-display font-black text-xl uppercase tracking-tight text-white mb-3">
                    TRADUÇÃO E DIVULGAÇÃO DE FONTES
                  </h3>

                  <p className="text-xs sm:text-sm font-mono text-neutral-300 leading-relaxed">
                    Trabalho militante contínuo de tradução de textos inéditos ou esquecidos dos clássicos do marxismo, de resoluções sindicais operárias e de documentos das lutas do Sul Global, democratizando armas conceituais para a formação militante.
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-neutral-700 text-[11px] font-mono text-rev-red font-bold uppercase">
                  → Socialização do conhecimento revolucionário
                </div>
              </div>
            </div>
          </section>

          {/* EXPEDIENTE EDITORIAL */}
          <section className="bg-rev-black text-white p-6 sm:p-8 border-2 border-white shadow-[6px_6px_0px_#111111] space-y-4">
            <h2 className="font-display font-black text-xl sm:text-2xl uppercase text-white border-b border-neutral-700 pb-2">
              3. EXPEDIENTE & NORMAS DE SUBMISSÃO
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-mono text-neutral-300 pt-2">
              <div>
                <strong className="text-white block uppercase">DIREÇÃO POLÍTICA E EDITORIAL:</strong>
                <span className="block mt-1 font-bold text-white">{expediente.direcao_politica}</span>
                <span className="text-[11px] text-neutral-400">{expediente.direcao_politica_desc}</span>
              </div>

              <div>
                <strong className="text-white block uppercase">CONSELHO EDITORIAL:</strong>
                <span className="block mt-1 font-bold text-white">{expediente.conselho_editorial}</span>
                <span className="text-[11px] text-neutral-400">{expediente.conselho_editorial_desc}</span>
              </div>

              <div>
                <strong className="text-white block uppercase">EDIÇÃO DE ARTIGOS DE OPINIÃO:</strong>
                <span className="block mt-1 font-bold text-white">{expediente.artigos_opiniao}</span>
                <span className="text-[11px] text-neutral-400">{expediente.artigos_opiniao_desc}</span>
              </div>

              <div>
                <strong className="text-white block uppercase">NÚCLEO DE TRADUÇÕES:</strong>
                <span className="block mt-1 font-bold text-white">{expediente.traducoes}</span>
                <span className="text-[11px] text-neutral-400">{expediente.traducoes_desc}</span>
              </div>

              <div>
                <strong className="text-white block uppercase">PESQUISA HISTÓRICA:</strong>
                <span className="block mt-1 font-bold text-white">{expediente.pesquisa_historica}</span>
                <span className="text-[11px] text-neutral-400">{expediente.pesquisa_historica_desc}</span>
              </div>

              <div>
                <strong className="text-white block uppercase">CONTATO PARA SUBMISSÕES:</strong>
                <span className="text-rev-red font-bold block mt-1">{expediente.contato_submissoes}</span>
                <span className="text-[11px] text-neutral-400">{expediente.contato_submissoes_desc}</span>
              </div>
            </div>

            {expediente.notas_finais && (
              <div className="pt-3 border-t border-neutral-800 text-[11px] text-neutral-400 italic">
                {expediente.notas_finais}
              </div>
            )}

            <div className="pt-6 border-t border-neutral-700 flex flex-wrap items-center justify-between gap-4">
              <Link
                href="/assine"
                className="btn-brutalist !bg-rev-red !text-white !border-white hover:!bg-white hover:!text-rev-black !text-xs !py-2.5"
              >
                <span>APOIAR A MANUTENÇÃO DA REVISTA →</span>
              </Link>

              <a
                href="mailto:contato@arevoltavermelha.com.br?subject=Submissao%20de%20Artigo%20de%20Opiniao"
                className="btn-brutalist !bg-white !text-rev-black hover:!bg-rev-red hover:!text-white !text-xs !py-2.5"
              >
                <span>SUBMETER ARTIGO DE OPINIÃO →</span>
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
