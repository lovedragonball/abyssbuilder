'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    signInWithPopup,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    User as FirebaseUser,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { createOrUpdateUserProfile } from '@/lib/firestore';

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
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    updateDisplayName: (displayName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isUserLoading, setIsUserLoading] = useState(true);

    useEffect(() => {
        // Listen to Firebase auth state changes
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
            if (firebaseUser) {
                const userData: User = {
                    uid: firebaseUser.uid,
                    username: firebaseUser.email?.split('@')[0] || 'user',
                    displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
                    photoURL: firebaseUser.photoURL || `https://api.dicebear.com/8.x/bottts/svg?seed=${firebaseUser.uid}`,
                    hasSetDisplayName: !!firebaseUser.displayName,
                };
                setUser(userData);

                // Create/update user profile in Firestore
                try {
                    await createOrUpdateUserProfile(firebaseUser.uid, {
                        username: userData.username,
                        displayName: userData.displayName,
                        photoURL: userData.photoURL,
                        email: firebaseUser.email,
                    });
                } catch (error) {
                    console.error('Error updating user profile:', error);
                }
            } else {
                setUser(null);
            }
            setIsUserLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error('Error signing in with Google:', error);
            throw error;
        }
    };

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
            setUser(null);
        } catch (error) {
            console.error('Error signing out:', error);
            throw error;
        }
    };

    const updateDisplayName = async (displayName: string) => {
        if (!user) return;

        // Validate display name
        if (!displayName || displayName.length > 50) {
            throw new Error('Display name must be between 1 and 50 characters');
        }

        try {
            // Update in Firestore
            await createOrUpdateUserProfile(user.uid, {
                displayName,
            });

            // Update local state
            setUser({
                ...user,
                displayName,
                hasSetDisplayName: true,
            });
        } catch (error) {
            console.error('Error updating display name:', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, isUserLoading, signInWithGoogle, signOut, updateDisplayName }}>
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
