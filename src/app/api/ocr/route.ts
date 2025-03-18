import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { imagePath, invoiceId } = await req.json();

  try {
    const res = await fetch('http://localhost:3001/ocr', {
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