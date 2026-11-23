import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Flame } from 'lucide-react';

export default function Footer() {
  const instagramUrl = process.env.NEXT_PUBLIC_INSTAGRAM_URL || 'https://instagram.com/arevoltavermelha';
  const youtubeUrl = process.env.NEXT_PUBLIC_YOUTUBE_URL || 'https://youtube.com/@arevoltavermelha';

  return (
    <footer className="w-full bg-rev-black text-rev-white border-t-2 border-rev-black font-mono">
      <div className="max-w-[1400px] mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 border-x border-neutral-800">
        {/* Bloco 1: Logotipo Oficial Sem Fundo + Redes Sociais (5 colunas) */}
        <div className="lg:col-span-5 space-y-5">
          <Link href="/" className="block">
            <Image
              src="/logo_horizontal.webp"
              alt="A Revolta Vermelha - Revista Política"
              width={380}
              height={100}
              className="h-16 md:h-20 w-auto object-contain filter brightness-0 invert"
            />
          </Link>
          <span className="text-[11px] text-neutral-400 font-mono tracking-widest uppercase block">
            REVISTA POLÍTICA
          </span>

          {/* Redes Sociais no Rodapé: Instagram e YouTube */}
          <div className="flex items-center gap-3 pt-2">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram de A Revolta Vermelha"
              className="w-9 h-9 border border-neutral-700 bg-neutral-900 flex items-center justify-center text-neutral-300 hover:text-white hover:bg-rev-red hover:border-rev-red transition-all"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" role="img">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>

            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube de A Revolta Vermelha"
              className="w-9 h-9 border border-neutral-700 bg-neutral-900 flex items-center justify-center text-neutral-300 hover:text-white hover:bg-rev-red hover:border-rev-red transition-all"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" role="img">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Bloco 2: Editorias Oficiais (3 colunas) */}
        <div className="lg:col-span-3 space-y-3">
          <h4 className="font-display text-xs text-white uppercase tracking-widest border-b border-neutral-700 pb-2">
            EDITORIAS OFICIAIS
          </h4>
          <ul className="space-y-2 text-xs text-neutral-400">
            <li>
              <Link href="/?cat=EDITORIAL#artigos" className="hover:text-rev-red transition-colors">
                → EDITORIAL
              </Link>
            </li>
            <li>
              <Link href="/?cat=OPINIÃO#artigos" className="hover:text-rev-red transition-colors">
                → ARTIGOS DE OPINIÃO
              </Link>
            </li>
            <li>
              <Link href="/?cat=NACIONAL%20%26%20INTERNACIONAL#artigos" className="hover:text-rev-red transition-colors">
                → NACIONAL & INTERNACIONAL
              </Link>
            </li>
            <li>
              <Link href="/?cat=RIO%20GRANDE%20DO%20NORTE%20(RN)#artigos" className="hover:text-rev-red transition-colors">
                → RIO GRANDE DO NORTE (RN)
              </Link>
            </li>
            <li>
              <Link href="/?cat=TRADUÇÕES#artigos" className="hover:text-rev-red transition-colors">
                → TRADUÇÕES INÉDITAS
              </Link>
            </li>
          </ul>
        </div>

        {/* Bloco 3: Expediente e Apoio (4 colunas) */}
        <div className="lg:col-span-4 space-y-3">
          <h4 className="font-display text-xs text-white uppercase tracking-widest border-b border-neutral-700 pb-2">
            SUSTENTAÇÃO & EXPEDIENTE
          </h4>
          <ul className="space-y-2 text-xs text-neutral-400">
            <li>
              <Link href="/assine" className="text-rev-red font-bold hover:underline flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5" />
                <span>ASSINE / APOIE NO APOIA.SE</span>
              </Link>
            </li>
            <li>
              <Link href="/sobre" className="hover:text-rev-red transition-colors">
                → MANIFESTO EDITORIAL & EXPEDIENTE
              </Link>
            </li>
            <li>
              <Link href="/autores" className="hover:text-rev-red transition-colors">
                → ÍNDICE DE AUTORES & COLUNISTAS
              </Link>
            </li>
            <li>
              <Link href="/busca" className="hover:text-rev-red transition-colors">
                → PESQUISA NO ACERVO
              </Link>
            </li>
          </ul>

          <div className="pt-2">
            <Link
              href="/assine"
              className="btn-brutalist !bg-rev-red !text-white !border-white hover:!bg-white hover:!text-rev-black !text-xs !py-2 w-full text-center"
            >
              ADQUIRIR REVISTA FÍSICA →
            </Link>
          </div>
        </div>
      </div>

      {/* Faixa inferior limpa e discreta */}
      <div className="border-t border-neutral-800 py-4 px-6 text-center text-xs text-neutral-500 max-w-[1400px] mx-auto">
        <span>© 2026 A REVOLTA VERMELHA</span>
      </div>
    </footer>
  );
}
