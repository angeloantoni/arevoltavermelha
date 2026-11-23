'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthors } from '@/lib/authorStore';
import { Author } from '@/lib/types';
import { Plus, Users, Edit2, Trash2, X, Check, FileText } from 'lucide-react';
import LogoutButton from '../LogoutButton';

const ROLES = [
  'Autor',
  'Tradutor',
  'Conselho Editorial',
  'Pesquisador Histórico',
  'Colunista Convidado',
];

export default function AdminAutoresPage() {
  const { authors, isLoaded, saveAuthor, deleteAuthor } = useAuthors();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Campos do formulário
  const [name, setName] = useState('');
  const [role, setRole] = useState('Autor');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingId(null);
    setName('');
    setRole('Autor');
    setBio('');
    setAvatarUrl('');
    setIsModalOpen(true);
  };

  const openEditModal = (author: Author) => {
    setEditingId(author.id);
    setName(author.name);
    setRole(author.role);
    setBio(author.bio || '');
    setAvatarUrl(author.avatar_url || '');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Informe o nome do autor.');
      return;
    }

    saveAuthor({
      id: editingId || undefined,
      name: name.trim(),
      role,
      bio: bio.trim(),
      avatar_url: avatarUrl.trim() || '/logo.webp',
    });

    setFeedback(editingId ? 'Autor atualizado com sucesso!' : 'Novo autor cadastrado com sucesso!');
    setTimeout(() => setFeedback(null), 3000);
    closeModal();
  };

  const handleDelete = (id: string, authorName: string) => {
    if (confirm(`Tem certeza que deseja excluir "${authorName}" do quadro de autores?`)) {
      deleteAuthor(id);
      setFeedback(`Autor "${authorName}" excluído.`);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  return (
    <div className="w-full bg-rev-white min-h-screen py-10 font-mono">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        {/* Cabeçalho do Painel */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b-2 border-rev-black pb-6 mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-rev-red font-bold uppercase tracking-wider mb-2">
              <span className="w-2.5 h-2.5 bg-rev-red inline-block" />
              <span>PAINEL DE CONTROLE EDITORIAL</span>
            </div>
            <h1 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-rev-black">
              AUTORES & TRADUTORES
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={openCreateModal}
              className="btn-brutalist !bg-rev-red !text-white hover:!bg-rev-black flex items-center gap-2 !text-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>NOVO AUTOR / TRADUTOR +</span>
            </button>
            <LogoutButton />
          </div>
        </div>

        {/* Abas de Navegação do CMS */}
        <div className="flex items-center gap-2 border-b border-rev-black mb-8">
          <Link
            href="/admin"
            className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral-600 hover:text-rev-black flex items-center gap-2 border-b-2 border-transparent transition-all"
          >
            <FileText className="w-4 h-4" />
            <span>GESTÃO DE ARTIGOS</span>
          </Link>

          <Link
            href="/admin/autores"
            className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-rev-red border-b-2 border-rev-red flex items-center gap-2 bg-neutral-100 transition-all"
          >
            <Users className="w-4 h-4 text-rev-red" />
            <span>GESTÃO DE AUTORES & TRADUTORES ({authors.length})</span>
          </Link>
        </div>

        {/* Notificação Toast */}
        {feedback && (
          <div className="mb-6 p-3 bg-rev-black text-white text-xs border border-rev-red flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-rev-red" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Tabela Brutalista de Autores */}
        <div className="border border-rev-black bg-white overflow-x-auto shadow-[4px_4px_0px_#111111]">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="bg-rev-black text-white uppercase text-[11px] border-b border-rev-black">
                <th className="py-3 px-4 w-16">FOTO</th>
                <th className="py-3 px-4">NOME & SLUG</th>
                <th className="py-3 px-4">FUNÇÃO / PAPEL</th>
                <th className="py-3 px-4">MINI-BIOGRAFIA</th>
                <th className="py-3 px-4 text-right">AÇÕES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {!isLoaded ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-neutral-500">
                    Carregando quadro de autores...
                  </td>
                </tr>
              ) : authors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-neutral-500">
                    Nenhum autor cadastrado até o momento.
                  </td>
                </tr>
              ) : (
                authors.map((author) => (
                  <tr key={author.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="relative w-10 h-10 border border-rev-black bg-white overflow-hidden">
                        <Image
                          src={author.avatar_url || '/logo.webp'}
                          alt={author.name}
                          fill
                          className="object-contain p-0.5 filter grayscale"
                        />
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-rev-black text-sm">{author.name}</div>
                      <div className="text-[10px] text-neutral-500">/{author.slug}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="bg-neutral-200 text-neutral-900 px-2.5 py-1 text-[10px] font-bold uppercase border border-neutral-400 inline-block">
                        {author.role}
                      </span>
                    </td>

                    <td className="py-3 px-4 max-w-md">
                      <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                        {author.bio || 'Sem biografia cadastrada.'}
                      </p>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(author)}
                          className="btn-brutalist !py-1 !px-2.5 !text-[11px] inline-flex items-center gap-1 cursor-pointer"
                          title="Editar autor"
                        >
                          <Edit2 className="w-3 h-3 text-neutral-700" />
                          <span>EDITAR</span>
                        </button>

                        <button
                          onClick={() => handleDelete(author.id, author.name)}
                          className="btn-brutalist !bg-neutral-100 hover:!bg-rev-red hover:!text-white !py-1 !px-2.5 !text-[11px] inline-flex items-center gap-1 cursor-pointer"
                          title="Excluir autor"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>EXCLUIR</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Link para visualização pública */}
        <div className="mt-8 flex items-center justify-between text-xs text-neutral-500">
          <span>ALTERAÇÕES REFLETEM IMEDIATAMENTE NA PÁGINA PÚBLICA /autores</span>
          <Link href="/autores" className="text-rev-red font-bold hover:underline">
            VER PÁGINA PÚBLICA DE AUTORES →
          </Link>
        </div>
      </div>

      {/* MODAL BRUTALISTA DE INCLUSÃO / EDIÇÃO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white border-2 border-rev-black w-full max-w-xl p-6 sm:p-8 shadow-[8px_8px_0px_#111111]">
            <div className="flex items-center justify-between border-b-2 border-rev-black pb-3 mb-6">
              <h2 className="font-display font-black text-xl uppercase tracking-tight text-rev-black">
                {editingId ? 'EDITAR AUTOR / TRADUTOR' : 'NOVO AUTOR / TRADUTOR'}
              </h2>
              <button
                onClick={closeModal}
                className="btn-brutalist !p-1.5 !bg-rev-black !text-white hover:!bg-rev-red cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-rev-black block">
                  NOME COMPLETO*:
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Carlos Marighella"
                  className="w-full px-3 py-2 border border-rev-black text-xs font-mono focus:ring-2 focus:ring-rev-red outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-rev-black block">
                  FUNÇÃO / PAPEL EDITORIAL*:
                </label>
                <div className="flex gap-2">
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="flex-1 px-3 py-2 border border-rev-black text-xs font-mono bg-white focus:ring-2 focus:ring-rev-red outline-none"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Ou digite outra função..."
                    className="flex-1 px-3 py-2 border border-rev-black text-xs font-mono focus:ring-2 focus:ring-rev-red outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-rev-black block">
                  MINI-BIOGRAFIA / NOTA EDITORIAL:
                </label>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Trajetória política, áreas de pesquisa ou atribuição no conselho..."
                  className="w-full px-3 py-2 border border-rev-black text-xs font-mono focus:ring-2 focus:ring-rev-red outline-none leading-relaxed"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-rev-black block">
                  URL DA FOTO / AVATAR (OPCIONAL):
                </label>
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://... ou deixe em branco para logotipo padrão"
                  className="w-full px-3 py-2 border border-rev-black text-xs font-mono focus:ring-2 focus:ring-rev-red outline-none"
                />
                <span className="text-[10px] text-neutral-500 block">
                  Caso não preencha, o sistema utiliza o logotipo oficial como avatar padrão.
                </span>
              </div>

              <div className="pt-4 border-t border-neutral-300 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn-brutalist !bg-neutral-100 !py-2 !px-4 !text-xs cursor-pointer"
                >
                  CANCELAR
                </button>

                <button
                  type="submit"
                  className="btn-brutalist !bg-rev-red !text-white hover:!bg-rev-black !py-2 !px-5 !text-xs cursor-pointer"
                >
                  {editingId ? 'SALVAR ALTERAÇÕES →' : 'CADASTRAR AUTOR →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
