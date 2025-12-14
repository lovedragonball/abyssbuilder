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
      'lucide-react',
      'date-fns',
      'recharts',
      '@radix-ui/react-accordion',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-popover',
      '@radix-ui/react-select',
      '@radix-ui/react-tooltip',
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
  serverExternalPackages: ['leaflet', 'react-leaflet'],

  // Exclude heavy files from the serverless function bundle
  outputFileTracingExcludes: {
    '*': [
      'node_modules/@swc/core-linux-x64-gnu',
      'node_modules/@swc/core-linux-x64-musl',
      'node_modules/@esbuild/linux-x64',
      'node_modules/webpack',
      'node_modules/terser',
      'node_modules/esbuild',
      'node_modules/sharp', // Vercel provides sharp in the runtime
      'node_modules/@next/swc-linux-x64-gnu',
      'node_modules/@next/swc-linux-x64-musl',
      'node_modules/typescript',
      'node_modules/eslint',
      'node_modules/jest',
      'node_modules/@jest',
      'node_modules/postcss',
      'node_modules/tailwindcss',
      '**/*.map',
      '**/*.d.ts',
      '**/*.test.js',
      '**/*.test.ts',
      'public/maps/**/*',
      'public/Forging/**/*',
    ],
  },

  // Turbopack config (Next.js 16+)
  turbopack: {},
};

export default nextConfig;
