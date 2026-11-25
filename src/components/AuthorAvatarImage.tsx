'use client';

import React, { useState } from 'react';

interface AuthorAvatarImageProps {
  avatarUrl?: string | null;
  name: string;
  isLogo?: boolean;
  initials: string;
  className?: string;
}

export default function AuthorAvatarImage({
  avatarUrl,
  name,
  isLogo = false,
  initials,
  className = '',
}: AuthorAvatarImageProps) {
  const [hasError, setHasError] = useState(false);
  const cleanUrl = avatarUrl && typeof avatarUrl === 'string' ? avatarUrl.trim() : '';

  if (!cleanUrl || hasError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-900 text-white font-mono select-none p-4 text-center">
        <span className="font-display font-black text-4xl sm:text-5xl text-neutral-100 tracking-wider">
          {initials}
        </span>
        <span className="text-[10px] text-rev-red uppercase font-bold tracking-widest mt-2 border-t border-neutral-800 pt-1">
          QUADRO EDITORIAL
        </span>
      </div>
    );
  }

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={cleanUrl}
      alt={name}
      loading="lazy"
      className={`w-full h-full ${
        isLogo ? 'object-contain p-2' : 'object-cover'
      } filter grayscale contrast-125 group-hover:scale-105 transition-transform duration-300 ${className}`}
      onError={() => setHasError(true)}
    />
  );
}
