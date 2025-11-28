import { NextResponse } from "next/server"

type RedditPost = {
  id: string
  title: string
  permalink: string
  subreddit: string
  score: number
  createdUtc: number
}

const USER_AGENT = "AbyssBuilder/1.0 (contact: dev@local)"
const REDDIT_URL = "https://www.reddit.com/user/DNAbyss_Official/submitted.json?limit=6"

// Ensure this runs on Node.js runtime (not Edge)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const res = await fetch(REDDIT_URL, {
      headers: {
        "User-Agent": USER_AGENT,
        "Accept": "application/json"
      },
      next: { revalidate: 120 }, // cache for 2 minutes
      // Add timeout
      signal: AbortSignal.timeout(10000) // 10 second timeout
    })

    if (!res.ok) {
      console.error(`Reddit API failed: ${res.status} ${res.statusText}`);
      return NextResponse.json({ 
        error: "reddit_fetch_failed",
        posts: [] 
      }, { status: 200 }) // Return 200 so client can handle gracefully
    }

    const json = await res.json()
    const posts = (json?.data?.children ?? [])
      .map((item: any) => item?.data)
      .filter(Boolean)
      .slice(0, 5)
      .map((entry: any): RedditPost => ({
        id: entry.id,
        title: entry.title,
        permalink: `https://www.reddit.com${entry.permalink}`,
        subreddit: entry.subreddit_name_prefixed || entry.subreddit || "Reddit",
        score: entry.score ?? 0,
        createdUtc: entry.created_utc ?? 0
      }))

    return NextResponse.json({ posts }, {
      headers: {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
      },
    })
  } catch (error) {
    console.error('Reddit fetch error:', error);
    return NextResponse.json({ 
      error: "reddit_fetch_error",
      posts: [] 
    }, { status: 200 }) // Return 200 so client can handle gracefully
  }
}
