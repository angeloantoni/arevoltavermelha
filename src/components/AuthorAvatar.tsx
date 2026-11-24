'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface AuthorAvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  className?: string;
  imageClassName?: string;
  shape?: 'square' | 'circle';
}

/**
 * Extrai as iniciais do autor para o fallback brutalista.
 * Ex: "Dinarco Reis" -> "DR", "Conselho Editorial" -> "CE", "Lenin" -> "LE".
 */
export function getAuthorInitials(name: string): string {
  if (!name || !name.trim()) return 'RV';
  const clean = name.trim().replace(/^Dra?\.\s+/i, '');
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function AuthorAvatar({
  name,
  avatarUrl,
  size = 'md',
  className = '',
  imageClassName = '',
  shape = 'square',
}: AuthorAvatarProps) {
  const [hasError, setHasError] = useState(false);

  // Considera vazio se for null, undefined, string vazia ou se o carregamento falhou
  const rawUrl = avatarUrl ? avatarUrl.trim() : '';
  const isAvailable = Boolean(rawUrl && !hasError);
  const initials = getAuthorInitials(name);
  const isLogo = rawUrl.includes('logo') || rawUrl === '/logo.webp';

  const sizeClasses = {
    xs: 'w-7 h-7 text-[10px]',
    sm: 'w-9 h-9 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-20 h-20 text-lg sm:w-24 sm:h-24 sm:text-xl',
    custom: '',
  }[size];

  const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-none';

  if (!isAvailable) {
    return (
      <div
        className={`relative border border-rev-black bg-neutral-900 text-white flex items-center justify-center font-mono font-bold select-none shadow-[1px_1px_0px_#C81E1E] flex-shrink-0 ${shapeClass} ${sizeClasses} ${className}`}
        title={`Foto não informada para ${name} (exibindo iniciais)`}
      >
        <span className="tracking-tight">{initials}</span>
      </div>
    );
  }

  return (
    <div
      className={`relative border border-rev-black bg-neutral-100 overflow-hidden flex-shrink-0 ${shapeClass} ${sizeClasses} ${className}`}
    >
      <Image
        src={rawUrl}
        alt={name || 'Autor'}
        fill
        unoptimized
        onError={() => setHasError(true)}
        className={`${
          isLogo ? 'object-contain p-1' : 'object-cover'
        } filter grayscale contrast-125 ${shapeClass} ${imageClassName}`}
      />
    </div>
  );
}
