'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FeatureCard } from './feature-card';
import { Hammer, Trophy, Map, Package } from 'lucide-react';

const features = [
  {
    icon: Hammer,
    title: 'Build Creator',
    description: 'Create and customize powerful character builds with our intuitive builder. Mix and match weapons, skills, and equipment to find your perfect playstyle.',
    href: '/create',
    accentColor: 'hsl(210, 90%, 60%)',
  },
  {
    icon: Trophy,
    title: 'Tier List',
    description: 'Discover the most powerful characters and builds ranked by the community. Stay updated with the current meta and competitive strategies.',
    href: '/tier-list',
    accentColor: 'hsl(270, 65%, 55%)',
  },
  {
    icon: Map,
    title: 'Interactive Map',
    description: 'Explore detailed maps with marked locations for treasures, secrets, and important NPCs. Never miss a collectible or hidden area again.',
    href: '/map',
    accentColor: 'hsl(330, 70%, 60%)',
  },
  {
    icon: Package,
    title: 'Materials Guide',
    description: 'Find comprehensive information about crafting materials, upgrade components, and where to farm them efficiently.',
    href: '/materials',
    accentColor: 'hsl(180, 70%, 50%)',
  },
];

export function FeatureGrid() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <section className="relative w-full py-12 sm:py-16 md:py-20 px-4">
      <div className="container mx-auto">
        {/* Section header */}
        <motion.div
          className="text-center mb-8 sm:mb-10 md:mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 px-4">
            <span className="gradient-text">Everything You Need</span>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-4">
            Powerful tools and resources to enhance your gaming experience
          </p>
        </motion.div>

        {/* Feature cards grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {features.map((feature) => (
            <motion.div key={feature.href} variants={itemVariants}>
              <FeatureCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                href={feature.href}
                accentColor={feature.accentColor}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>
    </section>
  );
}
