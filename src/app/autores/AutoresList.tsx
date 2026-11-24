'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthors } from '@/lib/authorStore';
import { Article } from '@/lib/types';
import { BookOpen, ArrowRight } from 'lucide-react';

export default function AutoresList() {
  const { authors } = useAuthors();
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    fetch('/api/articles')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setArticles(data);
        }
      })
      .catch((err) => console.error('Erro ao carregar artigos dos autores:', err));
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {authors.map((author) => {
        const authorArticles = articles.filter(
          (a) => a.author_id === author.id || a.author?.slug === author.slug
        );

        return (
          <div
            key={author.id}
            className="border border-rev-black bg-white flex flex-col justify-between group hover:border-rev-red transition-all shadow-[4px_4px_0px_#111111]"
          >
            <div>
              {/* Foto do Autor em P&B */}
              <div
                className={`relative aspect-[4/3] w-full overflow-hidden border-b border-rev-black ${
                  author.avatar_url && author.avatar_url.includes('logo') ? 'bg-white p-4' : 'bg-neutral-200'
                }`}
              >
                <Image
                  src={author.avatar_url || '/logo.webp'}
                  alt={author.name}
                  fill
                  className={`${
                    author.avatar_url && author.avatar_url.includes('logo') ? 'object-contain p-2' : 'object-cover'
                  } filter grayscale contrast-125 group-hover:scale-105 transition-transform duration-300`}
                />
                <div className="absolute top-3 left-3">
                  <span className="bg-rev-black text-white text-[10px] font-mono font-bold uppercase px-2.5 py-1 border border-rev-black">
                    {author.role}
                  </span>
                </div>
              </div>

              {/* Informações */}
              <div className="p-6">
                <h2 className="font-display font-black text-xl uppercase tracking-tight text-rev-black group-hover:text-rev-red transition-colors">
                  {author.name}
                </h2>
                <p className="mt-3 text-xs font-mono text-neutral-600 leading-relaxed">
                  {author.bio}
                </p>
              </div>
            </div>

            {/* Rodapé do Card */}
            <div className="p-6 pt-0 border-t border-neutral-100 flex items-center justify-between mt-4">
              <span className="text-[11px] font-mono text-rev-muted flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-rev-red" />
                <span>{authorArticles.length} TEXTOS PUBLICADOS</span>
              </span>

              <Link
                href={`/autores/${author.slug}`}
                className="inline-flex items-center gap-1 text-xs font-mono font-bold uppercase text-rev-black group-hover:text-rev-red transition-colors"
              >
                <span>PERFIL</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
