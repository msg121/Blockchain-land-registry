import { NextResponse } from 'next/server';
import { keccak256, toBytes } from 'viem';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const hash = searchParams.get('hash');
  
  if (!hash) {
    return new NextResponse('Hash required', { status: 400 });
  }

  try {
    const res = await fetch('https://api.pinata.cloud/data/pinList?status=pinned&pageLimit=1000', {
      headers: { 
        Authorization: `Bearer ${process.env.PINATA_JWT}` 
      },
      next: { revalidate: 0 } // no cache
    });

    if (!res.ok) {
      return new NextResponse('Failed to fetch from Pinata', { status: 500 });
    }

    const data = await res.json();
    
    // Reverse lookup: hash each CID and compare
    for (const pin of data.rows) {
      const uri = `ipfs://${pin.ipfs_pin_hash}`;
      const pinHash = keccak256(toBytes(uri));
      
      if (pinHash === hash) {
        return NextResponse.redirect(`https://crimson-adverse-bonobo-788.mypinata.cloud/ipfs/${pin.ipfs_pin_hash}`);
      }
    }

    return new NextResponse('Document not found in off-chain storage. Has it been unpinned?', { status: 404 });
  } catch (e: any) {
    return new NextResponse(e.message, { status: 500 });
  }
}
