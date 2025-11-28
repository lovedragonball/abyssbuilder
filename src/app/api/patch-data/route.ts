import { NextRequest, NextResponse } from 'next/server';
import { getPatchData } from '@/lib/patch-data-server';

// Ensure this runs on Node.js runtime (not Edge)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Try to get base URL from request headers for Vercel
    const host = request.headers.get('host');
    const protocol = request.headers.get('x-forwarded-proto') || 
                     (request.url.startsWith('https') ? 'https' : 'http');
    const baseUrl = host ? `${protocol}://${host}` : undefined;

    // Try to get patch data using the server function
    // This function already tries multiple methods (filesystem + HTTP)
    // Pass baseUrl so it can fetch from public folder if filesystem fails
    const patchData = await getPatchData(baseUrl);

    // If there's an error in the patch data, still return it but with 200 status
    // so the client can handle the error state gracefully
    if (patchData.error) {
      console.warn('Patch data loaded with error:', patchData.error);
    }
    
    return NextResponse.json(patchData, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to fetch patch data:', errorMessage);
    
    return NextResponse.json(
      {
        knownIssues: [],
        updates: [],
        lastUpdated: new Date().toISOString(),
        error: `Failed to load patch notes: ${errorMessage}`,
      },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  }
}
