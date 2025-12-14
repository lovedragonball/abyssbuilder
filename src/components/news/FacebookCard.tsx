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
  const pageUrl = "https://www.facebook.com/DNAbyss.Official"
  const [embedStatus, setEmbedStatus] = React.useState<EmbedStatus>("loading")
  const iframeRef = React.useRef<HTMLIFrameElement>(null)

  // Facebook Page Plugin URL
  // Adjusted width/height to be responsive and fit container
  const embedSrc = `https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(pageUrl)}&tabs=timeline&width=500&height=600&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true`

  const handleIframeLoad = () => {
    setEmbedStatus("ready")
  }

  const handleIframeError = () => {
    setEmbedStatus("error")
  }

  const reloadEmbed = () => {
    setEmbedStatus("loading")
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

  return (
    <div className="bg-gray-800/80 rounded-lg border border-gray-700/50 overflow-hidden h-full flex flex-col">
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

      <div className="flex-1 p-0 bg-gray-900/30 relative min-h-[500px]">
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
                The Facebook plugin may be blocked by your browser or ad blocker.
              </p>
            </div>

            <button
              onClick={reloadEmbed}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-600 text-gray-300 text-xs font-medium rounded hover:bg-gray-800 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Facebook Embed */}
        <iframe
          ref={iframeRef}
          src={embedSrc}
          title="Facebook feed"
          className="w-full h-full border-0 absolute inset-0"
          allow="encrypted-media"
          loading="lazy"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          style={{ display: embedStatus === "error" ? 'none' : 'block' }}
        />
      </div>
    </div>
  )
}
