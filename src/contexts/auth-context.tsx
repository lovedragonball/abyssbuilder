'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { validateUser } from '@/lib/validation';

interface User {
    uid: string;
    username: string;
    displayName: string;
    photoURL: string;
    hasSetDisplayName?: boolean;
}

interface AuthContextType {
    user: User | null;
    isUserLoading: boolean;
    signIn: (username: string, password: string) => Promise<void>;
    signUp: (username: string, password: string) => Promise<void>;
    signOut: () => void;
    updateDisplayName: (displayName: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isUserLoading, setIsUserLoading] = useState(true);

    useEffect(() => {
        // Load user from localStorage on mount
        const savedUser = storage.getItem<User | null>(STORAGE_KEYS.USER, null);
        if (savedUser) {
            setUser(savedUser);
        }
        setIsUserLoading(false);
    }, []);

    const signIn = async (username: string, password: string) => {
        // Validate input
        const validation = validateUser({ username, password });
        if (!validation.success) {
            throw new Error(validation.errors?.[0]?.message || 'Invalid credentials');
        }

        // Check if user exists
        const users = storage.getItem<Record<string, any>>(STORAGE_KEYS.USERS, {});
        const userData = users[username];

        if (!userData) {
            throw new Error('User not found');
        }

        if (userData.password !== password) {
            throw new Error('Incorrect password');
        }

        const mockUser: User = {
            uid: userData.uid,
            username: username,
            displayName: userData.displayName || username,
            photoURL: `https://api.dicebear.com/8.x/bottts/svg?seed=${username}`,
            hasSetDisplayName: userData.hasSetDisplayName || false,
        };
        setUser(mockUser);
        storage.setItem(STORAGE_KEYS.USER, mockUser);
    };

    const signUp = async (username: string, password: string) => {
        // Validate input
        const validation = validateUser({ username, password });
        if (!validation.success) {
            throw new Error(validation.errors?.[0]?.message || 'Invalid input');
        }

        // Check if username already exists
        const users = storage.getItem<Record<string, any>>(STORAGE_KEYS.USERS, {});

        if (users[username]) {
            throw new Error('Username already exists');
        }

        // Create new user
        const uid = Math.random().toString(36).substring(7);
        users[username] = {
            uid,
            password,
            hasSetDisplayName: false,
        };
        storage.setItem(STORAGE_KEYS.USERS, users);

        // Sign in the new user
        const mockUser: User = {
            uid,
            username,
            displayName: username,
            photoURL: `https://api.dicebear.com/8.x/bottts/svg?seed=${username}`,
            hasSetDisplayName: false,
        };
        setUser(mockUser);
        storage.setItem(STORAGE_KEYS.USER, mockUser);
    };

    const signOut = () => {
        setUser(null);
        storage.removeItem(STORAGE_KEYS.USER);
    };

    const updateDisplayName = (displayName: string) => {
        if (!user) return;

        // Validate display name
        if (!displayName || displayName.length > 50) {
            throw new Error('Display name must be between 1 and 50 characters');
        }

        const updatedUser = {
            ...user,
            displayName,
            hasSetDisplayName: true,
        };

        // Update user in state
        setUser(updatedUser);
        storage.setItem(STORAGE_KEYS.USER, updatedUser);

        // Update in users database
        const users = storage.getItem<Record<string, any>>(STORAGE_KEYS.USERS, {});
        if (users[user.username]) {
            users[user.username].displayName = displayName;
            users[user.username].hasSetDisplayName = true;
            storage.setItem(STORAGE_KEYS.USERS, users);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isUserLoading, signIn, signUp, signOut, updateDisplayName }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
