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
    const { signIn, signUp } = useAuth();
    const { toast } = useToast();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);

    const handleAuthAction = async () => {
        if (!username || !password) {
            setError('Please fill in all fields');
            return;
        }

        if (username.length < 3) {
            setError('Username must be at least 3 characters');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        setError('');
        try {
            if (isSignUp) {
                await signUp(username, password);
                toast({
                    title: 'Account Created',
                    description: "Welcome to AbyssBuilds! You're now signed in.",
                });
            } else {
                await signIn(username, password);
                toast({
                    title: 'Signed In',
                    description: 'Welcome back!',
                });
            }
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
            <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                    id="username"
                    type="text"
                    placeholder="your_username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={loading}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    disabled={loading}
                />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex flex-col gap-2">
                <Button onClick={handleAuthAction} disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSignUp ? 'Sign Up' : 'Sign In'}
                </Button>
                <Button
                    variant="link"
                    size="sm"
                    className="text-muted-foreground"
                    onClick={() => {
                        setIsSignUp(!isSignUp);
                        setError('');
                    }}
                    disabled={loading}
                >
                    {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                </Button>
            </div>
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
