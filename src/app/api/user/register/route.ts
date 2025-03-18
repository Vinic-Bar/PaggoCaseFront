import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  // registrar o usuário

  return NextResponse.json({ message: 'Usuário registrado com sucesso' });
}