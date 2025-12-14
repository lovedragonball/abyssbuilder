'use client';

import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  ctaButtons?: Array<{
    label: string;
    href: string;
    variant: 'default' | 'gradient' | 'glass' | 'outline';
  }>;
}

export function HeroSection({
  title = 'Forge Your Legend',
  subtitle = 'The ultimate platform to create, share, and discover builds for your favorite abyss-crawling adventure.',
  ctaButtons = [
    {
      label: 'Create New Build',
      href: '/create',
      variant: 'gradient' as const,
    },
  ],
}: HeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  // Parallax effect - moves slower than scroll
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  // Particle system - optimized for performance
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check for reduced-motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Reduced particle count for better GPU performance (was 30)
    const particleCount = 12;
    const particles: HTMLDivElement[] = [];

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'absolute rounded-full pointer-events-none';

      // Random size between 2-5px (slightly smaller)
      const size = Math.random() * 3 + 2;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;

      // Random position
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;

      // Random color (blue to purple gradient)
      const hue = Math.random() * 60 + 210; // 210-270 (blue to purple)
      particle.style.backgroundColor = `hsl(${hue}, 80%, 60%)`;
      // Removed boxShadow to reduce GPU load

      // Slower animation for better performance (was 15-25s, now 20-35s)
      const duration = Math.random() * 15 + 20;
      const delay = Math.random() * 5;
      particle.style.animation = `particle-float ${duration}s ${delay}s ease-in-out infinite`;
      particle.style.opacity = `${Math.random() * 0.4 + 0.2}`;
      // Use will-change sparingly
      particle.style.willChange = 'transform';

      container.appendChild(particle);
      particles.push(particle);
    }

    return () => {
      particles.forEach(particle => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      });
    };
  }, []);

  // Text reveal animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
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
        damping: 12,
      },
    },
  };

  const titleVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 80,
        damping: 10,
        duration: 0.8,
      },
    },
  };

  return (
    <section className="relative w-full min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 gradient-hero">
        <motion.div
          className="absolute inset-0 opacity-30"
          style={{ y }}
        >
          {/* Gradient orbs for depth - reduced size and blur for GPU performance */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/15 rounded-full blur-2xl" style={{ animation: 'float 8s ease-in-out infinite' }} />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/15 rounded-full blur-2xl" style={{ animation: 'float 8s ease-in-out infinite', animationDelay: '1s' }} />
        </motion.div>
      </div>

      {/* Floating particles container */}
      <div ref={containerRef} className="absolute inset-0 overflow-hidden" />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />

      {/* Content */}
      <motion.div
        className="relative z-10 container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 text-center"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        style={{ opacity }}
      >
        <motion.div variants={titleVariants} className="mb-4 sm:mb-6">
          <h1 className="font-headline text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter px-2">
            <span className="inline-block gradient-text">
              {title}
            </span>
          </h1>
          {/* Sparkle decoration - optimized animation */}
          <motion.div
            className="inline-block ml-2 sm:ml-4"
            animate={{
              rotate: [0, 5, -5, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            }}
          >
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 text-accent" />
          </motion.div>
        </motion.div>

        <motion.p
          variants={itemVariants}
          className="mx-auto max-w-2xl text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 leading-relaxed px-4"
        >
          {subtitle}
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4"
        >
          {ctaButtons.map((button) => (
            <motion.div
              key={button.href}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto"
            >
              <Button
                asChild
                size="lg"
                variant={button.variant}
                className="group relative overflow-hidden w-full sm:w-auto"
              >
                <Link href={button.href}>
                  {button.label}
                  <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </motion.div>
          ))}
        </motion.div>

        {/* Scroll indicator - using CSS animation for better performance */}
        <motion.div
          variants={itemVariants}
          className="mt-12 sm:mt-16 flex flex-col items-center gap-2 hidden sm:flex"
        >
          <span className="text-xs sm:text-sm text-muted-foreground">Scroll to explore</span>
          <div
            className="w-5 h-8 sm:w-6 sm:h-10 border-2 border-muted-foreground/30 rounded-full flex items-start justify-center p-2 animate-bounce"
            style={{ animationDuration: '2s' }}
          >
            <div
              className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-muted-foreground/50 rounded-full animate-pulse"
              style={{ animationDuration: '2s' }}
            />
          </div>
        </motion.div>
      </motion.div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
