import React from 'react';
import Image from 'next/image';
import { Flame, BookOpen, CheckCircle, ArrowRight, ShieldCheck, Mail } from 'lucide-react';


export const metadata = {
  title: 'Assine & Apoie — A Revolta Vermelha',
  description:
    'Financie o jornalismo e a produção teórica marxista-leninista independente ou garanta os exemplares físicos da revista.',
};

export default function AssinePage() {
  const apoiaSeUrl = process.env.NEXT_PUBLIC_APOIASE_URL || 'https://apoia.se/arevoltavermelha';

  return (
    <div className="w-full bg-rev-white min-h-screen py-12">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        {/* Cabeçalho */}
        <div className="border-b-2 border-rev-black pb-8 mb-12">
          <div className="flex items-center gap-2 text-xs font-mono text-rev-red font-bold uppercase tracking-wider mb-2">
            <Flame className="w-4 h-4 text-rev-red" />
            <span>SUSTENTAÇÃO MATERIAL INDEPENDENTE</span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-rev-black leading-tight">
            ASSINE & REVISTA FÍSICA
          </h1>
          <p className="mt-4 text-sm sm:text-base font-mono text-neutral-700 max-w-3xl leading-relaxed">
            Não recebemos subvenções estatais nem patrocínios de conglomerados corporativos. A produção de teoria revolucionária e a pesquisa histórica viva dependem diretamente da solidariedade militante dos nossos leitores.
          </p>
        </div>

        {/* As Duas Modalidades Claras */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-14">
          {/* MODALIDADE 1: Assinatura & Apoio Contínuo */}
          <div className="border-2 border-rev-black bg-white flex flex-col justify-between p-6 sm:p-8 shadow-[6px_6px_0px_#111111] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="bg-rev-red text-white text-[11px] font-mono font-bold uppercase px-3 py-1 border border-rev-black">
                  MODALIDADE 01
                </span>
                <span className="text-xs font-mono text-rev-muted">RECORRENTE</span>
              </div>

              <h2 className="font-display font-black text-2xl uppercase tracking-tight text-rev-black mb-3">
                ASSINATURA & APOIO CONTÍNUO
              </h2>

              <p className="text-xs sm:text-sm font-mono text-neutral-600 leading-relaxed mb-6">
                Contribuição mensal voluntária para custear a manutenção da plataforma digital, remunerar traduções operárias e financiar investigações no interior do Rio Grande do Norte e outros estados.
              </p>

              <div className="space-y-3 border-t border-neutral-200 pt-5 mb-8 text-xs font-mono text-neutral-800">
                <div className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-rev-red flex-shrink-0 mt-0.5" />
                  <span>Acesso irrestrito a todos os cadernos e documentos digitalizados</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-rev-red flex-shrink-0 mt-0.5" />
                  <span>Participação nos grupos de leitura e debates do conselho editorial</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-rev-red flex-shrink-0 mt-0.5" />
                  <span>Relatórios anuais de prestação de contas dos recursos arrecadados</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-rev-red flex-shrink-0 mt-0.5" />
                  <span>Nome creditado no expediente oficial dos cadernos como colaborador</span>
                </div>
              </div>
            </div>

            <div>
              <a
                href={apoiaSeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full btn-brutalist !bg-rev-red !text-white hover:!bg-rev-black !py-3.5 !text-xs flex items-center justify-between"
              >
                <span>APOIAR NO APOIA.SE →</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <span className="text-[10px] font-mono text-neutral-500 block text-center mt-2">
                A partir de R$ 10/mês • Cancele quando quiser
              </span>
            </div>
          </div>

          {/* MODALIDADE 2: Edição Física Impressa */}
          <div className="border-2 border-rev-black bg-neutral-100 flex flex-col justify-between p-6 sm:p-8 shadow-[6px_6px_0px_#C81E1E] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="bg-rev-black text-white text-[11px] font-mono font-bold uppercase px-3 py-1 border border-rev-black">
                  MODALIDADE 02
                </span>
                <span className="text-xs font-mono text-rev-red font-bold">EDIÇÃO LIMITADA</span>
              </div>

              <h2 className="font-display font-black text-2xl uppercase tracking-tight text-rev-black mb-3">
                EDIÇÃO FÍSICA IMPRESSA
              </h2>

              <p className="text-xs sm:text-sm font-mono text-neutral-600 leading-relaxed mb-6">
                Adquira o exemplar impresso colecionável da revista. Projeto gráfico editorial com padrão suíço-brutalista, ensaios na íntegra e acabamento de arquivo.
              </p>

              <div className="space-y-3 border-t border-neutral-300 pt-5 mb-8 text-xs font-mono text-neutral-800">
                <div className="flex items-start gap-2.5">
                  <BookOpen className="w-4 h-4 text-rev-black flex-shrink-0 mt-0.5" />
                  <span>Volume Nº 01: 96 páginas em papel Pólen Bold 90g com encadernação costurada</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <BookOpen className="w-4 h-4 text-rev-black flex-shrink-0 mt-0.5" />
                  <span>Pôster central encartado com vetor e cronologia do Levante de 1935 em Natal</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <BookOpen className="w-4 h-4 text-rev-black flex-shrink-0 mt-0.5" />
                  <span>Traduções anotadas e ensaios exclusivos não disponíveis no site</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <BookOpen className="w-4 h-4 text-rev-black flex-shrink-0 mt-0.5" />
                  <span>Envio postal protegido para todo o território nacional com código de rastreio</span>
                </div>
              </div>
            </div>

            <div>
              <a
                href={apoiaSeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full btn-brutalist !bg-rev-black !text-white hover:!bg-rev-red !py-3.5 !text-xs flex items-center justify-between"
              >
                <span>ADQUIRIR EXEMPLAR FÍSICO →</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <span className="text-[10px] font-mono text-neutral-500 block text-center mt-2">
                Exemplar avulso ou combinado com assinatura
              </span>
            </div>
          </div>
        </div>

        {/* Faixa de Transparência e Segurança */}
        <div className="border border-rev-black bg-white p-6 grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-rev-red flex-shrink-0" />
            <div>
              <strong className="block text-rev-black uppercase">INDEPENDÊNCIA TOTAL</strong>
              <span className="text-neutral-600 text-[11px] leading-tight">
                Financiada exclusivamente por leitores e militantes da causa proletária.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-rev-black flex-shrink-0" />
            <div>
              <strong className="block text-rev-black uppercase">CONTATO DIRETO</strong>
              <span className="text-neutral-600 text-[11px] leading-tight">
                Dúvidas sobre envios ou pagamentos: contato@arevoltavermelha.org
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-5 h-5 bg-rev-black flex-shrink-0 p-0.5">
              <Image
                src="/logo.webp"
                alt="Logo"
                width={16}
                height={16}
                className="w-full h-full object-contain filter invert"
              />
            </div>
            <div>
              <strong className="block text-rev-black uppercase">CONSELHO EDITORIAL</strong>
              <span className="text-neutral-600 text-[11px] leading-tight">
                Comitê permanente sediado em Natal / Rio Grande do Norte.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
