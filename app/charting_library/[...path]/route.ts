import { NextRequest, NextResponse } from 'next/server';

const TV_CDN = 'https://charting-library.tradingview-widget.com/charting_library';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const filePath = path.join('/');
  const url = `${TV_CDN}/${filePath}`;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': '*/*',
        'Referer': 'https://charting-library.tradingview-widget.com/',
        'Origin': 'https://charting-library.tradingview-widget.com',
      },
    });

    if (!res.ok) {
      return new NextResponse(null, { status: res.status });
    }

    const data = await res.arrayBuffer();
    
    // Determine content type
    let contentType = 'application/octet-stream';
    if (filePath.endsWith('.js')) contentType = 'text/javascript';
    else if (filePath.endsWith('.css')) contentType = 'text/css';
    else if (filePath.endsWith('.woff2')) contentType = 'font/woff2';
    else if (filePath.endsWith('.woff')) contentType = 'font/woff';
    else if (filePath.endsWith('.svg')) contentType = 'image/svg+xml';
    else if (filePath.endsWith('.cur')) contentType = 'application/octet-stream';
    else if (filePath.endsWith('.png')) contentType = 'image/png';

    return new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (e) {
    return new NextResponse(null, { status: 502 });
  }
}
