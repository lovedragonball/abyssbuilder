'use client';

import { motion } from 'framer-motion';
import { Twitter, Heart, MessageCircle, Repeat2, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TwitterCardProps {
  username: string;
  handle: string;
  content: string;
  timestamp: string;
  likes?: number;
  retweets?: number;
  replies?: number;
  url: string;
  index: number;
}

export function TwitterCard({
  username,
  handle,
  content,
  timestamp,
  likes = 0,
  retweets = 0,
  replies = 0,
  url,
  index,
}: TwitterCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, type: 'spring', stiffness: 100 }}
    >
      <Card className="p-6 hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/10 group">
        <div className="flex gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <Twitter className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-foreground group-hover:text-blue-400 transition-colors">
                  {username}
                </h3>
                <p className="text-sm text-muted-foreground">@{handle}</p>
              </div>
              <Badge variant="outline" className="text-xs">
                {timestamp}
              </Badge>
            </div>

            {/* Tweet Content */}
            <p className="text-sm text-foreground mb-4 whitespace-pre-wrap">
              {content}
            </p>

            {/* Stats */}
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <motion.div
                className="flex items-center gap-1 hover:text-pink-400 transition-colors cursor-pointer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Heart className="w-4 h-4" />
                <span>{likes}</span>
              </motion.div>

              <motion.div
                className="flex items-center gap-1 hover:text-green-400 transition-colors cursor-pointer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Repeat2 className="w-4 h-4" />
                <span>{retweets}</span>
              </motion.div>

              <motion.div
                className="flex items-center gap-1 hover:text-blue-400 transition-colors cursor-pointer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <MessageCircle className="w-4 h-4" />
                <span>{replies}</span>
              </motion.div>

              <motion.a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto flex items-center gap-1 hover:text-blue-400 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ExternalLink className="w-4 h-4" />
                <span>View</span>
              </motion.a>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
