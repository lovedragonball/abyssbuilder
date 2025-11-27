import React from 'react';
import { HeroSection } from '@/components/homepage/hero-section';
import { FeatureGrid } from '@/components/homepage/feature-grid';
import { RecentBuildsSection } from '@/components/homepage/recent-builds-section';
import { NewsUpdatesSection } from '@/components/news/news-updates-section';
import { getPatchData } from '@/lib/patch-data-server';

export default async function HomePage() {
  const patchData = await getPatchData();

  return (
    <div className="space-y-16 md:space-y-24">
      {/* Hero Section with enhanced design */}
      <HeroSection
        title="Forge Your Legend"
        subtitle="The ultimate platform to create, share, and discover builds for your favorite abyss-crawling adventure."
        ctaButtons={[
          {
            label: 'Create New Build',
            href: '/create',
            variant: 'gradient',
          },
        ]}
      />

      {/* Feature Grid Section */}
      <FeatureGrid />

      {/* Recent/Featured Builds Section */}
      <RecentBuildsSection
        title="Recent Builds"
        subtitle="Check out the latest character builds from the community"
        maxBuilds={4}
        showFeatured={false}
      />

      {/* News & Updates Section */}
      <section className="container mx-auto px-4">
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              News & Updates
            </h2>
            <p className="text-muted-foreground">
              Stay informed about the latest patch notes and known issues
            </p>
          </div>
          <NewsUpdatesSection 
            patchData={patchData} 
            maxVisibleUpdates={5}
          />
        </div>
      </section>
    </div>
  );
}
