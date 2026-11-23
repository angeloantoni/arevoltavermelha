'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, ArrowRight, AlertCircle, ArrowLeft, ShieldCheck } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Credenciais inválidas.');
        setLoading(false);
        return;
      }

      // Redireciona para o painel
      router.push(from);
      router.refresh();
    } catch {
      setError('Falha de conexão com o servidor editorial.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white border border-rev-black shadow-[4px_4px_0px_#C81E1E] p-6 sm:p-8">
      {/* Cabeçalho do Card */}
      <div className="border-b border-rev-black pb-4 mb-6">
        <div className="flex items-center gap-1.5 text-xs text-rev-red font-bold uppercase tracking-wider mb-1">
          <Lock className="w-3.5 h-3.5" />
          <span>AUTENTICAÇÃO CMS</span>
        </div>
        <h1 className="font-display font-black text-2xl uppercase tracking-tight text-rev-black">
          ACESSO EDITORIAL
        </h1>
        <p className="text-xs text-neutral-600 mt-1 font-mono leading-relaxed">
          Informe suas credenciais para gerenciar o acervo de artigos e o quadro de autores.
        </p>
      </div>

      {/* Alerta de Erro */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-rev-red text-rev-red text-xs font-mono flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase text-rev-black mb-1">
            E-MAIL DO EDITOR:
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@revoltavermelha.com.br"
            className="w-full px-3 py-2.5 border border-rev-black font-mono text-xs focus:ring-2 focus:ring-rev-red outline-none bg-neutral-50"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-rev-black mb-1">
            SENHA DE ACESSO:
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3 py-2.5 border border-rev-black font-mono text-xs focus:ring-2 focus:ring-rev-red outline-none bg-neutral-50"
          />
        </div>

        {/* Caixa explicativa de credenciais padrão */}
        <div className="p-3 bg-neutral-100 border border-neutral-300 text-[11px] text-neutral-700 space-y-1">
          <div className="font-bold flex items-center gap-1 text-rev-black">
            <ShieldCheck className="w-3.5 h-3.5 text-rev-red" />
            <span>CREDENCIAIS DE DEMONSTRAÇÃO:</span>
          </div>
          <div className="text-neutral-600 font-mono">
            E-mail: <code className="bg-white px-1 py-0.5 border border-neutral-300">admin@revoltavermelha.com.br</code>
          </div>
          <div className="text-neutral-600 font-mono">
            Senha: <code className="bg-white px-1 py-0.5 border border-neutral-300">revolta1935</code>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-brutalist !bg-rev-red !text-white hover:!bg-rev-black w-full !py-3 flex items-center justify-center gap-2 font-bold cursor-pointer transition-all !text-xs"
        >
          {loading ? (
            <span>VALIDANDO CREDENCIAIS...</span>
          ) : (
            <>
              <span>ENTRAR NO PAINEL →</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Retornar à Capa */}
      <div className="mt-6 pt-4 border-t border-neutral-200 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-rev-black font-bold uppercase transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>RETORNAR AO INÍCIO DA REVISTA</span>
        </Link>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="w-full min-h-screen bg-[#111111] flex flex-col items-center justify-center p-4 sm:p-6 font-mono">
      {/* Logotipo da Revista */}
      <div className="flex flex-col items-center mb-4">
        <Link href="/" className="block">
          <Image
            src="/logo_horizontal.webp"
            alt="A Revolta Vermelha - Revista Política"
            width={380}
            height={100}
            className="h-14 sm:h-16 w-auto object-contain filter brightness-0 invert"
            priority
          />
        </Link>
        <span className="text-[10px] text-neutral-400 font-mono tracking-widest uppercase mt-2">
          REVISTA POLÍTICA • SISTEMA EDITORIAL
        </span>
      </div>

      <Suspense
        fallback={
          <div className="w-full max-w-md bg-white border border-rev-black p-8 text-center text-xs font-mono text-neutral-500">
            CARREGANDO FORMULÁRIO DE ACESSO...
          </div>
        }
      >
        <LoginForm />
      </Suspense>

      <div className="mt-8 text-neutral-500 text-[11px] font-mono">
        © 2026 A REVOLTA VERMELHA • AMBIENTE RESTRITO A EDITORES E ARTICULISTAS
      </div>
    </div>
  );
}
