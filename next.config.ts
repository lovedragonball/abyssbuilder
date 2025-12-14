import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: false, // Disable Strict Mode to avoid double Leaflet initialization
  output: 'standalone', // Reduce serverless function size
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'files.boarhat.gg',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // Performance optimizations
  experimental: {
    optimizePackageImports: [
      // Icons
      'lucide-react',
      // Utilities
      'date-fns',
      'clsx',
      'zod',
      // Radix UI - all packages
      '@radix-ui/react-accordion',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-avatar',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-collapsible',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-label',
      '@radix-ui/react-menubar',
      '@radix-ui/react-popover',
      '@radix-ui/react-progress',
      '@radix-ui/react-radio-group',
      '@radix-ui/react-scroll-area',
      '@radix-ui/react-select',
      '@radix-ui/react-separator',
      '@radix-ui/react-slider',
      '@radix-ui/react-slot',
      '@radix-ui/react-switch',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
      '@radix-ui/react-tooltip',
      // Animation
      'framer-motion',
    ],
  },
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // External packages for serverless (reduce bundle size)
  serverExternalPackages: ['leaflet', 'react-leaflet', 'sharp'],

  // Exclude heavy files from the serverless function bundle
  outputFileTracingExcludes: {
    '*': [
      // SWC binaries
      'node_modules/@swc/**/*',
      'node_modules/@swc/core-linux-x64-gnu',
      'node_modules/@swc/core-linux-x64-musl',
      'node_modules/@swc/core-win32-x64-msvc',
      // esbuild
      'node_modules/@esbuild/**/*',
      'node_modules/esbuild/**/*',
      // Next.js SWC binaries
      'node_modules/@next/swc-linux-x64-gnu',
      'node_modules/@next/swc-linux-x64-musl',
      'node_modules/@next/swc-win32-x64-msvc',
      // Build tools (not needed at runtime)
      'node_modules/webpack/**/*',
      'node_modules/terser/**/*',
      'node_modules/sharp/**/*',
      'node_modules/typescript/**/*',
      'node_modules/eslint/**/*',
      'node_modules/eslint-*/**/*',
      'node_modules/@typescript-eslint/**/*',
      'node_modules/jest/**/*',
      'node_modules/@jest/**/*',
      'node_modules/postcss/**/*',
      'node_modules/tailwindcss/**/*',
      'node_modules/@testing-library/**/*',
      'node_modules/patch-package/**/*',
      // Babel (not needed with SWC)
      'node_modules/@babel/**/*',
      'node_modules/babel-*/**/*',
      // Large optional deps
      'node_modules/caniuse-lite/**/*',
      'node_modules/browserslist/**/*',
      // Source maps and type definitions
      '**/*.map',
      '**/*.d.ts',
      '**/*.d.mts',
      // Test files
      '**/*.test.js',
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/*.spec.js',
      '**/*.spec.ts',
      '**/__tests__/**/*',
      '**/__mocks__/**/*',
      // Documentation
      '**/README.md',
      '**/CHANGELOG.md',
      '**/LICENSE',
      // Static assets (served separately)
      'public/maps/**/*',
      'public/Forging/**/*',
      'public/My Map/**/*',
    ],
  },

  // Turbopack config (Next.js 16+)
  turbopack: {},
};

export default nextConfig;
