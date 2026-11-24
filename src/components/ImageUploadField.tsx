'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, X, Loader2, Link as LinkIcon, Check, Image as ImageIcon, Crop } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import ImageCropperModal from './ImageCropperModal';

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  aspectRatio?: 'video' | 'square';
  helpText?: string;
  enableCrop?: boolean;
  targetSlug?: string;
}

export default function ImageUploadField({
  label,
  value,
  onChange,
  folder = 'geral',
  aspectRatio = 'video',
  helpText,
  enableCrop,
  targetSlug,
}: ImageUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Estados do Modal de Recorte Interativo (1:1)
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string>('');

  const shouldCrop = enableCrop !== undefined ? enableCrop : (aspectRatio === 'square');

  const executeUpload = async (fileOrBlob: File | Blob, desiredName?: string) => {
    setUploading(true);
    setError(null);
    setSuccessMsg(null);

    const cleanSlug = targetSlug
      ? targetSlug.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
      : 'imagem';

    let filePath: string;
    let fileNameOnly: string;

    if (desiredName) {
      filePath = desiredName;
      fileNameOnly = desiredName.split('/').pop() || `${Date.now()}-${cleanSlug}.jpg`;
    } else if (fileOrBlob instanceof File && fileOrBlob.name) {
      const cleanOriginal = fileOrBlob.name.toLowerCase().replace(/[^a-z0-9.-]/g, '-') || 'imagem.jpg';
      fileNameOnly = `${Date.now()}-${cleanOriginal}`;
      filePath = `${folder ? `${folder}/` : ''}${fileNameOnly}`;
    } else {
      fileNameOnly = `${Date.now()}-${cleanSlug || 'recorte'}.jpg`;
      filePath = `${folder ? `${folder}/` : ''}${fileNameOnly}`;
    }

    try {
      const contentType = fileOrBlob.type || 'image/jpeg';

      // 1. Tentar upload direto no Supabase Storage (bucket 'midia')
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error: uploadError } = await supabase.storage
            .from('midia')
            .upload(filePath, fileOrBlob, {
              contentType,
              cacheControl: '3600',
              upsert: true,
            });

          if (!uploadError && data) {
            const { data: publicData } = supabase.storage
              .from('midia')
              .getPublicUrl(filePath);

            if (publicData?.publicUrl) {
              onChange(publicData.publicUrl);
              setSuccessMsg('Upload concluído com sucesso no Supabase Storage!');
              setTimeout(() => setSuccessMsg(null), 3000);
              return true;
            }
          } else if (uploadError) {
            console.warn('Supabase Storage direto falhou, tentando rota da API:', uploadError.message);
          }
        } catch (supabaseErr) {
          console.warn('Falha na tentativa direta do Supabase:', supabaseErr);
        }
      }

      // 2. Fallback via endpoint do servidor (/api/upload)
      const fileToSend = fileOrBlob instanceof File
        ? fileOrBlob
        : new File([fileOrBlob], fileNameOnly, { type: contentType });

      const formData = new FormData();
      formData.append('file', fileToSend);
      if (folder) formData.append('folder', folder);
      if (filePath) formData.append('filePath', filePath);
      if (targetSlug) formData.append('slug', targetSlug);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();

      if (!res.ok || !json.url) {
        throw new Error(json.error || 'Falha ao processar upload da imagem.');
      }

      onChange(json.url);
      setSuccessMsg('Upload concluído com sucesso!');
      setTimeout(() => setSuccessMsg(null), 3000);
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao realizar upload.';
      setError(msg);
      return false;
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validação básica de tipo
    if (!file.type.startsWith('image/')) {
      setError('Selecione um arquivo de imagem válido (PNG, JPG, WEBP, etc.).');
      return;
    }

    // Limite razoável de 15MB
    if (file.size > 15 * 1024 * 1024) {
      setError('O tamanho da imagem não deve exceder 15MB.');
      return;
    }

    setError(null);
    setSuccessMsg(null);

    // Se recorte estiver ativado (padrão para autores / proporção 1:1), abre o modal de enquadramento
    if (shouldCrop) {
      const previewUrl = URL.createObjectURL(file);
      setCropImageSrc(previewUrl);
      setIsCropperOpen(true);
      return;
    }

    // Caso contrário, executa upload direto do arquivo original
    await executeUpload(file);
  };

  // Confirmação do recorte via Canvas (recebe Blob 400x400)
  const handleCropperConfirm = async (croppedBlob: Blob) => {
    const cleanSlug = targetSlug
      ? targetSlug.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
      : 'autor';
    const filePath = `${folder ? `${folder}/` : ''}${Date.now()}-${cleanSlug || 'autor'}.jpg`;

    const success = await executeUpload(croppedBlob, filePath);
    if (success) {
      if (cropImageSrc.startsWith('blob:')) {
        URL.revokeObjectURL(cropImageSrc);
      }
      setIsCropperOpen(false);
      setCropImageSrc('');
    }
  };

  const handleCropperCancel = () => {
    if (cropImageSrc.startsWith('blob:')) {
      URL.revokeObjectURL(cropImageSrc);
    }
    setIsCropperOpen(false);
    setCropImageSrc('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClear = () => {
    onChange('');
    setError(null);
    setSuccessMsg(null);
  };

  const handleOpenExistingCrop = () => {
    if (!value) return;
    setCropImageSrc(value);
    setIsCropperOpen(true);
  };

  return (
    <div className="space-y-2 font-mono text-xs">
      <div className="flex items-center justify-between">
        <label className="font-bold uppercase text-rev-black block">{label}</label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[10px] text-neutral-500 hover:text-rev-black flex items-center gap-1 underline cursor-pointer"
        >
          <LinkIcon className="w-3 h-3" />
          <span>{showUrlInput ? 'Ocultar campo de URL' : 'Ou colar URL externa'}</span>
        </button>
      </div>

      {helpText && <p className="text-[11px] text-neutral-500">{helpText}</p>}

      {/* Caixa de Ações de Upload Brutalista */}
      <div className="border border-rev-black bg-neutral-50 p-3 sm:p-4 shadow-[2px_2px_0px_#111111] space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Input de arquivo invisível acionado pelo botão brutalista */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="btn-brutalist !bg-rev-red !text-white hover:!bg-rev-black flex items-center justify-center gap-2 !py-2.5 !px-4 cursor-pointer disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>ENVIANDO PARA STORAGE...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>ENVIAR IMAGEM DO DISPOSITIVO</span>
              </>
            )}
          </button>

          {value && (
            <div className="flex items-center gap-2">
              {shouldCrop && (
                <button
                  type="button"
                  onClick={handleOpenExistingCrop}
                  disabled={uploading}
                  className="btn-brutalist !bg-neutral-800 !text-white hover:!bg-rev-black flex items-center justify-center gap-1.5 !py-2.5 !px-3"
                  title="Ajustar enquadramento e recorte da imagem"
                >
                  <Crop className="w-3.5 h-3.5 text-rev-red" />
                  <span>AJUSTAR ENQUADRAMENTO</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleClear}
                className="btn-brutalist !bg-white !text-neutral-700 hover:!bg-neutral-200 flex items-center justify-center gap-1.5 !py-2.5 !px-3"
                title="Remover imagem atual"
              >
                <X className="w-3.5 h-3.5" />
                <span>REMOVER FOTO</span>
              </button>
            </div>
          )}
        </div>

        {/* Notificações de Erro e Sucesso */}
        {error && (
          <div className="p-2.5 bg-red-50 border border-rev-red text-rev-red text-[11px]">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="p-2.5 bg-green-50 border border-green-700 text-green-900 text-[11px] flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-green-700" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Campo opcional para colar URL externa */}
        {showUrlInput && (
          <div className="pt-2 border-t border-neutral-200 space-y-1">
            <span className="text-[10px] text-neutral-500 uppercase block">URL DIRETA:</span>
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://exemplo.com/foto.jpg"
              className="w-full px-3 py-2 border border-rev-black bg-white text-xs focus:ring-2 focus:ring-rev-red outline-none"
            />
          </div>
        )}

        {/* Pré-visualização da Imagem */}
        {value ? (
          <div className="pt-2">
            <div className="text-[10px] text-neutral-500 uppercase mb-1.5 flex items-center gap-1">
              <ImageIcon className="w-3 h-3 text-rev-red" />
              <span>PRÉ-VISUALIZAÇÃO DA IMAGEM ATUAL:</span>
            </div>
            <div
              className={`relative border-2 border-rev-black bg-neutral-200 overflow-hidden shadow-[2px_2px_0px_#111111] ${
                aspectRatio === 'square'
                  ? 'w-24 h-24 sm:w-28 sm:h-28'
                  : 'w-full max-w-sm aspect-[16/10]'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={value}
                alt="Preview da imagem"
                className="w-full h-full object-cover filter grayscale contrast-125"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                  setError('Aviso: Não foi possível carregar a imagem desta URL externa.');
                }}
              />
            </div>
            <div className="text-[10px] text-neutral-500 truncate mt-1 max-w-md">
              Origem: <code className="bg-neutral-200 px-1 py-0.5">{value}</code>
            </div>
          </div>
        ) : (
          <div className="text-[11px] text-neutral-400 italic pt-1">
            Nenhuma imagem selecionada. Envie um arquivo ou informe uma URL.
          </div>
        )}
      </div>

      {/* Modal Interativo de Recorte e Enquadramento 1:1 */}
      {isCropperOpen && (
        <ImageCropperModal
          isOpen={isCropperOpen}
          imageSrc={cropImageSrc}
          onConfirm={handleCropperConfirm}
          onCancel={handleCropperCancel}
          isProcessing={uploading}
        />
      )}
    </div>
  );
}
