"use client"

import * as React from "react"

// Reddit Icon Component
const RedditIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
  </svg>
)

type RedditPost = {
  id: string
  title: string
  permalink: string
  subreddit: string
  score: number
  createdUtc: number
}

const REDDIT_USER = "DNAbyss_Official"

function formatDate(timestamp: number) {
  const date = new Date(timestamp * 1000)
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric"
  })
}

export function RedditCard() {
  const [posts, setPosts] = React.useState<RedditPost[]>([])
  const [status, setStatus] = React.useState<"loading" | "ready" | "error">("loading")

  React.useEffect(() => {
    let cancelled = false

    const loadPosts = async () => {
      try {
        setStatus("loading")
        const response = await fetch("/api/social/reddit")

        if (!response.ok) {
          throw new Error("reddit-request-failed")
        }

        const json = await response.json()
        const parsed = (json?.posts ?? []) as RedditPost[]

        if (!cancelled) {
          setPosts(parsed)
          setStatus("ready")
        }
      } catch (error) {
        if (!cancelled) {
          setStatus("error")
        }
      }
    }

    loadPosts()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700/50 overflow-hidden">
      <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#FF4500]/10 flex items-center justify-center">
            <RedditIcon className="w-5 h-5 text-[#FF4500]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-200">Reddit</h3>
            <p className="text-xs text-gray-400">u/DNAbyss_Official</p>
          </div>
        </div>
        <a
          href="https://www.reddit.com/r/DuelNightAbyss/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-[#FF4500] hover:underline"
        >
          <span>Visit</span>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
      <div className="p-4 bg-gray-900/30">
        <div className="text-sm font-medium text-gray-300 mb-3">Reddit Feed</div>
        <div className="text-xs text-gray-400 mb-2">Latest from u/DNAbyss_Official</div>
        <div className="h-[500px] overflow-y-auto rounded-lg bg-gray-950/40 border border-gray-800/60 p-4">
          {status === "loading" && (
            <div className="flex flex-col items-center justify-center gap-3 h-full text-gray-400 text-sm">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF4500]" />
              <p>Loading posts...</p>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center justify-center gap-2 h-full text-gray-300 text-sm text-center">
              <p>Unable to load Reddit right now.</p>
              <a
                href="https://www.reddit.com/user/DNAbyss_Official"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#FF4500] text-xs hover:underline"
              >
                Open Reddit profile
              </a>
            </div>
          )}

          {status === "ready" && posts.length === 0 && (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              No recent posts available.
            </div>
          )}

          {status === "ready" && posts.length > 0 && (
            <ul className="space-y-3">
              {posts.map((post) => (
                <li
                  key={post.id}
                  className="rounded-md border border-gray-800/70 bg-gradient-to-br from-gray-900/70 via-gray-900/40 to-gray-900/70 p-3 hover:border-[#FF4500]/60 hover:shadow-[0_10px_30px_-15px_rgba(255,69,0,0.6)] transition-all"
                >
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                    <span className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-[#FF4500]/15 text-[#FF4500] border border-[#FF4500]/30">
                        {post.subreddit}
                      </span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-gray-800/60 text-gray-300 border border-gray-700">
                      {formatDate(post.createdUtc)}
                    </span>
                  </div>
                  <a
                    href={post.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm font-semibold text-gray-50 hover:text-[#FF4500] transition-colors leading-relaxed"
                  >
                    {post.title}
                  </a>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-gray-400">Score</span>
                    <span className="px-2 py-0.5 rounded bg-gray-800/70 text-gray-100 border border-gray-700">
                      {post.score}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
