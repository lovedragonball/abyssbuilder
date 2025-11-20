import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import MainLayout from '@/components/layout/main-layout';
import { cn } from '@/lib/utils';
import { ErrorBoundary } from '@/components/error-boundary';
import { AuthProvider } from '@/contexts/auth-context';
import MouseGradient from '@/components/MouseGradient';
import { TextSelectionSearch } from '@/components/TextSelectionSearch';

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
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn('font-body antialiased')}>
        <ErrorBoundary>
          <AuthProvider>
            <MouseGradient />
            <TextSelectionSearch />
            <MainLayout>{children}</MainLayout>
            <Toaster />
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
