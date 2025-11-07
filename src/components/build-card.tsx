'use client';
import Link from 'next/link';
import Image from 'next/image';
import type { Build } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, Eye, User, Globe, Lock, Edit, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';

type BuildCardProps = {
  build: Build;
  showEditButton?: boolean;
  onDelete?: (buildId: string) => void;
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function BuildCard({ build, showEditButton = false, onDelete }: BuildCardProps) {
  const voteCount = build.voteCount || 0;
  const views = build.views || 0;
  const { toast } = useToast();
  const { user } = useAuth();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [currentVoteCount, setCurrentVoteCount] = useState(voteCount);

  useEffect(() => {
    if (user && build.votedBy) {
      setHasVoted(build.votedBy.includes(user.uid));
    }
  }, [user, build.votedBy]);

  const handleVote = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Login Required',
        description: 'Please login to vote on builds.',
      });
      return;
    }

    try {
      const { voteBuild } = await import('@/lib/firestore');
      await voteBuild(build.id, user.uid, !hasVoted);
      
      if (hasVoted) {
        setHasVoted(false);
        setCurrentVoteCount(prev => Math.max(0, prev - 1));
        toast({
          title: 'Vote Removed',
          description: 'Your vote has been removed.',
        });
      } else {
        setHasVoted(true);
        setCurrentVoteCount(prev => prev + 1);
        toast({
          title: 'Voted!',
          description: 'Thanks for voting on this build.',
        });
      }
    } catch (error) {
      console.error('Error voting:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to vote. Please try again.',
      });
    }
  };

  const handleDelete = async () => {
    try {
      const { deleteBuild } = await import('@/lib/firestore');
      await deleteBuild(build.id);

      toast({
        title: 'Build Deleted',
        description: 'Your build has been deleted successfully.',
      });

      setIsDeleteDialogOpen(false);
      
      if (onDelete) {
        onDelete(build.id);
      }
    } catch (error) {
      console.error('Error deleting build:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete build. Please try again.',
      });
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <div className="group block h-full relative">
        <Link href={`/builds/${build.id}`}>
          <Card className="flex h-full flex-col overflow-hidden transition-all duration-300 hover:border-primary hover:shadow-lg hover:shadow-primary/10 bg-card">
            <CardHeader className="relative p-0">
              <div className="aspect-[3/4] w-full overflow-hidden">
                <Image
                  src={build.itemImage}
                  alt={build.itemName}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  data-ai-hint="fantasy character"
                />
                <div className="absolute top-2 right-2">
                  <Badge
                    variant={build.visibility === 'public' ? 'secondary' : 'destructive'}
                    className="flex items-center gap-1"
                  >
                    {build.visibility === 'public' ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                    <span className="capitalize">{build.visibility}</span>
                  </Badge>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/70 to-transparent" />
              <div className="absolute bottom-0 left-0 p-4 w-full">
                <h3 className="font-headline text-xl font-bold truncate">{build.buildName}</h3>
                <p className="font-semibold truncate">{build.itemName}</p>
              </div>
            </CardHeader>
            <CardContent className="flex-grow p-4">
              <div className="flex items-center gap-2 text-sm mb-2">
                <User className="h-4 w-4 text-primary" />
                <span className="font-medium text-foreground">
                  {build.creator || 'Anonymous'}
                </span>
              </div>
              {build.contentFocus && build.contentFocus.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {build.contentFocus.map((focus) => (
                    <Badge key={focus} variant="secondary" className="capitalize">
                      {focus.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between p-4 pt-0 text-sm">
              <button
                onClick={handleVote}
                className={cn(
                  "flex items-center gap-2 transition-colors hover:text-primary",
                  hasVoted ? "text-primary" : "text-muted-foreground"
                )}
              >
                <ThumbsUp className={cn("h-4 w-4", hasVoted && "fill-current")} />
                <span>{currentVoteCount.toLocaleString()}</span>
              </button>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Eye className="h-4 w-4" />
                <span>{views.toLocaleString()}</span>
              </div>
            </CardFooter>
          </Card>
        </Link>
        {showEditButton && (
          <div className="absolute bottom-4 right-4 z-10 flex gap-2">
            <Button
              asChild
              size="sm"
              variant="outline"
              onClick={(e) => e.stopPropagation()}
            >
              <Link href={`/create/${build.itemId}?buildId=${build.id}`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDeleteDialogOpen(true);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Build</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{build.buildName}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Build
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
