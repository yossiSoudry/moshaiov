import { NextRequest, NextResponse } from 'next/server';

const BRAINERCE_API = 'https://api.brainerce.com';
const CONNECTION_ID = 'vc_LtawnwQr1w5F5Tqi1wYOG';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

async function fetchWithRetry(url: string, retries = MAX_RETRIES): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://moshaiov.co.il',
        },
        cache: 'no-store',
      });

      if (response.ok) {
        return response;
      }

      // If 503 or 502, retry
      if (response.status === 503 || response.status === 502) {
        console.log(`Retry ${i + 1}/${retries} - API returned ${response.status}`);
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (i + 1)));
          continue;
        }
      }

      return response;
    } catch (error) {
      console.log(`Retry ${i + 1}/${retries} - Fetch error:`, error);
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (i + 1)));
        continue;
      }
      throw error;
    }
  }

  throw new Error('Max retries reached');
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '8';
    const search = searchParams.get('search') || '';

    const url = new URL(`${BRAINERCE_API}/api/vc/${CONNECTION_ID}/products`);
    url.searchParams.set('page', page);
    url.searchParams.set('limit', limit);
    if (search) {
      url.searchParams.set('search', search);
    }

    const response = await fetchWithRetry(url.toString());

    if (!response.ok) {
      console.error(`API error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        {
          error: 'Service temporarily unavailable',
          data: [],
          meta: { totalPages: 0, currentPage: 1, total: 0 }
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Products API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch products',
        data: [],
        meta: { totalPages: 0, currentPage: 1, total: 0 }
      },
      { status: 500 }
    );
  }
}
