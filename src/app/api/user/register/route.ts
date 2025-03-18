import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest): Promise<Response> {
  const { email, password } = await req.json();
  console.log(`Registrando usuário com email: ${email} e senha: ${password}`);

  return NextResponse.json({ message: 'Usuário registrado com sucesso' });
}