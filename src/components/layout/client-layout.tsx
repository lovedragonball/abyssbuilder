'use client';

import { Suspense } from 'react';
import MainLayout from '@/components/layout/main-layout';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background">
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </div>
        }>
            <MainLayout>{children}</MainLayout>
        </Suspense>
    );
}
