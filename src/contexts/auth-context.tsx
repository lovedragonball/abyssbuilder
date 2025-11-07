'use client';

import { createContext, useContext, ReactNode } from 'react';

// Simple user type - no authentication needed
interface User {
  uid: string;
  displayName: string;
  email: string;
}

interface AuthContextType {
  user: User;
  loading: boolean;
}

// Default user for everyone (no login required)
const defaultUser: User = {
  uid: 'local-user',
  displayName: 'Local User',
  email: 'local@example.com',
};

const AuthContext = createContext<AuthContextType>({
  user: defaultUser,
  loading: false,
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <AuthContext.Provider value={{ user: defaultUser, loading: false }}>
      {children}
    </AuthContext.Provider>
  );
}
