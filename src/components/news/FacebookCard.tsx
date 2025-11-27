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
  const pageUrl = process.env.NEXT_PUBLIC_FACEBOOK_PAGE_URL ?? "https://www.facebook.com/DuelNightAbyss"
  const mobileUrl = process.env.NEXT_PUBLIC_FACEBOOK_MOBILE_URL ?? "https://m.facebook.com/DuelNightAbyss"
  const featuredVideoUrl = process.env.NEXT_PUBLIC_FACEBOOK_VIDEO_URL
  const videoEmbedUrl = featuredVideoUrl
    ? `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(featuredVideoUrl)}&show_text=false&width=500`
    : undefined

  const [view, setView] = React.useState<"page" | "lite" | "video">("page")
  const [embedStatus, setEmbedStatus] = React.useState<"loading" | "ready" | "error">("loading")
  const [reloadKey, setReloadKey] = React.useState(0)

  const pagePluginSrc = React.useMemo(
    () =>
      `https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(pageUrl)}&tabs=timeline&width=500&height=520&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true`,
    [pageUrl]
  )

  const liteEmbedSrc = React.useMemo(() => `${mobileUrl}?ref=embed`, [mobileUrl])

  const currentSrc = React.useMemo(() => {
    if (view === "lite") return liteEmbedSrc
    if (view === "video" && videoEmbedUrl) return videoEmbedUrl
    return pagePluginSrc
  }, [view, liteEmbedSrc, pagePluginSrc, videoEmbedUrl])

  React.useEffect(() => {
    setEmbedStatus("loading")
  }, [view, reloadKey])

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      setEmbedStatus((prev) => (prev === "loading" ? "error" : prev))
    }, 8000)
    return () => clearTimeout(timer)
  }, [view, reloadKey])

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

      <div className="flex-1 overflow-hidden rounded-b-lg bg-white">
        {currentSrc ? (
          <div className="relative w-full h-full">
            <iframe
              key={`${view}-${reloadKey}`}
              src={currentSrc}
              title={view === "video" ? "Facebook video" : "Facebook feed"}
              className="absolute inset-0 w-full h-full border-0"
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              onLoad={() => setEmbedStatus("ready")}
              onError={() => setEmbedStatus("error")}
            />

            {embedStatus === "loading" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600 bg-gray-100/90 z-10 space-y-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1877F2]" />
                <p className="text-sm">Loading Facebook content...</p>
              </div>
            )}

            {embedStatus === "error" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-700 bg-gray-100/95 z-20 p-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mb-2">
                  <FacebookIcon className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Embedded feed unavailable</h4>
                  <p className="text-xs text-gray-500 mt-1 max-w-[260px] mx-auto">
                    The Facebook plugin was blocked. Use the link below to view.
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
                    onClick={() => setReloadKey((k) => k + 1)}
                    className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-xs font-medium rounded hover:bg-gray-200 transition-colors"
                  >
                    Reload
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-600 bg-gray-100 p-6 text-center h-full space-y-3">
            <p className="text-sm">No embed URL configured.</p>
            <p className="text-xs text-gray-500">Add NEXT_PUBLIC_FACEBOOK_VIDEO_URL to show the featured video.</p>
          </div>
        )}
      </div>
    </div>
  )
}
