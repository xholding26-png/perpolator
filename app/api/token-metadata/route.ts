import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey } from '@solana/web3.js';

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://devnet.helius-rpc.com/?api-key=dd62a158-95b7-40e8-bc19-a59cacb95f40';
const HELIUS_KEY = 'dd62a158-95b7-40e8-bc19-a59cacb95f40';

// Metaplex Token Metadata Program
const METADATA_PROGRAM = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

function deriveMetadataPDA(mint: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('metadata'), METADATA_PROGRAM.toBuffer(), mint.toBuffer()],
    METADATA_PROGRAM
  );
  return pda;
}

function parseMetadata(data: Buffer): { name: string; symbol: string; uri: string } {
  // Metaplex metadata v1 layout (after 1-byte key + 32-byte update_authority + 32-byte mint)
  let offset = 1 + 32 + 32;
  
  // Name (4-byte length prefix + string)
  const nameLen = data.readUInt32LE(offset);
  offset += 4;
  const name = data.subarray(offset, offset + nameLen).toString('utf-8').replace(/\0/g, '').trim();
  offset += nameLen;
  
  // Symbol (4-byte length prefix + string)
  const symbolLen = data.readUInt32LE(offset);
  offset += 4;
  const symbol = data.subarray(offset, offset + symbolLen).toString('utf-8').replace(/\0/g, '').trim();
  offset += symbolLen;
  
  // URI (4-byte length prefix + string)
  const uriLen = data.readUInt32LE(offset);
  offset += 4;
  const uri = data.subarray(offset, offset + uriLen).toString('utf-8').replace(/\0/g, '').trim();
  
  return { name, symbol, uri };
}

export async function GET(req: NextRequest) {
  const mint = req.nextUrl.searchParams.get('mint');
  if (!mint) {
    return NextResponse.json({ error: 'Missing mint parameter' }, { status: 400 });
  }

  try {
    // Try Helius DAS API first (works for mainnet tokens even on devnet RPC)
    try {
      const dasResp = await fetch(`https://mainnet.helius-rpc.com/?api-key=${HELIUS_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getAsset',
          params: { id: mint },
        }),
      });
      const dasData = await dasResp.json();
      
      if (dasData.result?.content?.metadata) {
        const meta = dasData.result.content.metadata;
        const image = dasData.result.content?.links?.image || 
                      dasData.result.content?.files?.[0]?.uri || '';
        return NextResponse.json({
          mint,
          name: meta.name || '',
          symbol: meta.symbol || '',
          image,
          source: 'helius-das',
        });
      }
    } catch {}

    // Fallback: on-chain Metaplex metadata
    const connection = new Connection(RPC_URL, 'confirmed');
    const mintPk = new PublicKey(mint);
    const metadataPDA = deriveMetadataPDA(mintPk);
    const info = await connection.getAccountInfo(metadataPDA);
    
    if (info && info.data.length > 0) {
      const parsed = parseMetadata(info.data as Buffer);
      
      // Fetch image from URI if it's a JSON metadata URL
      let image = '';
      if (parsed.uri && parsed.uri.startsWith('http')) {
        try {
          const uriResp = await fetch(parsed.uri, { signal: AbortSignal.timeout(3000) });
          const uriData = await uriResp.json();
          image = uriData.image || '';
        } catch {}
      }
      
      return NextResponse.json({
        mint,
        name: parsed.name,
        symbol: parsed.symbol,
        image,
        source: 'metaplex',
      });
    }

    return NextResponse.json({
      mint,
      name: mint.slice(0, 6) + '...',
      symbol: mint.slice(0, 4).toUpperCase(),
      image: '',
      source: 'fallback',
    });
  } catch (error) {
    return NextResponse.json({
      mint,
      name: mint.slice(0, 6) + '...',
      symbol: mint.slice(0, 4).toUpperCase(),
      image: '',
      source: 'error',
    });
  }
}
