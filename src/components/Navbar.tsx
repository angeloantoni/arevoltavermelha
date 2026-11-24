'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Search, Menu, X, ArrowUpRight, Flame } from 'lucide-react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const navLinks = [
    { label: 'INÍCIO', href: '/' },
    { label: 'EDITORIAL', href: '/?cat=EDITORIAL#artigos' },
    { label: 'ARTIGOS DE OPINIÃO', href: '/?cat=OPINIÃO#artigos' },
    { label: 'NACIONAL & INTERNACIONAL', href: '/?cat=NACIONAL%20%26%20INTERNACIONAL#artigos' },
    { label: 'RIO GRANDE DO NORTE (RN)', href: '/?cat=RIO%20GRANDE%20DO%20NORTE%20(RN)#artigos' },
    { label: 'TRADUÇÕES INÉDITAS', href: '/?cat=TRADUÇÕES#artigos' },
    { label: 'ASSINE & REVISTA FÍSICA', href: '/assine', highlight: true },
    { label: 'MANIFESTO & EXPEDIENTE', href: '/sobre' },
    { label: 'AUTORES & COLUNISTAS', href: '/autores' },
    { label: 'BUSCA NO ACERVO', href: '/busca' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-rev-white border-b border-rev-black">
        {/* Faixa superior minimalista */}
        <div className="bg-rev-black text-rev-white text-[10px] uppercase tracking-widest py-1 px-4 flex items-center justify-between border-b border-rev-black font-mono">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-rev-red animate-pulse" />
            <span>A REVOLTA VERMELHA</span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-neutral-400">
            <Link href="/sobre" className="hover:text-rev-red transition-colors">
              MANIFESTO EDITORIAL
            </Link>
            <span>•</span>
            <Link href="/assine" className="text-rev-red font-bold hover:underline">
              APOIE A REVISTA
            </Link>
          </div>
        </div>

        {/* Header Responsivo */}
        {/* 1. Versão Mobile (< 768px): Logotipo perfeitamente centralizado sem deslocamento */}
        <div className="md:hidden relative w-full flex items-center justify-center min-h-[85px] px-14 py-2 bg-rev-white">
          {/* Botão de Busca à Esquerda (Largura fixa 48px com borda 1px) */}
          <Link
            href="/busca"
            aria-label="Busca no acervo"
            className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center border-r border-rev-black text-rev-black hover:text-rev-red hover:bg-neutral-100 transition-colors"
          >
            <Search className="w-5 h-5" />
          </Link>

          {/* Célula Central Mobile: Logotipo 100% centralizado no eixo da tela */}
          <div className="w-full flex flex-col items-center justify-center mx-auto text-center">
            <Link
              href="/"
              className="flex flex-col items-center justify-center mx-auto text-center group"
            >
              <Image
                src="/logo_horizontal.webp"
                alt="A Revolta Vermelha - Revista Política"
                width={480}
                height={100}
                className="w-full max-w-[230px] sm:max-w-[280px] h-auto max-h-[68px] sm:max-h-[76px] object-contain mx-auto transition-transform group-hover:scale-[1.01]"
                priority
              />
            </Link>
          </div>

          {/* Botão de Menu à Direita (Largura fixa 48px com borda 1px idêntica) */}
          <button
            onClick={() => setIsMenuOpen(true)}
            aria-label="Abrir Menu de Navegação"
            className="absolute right-0 top-0 bottom-0 w-12 flex items-center justify-center border-l border-rev-black text-rev-black hover:text-rev-red hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Versão Desktop (>= 768px): Header clássico brutalista em 3 células rígidas */}
        <div className="hidden md:grid max-w-[1400px] mx-auto md:grid-cols-12 items-stretch min-h-[110px] md:min-h-[130px]">
          {/* Célula Esquerda (25% / col-span-3): BUSCA */}
          <div className="col-span-3 flex items-center border-r border-rev-black px-6">
            <Link
              href="/busca"
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rev-black hover:text-rev-red transition-colors group"
            >
              <Search className="w-4 h-4 text-rev-black group-hover:text-rev-red" />
              <span>BUSCA NO ACERVO</span>
            </Link>
          </div>

          {/* Célula Central (50% / col-span-6): LOGO OFICIAL CLICÁVEL */}
          <div className="col-span-6 flex items-center justify-center px-4 py-2">
            <Link href="/" className="flex items-center justify-center w-full group py-0">
              <Image
                src="/logo_horizontal.webp"
                alt="A Revolta Vermelha - Revista Política"
                width={620}
                height={130}
                className="w-full max-w-[520px] md:max-w-[620px] h-auto max-h-[115px] object-contain transition-transform group-hover:scale-[1.01]"
                priority
              />
            </Link>
          </div>

          {/* Célula Direita (25% / col-span-3): ASSINE / APOIE CENTRALIZADO + MENU */}
          <div className="col-span-3 flex items-center justify-end border-l border-rev-black">
            <div className="flex-1 flex items-center justify-center px-4 py-2">
              <Link
                href="/assine"
                className="w-full max-w-[190px] flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-bold uppercase tracking-wider bg-rev-red text-white hover:bg-rev-black transition-colors border border-rev-black shadow-[2px_2px_0px_#111111]"
              >
                <Flame className="w-3.5 h-3.5" />
                <span>ASSINE / APOIE</span>
              </Link>
            </div>

            <button
              onClick={() => setIsMenuOpen(true)}
              aria-label="Abrir Menu de Navegação"
              className="h-full px-5 py-3 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest bg-rev-white hover:bg-rev-red hover:text-white transition-colors border-l border-rev-black cursor-pointer"
            >
              <Menu className="w-5 h-5" />
              <span>MENU</span>
            </button>
          </div>
        </div>
      </header>

      {/* DRAWER OVERLAY FULLSCREEN */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-rev-white flex flex-col justify-between overflow-y-auto animate-in fade-in duration-200">
          {/* Top Bar do Drawer */}
          <div className="border-b border-rev-black max-w-[1400px] w-full mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3">
              <div className="relative flex items-center">
                <Image
                  src="/logo_horizontal.webp"
                  alt="A Revolta Vermelha"
                  width={340}
                  height={90}
                  className="h-14 md:h-16 w-auto object-contain"
                />
              </div>
            </Link>

            <button
              onClick={() => setIsMenuOpen(false)}
              className="btn-brutalist flex items-center gap-2 text-sm !bg-rev-black !text-white hover:!bg-rev-red"
            >
              <X className="w-5 h-5" />
              <span>FECHAR [ESC]</span>
            </button>
          </div>

          {/* Conteúdo Central do Drawer */}
          <div className="max-w-[1400px] w-full mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto">
            {/* Coluna 1: Links Gigantes */}
            <nav className="lg:col-span-8 flex flex-col space-y-2">
              <span className="text-xs uppercase text-rev-muted tracking-widest mb-1 font-mono">
                — SUMÁRIO DA REVISTA & EDITORIAS
              </span>
              {navLinks.map((link, idx) => (
                <Link
                  key={link.href + idx}
                  href={link.href}
                  className={`group flex items-center justify-between text-xl sm:text-2xl md:text-3xl font-display font-black uppercase tracking-tight py-2 border-b border-neutral-200 hover:border-rev-red hover:text-rev-red hover:pl-3 transition-all ${
                    link.highlight ? 'text-rev-red' : 'text-rev-black'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {link.highlight && <span className="text-xs font-mono bg-rev-red text-white px-2 py-0.5">[DESTAQUE]</span>}
                    {link.label}
                  </span>
                  <ArrowUpRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity text-rev-red" />
                </Link>
              ))}
            </nav>

            {/* Coluna 2: Busca Rápida + Caixa de Apoio */}
            <div className="lg:col-span-4 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-rev-black lg:pl-8 pt-8 lg:pt-0 space-y-6">
              <div>
                <h4 className="font-display text-xs uppercase tracking-wider mb-2">
                  PESQUISA DIRETA NO ACERVO
                </h4>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (searchQuery.trim()) {
                      window.location.href = `/busca?q=${encodeURIComponent(searchQuery)}`;
                    }
                  }}
                  className="flex flex-col gap-2"
                >
                  <input
                    type="text"
                    placeholder="Autor, tema, RN ou editorial..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2.5 border border-rev-black font-mono text-xs focus:outline-none focus:ring-2 focus:ring-rev-red bg-white"
                  />
                  <button type="submit" className="btn-brutalist w-full text-center !text-xs">
                    BUSCAR NO ARQUIVO →
                  </button>
                </form>
              </div>

              {/* Bloco de Apoio Direto */}
              <div className="p-4 bg-neutral-100 border border-rev-black space-y-3 text-xs">
                <div className="font-display font-bold text-rev-red uppercase flex items-center gap-1.5">
                  <Flame className="w-4 h-4" />
                  <span>ASSINE & FORTALEÇA O PROJETO</span>
                </div>
                <p className="text-neutral-700 leading-relaxed font-mono">
                  Ajude a sustentar a produção teórica marxista-leninista independente e garanta seu exemplar físico colecionável.
                </p>
                <Link href="/assine" className="btn-brutalist !bg-rev-black !text-white hover:!bg-rev-red w-full text-center !text-xs">
                  CONHECER MODALIDADES →
                </Link>
              </div>

              <div className="text-[11px] text-rev-muted font-mono">
                NATAL / RN • BRASIL • © 2026 A REVOLTA VERMELHA
              </div>
            </div>
          </div>

          {/* Barra inferior */}
          <div className="border-t border-rev-black py-2.5 px-6 text-center text-[10px] tracking-widest uppercase bg-rev-black text-white font-mono">
            PRESSIONE ESC OU CLIQUE EM FECHAR PARA RETORNAR À LEITURA
          </div>
        </div>
      )}
    </>
  );
}
