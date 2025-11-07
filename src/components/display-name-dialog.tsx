'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function DisplayNameDialog() {
    const { user, updateDisplayName } = useAuth();
    const { toast } = useToast();
    const [displayName, setDisplayName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const isOpen = user ? !user.hasSetDisplayName : false;

    const handleSave = async () => {
        if (!displayName.trim()) {
            setError('Please enter a display name');
            return;
        }

        if (displayName.length < 2) {
            setError('Display name must be at least 2 characters');
            return;
        }

        if (displayName.length > 30) {
            setError('Display name cannot be more than 30 characters');
            return;
        }

        setLoading(true);
        setError('');

        try {
            updateDisplayName(displayName.trim());
            toast({
                title: 'Display Name Set!',
                description: 'Your display name has been saved successfully.',
            });
        } catch (err) {
            setError('Failed to save display name. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
        }
    };

    return (
        <Dialog open={isOpen}>
            <DialogContent hideCloseButton className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Set Your Display Name</DialogTitle>
                    <DialogDescription>
                        Choose a display name that others will see. This can be different from your username.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="displayName">Display Name</Label>
                        <Input
                            id="displayName"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Enter your display name"
                            disabled={loading}
                            autoFocus
                        />
                        <p className="text-xs text-muted-foreground">Your username: @{user?.username}</p>
                    </div>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                </div>
                <DialogFooter>
                    <Button onClick={handleSave} disabled={loading} className="w-full">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Display Name
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
