'use client';

import { useEffect, useState } from 'react';
import { ExternalLink, TrendingUp } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type RedditPost = {
  id: string;
  title: string;
  permalink: string;
  subreddit: string;
  score: number;
  created_utc: number;
};

type RedditApiChild = {
  data: RedditPost;
};

type RedditApiResponse = {
  data?: {
    children?: RedditApiChild[];
  };
};

const formatTimeAgo = (unixSeconds: number) => {
  const now = Date.now();
  const diff = Math.max(0, now - unixSeconds * 1000);
  const minutes = Math.floor(diff / (1000 * 60));
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export function RedditCard() {
  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchPosts = async () => {
      try {
        const response = await fetch(
          'https://www.reddit.com/user/DNAbyss_Official/submitted.json?limit=6&raw_json=1',
          {
            signal: controller.signal,
            headers: {
              'Accept': 'application/json',
            },
            mode: 'cors',
            cache: 'no-cache'
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch Reddit posts: ${response.status}`);
        }

        const payload = (await response.json()) as RedditApiResponse;

        if (!payload.data?.children || payload.data.children.length === 0) {
          setError('No recent Reddit activity.');
          return;
        }

        const mapped = payload.data.children.map((child) => ({
          id: child.data.id,
          title: child.data.title,
          permalink: `https://www.reddit.com${child.data.permalink}`,
          subreddit: child.data.subreddit,
          score: child.data.score,
          created_utc: child.data.created_utc,
        }));

        setPosts(mapped);
        setError(null);
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error('Reddit API Error:', err);
        setError('Unable to load Reddit posts right now.');
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchPosts();

    return () => controller.abort();
  }, []);

  return (
    <Card className="overflow-hidden border-2 border-border/50 bg-card/50 backdrop-blur">
      <div className="bg-gradient-to-r from-orange-500/10 via-orange-600/10 to-orange-500/10 p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
            </svg>
            <div>
              <h2 className="text-lg font-bold">Reddit Feed</h2>
              <p className="text-xs text-muted-foreground">Latest from u/DNAbyss_Official</p>
            </div>
          </div>
          <Button asChild variant="outline" size="sm" className="border-orange-500/50 hover:bg-orange-500/10">
            <a
              href="https://www.reddit.com/user/DNAbyss_Official/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <span>Visit</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </Button>
        </div>
      </div>

      <div className="p-4">
        <div className="bg-background rounded-lg overflow-hidden">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse rounded-lg border border-border/50 p-4 bg-muted/10"
                >
                  <div className="h-4 bg-muted/40 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted/30 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center gap-3 py-10 text-center text-muted-foreground">
              <svg className="w-10 h-10 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
              </svg>
              <p className="text-sm font-medium">{error}</p>
              <p className="text-xs">Try again later or open Reddit directly.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.slice(0, 4).map((post) => (
                <a
                  key={post.id}
                  href={post.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block border border-border/50 rounded-lg p-4 hover:border-orange-500/60 hover:bg-orange-500/5 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold leading-snug text-foreground">
                      {post.title}
                    </p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatTimeAgo(post.created_utc)}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <Badge variant="secondary" className="bg-orange-500/10 text-orange-400 border-transparent">
                      r/{post.subreddit}
                    </Badge>
                    <div className="flex items-center gap-1 text-orange-400">
                      <TrendingUp className="w-3 h-3" />
                      <span>{post.score}</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
