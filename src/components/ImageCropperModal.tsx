'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Check, ZoomIn, ZoomOut, Sparkles, Loader2, Move } from 'lucide-react';

interface ImageCropperModalProps {
  isOpen: boolean;
  imageSrc: string;
  onConfirm: (croppedBlob: Blob) => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

const VIEWPORT_SIZE = 240; // 240px x 240px conforme especificação
const OUTPUT_SIZE = 400; // 400px x 400px conforme especificação

export default function ImageCropperModal({
  isOpen,
  imageSrc,
  onConfirm,
  onCancel,
  isProcessing = false,
}: ImageCropperModalProps) {
  const [zoom, setZoom] = useState<number>(1);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isGrayscale, setIsGrayscale] = useState<boolean>(true); // Ativo por padrão na estética do jornal
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [imgDimensions, setImgDimensions] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  const imgRef = useRef<HTMLImageElement | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const initialOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Calcula escala base para cobrir o viewport de 240x240
  const getBaseScale = useCallback(() => {
    if (!imgDimensions.width || !imgDimensions.height) return 1;
    return Math.max(
      VIEWPORT_SIZE / imgDimensions.width,
      VIEWPORT_SIZE / imgDimensions.height
    );
  }, [imgDimensions]);

  const currentScale = getBaseScale() * zoom;

  // Carrega a imagem e inicializa posição centralizada
  useEffect(() => {
    if (!imageSrc || !isOpen) return;

    setImageLoaded(false);
    setZoom(1);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imgRef.current = img;
      setImgDimensions({ width: img.naturalWidth, height: img.naturalHeight });

      const baseScale = Math.max(
        VIEWPORT_SIZE / img.naturalWidth,
        VIEWPORT_SIZE / img.naturalHeight
      );
      const renderedW = img.naturalWidth * baseScale;
      const renderedH = img.naturalHeight * baseScale;

      setOffset({
        x: (VIEWPORT_SIZE - renderedW) / 2,
        y: (VIEWPORT_SIZE - renderedH) / 2,
      });
      setImageLoaded(true);
    };
    img.src = imageSrc;
  }, [imageSrc, isOpen]);

  // Função para limitar o arraste dentro dos limites de cobertura do viewport
  const clampOffset = useCallback(
    (newX: number, newY: number, scale: number) => {
      const renderedW = imgDimensions.width * scale;
      const renderedH = imgDimensions.height * scale;

      const minX = VIEWPORT_SIZE - renderedW;
      const maxX = 0;
      const minY = VIEWPORT_SIZE - renderedH;
      const maxY = 0;

      return {
        x: Math.min(maxX, Math.max(minX, newX)),
        y: Math.min(maxY, Math.max(minY, newY)),
      };
    },
    [imgDimensions]
  );

  // Trata alteração de zoom mantendo o centro do enquadramento
  const handleZoomChange = (newZoom: number) => {
    if (!imageLoaded || !imgDimensions.width) return;

    const baseScale = getBaseScale();
    const oldScale = baseScale * zoom;
    const nextScale = baseScale * newZoom;

    // Ponto central do viewport em coordenadas da imagem
    const centerImgX = (VIEWPORT_SIZE / 2 - offset.x) / oldScale;
    const centerImgY = (VIEWPORT_SIZE / 2 - offset.y) / oldScale;

    const nextOffsetX = VIEWPORT_SIZE / 2 - centerImgX * nextScale;
    const nextOffsetY = VIEWPORT_SIZE / 2 - centerImgY * nextScale;

    setZoom(newZoom);
    setOffset(clampOffset(nextOffsetX, nextOffsetY, nextScale));
  };

  // --- Controles de Arraste com Mouse (Desktop) ---
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    initialOffsetRef.current = { ...offset };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setOffset(
      clampOffset(
        initialOffsetRef.current.x + dx,
        initialOffsetRef.current.y + dy,
        currentScale
      )
    );
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // --- Controles de Arraste com Toque (Mobile) ---
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    initialOffsetRef.current = { ...offset };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragStartRef.current.x;
    const dy = e.touches[0].clientY - dragStartRef.current.y;
    setOffset(
      clampOffset(
        initialOffsetRef.current.x + dx,
        initialOffsetRef.current.y + dy,
        currentScale
      )
    );
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
  };

  // Exportação via Canvas 400x400 e geração de Blob JPEG
  const handleConfirmCrop = () => {
    if (!imgRef.current || !imageLoaded) return;

    const canvas = document.createElement('canvas');
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Coordenadas da região visível na imagem original
    const sx = -offset.x / currentScale;
    const sy = -offset.y / currentScale;
    const sWidth = VIEWPORT_SIZE / currentScale;
    const sHeight = VIEWPORT_SIZE / currentScale;

    // Aplicação do filtro P&B Editorial de Alto Contraste
    if (isGrayscale) {
      try {
        ctx.filter = 'grayscale(100%) contrast(125%)';
        ctx.drawImage(imgRef.current, sx, sy, sWidth, sHeight, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
        ctx.filter = 'none';
      } catch {
        ctx.drawImage(imgRef.current, sx, sy, sWidth, sHeight, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
        // Fallback manual de manipulação de pixels caso ctx.filter não seja suportado
        const imgData = ctx.getImageData(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 4) {
          const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
          // Contraste aumentado (fator 1.25)
          const c = Math.min(255, Math.max(0, (gray - 128) * 1.25 + 128));
          d[i] = c;
          d[i + 1] = c;
          d[i + 2] = c;
        }
        ctx.putImageData(imgData, 0, 0);
      }
    } else {
      ctx.drawImage(imgRef.current, sx, sy, sWidth, sHeight, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
    }

    // Exportação do Blob JPEG com qualidade 0.9
    canvas.toBlob(
      (blob) => {
        if (blob) {
          onConfirm(blob);
        }
      },
      'image/jpeg',
      0.9
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-black/80 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white border-2 border-rev-black shadow-[8px_8px_0px_#C81E1E] w-full max-w-md p-6 font-mono text-xs">
        {/* Barra de Título */}
        <div className="flex items-center justify-between border-b-2 border-rev-black pb-3 mb-5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-rev-red inline-block" />
            <h3 className="font-display font-black text-sm uppercase text-rev-black">
              ENQUADRAMENTO DE FOTO (1:1)
            </h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="text-neutral-500 hover:text-rev-black cursor-pointer disabled:opacity-50"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Instrução rápida */}
        <p className="text-[11px] text-neutral-600 mb-4 leading-relaxed">
          Arraste a foto com o mouse ou toque para posicionar o rosto. Ajuste o zoom abaixo para o enquadramento ideal.
        </p>

        {/* Área de Visualização e Recorte (240x240) */}
        <div className="flex flex-col items-center justify-center mb-5">
          <div
            style={{ width: `${VIEWPORT_SIZE}px`, height: `${VIEWPORT_SIZE}px` }}
            className="relative border-2 border-rev-black bg-neutral-950 overflow-hidden select-none cursor-grab active:cursor-grabbing shadow-[4px_4px_0px_#111111]"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {imageLoaded && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={imageSrc}
                alt="Para recorte"
                draggable={false}
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  width: `${imgDimensions.width * currentScale}px`,
                  height: `${imgDimensions.height * currentScale}px`,
                  transform: `translate(${offset.x}px, ${offset.y}px)`,
                  filter: isGrayscale ? 'grayscale(100%) contrast(125%)' : 'none',
                  maxWidth: 'none',
                  maxHeight: 'none',
                  userSelect: 'none',
                  pointerEvents: 'none',
                }}
              />
            )}

            {/* Linhas guia de terços (Grid Brutalista) */}
            <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-white/20">
              <div className="border-r border-b border-white/20" />
              <div className="border-r border-b border-white/20" />
              <div className="border-b border-white/20" />
              <div className="border-r border-b border-white/20" />
              <div className="border-r border-b border-white/20" />
              <div className="border-b border-white/20" />
              <div className="border-r border-white/20" />
              <div className="border-r border-white/20" />
              <div />
            </div>

            {/* Dica de arraste centralizada sobreposta */}
            <div className="absolute bottom-2 right-2 bg-rev-black/80 text-white text-[9px] px-1.5 py-0.5 pointer-events-none flex items-center gap-1">
              <Move className="w-2.5 h-2.5" />
              <span>ARRASTAR</span>
            </div>
          </div>
        </div>

        {/* Controle de Zoom */}
        <div className="space-y-2 mb-4 bg-neutral-50 p-3 border border-rev-black">
          <div className="flex items-center justify-between text-[11px] font-bold text-rev-black">
            <span className="flex items-center gap-1 uppercase">
              <ZoomIn className="w-3.5 h-3.5 text-rev-red" />
              <span>ZOOM / ESCALA:</span>
            </span>
            <span className="text-rev-red font-mono">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ZoomOut className="w-4 h-4 text-neutral-500 shrink-0" />
            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
              className="w-full accent-rev-red cursor-pointer"
            />
            <ZoomIn className="w-4 h-4 text-neutral-500 shrink-0" />
          </div>
        </div>

        {/* Toggle Filtro P&B Editorial */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => setIsGrayscale(!isGrayscale)}
            className={`w-full py-2 px-3 border border-rev-black flex items-center justify-between transition-colors cursor-pointer ${
              isGrayscale
                ? 'bg-neutral-900 text-white'
                : 'bg-white text-neutral-800 hover:bg-neutral-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles className={`w-3.5 h-3.5 ${isGrayscale ? 'text-rev-red' : 'text-neutral-400'}`} />
              <span className="font-bold uppercase text-[11px]">
                APLICAR FILTRO P&B EDITORIAL
              </span>
            </div>
            <span
              className={`px-2 py-0.5 text-[9px] font-bold uppercase border ${
                isGrayscale
                  ? 'bg-rev-red text-white border-rev-red'
                  : 'bg-neutral-200 text-neutral-600 border-neutral-300'
              }`}
            >
              {isGrayscale ? 'ATIVADO' : 'DESATIVADO'}
            </span>
          </button>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="btn-brutalist !bg-neutral-100 !text-neutral-700 hover:!bg-neutral-200"
          >
            CANCELAR
          </button>

          <button
            type="button"
            onClick={handleConfirmCrop}
            disabled={isProcessing || !imageLoaded}
            className="btn-brutalist !bg-rev-red !text-white hover:!bg-rev-black flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>SALVANDO RECORTE...</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>CONFIRMAR RECORTE</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
