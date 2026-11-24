'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Author } from '@/lib/types';
import { CONSELHO_EDITORIAL_UUID } from '@/lib/uuid';
import { Plus, Users, Edit2, Trash2, X, Check, FileText, BookOpen, AlertCircle, Loader2 } from 'lucide-react';
import LogoutButton from '../LogoutButton';
import ImageUploadField from '@/components/ImageUploadField';
import AuthorAvatar from '@/components/AuthorAvatar';

const ROLES = [
  'Autor',
  'Tradutor',
  'Conselho Editorial',
  'Pesquisador Histórico',
  'Colunista Convidado',
];

export default function AdminAutoresPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Campos do formulário
  const [name, setName] = useState('');
  const [role, setRole] = useState('Autor');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchAuthors = useCallback(async () => {
    try {
      const res = await fetch('/api/authors');
      const data = await res.json();
      if (Array.isArray(data)) {
        setAuthors(data);
      }
    } catch (err) {
      console.error('Erro ao listar autores:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAuthors();
  }, [fetchAuthors]);

  const openCreateModal = () => {
    setEditingId(null);
    setName('');
    setRole('Autor');
    setBio('');
    setAvatarUrl('');
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (author: Author) => {
    setEditingId(author.id);
    setName(author.name);
    setRole(author.role);
    setBio(author.bio || '');
    setAvatarUrl(author.avatar_url || '');
    setError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Informe o nome do autor.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload = {
        name: name.trim(),
        role,
        bio: bio.trim(),
        avatar_url: avatarUrl.trim() || (name.toLowerCase().includes('conselho') ? '/logo.webp' : null),
      };

      const url = editingId ? `/api/authors/${editingId}` : '/api/authors';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao salvar autor no banco.');
      }

      await fetchAuthors();
      setFeedback(editingId ? 'Autor atualizado com sucesso!' : 'Novo autor cadastrado no banco com sucesso!');
      setTimeout(() => setFeedback(null), 3000);
      closeModal();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha na gravação do autor.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, authorName: string) => {
    if (id === CONSELHO_EDITORIAL_UUID) {
      alert('O Conselho Editorial é o registro permanente da revista e não pode ser excluído.');
      return;
    }

    if (!confirm(`Tem certeza que deseja excluir "${authorName}" do quadro de autores no banco?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/authors/${id}`, { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao excluir autor.');
      }

      await fetchAuthors();
      setFeedback(`Autor "${authorName}" excluído do banco com sucesso.`);
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha na exclusão do autor.';
      alert(`Erro: ${msg}`);
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
        <div className="flex items-center gap-2 border-b border-rev-black mb-8 overflow-x-auto">
          <Link
            href="/admin"
            className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral-600 hover:text-rev-black flex items-center gap-2 border-b-2 border-transparent transition-all whitespace-nowrap"
          >
            <FileText className="w-4 h-4" />
            <span>GESTÃO DE ARTIGOS</span>
          </Link>

          <Link
            href="/admin/autores"
            className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-rev-red border-b-2 border-rev-red flex items-center gap-2 bg-neutral-100 transition-all whitespace-nowrap"
          >
            <Users className="w-4 h-4 text-rev-red" />
            <span>GESTÃO DE AUTORES & TRADUTORES ({authors.length})</span>
          </Link>

          <Link
            href="/admin/expediente"
            className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral-600 hover:text-rev-black flex items-center gap-2 border-b-2 border-transparent transition-all whitespace-nowrap"
          >
            <BookOpen className="w-4 h-4" />
            <span>GESTÃO DO EXPEDIENTE</span>
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
                <th className="py-3 px-4">FOTO</th>
                <th className="py-3 px-4">NOME & SLUG</th>
                <th className="py-3 px-4">FUNÇÃO EDITORIAL</th>
                <th className="py-3 px-4">UUID DO BANCO</th>
                <th className="py-3 px-4 text-right">AÇÕES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-neutral-500 font-mono">
                    Carregando autores do banco de dados...
                  </td>
                </tr>
              ) : authors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-neutral-500 font-mono">
                    Nenhum autor cadastrado.
                  </td>
                </tr>
              ) : (
                authors.map((author) => {
                  const isPermanent = author.id === CONSELHO_EDITORIAL_UUID;

                  return (
                    <tr key={author.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="py-3 px-4">
                        <AuthorAvatar
                          name={author.name}
                          avatarUrl={author.avatar_url}
                          size="sm"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-rev-black">{author.name}</div>
                        <div className="text-[10px] text-neutral-500">/{author.slug}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-neutral-200 text-neutral-800 px-2 py-0.5 font-bold uppercase text-[10px] border border-neutral-300">
                          {author.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[10px] text-neutral-500 font-mono">
                        {author.id}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(author)}
                            className="btn-brutalist !py-1 !px-2.5 !text-[11px] inline-flex items-center gap-1 cursor-pointer hover:!bg-rev-black hover:!text-white"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>EDITAR</span>
                          </button>
                          {!isPermanent && (
                            <button
                              onClick={() => handleDelete(author.id, author.name)}
                              className="btn-brutalist !py-1 !px-2.5 !text-[11px] inline-flex items-center gap-1 cursor-pointer !bg-white !text-rev-red border-rev-red hover:!bg-rev-red hover:!text-white"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>EXCLUIR</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Modal de Criação / Edição de Autor */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
            <div className="bg-white border-2 border-rev-black shadow-[6px_6px_0px_#C81E1E] w-full max-w-lg p-6 animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-rev-black pb-3 mb-4">
                <div className="font-display font-black text-lg uppercase text-rev-black">
                  {editingId ? 'EDITAR AUTOR / TRADUTOR' : 'CADASTRAR NOVO AUTOR'}
                </div>
                <button
                  onClick={closeModal}
                  className="text-neutral-500 hover:text-rev-black cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-rev-red text-rev-red text-xs font-mono flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
                <div>
                  <label className="block font-bold uppercase text-rev-black mb-1">
                    NOME COMPLETO*:
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Dinarco Reis"
                    className="w-full px-3 py-2 border border-rev-black focus:ring-2 focus:ring-rev-red outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-rev-black mb-1">
                    FUNÇÃO / PAPEL EDITORIAL*:
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 border border-rev-black bg-white focus:ring-2 focus:ring-rev-red outline-none"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <ImageUploadField
                  label="FOTO DE PERFIL / AVATAR (P&B):"
                  value={avatarUrl}
                  onChange={setAvatarUrl}
                  folder="autores"
                  aspectRatio="square"
                  enableCrop={true}
                  targetSlug={name || 'autor'}
                  helpText="Selecione uma foto para enquadrar o rosto (1:1), ajustar o zoom, aplicar filtro P&B e enviar para a subpasta 'imagens_autores' do bucket 'Midia' no Supabase Storage."
                />

                <div>
                  <label className="block font-bold uppercase text-rev-black mb-1">
                    MINIBIOGRAFIA POLÍTICA:
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Breve trajetória histórica, filiação teórica ou papel militante..."
                    className="w-full px-3 py-2 border border-rev-black focus:ring-2 focus:ring-rev-red outline-none"
                  />
                </div>

                <div className="pt-4 border-t border-neutral-200 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="btn-brutalist !bg-neutral-100 !text-neutral-700 hover:!bg-neutral-200"
                  >
                    CANCELAR
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-brutalist !bg-rev-red !text-white hover:!bg-rev-black flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>GRAVANDO NO BANCO...</span>
                      </>
                    ) : (
                      <span>{editingId ? 'SALVAR ALTERAÇÕES' : 'CADASTRAR NO BANCO'}</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
