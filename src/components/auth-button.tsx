'use client';

import { Button } from './ui/button';
import { useAuth } from '@/contexts/auth-context';
import { Skeleton } from './ui/skeleton';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { LogIn, LogOut, Loader2, User as UserIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from './ui/dialog';
import { Input } from './ui/input';
import { useToast } from '@/hooks/use-toast';
import { Label } from './ui/label';
import Link from 'next/link';

function UserProfile() {
    const { user, signOut } = useAuth();

    if (!user) return null;

    const handleSignOut = () => {
        signOut();
    };

    const getInitials = (name: string) => {
        return name.charAt(0).toUpperCase();
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user.photoURL} alt={user.displayName} />
                        <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.displayName}</p>
                        <p className="text-xs leading-none text-muted-foreground">@{user.username}</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/profile">
                        <UserIcon className="mr-2 h-4 w-4" />
                        <span>My Profile</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function AuthForm() {
    const { signInWithGoogle } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError('');
        try {
            await signInWithGoogle();
            toast({
                title: 'Signed In',
                description: 'Welcome to AbyssBuilds!',
            });
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button onClick={handleGoogleSignIn} disabled={loading} className="w-full" size="lg">
                {loading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                    <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                        <path
                            fill="currentColor"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                            fill="currentColor"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                            fill="currentColor"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                            fill="currentColor"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                    </svg>
                )}
                Continue with Google
            </Button>
        </div>
    );
}

function SignInDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Welcome to AbyssBuilds</DialogTitle>
                    <DialogDescription>Sign in or create an account to save and share your builds.</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <AuthForm />
                </div>
            </DialogContent>
        </Dialog>
    );
}

export function AuthButton() {
    const { user, isUserLoading } = useAuth();
    const [isSignInDialogOpen, setSignInDialogOpen] = useState(false);

    useEffect(() => {
        if (user) {
            setSignInDialogOpen(false);
        }
    }, [user]);

    if (isUserLoading) {
        return <Skeleton className="h-8 w-24" />;
    }

    return (
        <>
            {user ? (
                <UserProfile />
            ) : (
                <Button onClick={() => setSignInDialogOpen(true)} variant="outline">
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                </Button>
            )}
            <SignInDialog open={isSignInDialogOpen} onOpenChange={setSignInDialogOpen} />
        </>
    );
}
