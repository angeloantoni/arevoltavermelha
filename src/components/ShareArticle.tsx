'use client';

import React, { useState } from 'react';
import { Share2, MessageCircle, Copy, Check, Download, Sparkles } from 'lucide-react';
import { Article } from '@/lib/types';

interface ShareArticleProps {
  article: Article;
}

export default function ShareArticle({ article }: ShareArticleProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const getArticleUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.href;
    }
    return `https://arevoltavermelha.com.br/artigo/${article.slug}`;
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getArticleUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      setCopied(false);
    }
  };

  const handleShareWhatsApp = () => {
    const text = `*${article.title}*\n${article.subtitle ? `_${article.subtitle}_\n\n` : '\n'}Leia este artigo na revista A Revolta Vermelha:\n${getArticleUrl()}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleShareTwitter = () => {
    const text = `${article.title} — via @arevoltavermelha`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(getArticleUrl())}`;
    window.open(url, '_blank');
  };

  // Helper para carregar imagens de forma segura com crossOrigin
  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Falha ao carregar imagem: ${src}`));
      img.src = src;
    });
  };

  // Helper para desenhar retângulos com cantos arredondados
  const drawRoundedRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  };

  // Função central de renderização do Card 1080x1920 baseada em modelo.webp
  const renderCardCanvas = async (): Promise<HTMLCanvasElement> => {
    try {
      await document.fonts.ready;
    } catch {
      // continua caso fonts.ready falhe
    }

    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Não foi possível obter contexto 2D do Canvas.');
    }

    // 1. FUNDO EXTERNO ESCURO (#111111)
    ctx.fillStyle = '#111111';
    ctx.fillRect(0, 0, 1080, 1920);

    // 2. MARCAS CONSTRUTIVISTAS E REGISTROS MILIMÉTRICOS
    ctx.strokeStyle = '#262626';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(36, 36, 1008, 1848);

    // Ticks centrais verticais e horizontais em vermelho (#C81E1E)
    ctx.strokeStyle = '#C81E1E';
    ctx.lineWidth = 2;

    // Top & Bottom ticks
    ctx.beginPath();
    ctx.moveTo(540, 12);
    ctx.lineTo(540, 44);
    ctx.moveTo(540, 1876);
    ctx.lineTo(540, 1908);
    // Left & Right ticks
    ctx.moveTo(12, 960);
    ctx.lineTo(44, 960);
    ctx.moveTo(1036, 960);
    ctx.lineTo(1068, 960);
    ctx.stroke();

    // Cantoneiras construtivistas vermelhas
    // Top-Left L-bracket
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(60, 100);
    ctx.lineTo(60, 60);
    ctx.lineTo(100, 60);
    ctx.stroke();

    // Top-Right faixas diagonais
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const sx = 940 + i * 14;
      ctx.moveTo(sx, 60);
      ctx.lineTo(sx + 10, 75);
    }
    ctx.stroke();

    // Bottom-Left L-bracket
    ctx.beginPath();
    ctx.moveTo(60, 1820);
    ctx.lineTo(60, 1860);
    ctx.lineTo(100, 1860);
    ctx.stroke();

    // Bottom-Right L-bracket
    ctx.beginPath();
    ctx.moveTo(1020, 1820);
    ctx.lineTo(1020, 1860);
    ctx.lineTo(980, 1860);
    ctx.stroke();

    // 3. TOPO: LOGOTIPO OFICIAL HORIZONTAL COM PROPORÇÃO NATIVA E TRATAMENTO DE COR
    let topSubtitleY = 275;
    try {
      const logoImg = await loadImage('/logo_horizontal.webp');
      const naturalW = logoImg.naturalWidth || logoImg.width;
      const naturalH = logoImg.naturalHeight || logoImg.height;
      const aspectRatio = naturalW / naturalH;

      // Largura alvo de 640px e cálculo automático de altura mantendo proporção nativa
      const targetWidth = 640;
      const targetHeight = targetWidth / aspectRatio;
      const targetX = (1080 - targetWidth) / 2;
      const targetY = 90;

      // Criar offscreen canvas para manipular os pixels e inverter preto para branco
      const offscreen = document.createElement('canvas');
      offscreen.width = naturalW;
      offscreen.height = naturalH;
      const offCtx =
        offscreen.getContext('2d', { willReadFrequently: true }) ||
        offscreen.getContext('2d');

      if (offCtx) {
        offCtx.drawImage(logoImg, 0, 0, naturalW, naturalH);
        const imgData = offCtx.getImageData(0, 0, naturalW, naturalH);
        const data = imgData.data;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          // Se o pixel tiver opacidade
          if (a > 15) {
            // Preservar pixels vermelhos da bandeira e da palavra "VERMELHA" (R > 120 && G < 80)
            const isRed = r > 120 && g < 80;

            if (!isRed) {
              // Converter traços pretos/escuros (R < 80 && G < 80 && B < 80) para branco puro (#FFFFFF)
              if (r < 80 && g < 80 && b < 80) {
                data[i] = 255;
                data[i + 1] = 255;
                data[i + 2] = 255;
              } else if (r < 120 && g < 120 && b < 120) {
                // Suavização de antialiasing escuro
                data[i] = 255;
                data[i + 1] = 255;
                data[i + 2] = 255;
              }
            }
          }
        }

        offCtx.putImageData(imgData, 0, 0);
        ctx.drawImage(offscreen, targetX, targetY, targetWidth, targetHeight);
      } else {
        ctx.drawImage(logoImg, targetX, targetY, targetWidth, targetHeight);
      }

      topSubtitleY = targetY + targetHeight + 30;
    } catch {
      // Fallback tipográfico caso o arquivo falhe
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 44px "Archivo Black", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('A REVOLTA VERMELHA', 540, 180);
      topSubtitleY = 275;
    }

    // Linha de subtítulo do topo
    ctx.fillStyle = '#CCCCCC';
    ctx.font = '700 21px monospace';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '2px';
    ctx.fillText('REVISTA POLÍTICA • EDIÇÃO 2026 • NATAL, RN', 540, topSubtitleY);
    ctx.letterSpacing = '0px';

    // 4. CÁLCULO DINÂMICO DE ESTRUTURA E ALTURA DO CORPO VERMELHO
    const cardX = 95;
    const cardY = topSubtitleY + 45;
    const cardW = 890;

    // 5. TAG PRETA DA CATEGORIA / EDITORIA
    const badgeW = 260;
    const badgeH = 44;
    const badgeX = (1080 - badgeW) / 2;
    const badgeY = cardY + 32;

    // 6. CÁLCULO DAS LINHAS DO TÍTULO PRINCIPAL (ARCHIVO BLACK)
    const titleMaxWidth = 820;
    const words = article.title.toUpperCase().split(' ');
    const titleLines: string[] = [];
    let currentLine = '';

    ctx.font = '900 48px "Archivo Black", sans-serif';
    for (let i = 0; i < words.length; i++) {
      const testLine = currentLine ? `${currentLine} ${words[i]}` : words[i];
      const metrics = ctx.measureText(testLine);
      if (metrics.width > titleMaxWidth && currentLine) {
        titleLines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      titleLines.push(currentLine);
    }

    const titleLineHeight = 58;
    const titleStartY = badgeY + badgeH + 52;
    const titleEndY = titleStartY + (titleLines.length - 1) * titleLineHeight;

    // 7. CÁLCULO DAS LINHAS DO SUBTÍTULO / LINHA FINA
    let subtitleEndY = titleEndY;
    const subLines: string[] = [];
    if (article.subtitle) {
      ctx.font = '700 19px monospace';
      const subWords = article.subtitle.toUpperCase().split(' ');
      let subLine = '';

      for (let i = 0; i < subWords.length; i++) {
        const testSub = subLine ? `${subLine} ${subWords[i]}` : subWords[i];
        if (ctx.measureText(testSub).width > 820 && subLine) {
          subLines.push(subLine);
          subLine = subWords[i];
        } else {
          subLine = testSub;
        }
      }
      if (subLine) subLines.push(subLine);
      subtitleEndY = titleEndY + 36 + (subLines.length - 1) * 28;
    }

    // 8. FOTOGRAFIA DE CAPA
    const photoX = cardX + 35;
    const photoY = subtitleEndY + 25;
    const photoW = cardW - 70;
    const photoH = 500;
    const photoEndY = photoY + photoH;

    // 9. BLOCO INFERIOR DO AUTOR E CITAÇÃO
    const bottomBlockY = photoEndY + 25;

    // Cálculo das linhas da citação
    const dividerX = 540;
    const quoteX = dividerX + 22;
    const maxQuoteW = photoX + photoW - quoteX;

    const quoteText =
      article.category === 'EDITORIAL'
        ? '«A teoria também se converte em força material quando penetra nas massas.»'
        : `«${article.excerpt.slice(0, 85).trim()}...»`;

    ctx.font = '700 16px monospace';
    const qWords = quoteText.split(' ');
    let qLine = '';
    const qLines: string[] = [];

    for (let i = 0; i < qWords.length; i++) {
      const testQ = qLine ? `${qLine} ${qWords[i]}` : qWords[i];
      if (ctx.measureText(testQ).width > maxQuoteW && qLine) {
        qLines.push(qLine);
        qLine = qWords[i];
      } else {
        qLine = testQ;
      }
    }
    if (qLine) qLines.push(qLine);

    // Alturas dos blocos da coluna esquerda e direita
    const authorColBottom = bottomBlockY + 115;
    const quoteColBottom = bottomBlockY + 54 + Math.min(qLines.length, 3) * 24 + 20;
    const blockContentBottom = Math.max(authorColBottom, quoteColBottom);

    // AJUSTE DE ALTURA COM RESPIRO EXATO DE 48px
    const cardH = (blockContentBottom - cardY) + 48;
    const cardBottom = cardY + cardH;

    // DESENHAR O CARD VERMELHO COM A ALTURA EXATA
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 25;
    ctx.shadowOffsetY = 10;
    ctx.fillStyle = '#C81E1E';
    ctx.fillRect(cardX, cardY, cardW, cardH);

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Moldura rígida preta (#111111) de 4px
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 4;
    ctx.strokeRect(cardX, cardY, cardW, cardH);

    // Linha interna de detalhe técnico
    ctx.lineWidth = 1.5;
    ctx.strokeRect(cardX + 8, cardY + 8, cardW - 16, cardH - 16);

    // DESENHAR TAG DA CATEGORIA
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cardX + 25, badgeY + badgeH / 2);
    ctx.lineTo(badgeX - 10, badgeY + badgeH / 2);
    ctx.moveTo(badgeX + badgeW + 10, badgeY + badgeH / 2);
    ctx.lineTo(cardX + cardW - 25, badgeY + badgeH / 2);
    ctx.stroke();

    ctx.fillStyle = '#111111';
    ctx.fillRect(badgeX, badgeY, badgeW, badgeH);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(badgeX, badgeY, badgeW, badgeH);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`[ ${article.category.toUpperCase()} ]`, 540, badgeY + 28);

    // DESENHAR TÍTULO PRINCIPAL (LINHAS ALTERNADAS BRANCO E PRETO)
    titleLines.forEach((line, index) => {
      ctx.fillStyle = index === 0 ? '#FFFFFF' : '#111111';
      ctx.font = '900 48px "Archivo Black", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(line, 540, titleStartY + index * titleLineHeight);
    });

    // DESENHAR SUBTÍTULO
    if (subLines.length > 0) {
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '700 19px monospace';
      ctx.textAlign = 'center';
      subLines.forEach((sLine, sIdx) => {
        ctx.fillText(sLine, 540, titleEndY + 36 + sIdx * 28);
      });
    }

    // DESENHAR FOTOGRAFIA DE CAPA
    try {
      const coverImg = await loadImage(article.cover_image_url);

      ctx.save();
      ctx.beginPath();
      ctx.rect(photoX, photoY, photoW, photoH);
      ctx.clip();
      ctx.filter = 'grayscale(100%) contrast(135%) brightness(95%)';

      const imgAspect = coverImg.width / coverImg.height;
      const boxAspect = photoW / photoH;
      let drawW = photoW;
      let drawH = photoH;
      let drawX = photoX;
      let drawY = photoY;

      if (imgAspect > boxAspect) {
        drawW = photoH * imgAspect;
        drawX = photoX - (drawW - photoW) / 2;
      } else {
        drawH = photoW / imgAspect;
        drawY = photoY - (drawH - photoH) / 2;
      }

      ctx.drawImage(coverImg, drawX, drawY, drawW, drawH);
      ctx.filter = 'none';
      ctx.restore();
    } catch {
      ctx.fillStyle = '#1e1e1e';
      ctx.fillRect(photoX, photoY, photoW, photoH);
      ctx.fillStyle = '#888888';
      ctx.font = '700 24px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('[ ACERVO HISTÓRICO - NATAL / RN ]', 540, photoY + photoH / 2);
    }

    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 3;
    ctx.strokeRect(photoX, photoY, photoW, photoH);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(photoX + 2, photoY + 2, photoW - 4, photoH - 4);

    const captionH = 34;
    const captionY = photoY + photoH - captionH;
    ctx.fillStyle = 'rgba(17, 17, 17, 0.95)';
    ctx.fillRect(photoX, captionY, photoW, captionH);

    ctx.fillStyle = '#E6E6E6';
    ctx.font = '700 14px monospace';
    ctx.textAlign = 'left';
    const captionText = article.cover_caption || `Fig. 1: Acervo Histórico — ${article.title}`;
    const truncatedCaption =
      captionText.length > 85 ? `${captionText.slice(0, 82)}...` : captionText;
    ctx.fillText(truncatedCaption, photoX + 16, captionY + 22);

    // DESENHAR BLOCO INFERIOR DO AUTOR E CITAÇÃO
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(photoX, bottomBlockY);
    ctx.lineTo(photoX + photoW, bottomBlockY);
    ctx.stroke();

    const avatarCenterX = photoX + 48;
    const avatarCenterY = bottomBlockY + 70;
    const avatarRadius = 38;

    try {
      const avatarUrl = article.author?.avatar_url || '/logo.webp';
      const avatarImg = await loadImage(avatarUrl);

      ctx.save();
      ctx.beginPath();
      ctx.arc(avatarCenterX, avatarCenterY, avatarRadius, 0, Math.PI * 2);
      ctx.clip();
      ctx.filter = 'grayscale(100%) contrast(125%)';
      ctx.drawImage(
        avatarImg,
        avatarCenterX - avatarRadius,
        avatarCenterY - avatarRadius,
        avatarRadius * 2,
        avatarRadius * 2
      );
      ctx.filter = 'none';
      ctx.restore();
    } catch {
      ctx.fillStyle = '#111111';
      ctx.beginPath();
      ctx.arc(avatarCenterX, avatarCenterY, avatarRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(avatarCenterX, avatarCenterY, avatarRadius, 0, Math.PI * 2);
    ctx.stroke();

    const metaX = avatarCenterX + avatarRadius + 16;
    ctx.textAlign = 'left';
    ctx.font = '700 14px monospace';
    ctx.fillStyle = '#111111';

    const authorName = (article.author?.name || 'CONSELHO EDITORIAL').toUpperCase();
    const pubDate = new Date(article.published_at);
    const dateFormatted = pubDate
      .toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
      .toUpperCase();

    ctx.fillText(`AUTOR: ${authorName.length > 22 ? authorName.slice(0, 20) + '...' : authorName}`, metaX, bottomBlockY + 50);
    ctx.fillText(`DATA: ${dateFormatted}`, metaX, bottomBlockY + 74);
    ctx.fillText(`LEITURA: ${article.reading_time_minutes} MIN`, metaX, bottomBlockY + 98);

    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(dividerX, bottomBlockY + 16);
    ctx.lineTo(dividerX, bottomBlockY + 124);
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 16px monospace';

    qLines.slice(0, 3).forEach((line, idx) => {
      ctx.fillText(line, quoteX, bottomBlockY + 48 + idx * 24);
    });

    ctx.fillStyle = '#111111';
    ctx.font = '700 14px monospace';
    const authorSignature =
      article.category === 'EDITORIAL' ? '— Karl Marx (1844)' : `— ${article.author?.name || 'A Revolta Vermelha'}`;
    ctx.fillText(authorSignature, quoteX + 60, bottomBlockY + 52 + Math.min(qLines.length, 3) * 24);

    // 10. RODAPÉ DO CARD: FAIXA ARREDONDADA "LEIA EM: AREVOLTAVERMELHA.COM.BR"
    const pillW = 540;
    const pillH = 50;
    const pillX = (1080 - pillW) / 2;
    const pillY = Math.min(cardBottom + 45, 1805);

    ctx.strokeStyle = '#262626';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cardX, pillY + pillH / 2);
    ctx.lineTo(pillX - 15, pillY + pillH / 2);
    ctx.moveTo(pillX + pillW + 15, pillY + pillH / 2);
    ctx.lineTo(cardX + cardW, pillY + pillH / 2);
    ctx.stroke();

    ctx.fillStyle = '#111111';
    drawRoundedRect(ctx, pillX, pillY, pillW, pillH, 25);
    ctx.fill();

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    drawRoundedRect(ctx, pillX, pillY, pillW, pillH, 25);
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 19px monospace';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '1px';
    ctx.fillText('LEIA EM: AREVOLTAVERMELHA.COM.BR', 540, pillY + 32);
    ctx.letterSpacing = '0px';

    return canvas;
  };

  // Dispara geração e download ou compartilhamento nativo para Instagram
  const handleShareInstagram = async () => {
    setIsGenerating(true);
    setStatusMessage('GERANDO CARD (1080x1920)...');

    try {
      const canvas = await renderCardCanvas();

      canvas.toBlob(async (blob) => {
        if (!blob) {
          throw new Error('Falha na criação do blob da imagem.');
        }

        const fileName = `revolta-vermelha-${article.slug}.png`;
        const file = new File([blob], fileName, { type: 'image/png' });

        // Tenta compartilhamento nativo em smartphones (Instagram Stories)
        if (
          typeof navigator !== 'undefined' &&
          navigator.canShare &&
          navigator.canShare({ files: [file] })
        ) {
          try {
            await navigator.share({
              files: [file],
              title: article.title,
              text: `${article.title} — A Revolta Vermelha`,
            });
            setIsGenerating(false);
            setStatusMessage(null);
            return;
          } catch (err: unknown) {
            // Se o usuário cancelou o share sheet, não exibe erro
            if (err instanceof Error && err.name === 'AbortError') {
              setIsGenerating(false);
              setStatusMessage(null);
              return;
            }
          }
        }

        // Fallback para download direto em alta resolução (Desktop)
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = fileName;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);

        setIsGenerating(false);
        setStatusMessage('CARD BAIXADO! PRONTO PARA O INSTAGRAM STORIES.');
        setTimeout(() => setStatusMessage(null), 4000);
      }, 'image/png');
    } catch (err) {
      console.error('Erro gerando imagem para Instagram:', err);
      setIsGenerating(false);
      setStatusMessage(null);
      alert('Não foi possível gerar o card automaticamente no navegador.');
    }
  };

  // Download direto do Card PNG para anexar no WhatsApp ou X / Twitter
  const handleDownloadCard = async () => {
    setIsGenerating(true);
    setStatusMessage('GERANDO ARQUIVO DE IMAGEM...');

    try {
      const canvas = await renderCardCanvas();
      canvas.toBlob((blob) => {
        if (!blob) {
          throw new Error('Falha na criação do blob da imagem.');
        }
        const fileName = `card-${article.slug}.png`;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = fileName;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);

        setIsGenerating(false);
        setStatusMessage('CARD BAIXADO COM SUCESSO (1080x1920)!');
        setTimeout(() => setStatusMessage(null), 4000);
      }, 'image/png');
    } catch {
      setIsGenerating(false);
      setStatusMessage(null);
      alert('Erro ao processar imagem para download.');
    }
  };

  return (
    <div className="border border-rev-black bg-neutral-100 p-5 shadow-[4px_4px_0px_#111111] my-8 font-mono">
      {/* Cabeçalho Limpo sem textos redundantes */}
      <div className="flex items-center justify-between border-b border-neutral-300 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Share2 className="w-4 h-4 text-rev-red" />
          <span className="font-display font-black text-xs uppercase tracking-wider text-rev-black">
            COMPARTILHAR ESTA PUBLICAÇÃO
          </span>
        </div>
      </div>

      {/* Botões de Ação Uniformes */}
      <div className="flex flex-wrap items-center gap-3">
        {/* BOTÃO PRINCIPAL: INSTAGRAM */}
        <button
          onClick={handleShareInstagram}
          disabled={isGenerating}
          className="btn-brutalist !bg-rev-red !text-white !border-rev-black hover:!bg-rev-black hover:!text-white flex items-center gap-2 !py-2.5 !px-4 !text-xs cursor-pointer shadow-[3px_3px_0px_#111111] transition-all"
          title="Gera card 1080x1920 para Instagram Stories"
        >
          {isGenerating ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin text-white" />
              <span>GERANDO CARD...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24" role="img">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <span>INSTAGRAM</span>
            </>
          )}
        </button>

        {/* BOTÃO: WHATSAPP */}
        <button
          onClick={handleShareWhatsApp}
          className="btn-brutalist !bg-white !text-rev-black hover:!bg-green-700 hover:!text-white flex items-center gap-1.5 !py-2.5 !px-3 !text-xs cursor-pointer group"
          title="Compartilhar no WhatsApp com título e link"
        >
          <MessageCircle className="w-4 h-4 text-green-600 group-hover:text-white" />
          <span>WHATSAPP</span>
        </button>

        {/* BOTÃO: X / TWITTER */}
        <button
          onClick={handleShareTwitter}
          className="btn-brutalist !bg-white !text-rev-black hover:!bg-black hover:!text-white flex items-center gap-1.5 !py-2.5 !px-3 !text-xs cursor-pointer group"
          title="Compartilhar no X (Twitter)"
        >
          <svg className="w-3.5 h-3.5 fill-current text-neutral-800 group-hover:text-white" viewBox="0 0 24 24" role="img">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          <span>X / TWITTER</span>
        </button>

        {/* BOTÃO: BAIXAR CARD (PNG) */}
        <button
          onClick={handleDownloadCard}
          disabled={isGenerating}
          className="btn-brutalist !bg-white !text-rev-black hover:!bg-rev-black hover:!text-white flex items-center gap-1.5 !py-2.5 !px-3 !text-xs cursor-pointer"
          title="Baixar imagem do card (1080x1920) para anexar em posts ou mensagens"
        >
          <Download className="w-3.5 h-3.5" />
          <span>BAIXAR CARD (PNG)</span>
        </button>

        {/* BOTÃO: COPIAR LINK */}
        <button
          onClick={handleCopyLink}
          className="btn-brutalist !bg-white !text-rev-black hover:!bg-rev-red hover:!text-white flex items-center gap-1.5 !py-2.5 !px-3 !text-xs cursor-pointer"
          title="Copiar link direto para área de transferência"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-green-700 font-bold">LINK COPIADO!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>COPIAR LINK</span>
            </>
          )}
        </button>
      </div>

      {/* Alerta de Feedback de Status */}
      {statusMessage && (
        <div className="mt-3 p-2 bg-neutral-900 text-white text-[11px] font-mono flex items-center gap-2 animate-in fade-in">
          <Check className="w-3.5 h-3.5 text-rev-red" />
          <span>{statusMessage}</span>
        </div>
      )}
    </div>
  );
}
