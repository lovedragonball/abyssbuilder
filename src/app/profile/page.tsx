'use client';

import { useAuth } from '@/contexts/auth-context';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import BuildCard from '@/components/build-card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Build } from '@/lib/types';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export default function MyProfilePage() {
  const { user, isUserLoading } = useAuth();
  const [builds, setBuilds] = useState<Build[]>([]);
  const [areBuildsLoading, setAreBuildsLoading] = useState(true);

  const loadBuilds = () => {
    if (user) {
      // Load builds from localStorage
      const savedBuilds = JSON.parse(localStorage.getItem('builds') || '[]');
      const userBuilds = savedBuilds.filter((b: Build) => b.userId === user.uid);
      setBuilds(userBuilds);
    }
    setAreBuildsLoading(false);
  };

  useEffect(() => {
    loadBuilds();
  }, [user]);

  const handleBuildDeleted = (buildId: string) => {
    setBuilds((prevBuilds) => prevBuilds.filter((b) => b.id !== buildId));
  };

  if (isUserLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h1 className="text-2xl font-headline font-bold">Please Log In</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          You need to be logged in to view your profile.
        </p>
        <Button asChild className="mt-6">
          <Link href="#">Login</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6 mb-12">
        <Avatar className="h-24 w-24 border-2 border-primary">
          <AvatarImage src={user.photoURL} alt={user.displayName} />
          <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="text-center sm:text-left">
          <h1 className="text-4xl font-headline font-bold">{user.displayName}</h1>
          <p className="text-muted-foreground">@{user.username}</p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-headline font-bold">My Builds</h2>
        <Button asChild>
          <Link href="/create">Create New Build</Link>
        </Button>
      </div>

      {areBuildsLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      )}

      {!areBuildsLoading && builds && builds.length === 0 && (
        <Alert>
          <Terminal className="h-4 w-4" />
          <AlertTitle>No Builds Yet!</AlertTitle>
          <AlertDescription>
            You haven't created any builds. Start by creating one!
            <Button asChild variant="link" className="p-0 h-auto ml-2">
              <Link href="/create">Create a Build</Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {builds && builds.length > 0 && (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {builds.map((build) => (
            <BuildCard key={build.id} build={build} showEditButton={true} onDelete={handleBuildDeleted} />
          ))}
        </motion.div>
      )}
    </div>
  );
}
