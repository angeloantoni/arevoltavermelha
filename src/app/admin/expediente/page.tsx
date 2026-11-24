'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, FileText, Users, Save, Check, AlertCircle, ExternalLink, Loader2 } from 'lucide-react';
import LogoutButton from '../LogoutButton';
import { ExpedienteData, DEFAULT_EXPEDIENTE } from '@/lib/expedienteTypes';

export default function AdminExpedientePage() {
  const [formData, setFormData] = useState<ExpedienteData>(DEFAULT_EXPEDIENTE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/expediente')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data === 'object') {
          setFormData((prev) => ({ ...prev, ...data }));
        }
      })
      .catch((err) => console.error('Erro ao carregar expediente:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field: keyof ExpedienteData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/expediente', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao salvar expediente.');
      }

      setFeedback('Expediente editorial atualizado com sucesso no site!');
      setTimeout(() => setFeedback(null), 3500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao salvar dados.';
      setError(msg);
    } finally {
      setSaving(false);
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
              GESTÃO DO EXPEDIENTE
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/sobre"
              target="_blank"
              className="btn-brutalist !bg-white !text-rev-black hover:!bg-rev-black hover:!text-white flex items-center gap-2 !text-xs cursor-pointer"
            >
              <span>VER EXPEDIENTE NO SITE</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
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
            className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral-600 hover:text-rev-black flex items-center gap-2 border-b-2 border-transparent transition-all whitespace-nowrap"
          >
            <Users className="w-4 h-4" />
            <span>GESTÃO DE AUTORES & TRADUTORES</span>
          </Link>

          <Link
            href="/admin/expediente"
            className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-rev-red border-b-2 border-rev-red flex items-center gap-2 bg-neutral-100 transition-all whitespace-nowrap"
          >
            <BookOpen className="w-4 h-4 text-rev-red" />
            <span>GESTÃO DO EXPEDIENTE</span>
          </Link>
        </div>

        {/* Notificações */}
        {feedback && (
          <div className="mb-6 p-4 bg-rev-black text-white text-xs border border-rev-red flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-rev-red" />
            <span>{feedback}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-rev-red text-rev-red text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Formulário do Expediente */}
        {loading ? (
          <div className="p-12 text-center text-xs text-neutral-500 border border-rev-black bg-white">
            Carregando dados do expediente...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border border-rev-black bg-white p-6 sm:p-8 shadow-[4px_4px_0px_#111111] space-y-6">
              <div className="border-b border-rev-black pb-3">
                <h2 className="font-display font-black text-xl uppercase text-rev-black">
                  CORPO DIRETIVO & NÚCLEOS DE TRABALHO
                </h2>
                <p className="text-xs text-neutral-600 mt-1">
                  Estes dados são exibidos publicamente na seção de Expediente oficial da revista.
                </p>
              </div>

              {/* Seção 1: Direção Política e Editorial */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-rev-black block">
                    DIREÇÃO POLÍTICA E EDITORIAL (ÓRGÃO / ENTIDADE)*:
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.direcao_politica}
                    onChange={(e) => handleChange('direcao_politica', e.target.value)}
                    className="w-full px-3 py-2 border border-rev-black text-xs focus:ring-2 focus:ring-rev-red outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-rev-black block">
                    COMPOSIÇÃO / LOCALIDADE:
                  </label>
                  <input
                    type="text"
                    value={formData.direcao_politica_desc}
                    onChange={(e) => handleChange('direcao_politica_desc', e.target.value)}
                    className="w-full px-3 py-2 border border-rev-black text-xs focus:ring-2 focus:ring-rev-red outline-none"
                  />
                </div>
              </div>

              {/* Seção 2: Conselho Editorial */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-rev-black block">
                    CONSELHO EDITORIAL*:
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.conselho_editorial}
                    onChange={(e) => handleChange('conselho_editorial', e.target.value)}
                    className="w-full px-3 py-2 border border-rev-black text-xs focus:ring-2 focus:ring-rev-red outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-rev-black block">
                    ATRIBUIÇÕES DO CONSELHO:
                  </label>
                  <input
                    type="text"
                    value={formData.conselho_editorial_desc}
                    onChange={(e) => handleChange('conselho_editorial_desc', e.target.value)}
                    className="w-full px-3 py-2 border border-rev-black text-xs focus:ring-2 focus:ring-rev-red outline-none"
                  />
                </div>
              </div>

              {/* Seção 3: Edição de Artigos de Opinião */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-rev-black block">
                    EDIÇÃO DE ARTIGOS DE OPINIÃO*:
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.artigos_opiniao}
                    onChange={(e) => handleChange('artigos_opiniao', e.target.value)}
                    className="w-full px-3 py-2 border border-rev-black text-xs focus:ring-2 focus:ring-rev-red outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-rev-black block">
                    REGIME DE REVISÃO:
                  </label>
                  <input
                    type="text"
                    value={formData.artigos_opiniao_desc}
                    onChange={(e) => handleChange('artigos_opiniao_desc', e.target.value)}
                    className="w-full px-3 py-2 border border-rev-black text-xs focus:ring-2 focus:ring-rev-red outline-none"
                  />
                </div>
              </div>

              {/* Seção 4: Núcleo de Traduções */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-rev-black block">
                    NÚCLEO DE TRADUÇÕES*:
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.traducoes}
                    onChange={(e) => handleChange('traducoes', e.target.value)}
                    className="w-full px-3 py-2 border border-rev-black text-xs focus:ring-2 focus:ring-rev-red outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-rev-black block">
                    ESCOPO DE TRADUÇÃO:
                  </label>
                  <input
                    type="text"
                    value={formData.traducoes_desc}
                    onChange={(e) => handleChange('traducoes_desc', e.target.value)}
                    className="w-full px-3 py-2 border border-rev-black text-xs focus:ring-2 focus:ring-rev-red outline-none"
                  />
                </div>
              </div>

              {/* Seção 5: Pesquisa Histórica & Levante de 1935 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-rev-black block">
                    NÚCLEO DE PESQUISA HISTÓRICA*:
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.pesquisa_historica}
                    onChange={(e) => handleChange('pesquisa_historica', e.target.value)}
                    className="w-full px-3 py-2 border border-rev-black text-xs focus:ring-2 focus:ring-rev-red outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-rev-black block">
                    LINHA DE PESQUISA:
                  </label>
                  <input
                    type="text"
                    value={formData.pesquisa_historica_desc}
                    onChange={(e) => handleChange('pesquisa_historica_desc', e.target.value)}
                    className="w-full px-3 py-2 border border-rev-black text-xs focus:ring-2 focus:ring-rev-red outline-none"
                  />
                </div>
              </div>

              {/* Seção 6: Contato para Submissões */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-rev-black block">
                    E-MAIL / CANAL DE SUBMISSÕES*:
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.contato_submissoes}
                    onChange={(e) => handleChange('contato_submissoes', e.target.value)}
                    className="w-full px-3 py-2 border border-rev-black text-xs focus:ring-2 focus:ring-rev-red outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-rev-black block">
                    INSTRUÇÕES DE FLUXO:
                  </label>
                  <input
                    type="text"
                    value={formData.contato_submissoes_desc}
                    onChange={(e) => handleChange('contato_submissoes_desc', e.target.value)}
                    className="w-full px-3 py-2 border border-rev-black text-xs focus:ring-2 focus:ring-rev-red outline-none"
                  />
                </div>
              </div>

              {/* Seção 7: Nota de Fechamento */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-rev-black block">
                  DECLARAÇÃO INSTITUCIONAL DE SUSTENTAÇÃO:
                </label>
                <textarea
                  rows={2}
                  value={formData.notas_finais}
                  onChange={(e) => handleChange('notas_finais', e.target.value)}
                  className="w-full px-3 py-2 border border-rev-black text-xs focus:ring-2 focus:ring-rev-red outline-none"
                />
              </div>
            </div>

            {/* Botão de Gravação */}
            <div className="flex items-center justify-end gap-4">
              <Link href="/admin" className="text-xs font-mono text-neutral-600 hover:underline">
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="btn-brutalist !bg-rev-red !text-white hover:!bg-rev-black !px-6 !py-3 !text-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>SALVANDO EXPEDIENTE...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>SALVAR EXPEDIENTE EDITORIAL →</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
