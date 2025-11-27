# Bundle Size Optimization Guide

This guide provides strategies and best practices for optimizing bundle size in the AbyssBuilder project.

## Current Optimizations

### 1. Next.js Configuration

The project is configured with several optimizations in `next.config.ts`:

- **CSS Optimization**: `experimental.optimizeCss: true`
- **Console Removal**: Removes console.log in production (keeps error/warn)
- **Tree Shaking**: Enabled for production builds
- **Performance Budgets**: 244KB limit for assets and entry points

### 2. Lazy Loading

Non-critical components are lazy-loaded using `src/lib/lazy-components.ts`:

```typescript
import { LazyBuildCard, LazyGameMap } from '@/lib/lazy-components';

// Component loads only when needed
<LazyBuildCard build={build} />
```

### 3. Optimized Imports

#### Framer Motion

Use specific imports from `src/lib/framer-motion-config.ts`:

```typescript
// ❌ Bad - imports entire library
import { motion, AnimatePresence } from 'framer-motion';

// ✅ Good - tree-shakeable
import { motion, AnimatePresence } from '@/lib/framer-motion-config';
```

#### Lodash

```typescript
// ❌ Bad - imports entire library (70KB+)
import _ from 'lodash';
import { debounce } from 'lodash';

// ✅ Good - imports only what's needed
import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';
```

#### Date Libraries

```typescript
// ❌ Bad - moment.js is huge (67KB)
import moment from 'moment';

// ✅ Good - use date-fns (tree-shakeable)
import { format, parseISO } from 'date-fns';
```

## Bundle Analysis

### Run Bundle Analyzer

1. Install the analyzer:
```bash
npm install --save-dev @next/bundle-analyzer
```

2. Update `next.config.ts`:
```typescript
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);
```

3. Run analysis:
```bash
ANALYZE=true npm run build
```

### Check Bundle Size

```bash
npm run build
```

Look for output like:
```
Route (app)                              Size     First Load JS
┌ ○ /                                    5.2 kB         95.3 kB
├ ○ /about                               2.1 kB         92.2 kB
└ ○ /builds                              8.4 kB         98.5 kB
```

## Optimization Strategies

### 1. Code Splitting

#### Dynamic Imports

```typescript
import dynamic from 'next/dynamic';

// Load component only when needed
const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <Skeleton />,
  ssr: false, // Don't render on server
});
```

#### Route-based Splitting

Next.js automatically splits code by route. Keep routes focused:

```
app/
├── page.tsx           # Homepage (minimal)
├── builds/
│   └── page.tsx       # Builds page (loads build components)
└── map/
    └── page.tsx       # Map page (loads map components)
```

### 2. Dependency Optimization

#### Audit Dependencies

```bash
npm install -g depcheck
depcheck
```

Remove unused dependencies:
```bash
npm uninstall unused-package
```

#### Check Package Sizes

Use [Bundlephobia](https://bundlephobia.com/) before installing:

```bash
# Check size before installing
npx bundle-phobia package-name
```

#### Replace Heavy Dependencies

| Heavy Package | Lightweight Alternative | Size Savings |
|--------------|------------------------|--------------|
| moment.js (67KB) | date-fns (tree-shakeable) | ~60KB |
| lodash (70KB) | lodash-es (tree-shakeable) | ~65KB |
| axios (13KB) | fetch API (native) | 13KB |
| uuid (9KB) | crypto.randomUUID() (native) | 9KB |

### 3. Image Optimization

#### Use Next.js Image Component

```typescript
import Image from 'next/image';

<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority // For above-the-fold images
  placeholder="blur"
  blurDataURL="data:image/..." // Low-quality placeholder
/>
```

#### Optimize Image Formats

- Use WebP format (30% smaller than JPEG)
- Use AVIF format (50% smaller than JPEG)
- Compress images before upload

```bash
# Install sharp for image optimization
npm install sharp
```

#### Lazy Load Images

```typescript
<Image
  src="/below-fold.jpg"
  alt="Content"
  width={800}
  height={400}
  loading="lazy" // Lazy load below-fold images
/>
```

### 4. Font Optimization

#### Use Next.js Font Optimization

```typescript
import { Inter, Poppins } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  // Only load weights you need
  weight: ['400', '600', '700'],
});
```

#### Preload Critical Fonts

```typescript
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <head>
        <link
          rel="preload"
          href="/fonts/custom-font.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### 5. CSS Optimization

#### Tailwind CSS

Already optimized through JIT mode. Additional tips:

```typescript
// tailwind.config.ts
export default {
  // Only scan files that use Tailwind
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  
  // Safelist dynamic classes
  safelist: [
    'bg-primary-500',
    'text-accent-600',
  ],
}
```

#### Remove Unused CSS

```bash
# Install PurgeCSS for custom CSS
npm install --save-dev @fullhuman/postcss-purgecss
```

### 6. JavaScript Optimization

#### Minification

Next.js uses SWC for minification (faster than Terser).

#### Tree Shaking

Ensure imports are tree-shakeable:

```typescript
// ❌ Bad - imports everything
import * as utils from './utils';

// ✅ Good - imports only what's needed
import { formatDate, parseDate } from './utils';
```

#### Remove Dead Code

```typescript
// Use environment variables to remove code
if (process.env.NODE_ENV === 'development') {
  // This code is removed in production
  console.log('Debug info');
}
```

### 7. Third-Party Scripts

#### Load Scripts Efficiently

```typescript
import Script from 'next/script';

<Script
  src="https://analytics.example.com/script.js"
  strategy="lazyOnload" // Load after page is interactive
/>
```

#### Self-host Third-Party Scripts

Instead of loading from CDN, self-host for better caching:

```bash
# Download and add to public folder
public/
└── scripts/
    └── analytics.js
```

## Performance Budgets

### Set Budgets

```typescript
// next.config.ts
webpack: (config) => {
  config.performance = {
    maxAssetSize: 244000, // 244KB
    maxEntrypointSize: 244000,
    hints: 'error', // Fail build if exceeded
  };
  return config;
}
```

### Monitor Budgets

Use Lighthouse CI to track budgets over time:

```bash
npm install -g @lhci/cli
lhci autorun
```

## Monitoring

### Lighthouse

```bash
npm install -g lighthouse
lighthouse https://your-site.com --view
```

Target scores:
- Performance: > 90
- First Contentful Paint: < 1.8s
- Largest Contentful Paint: < 2.5s
- Total Blocking Time: < 200ms
- Cumulative Layout Shift: < 0.1

### Web Vitals

Monitor Core Web Vitals:

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

## Checklist

### Before Deploying

- [ ] Run `npm run build` and check bundle sizes
- [ ] Run Lighthouse audit (score > 90)
- [ ] Test on slow 3G network
- [ ] Check bundle analyzer for large dependencies
- [ ] Verify images are optimized
- [ ] Ensure fonts are preloaded
- [ ] Test with reduced motion enabled
- [ ] Check for unused dependencies
- [ ] Verify code splitting is working
- [ ] Test lazy loading components

### Regular Maintenance

- [ ] Monthly: Review bundle size trends
- [ ] Quarterly: Audit dependencies
- [ ] Quarterly: Update optimization strategies
- [ ] Yearly: Review and update performance budgets

## Common Issues

### Issue: Large Bundle Size

**Diagnosis:**
```bash
ANALYZE=true npm run build
```

**Solutions:**
1. Identify large dependencies in analyzer
2. Replace with lighter alternatives
3. Lazy load heavy components
4. Use dynamic imports

### Issue: Slow Initial Load

**Diagnosis:**
```bash
lighthouse https://your-site.com
```

**Solutions:**
1. Reduce JavaScript bundle size
2. Optimize images
3. Preload critical resources
4. Use code splitting

### Issue: Poor Performance on Mobile

**Diagnosis:**
Test on actual mobile device or Chrome DevTools mobile emulation

**Solutions:**
1. Reduce bundle size
2. Optimize images for mobile
3. Use responsive images
4. Lazy load below-fold content

## Resources

- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)
- [Web.dev Performance](https://web.dev/performance/)
- [Bundlephobia](https://bundlephobia.com/)
- [Bundle Analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
