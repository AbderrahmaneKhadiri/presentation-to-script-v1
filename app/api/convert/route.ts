import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier reçu.' }, { status: 400 });
    }

    const apyhubFormData = new FormData();
    apyhubFormData.append('file', file);

    const response = await fetch('https://api.apyhub.com/convert/presentation-file/pdf-file', {
      method: 'POST',
      headers: {
        'apy-token': process.env.APYHUB_TOKEN!,
      },
      body: apyhubFormData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Erreur de l'API ApyHub:", errorData);
      return NextResponse.json({ error: `Erreur de conversion: ${errorData.message || 'Service indisponible'}` }, { status: response.status });
    }

    const pdfBuffer = await response.arrayBuffer();
    
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
      },
    });

  } catch (error) {
    console.error("Erreur interne lors de la conversion:", error);
    return NextResponse.json({ error: 'Une erreur interne est survenue.' }, { status: 500 });
  }
}