'use client';

import { useState, useEffect, useCallback } from 'react';
import { Author } from './types';
import { AUTHORS as DEFAULT_AUTHORS } from './data';

const STORAGE_KEY = 'arevoltavermelha_authors_v1';

export function getStoredAuthors(): Author[] {
  if (typeof window === 'undefined') {
    return DEFAULT_AUTHORS;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_AUTHORS));
      return DEFAULT_AUTHORS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_AUTHORS;
  } catch {
    return DEFAULT_AUTHORS;
  }
}

export function saveStoredAuthor(
  authorData: Omit<Author, 'id' | 'slug'> & { id?: string; slug?: string }
): Author {
  const current = getStoredAuthors();
  const slug =
    authorData.slug ||
    authorData.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');

  let updatedAuthor: Author;

  if (authorData.id) {
    // Editar existente
    const index = current.findIndex((a) => a.id === authorData.id);
    updatedAuthor = {
      id: authorData.id,
      name: authorData.name,
      slug,
      role: authorData.role,
      bio: authorData.bio || '',
      avatar_url: authorData.avatar_url || '/logo.webp',
      articles_count: index >= 0 ? current[index].articles_count || 0 : 0,
    };
    if (index >= 0) {
      current[index] = updatedAuthor;
    } else {
      current.push(updatedAuthor);
    }
  } else {
    // Criar novo
    updatedAuthor = {
      id: `auth-${Date.now()}`,
      name: authorData.name,
      slug,
      role: authorData.role,
      bio: authorData.bio || '',
      avatar_url: authorData.avatar_url || '/logo.webp',
      articles_count: 0,
    };
    current.push(updatedAuthor);
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    window.dispatchEvent(new Event('authors_updated'));
  }

  return updatedAuthor;
}

export function deleteStoredAuthor(id: string): boolean {
  const current = getStoredAuthors();
  const filtered = current.filter((a) => a.id !== id);

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new Event('authors_updated'));
  }
  return true;
}

export function useAuthors() {
  const [authors, setAuthors] = useState<Author[]>(DEFAULT_AUTHORS);
  const [isLoaded, setIsLoaded] = useState(false);

  const refresh = useCallback(() => {
    setAuthors(getStoredAuthors());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    refresh();

    const handleUpdate = () => {
      refresh();
    };

    window.addEventListener('authors_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('authors_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [refresh]);

  return {
    authors,
    isLoaded,
    saveAuthor: saveStoredAuthor,
    deleteAuthor: deleteStoredAuthor,
    refresh,
  };
}
