'use client';
import Header from './header';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="p-4 sm:p-6 lg:p-8">{children}</div>
    </div>
  );
}
