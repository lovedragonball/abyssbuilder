'use client';

import { DisplayNameDialog } from './display-name-dialog';

export function AuthWrapper({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
            <DisplayNameDialog />
        </>
    );
}
