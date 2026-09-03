import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file = data.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert Next.js File to a raw Blob to prevent Node fetch from hanging
    const buffer = await file.arrayBuffer();
    const blob = new Blob([buffer], { type: file.type || 'application/octet-stream' });
    
    const pinataData = new FormData();
    pinataData.append('file', blob, file.name || 'upload');

    pinataData.append('pinataMetadata', JSON.stringify({
      name: file.name || 'upload',
    }));

    pinataData.append('pinataOptions', JSON.stringify({
      cidVersion: 0,
    }));

    const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
      },
      body: pinataData,
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Pinata upload failed:', errorText);
      return NextResponse.json({ error: `Pinata upload failed: ${errorText}` }, { status: res.status });
    }

    const resData = await res.json();
    return NextResponse.json(resData, { status: 200 });
  } catch (e: any) {
    console.error('API Error:', e);
    return NextResponse.json({ error: e.message || 'Internal Server Error' }, { status: 500 });
  }
}
