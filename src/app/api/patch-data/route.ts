import { NextResponse } from 'next/server';
import { getPatchData } from '@/lib/patch-data-server';

export async function GET() {
  try {
    const patchData = await getPatchData();
    
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
