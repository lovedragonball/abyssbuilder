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

export async function GET() {
  try {
    const res = await fetch(REDDIT_URL, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/json"
      },
      next: { revalidate: 120 } // cache for 2 minutes
    })

    if (!res.ok) {
      return NextResponse.json({ error: "reddit_fetch_failed" }, { status: 502 })
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

    return NextResponse.json({ posts })
  } catch (error) {
    return NextResponse.json({ error: "reddit_fetch_error" }, { status: 500 })
  }
}
