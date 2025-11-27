# Tailwind CSS Optimization Guide

This guide explains how to optimize Tailwind CSS for production builds to minimize bundle size.

## Current Configuration

The project is already configured to purge unused CSS in production through the `content` array in `tailwind.config.ts`:

```typescript
content: [
  './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
  './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  './src/app/**/*.{js,ts,jsx,tsx,mdx}',
]
```

## Optimization Strategies

### 1. Safelist Important Classes

If you have dynamically generated classes, add them to the safelist:

```typescript
// tailwind.config.ts
export default {
  safelist: [
    // Dynamic color classes
    'bg-primary-500',
    'bg-accent-500',
    // Animation classes
    'animate-fade-in',
    'animate-slide-in-right',
    // Responsive classes that might be dynamic
    {
      pattern: /^(bg|text|border)-(primary|accent|destructive)-(50|100|200|300|400|500|600|700|800|900)$/,
    },
  ],
  // ... rest of config
}
```

### 2. Use JIT Mode (Already Enabled)

Tailwind CSS v3+ uses JIT (Just-In-Time) mode by default, which:
- Generates styles on-demand
- Reduces build time
- Produces smaller CSS files
- Enables arbitrary values

### 3. Minimize Custom CSS

Prefer Tailwind utilities over custom CSS:

❌ **Bad:**
```css
.my-custom-button {
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}
```

✅ **Good:**
```tsx
<button className="bg-gradient-primary px-6 py-3 rounded-lg transition-all duration-300">
  Button
</button>
```

### 4. Extract Common Patterns

For frequently used combinations, use `@apply` in CSS:

```css
@layer components {
  .btn-primary {
    @apply px-6 py-3 rounded-lg bg-gradient-primary text-white font-semibold;
    @apply hover:shadow-glow transition-all duration-300;
    @apply focus-visible:outline-primary focus-visible:outline-offset-2;
  }
}
```

### 5. Optimize Imports

Import only what you need from Tailwind:

```css
/* Instead of importing everything */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* You can selectively import layers if needed */
@layer base {
  /* Only base styles you need */
}
```

## Bundle Size Analysis

### Check Current Bundle Size

```bash
npm run build
```

Look for the CSS file size in the build output.

### Analyze Bundle

Use Next.js bundle analyzer:

```bash
npm install --save-dev @next/bundle-analyzer
```

```javascript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // your config
});
```

Run analysis:
```bash
ANALYZE=true npm run build
```

## Production Optimizations

### 1. CSS Minification

Next.js automatically minifies CSS in production. Ensure you're building with:

```bash
npm run build
```

### 2. Remove Unused Fonts

Only import fonts you actually use:

```typescript
// app/layout.tsx
import { Inter, Poppins } from 'next/font/google';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const poppins = Poppins({ 
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
});
```

### 3. Optimize Images

Use Next.js Image component for automatic optimization:

```tsx
import Image from 'next/image';

<Image
  src="/path/to/image.jpg"
  alt="Description"
  width={500}
  height={300}
  loading="lazy"
  placeholder="blur"
/>
```

### 4. Code Splitting

Use dynamic imports for large components:

```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>,
  ssr: false,
});
```

## Monitoring Bundle Size

### Set Budget Limits

Add performance budgets to your build:

```javascript
// next.config.js
module.exports = {
  experimental: {
    optimizeCss: true,
  },
  // Performance budgets
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.performance = {
        maxAssetSize: 244000, // 244kb
        maxEntrypointSize: 244000,
        hints: 'warning',
      };
    }
    return config;
  },
};
```

### Track Over Time

Use tools like:
- [Bundlephobia](https://bundlephobia.com/) - Check package sizes
- [Bundle Analyzer](https://www.npmjs.com/package/@next/bundle-analyzer) - Visualize bundle
- Lighthouse - Performance audits

## Best Practices

### 1. Avoid Arbitrary Values When Possible

❌ **Bad:**
```tsx
<div className="w-[347px] h-[219px] mt-[23px]">
```

✅ **Good:**
```tsx
<div className="w-80 h-56 mt-6">
```

### 2. Use Tailwind's Built-in Utilities

❌ **Bad:**
```css
.custom-shadow {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}
```

✅ **Good:**
```tsx
<div className="shadow-lg">
```

### 3. Group Related Utilities

Use `@apply` for component patterns:

```css
@layer components {
  .card {
    @apply rounded-lg bg-card p-6 shadow-elevated;
  }
  
  .card-hover {
    @apply hover:shadow-elevated-lg hover:-translate-y-1;
    @apply transition-all duration-300;
  }
}
```

### 4. Remove Unused Plugins

Only include Tailwind plugins you actually use:

```typescript
// tailwind.config.ts
plugins: [
  require('tailwindcss-animate'), // Only if using animations
  // Remove unused plugins
],
```

## Expected Results

After optimization, you should see:

- **CSS Bundle Size:** < 50KB (gzipped)
- **Initial Page Load:** < 3s on 3G
- **Lighthouse Performance:** > 90
- **First Contentful Paint:** < 1.8s

## Troubleshooting

### Issue: Large CSS Bundle

**Solution:**
1. Check for unused custom CSS
2. Verify content paths in tailwind.config.ts
3. Remove unused Tailwind plugins
4. Use @apply for repeated patterns

### Issue: Classes Not Purged

**Solution:**
1. Ensure classes are in content paths
2. Don't use string concatenation for class names
3. Add dynamic classes to safelist

### Issue: Missing Styles in Production

**Solution:**
1. Add classes to safelist if dynamic
2. Check content paths include all files
3. Verify build process completes successfully

## Resources

- [Tailwind CSS Optimization](https://tailwindcss.com/docs/optimizing-for-production)
- [Next.js CSS Optimization](https://nextjs.org/docs/advanced-features/optimizing-css)
- [Web.dev Performance](https://web.dev/performance/)
