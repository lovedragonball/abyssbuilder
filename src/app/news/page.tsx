'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Twitter, ExternalLink, Newspaper, Calendar, MessageCircle, Facebook } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RedditCard } from '@/components/news/RedditCard';

// Declare Twitter widget types
declare global {
  interface Window {
    twttr?: {
      widgets: {
        load: () => void;
      };
    };
    FB?: {
      XFBML: {
        parse: () => void;
      };
    };
  }
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
    },
  },
};

export default function NewsPage() {
  const facebookFeedRef = useRef<HTMLDivElement>(null);
  const [facebookWidth, setFacebookWidth] = useState(500);
  const [facebookScale, setFacebookScale] = useState(1);
  const [twitterHeight, setTwitterHeight] = useState(800);

  // Load Twitter widget script
  useEffect(() => {
    // Check if script already exists
    if (document.getElementById('twitter-wjs')) {
      // If script exists, reload widgets
      if (window.twttr?.widgets) {
        window.twttr.widgets.load();
      }
      return;
    }

    // Create and load script
    const script = document.createElement('script');
    script.id = 'twitter-wjs';
    script.src = 'https://platform.twitter.com/widgets.js';
    script.async = true;
    script.charset = 'utf-8';

    document.body.appendChild(script);

    return () => {
      // Cleanup if needed
      const existingScript = document.getElementById('twitter-wjs');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  // Load Facebook SDK
  useEffect(() => {
    // Check if SDK already loaded
    if (window.FB) {
      window.FB.XFBML.parse();
      return;
    }

    // Load Facebook SDK
    (function (d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s) as HTMLScriptElement;
      js.id = id;
      js.src = 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v18.0';
      if (fjs && fjs.parentNode) {
        fjs.parentNode.insertBefore(js, fjs);
      }
    }(document, 'script', 'facebook-jssdk'));
  }, []);

  // Keep Facebook embed width closer to actual card size
  useEffect(() => {
    const updateWidth = () => {
      const containerWidth = facebookFeedRef.current?.offsetWidth ?? 500;
      if (containerWidth === 0) return;

      const minEmbedWidth = 320;
      const maxEmbedWidth = 500;
      const embedWidth = Math.max(minEmbedWidth, Math.min(containerWidth, maxEmbedWidth));
      const scale = containerWidth / embedWidth;
      const height = Math.round(800 * scale);

      setFacebookWidth((prev) => (prev === embedWidth ? prev : embedWidth));
      setFacebookScale((prev) => (Math.abs(prev - scale) < 0.01 ? prev : scale));
      setTwitterHeight((prev) => (prev === height ? prev : height));
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);

    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  useEffect(() => {
    if (window.FB?.XFBML) {
      window.FB.XFBML.parse();
    }
  }, [facebookWidth]);

  useEffect(() => {
    if (window.twttr?.widgets) {
      window.twttr.widgets.load();
    }
  }, [twitterHeight]);

  return (
    <>
      {/* Facebook SDK Root */}
      <div id="fb-root"></div>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-12 relative"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute top-10 left-1/4 w-2 h-2 bg-blue-500/30 rounded-full"
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <motion.div
              className="absolute top-20 right-1/3 w-3 h-3 bg-purple-500/20 rounded-full"
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.5,
              }}
            />
          </div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Newspaper className="w-12 h-12 mx-auto mb-4 text-blue-400" />
          </motion.div>

          <motion.h1
            className="text-4xl md:text-5xl font-headline font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Game News & Updates
          </motion.h1>

          <motion.p
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Stay updated with the latest news, announcements, and community updates from Duet Night Abyss
          </motion.p>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <Card className="p-6 hover:border-blue-500 transition-all hover:shadow-lg hover:shadow-blue-500/20 cursor-pointer group">
              <a
                href="https://x.com/DNAbyss_EN"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4"
              >
                <div className="p-3 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                  <Twitter className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg group-hover:text-blue-400 transition-colors">
                    Twitter
                  </h3>
                  <p className="text-sm text-muted-foreground">@DNAbyss_EN</p>
                </div>
                <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-blue-400 transition-colors" />
              </a>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="p-6 hover:border-orange-500 transition-all hover:shadow-lg hover:shadow-orange-500/20 cursor-pointer group">
              <a
                href="https://www.reddit.com/user/DNAbyss_Official/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4"
              >
                <div className="p-3 bg-orange-500/10 rounded-lg group-hover:bg-orange-500/20 transition-colors">
                  <svg className="w-6 h-6 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg group-hover:text-orange-500 transition-colors">
                    Reddit
                  </h3>
                  <p className="text-sm text-muted-foreground">u/DNAbyss_Official</p>
                </div>
                <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-orange-500 transition-colors" />
              </a>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="p-6 hover:border-blue-600 transition-all hover:shadow-lg hover:shadow-blue-600/20 cursor-pointer group">
              <a
                href="https://www.facebook.com/DNAbyss.Official"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4"
              >
                <div className="p-3 bg-blue-600/10 rounded-lg group-hover:bg-blue-600/20 transition-colors">
                  <Facebook className="w-6 h-6 text-blue-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg group-hover:text-blue-500 transition-colors">
                    Facebook
                  </h3>
                  <p className="text-sm text-muted-foreground">Official Page</p>
                </div>
                <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-blue-500 transition-colors" />
              </a>
            </Card>
          </motion.div>

        </motion.div>

        {/* Social Media Feeds - Side by Side */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          {/* Twitter Feed - Left Side */}
          <Card className="overflow-hidden border-2 border-border/50 bg-card/50 backdrop-blur">
            <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 p-4 border-b border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Twitter className="w-5 h-5 text-blue-400" />
                  <div>
                    <h2 className="text-lg font-bold">Twitter Feed</h2>
                    <p className="text-xs text-muted-foreground">@DNAbyss_EN</p>
                  </div>
                </div>
                <Button asChild variant="outline" size="sm" className="border-blue-500/50 hover:bg-blue-500/10">
                  <a
                    href="https://x.com/DNAbyss_EN"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <span>Follow</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </Button>
              </div>
            </div>

            <div className="p-4">
              {/* Twitter Timeline Embed */}
              <div
                className="bg-background rounded-lg overflow-hidden w-full"
                style={{ minHeight: `${twitterHeight}px` }}
              >
                <a
                  key={twitterHeight}
                  className="twitter-timeline"
                  data-theme="dark"
                  data-height={twitterHeight}
                  data-width="100%"
                  data-chrome="noheader nofooter noborders transparent"
                  data-tweet-limit="20"
                  data-dnt="false"
                  data-link-color="#a855f7"
                  data-border-color="#1e293b"
                  data-aria-polite="polite"
                  href="https://twitter.com/DNAbyss_EN?ref_src=twsrc%5Etfw"
                >
                  <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 360],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    >
                      <Twitter className="w-12 h-12 mb-4 text-blue-400" />
                    </motion.div>
                    <p className="text-lg font-semibold">Loading tweets...</p>
                    <p className="text-sm mt-2">Please wait</p>
                    <div className="mt-4 flex gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </Card>

          {/* Reddit Feed - Middle */}
          <RedditCard />

          {/* Facebook Feed - Right Side */}
          <Card className="overflow-hidden border-2 border-border/50 bg-card/50 backdrop-blur">
            <div className="bg-gradient-to-r from-blue-600/10 via-blue-500/10 to-blue-600/10 p-4 border-b border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Facebook className="w-5 h-5 text-blue-500" />
                  <div>
                    <h2 className="text-lg font-bold">Facebook Page</h2>
                    <p className="text-xs text-muted-foreground">DNAbyss.Official</p>
                  </div>
                </div>
                <Button asChild variant="outline" size="sm" className="border-blue-500/50 hover:bg-blue-500/10">
                  <a
                    href="https://www.facebook.com/DNAbyss.Official"
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
              {/* Facebook Page Plugin */}
              <div
                ref={facebookFeedRef}
                className="bg-background rounded-lg overflow-hidden w-full"
              >
                <div
                  className="relative w-full"
                  style={{ height: `${800 * facebookScale}px` }}
                >
                  <div
                    className="absolute top-0 left-0 origin-top-left"
                    style={{
                      transform: `scale(${facebookScale})`,
                      width: `${facebookWidth}px`,
                      height: '800px',
                    }}
                  >
                    <div
                      className="fb-page w-full"
                      data-href="https://www.facebook.com/DNAbyss.Official"
                      data-tabs="timeline"
                      data-width={facebookWidth}
                      data-height="800"
                      data-small-header="false"
                      data-adapt-container-width="true"
                      data-hide-cover="false"
                      data-show-facepile="true"
                    >
                      <blockquote cite="https://www.facebook.com/DNAbyss.Official" className="fb-xfbml-parse-ignore">
                        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                          <motion.div
                            animate={{
                              scale: [1, 1.2, 1],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: 'easeInOut',
                            }}
                          >
                            <Facebook className="w-12 h-12 mb-4 text-blue-500" />
                          </motion.div>
                          <p className="text-lg font-semibold">Loading Facebook...</p>
                          <p className="text-sm mt-2">Please wait</p>
                          <div className="mt-4 flex gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </blockquote>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

      </div>
    </>
  );
}

