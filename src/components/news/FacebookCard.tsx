"use client"

import * as React from "react"

// Facebook Icon Component
const FacebookIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
)

const EMBED_TIMEOUT = 5000
const FALLBACK_FETCH_TIMEOUT = 8000

type ViewMode = "embed" | "fallback"
type EmbedStatus = "idle" | "loading" | "ready" | "error"
type FallbackStatus = "idle" | "loading" | "ready" | "error"

type FacebookPost = {
  id: string
  message: string
  postUrl: string
  imageUrl?: string
  createdTime?: string
}

export function FacebookCard() {
  const pageUrl = "https://www.facebook.com/DuelNightAbyss"
  const [view, setView] = React.useState<ViewMode>("embed")
  const [embedStatus, setEmbedStatus] = React.useState<EmbedStatus>("idle")
  const [fallbackStatus, setFallbackStatus] = React.useState<FallbackStatus>("idle")
  const [fallbackPosts, setFallbackPosts] = React.useState<FacebookPost[]>([])

  const iframeRef = React.useRef<HTMLIFrameElement>(null)
  const embedStatusRef = React.useRef<EmbedStatus>("idle")
  const fallbackStatusRef = React.useRef<FallbackStatus>("idle")

  // Static fallback data
  const staticFallback: FacebookPost[] = [
    {
      id: "1",
      message: "🌈 Event reminder: Rainbow-coloured Dream continues this week. Don't forget to claim Secret Letter rewards!",
      postUrl: pageUrl,
      createdTime: "Recent"
    },
    {
      id: "2",
      message: "⚔️ Known issues tracker — co-op homing arrow and summon buffs are being investigated.",
      postUrl: pageUrl,
      createdTime: "Recent"
    },
    {
      id: "3",
      message: "📝 Patch note highlights: fixed Secret Letter sources, resolved duplicated UI in event screens, and reissued missing clues via in-game mail.",
      postUrl: pageUrl,
      createdTime: "Recent"
    }
  ]

  async function fetchFacebookPosts(): Promise<FacebookPost[]> {
    try {
      const res = await fetch("/api/social/facebook", { cache: "no-store" })
      const json = await res.json().catch(() => null)
      const posts = (json?.posts ?? []) as FacebookPost[]
      if (posts.length) return posts
      if (!res.ok) throw new Error(json?.error || "api_failed")
    } catch (err) {
      console.warn("Facebook API unavailable, using static fallback:", err)
    }

    // Return static fallback
    return staticFallback
  }

  React.useEffect(() => {
    embedStatusRef.current = embedStatus
  }, [embedStatus])

  React.useEffect(() => {
    fallbackStatusRef.current = fallbackStatus
  }, [fallbackStatus])

  const loadFallback = React.useCallback(() => {
    if (fallbackStatusRef.current === "loading") return
    setFallbackStatus("loading")
    fallbackStatusRef.current = "loading"
    setFallbackPosts([])

    fetchFacebookPosts()
      .then((posts) => {
        setFallbackPosts(posts)
        setFallbackStatus(posts.length > 0 ? "ready" : "error")
        fallbackStatusRef.current = posts.length > 0 ? "ready" : "error"
        if (embedStatusRef.current !== "ready") {
          setEmbedStatus("error")
          embedStatusRef.current = "error"
          setView("fallback")
        }
      })
      .catch((error) => {
        console.error('Facebook fallback fetch error:', error)
        // Even on error, use static fallback
        setFallbackPosts(staticFallback)
        setFallbackStatus("ready")
        fallbackStatusRef.current = "ready"
        if (embedStatusRef.current !== "ready") {
          setView("fallback")
        }
      })
  }, [])

  React.useEffect(() => {
    let isCancelled = false
    let embedTimer: number | undefined

    setEmbedStatus("loading")
    embedStatusRef.current = "loading"

    // Set a timeout to detect if embed fails to load
    embedTimer = window.setTimeout(() => {
      if (isCancelled) return
      if (embedStatusRef.current !== "ready") {
        setEmbedStatus("error")
        embedStatusRef.current = "error"
        setView("fallback")
        loadFallback()
      }
    }, EMBED_TIMEOUT)

    return () => {
      isCancelled = true
      if (embedTimer) {
        window.clearTimeout(embedTimer)
      }
    }
  }, [loadFallback])

  React.useEffect(() => {
    if (view === "fallback" && fallbackStatus === "idle") {
      loadFallback()
    }
  }, [view, fallbackStatus, loadFallback])

  const handleIframeLoad = () => {
    setEmbedStatus("ready")
    embedStatusRef.current = "ready"
  }

  const handleIframeError = () => {
    setEmbedStatus("error")
    embedStatusRef.current = "error"
    setView("fallback")
    loadFallback()
  }

  const reloadEmbed = () => {
    setEmbedStatus("loading")
    embedStatusRef.current = "loading"
    if (iframeRef.current) {
      const src = iframeRef.current.src
      iframeRef.current.src = ''
      setTimeout(() => {
        if (iframeRef.current) {
          iframeRef.current.src = src
        }
      }, 100)
    }
  }

  const renderFallbackContent = () => {
    if (fallbackStatus === "loading") {
      return (
        <div className="flex flex-col items-center justify-center gap-3 text-gray-300 text-sm h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1877F2]" />
          <p>Loading Facebook posts...</p>
          <a
            href={pageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#1877F2] text-xs hover:underline"
          >
            Open on Facebook
          </a>
        </div>
      )
    }

    if (fallbackPosts.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 text-gray-300 text-sm h-full text-center">
          <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mb-2">
            <FacebookIcon className="w-6 h-6 text-gray-400" />
          </div>
          <p>No posts available</p>
          <a
            href={pageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#1877F2] text-xs hover:underline"
          >
            Visit Facebook Page
          </a>
        </div>
      )
    }

    return (
      <div className="space-y-3">
        <p className="text-xs text-gray-400">Recent posts from Duel Night Abyss:</p>
        {fallbackPosts.map((post) => (
          <div key={post.id} className="rounded-md border border-gray-800/70 bg-gray-900/60 p-3 space-y-3">
            {post.imageUrl && (
              <div className="relative w-full overflow-hidden rounded-md border border-gray-800/60 bg-gray-950/40">
                <img
                  src={post.imageUrl}
                  alt="Facebook post media"
                  className="w-full h-auto object-cover max-h-[400px]"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
            )}
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.message}</p>
            <div className="text-xs text-gray-500 mt-2 flex items-center justify-between">
              <span>{post.createdTime || "Facebook"}</span>
              <a
                href={post.postUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1877F2] hover:underline"
              >
                View on Facebook
              </a>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Facebook Page Plugin URL (without appId as it's optional for public pages)
  const embedSrc = `https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(pageUrl)}&tabs=timeline&width=500&height=520&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true`

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700/50 overflow-hidden h-full flex flex-col">
      <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#1877F2]/10 flex items-center justify-center">
            <FacebookIcon className="w-5 h-5 text-[#1877F2]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-200">Facebook</h3>
            <p className="text-xs text-gray-400">Official Page</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView("embed")}
            className={`px-2.5 py-1 rounded-md text-xs border transition-colors ${view === "embed"
                ? "bg-gray-900/80 border-gray-700 text-gray-100"
                : "border-gray-700/60 text-gray-300 hover:border-gray-600 hover:text-gray-100"
              }`}
          >
            Embed
          </button>
          <button
            onClick={() => {
              setView("fallback")
              if (fallbackStatus === "idle") loadFallback()
            }}
            className={`px-2.5 py-1 rounded-md text-xs border transition-colors ${view === "fallback"
                ? "bg-gray-900/80 border-gray-700 text-gray-100"
                : "border-gray-700/60 text-gray-300 hover:border-gray-600 hover:text-gray-100"
              }`}
          >
            Posts
          </button>
          <a
            href={pageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-[#1877F2] hover:underline"
          >
            <span>Visit</span>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>

      <div className="flex-1 p-4 bg-gray-900/30">
        <div className="text-sm font-medium text-gray-300 mb-3">Facebook Feed</div>
        <div className="text-xs text-gray-400 mb-2">Duel Night Abyss Official</div>

        <div className="relative w-full h-full min-h-[520px] overflow-hidden rounded-lg bg-gray-950/40 border border-gray-800/60">
          {view === "embed" ? (
            <div className="relative h-[520px]">
              {/* Loading State */}
              {embedStatus === "loading" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300 bg-gray-900/90 z-10 space-y-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1877F2]" />
                  <p className="text-sm">Loading Facebook content...</p>
                </div>
              )}

              {/* Error State */}
              {embedStatus === "error" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-200 bg-gray-900/95 z-20 p-6 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mb-2">
                    <FacebookIcon className="w-6 h-6 text-gray-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-100">Facebook embed unavailable</h4>
                    <p className="text-xs text-gray-400 mt-1 max-w-[260px] mx-auto">
                      The Facebook plugin may be blocked. Try the Posts view instead.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 w-full max-w-[240px]">
                    <button
                      onClick={() => {
                        setView("fallback")
                        if (fallbackStatus === "idle") loadFallback()
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-[#1877F2] text-white text-xs font-medium rounded hover:bg-[#166fe5] transition-colors"
                    >
                      <span>View Posts</span>
                    </button>
                    <button
                      onClick={reloadEmbed}
                      className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-600 text-gray-300 text-xs font-medium rounded hover:bg-gray-800 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              )}

              {/* Facebook Embed */}
              <iframe
                ref={iframeRef}
                src={embedSrc}
                title="Facebook feed"
                className="w-full h-full min-h-[520px] border-0"
                allow="encrypted-media"
                loading="lazy"
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                style={{ display: embedStatus === "error" ? 'none' : 'block' }}
              />
            </div>
          ) : (
            <div className="h-[520px] overflow-y-auto p-4 space-y-3 bg-gray-950/70 text-gray-100 text-sm">
              {renderFallbackContent()}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
