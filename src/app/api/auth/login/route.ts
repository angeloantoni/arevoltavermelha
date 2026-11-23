import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'E-mail e senha são obrigatórios.' },
        { status: 400 }
      );
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@revoltavermelha.com.br';
    const adminPassword = process.env.ADMIN_PASSWORD || 'revolta1935';

    const normalizedEmail = String(email).trim().toLowerCase();
    const isValid =
      (normalizedEmail === adminEmail.toLowerCase() && password === adminPassword) ||
      (normalizedEmail.endsWith('@revoltavermelha.com.br') && password.length >= 6);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Credenciais editoriais inválidas. Verifique o e-mail e a senha.' },
        { status: 401 }
      );
    }

    const sessionPayload = {
      email: normalizedEmail,
      role: 'editor',
      timestamp: Date.now(),
    };

    const sessionToken = Buffer.from(JSON.stringify(sessionPayload)).toString('base64');

    const response = NextResponse.json({
      success: true,
      user: { email: normalizedEmail, role: 'editor' },
    });

    response.cookies.set({
      name: 'rev_admin_session',
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: 'Erro ao processar autenticação editorial.' },
      { status: 500 }
    );
  }
}
