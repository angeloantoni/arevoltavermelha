'use client';

import React, { useState } from 'react';
import { LogOut } from 'lucide-react';

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // fallback
    }
    document.cookie = 'rev_admin_session=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
    window.location.href = '/';
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="btn-brutalist !bg-neutral-100 !text-neutral-700 hover:!bg-rev-red hover:!text-white flex items-center gap-1.5 cursor-pointer text-xs transition-colors"
      title="Encerrar sessão editorial e voltar à capa"
    >
      <LogOut className="w-3.5 h-3.5" />
      <span>{loading ? 'SAINDO...' : 'SAIR'}</span>
    </button>
  );
}
