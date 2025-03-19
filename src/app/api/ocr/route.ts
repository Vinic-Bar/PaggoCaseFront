import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest): Promise<Response> {
  const { imagePath, invoiceId } = await req.json();

  try {
    const res = await fetch('https://paggocaseback-production.up.railway.app/ocr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imagePath, invoiceId }),
    });

    const data = await res.json();
    console.log('Resposta da API de OCR (JSON):', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error interacting with OCR API:', error);
    return NextResponse.json({ error: 'Error interacting with OCR API' }, { status: 500 });
  }
}