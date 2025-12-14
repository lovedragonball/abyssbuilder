"use client"

import * as React from "react"

// Twitter/X Icon Component
const TwitterIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

const TWITTER_SCRIPT_ID = "twitter-wjs"
const TWITTER_SCRIPT_SRC = "https://platform.twitter.com/widgets.js"
const FALLBACK_FETCH_TIMEOUT = 8000

type WidgetStatus = "idle" | "loading" | "ready" | "error"
type FallbackStatus = "idle" | "loading" | "ready" | "error"

type TweetItem = {
  id: string
  text: string
  tweetUrl: string
  url?: string
  imageUrl?: string
  imageUrls?: string[]
  videoUrl?: string
  videoEmbedUrl?: string
  statusId?: string
}

function loadTwitterScript() {
  return new Promise<any>((resolve, reject) => {
    const tw = (window as any).twttr
    if (tw?.widgets) {
      resolve(tw)
      return
    }

    const existingScript = document.getElementById(TWITTER_SCRIPT_ID) as HTMLScriptElement | null
    const script = existingScript ?? document.createElement("script")
    const timeout = window.setTimeout(() => reject(new Error("twitter-sdk-timeout")), 9000)

    const handleLoad = () => {
      window.clearTimeout(timeout)
      resolve((window as any).twttr)
    }
    const handleError = () => {
      window.clearTimeout(timeout)
      reject(new Error("twitter-sdk-failed"))
    }

    if (!existingScript) {
      script.id = TWITTER_SCRIPT_ID
      script.src = TWITTER_SCRIPT_SRC
      script.async = true
      script.onload = handleLoad
      script.onerror = handleError
      document.body.appendChild(script)
    } else {
      existingScript.onload = handleLoad
      existingScript.onerror = handleError
    }
  })
}

export function TwitterCard() {
  const [fallbackTweets, setFallbackTweets] = React.useState<TweetItem[]>([])
  const [fallbackStatus, setFallbackStatus] = React.useState<FallbackStatus>("idle")
  const fallbackStatusRef = React.useRef<FallbackStatus>("idle")
  const fallbackUrl = "/social/twitter-fallback.json"

  async function fetchTweets(): Promise<TweetItem[]> {
    try {
      const res = await fetch("/api/social/twitter", { cache: "no-store" })
      const json = await res.json().catch(() => null)
      const tweets = (json?.tweets ?? []) as TweetItem[]
      if (tweets.length) return tweets
      if (!res.ok) throw new Error(json?.error || "api_failed")
    } catch (err) {
      console.warn("Twitter API unavailable, using static fallback:", err)
    }

    try {
      const res = await fetch(fallbackUrl, { cache: "no-store" })
      const json = await res.json()
      const tweets = (json?.tweets ?? []) as TweetItem[]
      return tweets
    } catch (err) {
      console.error("Twitter static fallback failed:", err)
      return []
    }
  }

  React.useEffect(() => {
    fallbackStatusRef.current = fallbackStatus
  }, [fallbackStatus])

  const loadFallback = React.useCallback(() => {
    if (fallbackStatusRef.current === "loading") return
    setFallbackStatus("loading")
    fallbackStatusRef.current = "loading"
    setFallbackTweets([])

    fetchTweets()
      .then((tweets) => {
        setFallbackTweets(tweets)
        setFallbackStatus(tweets.length > 0 ? "ready" : "error")
        fallbackStatusRef.current = tweets.length > 0 ? "ready" : "error"
      })
      .catch((error) => {
        console.error('Twitter fallback fetch error:', error);
        setFallbackStatus("error")
        fallbackStatusRef.current = "error"
      })
  }, [])

  React.useEffect(() => {
    if (fallbackStatus === "idle") {
      loadFallback()
    }
  }, [fallbackStatus, loadFallback])

  const renderTweetMedia = (tweet: TweetItem) => {
    const poster = tweet.imageUrl ?? tweet.imageUrls?.[0]

    // Priority 1: Display images first if available
    if (poster) {
      return (
        <div className="relative w-full overflow-hidden rounded-md border border-gray-800/60 bg-gray-950/40">
          <img
            src={poster}
            alt="Tweet media"
            className="w-full h-auto object-cover max-h-[500px]"
            loading="lazy"
            onError={(e) => {
              // Hide broken images
              e.currentTarget.style.display = 'none'
            }}
          />
        </div>
      )
    }

    // Priority 2: Video embed URLs (YouTube, Piped, etc.)
    if (tweet.videoEmbedUrl) {
      return (
        <div className="w-full overflow-hidden rounded-md border border-gray-800/60 bg-black/60 relative pt-[56.25%]">
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src={tweet.videoEmbedUrl}
            title={tweet.statusId ? `Tweet ${tweet.statusId}` : "Tweet video"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      )
    }

    // Priority 3: Direct video URLs
    if (tweet.videoUrl) {
      return (
        <div className="w-full overflow-hidden rounded-md border border-gray-800/60 bg-black/60">
          <video className="w-full h-auto max-h-[400px]" controls preload="metadata">
            <source src={tweet.videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )
    }

    // Priority 4: If we have a status ID but no media, try Twitframe embed
    if (tweet.statusId) {
      const twitframe = `https://twitframe.com/show?url=${encodeURIComponent(`https://x.com/i/status/${tweet.statusId}`)}`
      return (
        <div className="w-full overflow-hidden rounded-md border border-gray-800/60 bg-black/60 relative pt-[56.25%]">
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src={twitframe}
            title={tweet.statusId ? `Tweet ${tweet.statusId}` : "Tweet"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      )
    }

    return null
  }

  const renderFallbackContent = () => {
    if (fallbackStatus === "loading") {
      return (
        <div className="flex flex-col items-center justify-center gap-3 text-gray-300 text-sm h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1DA1F2]" />
          <p>Loading tweets...</p>
          <a
            href="https://twitter.com/DNAbyss_EN"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#1DA1F2] text-xs hover:underline"
          >
            Open @DNAbyss_EN on X
          </a>
        </div>
      )
    }

    if (fallbackStatus === "error") {
      return (
        <div className="flex flex-col items-center justify-center gap-3 text-gray-300 text-sm h-full text-center">
          <p>We could not load tweets.</p>
          <div className="flex items-center gap-2">
            <button
              onClick={loadFallback}
              className="px-3 py-1.5 rounded-md border border-gray-700/70 bg-gray-900/70 text-xs text-gray-100 hover:border-gray-600 hover:bg-gray-800/70 transition-colors"
            >
              Retry
            </button>
            <a
              href="https://twitter.com/DNAbyss_EN"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1DA1F2] text-xs hover:underline"
            >
              Open on X
            </a>
          </div>
        </div>
      )
    }

    if (fallbackTweets.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 text-gray-300 text-sm h-full text-center">
          <p>No tweets available.</p>
          <a
            href="https://twitter.com/DNAbyss_EN"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#1DA1F2] text-xs hover:underline"
          >
            Open on X
          </a>
        </div>
      )
    }

    return (
      <div className="space-y-3">
        {fallbackTweets.map((tweet) => {
          const tweetLink = tweet.tweetUrl ?? tweet.url ?? "https://x.com/DNAbyss_EN"
          return (
            <div key={tweet.id} className="rounded-md border border-gray-800/70 bg-gray-900/60 p-3 space-y-3">
              {renderTweetMedia(tweet)}
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{tweet.text}</p>
              <div className="text-xs text-gray-500 mt-2 flex items-center justify-between">
                <span>Twitter</span>
                <a href={tweetLink} target="_blank" rel="noopener noreferrer" className="text-[#1DA1F2] hover:underline">
                  View on X
                </a>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="bg-gray-800/80 rounded-lg border border-gray-700/50 overflow-hidden h-full flex flex-col">
      <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#1DA1F2]/10 flex items-center justify-center">
            <TwitterIcon className="w-5 h-5 text-[#1DA1F2]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-200">Twitter</h3>
            <p className="text-xs text-gray-400">@DNAbyss_EN</p>
          </div>
        </div>
        <a
          href="https://twitter.com/DNAbyss_EN"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-[#1DA1F2] hover:underline"
        >
          <span>Follow</span>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
      <div className="flex-1 p-4 bg-gray-900/30">
        <div className="text-sm font-medium text-gray-300 mb-3">Twitter Feed</div>
        <div className="text-xs text-gray-400 mb-2">@DNAbyss_EN</div>
        <div className="relative h-full min-h-[520px] overflow-hidden rounded-lg bg-gray-950/40 border border-gray-800/60">
          <div className="h-[520px] overflow-y-auto p-4 space-y-3 bg-gray-950/70 text-gray-100 text-sm">
            {renderFallbackContent()}
          </div>
        </div>
      </div>
    </div>
  )
}
