"use client"

import { NewsUpdatesSection } from '@/components/news/news-updates-section';
import { useState, useEffect } from 'react';
import type { PatchData } from '@/lib/patch-data';

export default function NewsPage() {
  const [patchData, setPatchData] = useState<PatchData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/patch-data')
      .then(res => res.json())
      .then(data => {
        setPatchData(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch patch data:', err);
        setIsLoading(false);
      });
  }, []);

  if (isLoading || !patchData) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
