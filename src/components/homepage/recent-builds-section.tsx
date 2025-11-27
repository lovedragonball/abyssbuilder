'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { BuildCard } from '@/components/BuildCard';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';

interface Build {
  id: string;
  buildName: string;
  description?: string;
  itemName: string;
  itemImage: string;
  itemType: string;
  createdAt: string;
  updatedAt: string;
  mods?: (string | null)[];
  primeMod?: string | null;
  [key: string]: any;
}

interface RecentBuildsSectionProps {
  title?: string;
  subtitle?: string;
  maxBuilds?: number;
  showFeatured?: boolean;
}

export function RecentBuildsSection({
  title = 'Recent Builds',
  subtitle = 'Check out the latest character builds from the community',
  maxBuilds = 4,
  showFeatured = false,
}: RecentBuildsSectionProps) {
  const [builds, setBuilds] = useState<Build[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch builds from localStorage
    const fetchBuilds = () => {
      try {
        const storedBuilds = localStorage.getItem('builds');
        if (storedBuilds) {
          const parsedBuilds: Build[] = JSON.parse(storedBuilds);
          
          // Sort by updatedAt (most recent first)
          const sortedBuilds = parsedBuilds.sort((a, b) => {
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
          });
          
          // Take only the specified number of builds
          setBuilds(sortedBuilds.slice(0, maxBuilds));
        }
      } catch (error) {
        console.error('Error loading builds:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBuilds();
  }, [maxBuilds]);

  // If no builds and not loading, show empty state
  if (!isLoading && builds.length === 0) {
    return (
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              {title}
            </h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
              {subtitle}
            </p>
          </motion.div>
        </div>

        <EmptyState
          icon={<Sparkles className="w-16 h-16" strokeWidth={1.5} />}
          title="No Builds Yet"
          description="Start creating your first character build to see it featured here!"
          action={{
            label: 'Create Your First Build',
            onClick: () => window.location.href = '/create',
          }}
        />
      </section>
    );
  }

  // Show loading skeletons
  if (isLoading) {
    return (
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            {title}
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: maxBuilds }).map((_, index) => (
            <div
              key={index}
              className="h-[400px] rounded-xl bg-muted/50 animate-pulse"
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 py-12 md:py-16">
      {/* Section Header */}
      <motion.div
        className="text-center mb-8 md:mb-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-center gap-2 mb-3">
          {showFeatured && (
            <Sparkles className="h-6 w-6 text-accent animate-pulse" />
          )}
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            {title}
          </h2>
          {showFeatured && (
            <Sparkles className="h-6 w-6 text-accent animate-pulse" />
          )}
        </div>
        <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
          {subtitle}
        </p>
      </motion.div>

      {/* Builds Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mb-8">
        {builds.map((build, index) => (
          <motion.div
            key={build.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <BuildCard
              id={build.id}
              buildName={build.buildName}
              description={build.description}
              itemName={build.itemName}
              itemImage={build.itemImage}
              itemType={build.itemType}
              createdAt={build.createdAt}
              updatedAt={build.updatedAt}
              stats={
                build.mods
                  ? [
                      {
                        label: 'Mods',
                        value: build.mods.filter((m) => m !== null).length,
                      },
                    ]
                  : []
              }
              onView={(id) => {
                // Navigate to build detail or edit page
                window.location.href = `/create?buildId=${id}`;
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* View All CTA */}
      <motion.div
        className="flex justify-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Link href="/my-builds">
          <Button
            size="lg"
            variant="gradient"
            className="group min-h-[44px] px-6 md:px-8"
          >
            View All Builds
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </motion.div>
    </section>
  );
}
