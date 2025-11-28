"use client"

import { NewsUpdatesSection } from '@/components/news/news-updates-section';
import { usePatchData } from '@/hooks/use-patch-data';

export default function NewsPage() {
  const { data: patchData, loading: isLoading, error } = usePatchData();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !patchData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            News & Updates
          </h1>
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400">
            <p className="font-semibold">Error loading patch data</p>
            <p className="text-sm mt-2">{error?.message || 'Unknown error occurred'}</p>
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
