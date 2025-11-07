'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import React, { useEffect } from 'react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
    },
  },
};

export default function HomePage() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://tenor.com/embed.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Check if the script is still in the body before removing
      if (script.parentNode) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <motion.div
      className="space-y-16 md:space-y-24"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Hero Section */}
      <motion.section
        className="relative flex min-h-[60vh] items-center justify-center overflow-hidden rounded-xl border border-border bg-black p-8 text-center"
        variants={itemVariants}
      >
        <div className="absolute inset-0 h-full w-full opacity-30 overflow-hidden">
          <div
            className="tenor-gif-embed absolute top-1/2 left-1/2 min-h-full min-w-full -translate-x-1/2 -translate-y-1/2"
            data-postid="4027223289355280337"
            data-share-method="host"
            data-aspect-ratio="1.77778"
            data-width="100%"
          ></div>
        </div>

        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 space-y-6">
          <motion.h1
            className="font-headline text-5xl font-bold tracking-tighter text-white shadow-black [text-shadow:0_2px_4px_var(--tw-shadow-color)] md:text-7xl"
            variants={itemVariants}
          >
            Forge Your Legend
          </motion.h1>
          <motion.p
            className="mx-auto max-w-2xl text-lg text-muted-foreground"
            variants={itemVariants}
          >
            The ultimate platform to create, share, and discover builds for your
            favorite abyss-crawling adventure.
          </motion.p>
          <motion.div
            className="flex flex-col gap-4 sm:flex-row sm:justify-center"
            variants={itemVariants}
          >
            <Button asChild size="lg">
              <Link href="/create">
                Create New Build <ArrowRight className="ml-2" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </motion.section>
    </motion.div>
  );
}