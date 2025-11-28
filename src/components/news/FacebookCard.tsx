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

export function FacebookCard() {
  const pageUrl = "https://www.facebook.com/DuelNightAbyss"
  const [embedLoaded, setEmbedLoaded] = React.useState(false)
  const [embedError, setEmbedError] = React.useState(false)
  const iframeRef = React.useRef<HTMLIFrameElement>(null)

  React.useEffect(() => {
    // Set a timeout to detect if embed fails to load
    const timer = setTimeout(() => {
      if (!embedLoaded) {
        setEmbedError(true)
      }
    }, 5000)

    return () => clearTimeout(timer)
  }, [embedLoaded])

  const handleIframeLoad = () => {
    setEmbedLoaded(true)
    setEmbedError(false)
  }

  const handleIframeError = () => {
    setEmbedError(true)
    setEmbedLoaded(false)
  }

  const reloadEmbed = () => {
    setEmbedLoaded(false)
    setEmbedError(false)
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

  // Facebook Page Plugin URL
  const embedSrc = `https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(pageUrl)}&tabs=timeline&width=500&height=520&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId=`

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
            onClick={reloadEmbed}
            className="px-2.5 py-1 rounded-md text-xs border border-gray-700/60 text-gray-300 hover:border-gray-600 hover:text-gray-100 transition-colors"
          >
            Reload
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
          {/* Loading State */}
          {!embedLoaded && !embedError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300 bg-gray-900/90 z-10 space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1877F2]" />
              <p className="text-sm">Loading Facebook content...</p>
            </div>
          )}

          {/* Error State */}
          {embedError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-200 bg-gray-900/95 z-20 p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mb-2">
                <FacebookIcon className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-100">Facebook feed unavailable</h4>
                <p className="text-xs text-gray-400 mt-1 max-w-[260px] mx-auto">
                  The Facebook plugin may be blocked by your browser or network. Please visit our page directly.
                </p>
              </div>

              <div className="flex flex-col gap-2 w-full max-w-[240px]">
                <a
                  href={pageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-[#1877F2] text-white text-xs font-medium rounded hover:bg-[#166fe5] transition-colors"
                >
                  <span>Open on Facebook</span>
                </a>
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
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            style={{ display: embedError ? 'none' : 'block' }}
          />
        </div>
      </div>
    </div>
  )
}
