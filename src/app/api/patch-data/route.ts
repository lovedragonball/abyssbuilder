import { NextResponse } from 'next/server';
import { getPatchData } from '@/lib/patch-data-server';

export async function GET() {
  try {
    const patchData = await getPatchData();
    return NextResponse.json(patchData);
  } catch (error) {
    console.error('Failed to fetch patch data:', error);
    return NextResponse.json(
      {
        knownIssues: [],
        updates: [],
        lastUpdated: new Date().toISOString(),
        error: 'Failed to load patch notes',
      },
      { status: 500 }
    );
  }
}
