'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ArrowRight, Clock } from 'lucide-react';
import { Article } from '@/lib/types';

interface HeroSliderProps {
  articles: Article[];
}

export default function HeroSlider({ articles }: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? articles.length - 1 : prev - 1));
  };

  const next = () => {
    setCurrentIndex((prev) => (prev === articles.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    if (articles.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev === articles.length - 1 ? 0 : prev + 1));
    }, 9000);
    return () => clearInterval(timer);
  }, [articles.length]);

  if (!articles || articles.length === 0) return null;

  const current = articles[currentIndex];

  return (
    <section className="relative w-full h-[78vh] min-h-[520px] max-h-[760px] bg-rev-black overflow-hidden border-b border-rev-black text-white">
      {/* Imagem de Fundo P&B */}
      {articles.map((art, idx) => (
        <div
          key={art.id}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
          }`}
        >
          <div className="relative w-full h-full">
            <Image
              src={art.cover_image_url}
              alt={art.title}
              fill
              priority={idx === 0}
              className="object-cover filter grayscale contrast-125"
            />
            {/* Overlay sutil escuro */}
            <div className="absolute inset-0 bg-black/60" />
          </div>
        </div>
      ))}

      {/* Conteúdo Tipográfico Direto e Limpo */}
      <div className="relative z-20 max-w-[1400px] h-full mx-auto px-6 sm:px-10 flex flex-col justify-end pb-12 sm:pb-16">
        <div className="max-w-4xl space-y-4">
          {/* Selos Oficiais: Natureza da Publicação + Editoria */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider px-3 py-1 border border-rev-black ${
                current.publication_type === 'ARTIGO EDITORIAL'
                  ? 'bg-rev-red text-white'
                  : 'bg-white text-rev-black'
              }`}
            >
              [{current.publication_type}]
            </span>

            <span className="bg-rev-black text-white text-[11px] sm:text-xs font-mono uppercase tracking-wider px-3 py-1 border border-white/40">
              {current.category}
            </span>

            <span className="text-neutral-300 text-xs font-mono flex items-center gap-1 pl-2">
              <Clock className="w-3.5 h-3.5 text-rev-red" />
              <span>{current.reading_time_minutes} MIN DE LEITURA</span>
            </span>
          </div>

          {/* Manchete Principal em Archivo Black */}
          <Link href={`/artigo/${current.slug}`} className="block group">
            <h1
              className="font-display font-black text-white uppercase tracking-tight leading-[1.05] group-hover:text-rev-red transition-colors"
              style={{ fontSize: 'clamp(2rem, 4.2vw, 4rem)' }}
            >
              {current.title}
            </h1>
          </Link>

          {/* Subtítulo Conciso */}
          {current.subtitle && (
            <p className="font-mono text-neutral-200 text-sm sm:text-base max-w-2xl leading-relaxed border-l-2 border-rev-red pl-3 line-clamp-2">
              {current.subtitle}
            </p>
          )}

          {/* Botão Brutalista e Assinatura */}
          <div className="pt-2 flex flex-wrap items-center gap-6">
            <Link
              href={`/artigo/${current.slug}`}
              className="btn-brutalist !bg-rev-red !text-white !border-white hover:!bg-white hover:!text-rev-black"
            >
              <span>LER PUBLICAÇÃO</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="text-xs font-mono text-neutral-300">
              <span>POR: </span>
              <strong className="text-white uppercase">
                {current.author?.name || 'CONSELHO EDITORIAL'}
              </strong>
            </div>
          </div>
        </div>

        {/* Setas Quadradas Brutalistas */}
        {articles.length > 1 && (
          <div className="absolute right-6 bottom-12 sm:bottom-16 flex items-center gap-2 z-30">
            <div className="bg-rev-black/90 border border-white/40 text-white font-mono text-xs px-3 py-2 mr-2">
              <span className="text-rev-red font-bold">0{currentIndex + 1}</span>
              <span className="text-neutral-400"> / 0{articles.length}</span>
            </div>

            <button
              onClick={prevSlide}
              aria-label="Slide Anterior"
              className="w-10 h-10 bg-rev-white text-rev-black border border-rev-black flex items-center justify-center hover:bg-rev-red hover:text-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              aria-label="Próximo Slide"
              className="w-10 h-10 bg-rev-white text-rev-black border border-rev-black flex items-center justify-center hover:bg-rev-red hover:text-white transition-colors cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
