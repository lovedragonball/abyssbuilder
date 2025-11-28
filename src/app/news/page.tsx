"use client"

import { NewsUpdatesSection } from '@/components/news/news-updates-section';
import { useState, useEffect } from 'react';
import type { PatchData } from '@/lib/patch-data';

export default function NewsPage() {
  const [patchData, setPatchData] = useState<PatchData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/patch-data')
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        setPatchData(data);
        setIsLoading(false);
        // If the data has an error field, set it
        if (data.error) {
          setError(data.error);
        }
      })
      .catch(err => {
        console.error('Failed to fetch patch data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load patch data');
        setIsLoading(false);
        // Set empty patch data so the component can still render
        setPatchData({
          knownIssues: [],
          updates: [],
          lastUpdated: new Date().toISOString(),
          error: err instanceof Error ? err.message : 'Failed to load patch data',
        });
      });
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!patchData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            News & Updates
          </h1>
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400">
            <p className="font-semibold">Error loading patch data</p>
            <p className="text-sm mt-2">{error || 'Unknown error occurred'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Page Header */}
      <div className="space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground">
          News & Updates
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          Stay informed about the latest game updates, bug fixes, and known issues. 
          Check back regularly for the most recent patch notes and announcements.
        </p>
      </div>

      {/* News Updates Section */}
      <NewsUpdatesSection 
        patchData={patchData} 
        maxVisibleUpdates={10}
      />
    </div>
  );
}
