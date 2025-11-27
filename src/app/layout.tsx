import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { ErrorBoundary } from '@/components/error-boundary';
import { AuthProvider } from '@/contexts/auth-context';
import MouseGradient from '@/components/MouseGradient';
import { TextSelectionSearch } from '@/components/TextSelectionSearch';
import SkipToMain from '@/components/SkipToMain';
import ClientLayout from '@/components/layout/client-layout';

export const metadata: Metadata = {
  title: 'AbyssBuilds',
  description: 'Create and share builds for your favorite abyss-crawling game.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="dark scroll-smooth"
      suppressHydrationWarning
      data-darkreader-ignore
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
        <meta name="color-scheme" content="dark light" />
        <meta name="darkreader" content="disable" />
        <Script id="darkreader-hydration-guard" strategy="beforeInteractive">
          {`
            // Strip Dark Reader inline attributes before React hydrates to avoid SSR/CSR mismatch
            (function() {
              try {
                const scrub = (el) => {
                  if (!el || !el.getAttributeNames) return;
                  const names = el.getAttributeNames();
                  let style = el.getAttribute('style') || '';

                  for (const name of names) {
                    if (name.startsWith('data-darkreader-')) {
                      el.removeAttribute(name);
                    }
                  }

                  if (style && style.includes('--darkreader-')) {
                    const cleaned = style
                      .split(';')
                      .map((part) => part.trim())
                      .filter((part) => part && !part.startsWith('--darkreader-'))
                      .join('; ');

                    if (cleaned) {
                      el.setAttribute('style', cleaned);
                    } else {
                      el.removeAttribute('style');
                    }
                  }
                };

                const walk = (root) => {
                  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
                  while (walker.nextNode()) {
                    scrub(walker.currentNode);
                  }
                };

                const root = document.documentElement;
                walk(root);

                const observer = new MutationObserver((mutations) => {
                  for (const mutation of mutations) {
                    if (mutation.type === 'attributes') {
                      scrub(mutation.target);
                    }
                    if (mutation.type === 'childList') {
                      mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) {
                          scrub(node);
                          walk(node);
                        }
                      });
                    }
                  }
                });

                observer.observe(root, { subtree: true, childList: true, attributes: true });
                // Stop observing after hydration should be finished
                setTimeout(() => observer.disconnect(), 4000);
              } catch (err) {
                console.warn('Dark Reader cleanup skipped', err);
              }
            })();
          `}
        </Script>
        <script async src="https://platform.twitter.com/widgets.js" charSet="utf-8"></script>
        <script async defer crossOrigin="anonymous" src="https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v18.0"></script>
      </head>
      <body className={cn('font-body antialiased')}>
        <SkipToMain />
        <ErrorBoundary>
          <AuthProvider>
            <MouseGradient />
            <TextSelectionSearch />
            <ClientLayout>{children}</ClientLayout>
            <Toaster />
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
