import { NextResponse } from "next/server"

export type TweetItem = {
  id: string
  text: string
  /**
   * Canonical link to the tweet on X/Twitter.
   * Kept alongside the legacy `url` field for compatibility with older UI.
   */
  tweetUrl: string
  url: string
  imageUrl?: string
  imageUrls?: string[]
  videoUrl?: string
  videoEmbedUrl?: string
  statusId?: string
}

const TWITTER_PROXY = "https://r.jina.ai/http://nitter.net/DNAbyss_EN"

const IMAGE_LINK_PATTERN = /\[!\[[^\]]*]\((https?:\/\/[^\s)]+)\)]\((https?:\/\/[^\s)]+)\)/g
const SIMPLE_IMAGE_PATTERN = /!\[[^\]]*]\((https?:\/\/[^\s)]+)\)/g
const URL_PATTERN = /(https?:\/\/[^\s)"]+)/g
const LARGE_ID_PATTERN = /\b(\d{15,22})\b/

function extractImages(markdownBlock: string): string[] {
  const results: string[] = []

  for (const match of markdownBlock.matchAll(IMAGE_LINK_PATTERN)) {
    const [, , link] = match
    if (link) results.push(link)
  }

  for (const match of markdownBlock.matchAll(SIMPLE_IMAGE_PATTERN)) {
    const [, link] = match
    if (link) results.push(link)
  }

  return Array.from(new Set(results))
}

function stripImages(markdownBlock: string) {
  return markdownBlock.replace(IMAGE_LINK_PATTERN, "").replace(SIMPLE_IMAGE_PATTERN, "").trim()
}

function truncate(text: string, max = 420) {
  return text.length > max ? `${text.slice(0, max - 3)}...` : text
}

function normalizeUrl(raw: string | undefined): string | undefined {
  if (!raw) return undefined
  if (/^https?:\/\//i.test(raw)) return raw
  return `https://${raw}`
}

function extractUrls(markdownBlock: string): string[] {
  return Array.from(markdownBlock.matchAll(URL_PATTERN))
    .map((match) => normalizeUrl(match[1])!)
    .filter(Boolean)
}

function buildTweetUrl(statusId?: string, statusUrl?: string) {
  if (statusUrl) return statusUrl
  if (statusId) return `https://x.com/i/status/${statusId}`
  return "https://x.com/DNAbyss_EN"
}

function extractStatus(markdownBlock: string, urls: string[]): { statusId?: string; statusUrl?: string } {
  // 1) Try to find status ID from explicit URLs
  for (const raw of urls) {
    try {
      const url = new URL(raw)
      const twitframeParam = url.searchParams.get("url")
      if (twitframeParam && /status\/(\d{10,})/i.test(twitframeParam)) {
        const id = twitframeParam.match(/status\/(\d{10,})/i)?.[1]
        if (id) return { statusId: id, statusUrl: buildTweetUrl(id, undefined) }
      }

      const statusMatch = url.pathname.match(/status\/(\d{10,})/i)
      const isTwitterHost = /(twitter\.com|x\.com|vxtwitter\.com|fxtwitter\.com|nitter\.)/i.test(url.hostname)
      if (isTwitterHost && statusMatch?.[1]) {
        const id = statusMatch[1]
        return { statusId: id, statusUrl: buildTweetUrl(id, `https://x.com/i/status/${id}`) }
      }
    } catch {
      // ignore malformed URLs
    }
  }

  // 2) Fallback to any long numeric token (often present in media URLs)
  const largeId = markdownBlock.match(LARGE_ID_PATTERN)?.[1]
  if (largeId) {
    return { statusId: largeId, statusUrl: buildTweetUrl(largeId, `https://x.com/i/status/${largeId}`) }
  }

  return {}
}

function toYouTubeEmbed(url: string): string | undefined {
  try {
    const parsed = new URL(url)
    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.split("/").pop()
      return id ? `https://www.youtube.com/embed/${id}` : undefined
    }
    if (parsed.hostname.includes("youtube.com") && parsed.searchParams.get("v")) {
      return `https://www.youtube.com/embed/${parsed.searchParams.get("v")}`
    }
  } catch {
    // ignore
  }
  return undefined
}

function toPipedEmbed(url: string): string | undefined {
  try {
    const parsed = new URL(url)
    if (!parsed.hostname.includes("piped.")) return undefined
    const id = parsed.searchParams.get("v") ?? parsed.pathname.split("/").pop()
    return id ? `https://piped.video/embed/${id}` : undefined
  } catch {
    return undefined
  }
}

function twitframeFromStatus(statusId?: string, tweetUrl?: string) {
  if (!statusId) return undefined
  const target = tweetUrl ?? `https://x.com/i/status/${statusId}`
  return `https://twitframe.com/show?url=${encodeURIComponent(target)}`
}

function extractVideo(urls: string[], statusId?: string, tweetUrl?: string) {
  // Prefer direct MP4s or Twitter video CDN links
  const directVideo = urls.find((u) => /\.mp4($|\?)/i.test(u) || u.includes("video.twimg.com"))

  if (directVideo) {
    return { videoUrl: directVideo, videoEmbedUrl: undefined }
  }

  // YouTube / Piped embeds
  const youtube = urls.find((u) => u.includes("youtube.com/watch") || u.includes("youtu.be/"))
  if (youtube) {
    const embed = toYouTubeEmbed(youtube)
    if (embed) return { videoUrl: undefined, videoEmbedUrl: embed }
  }

  const piped = urls.find((u) => u.includes("piped.video"))
  if (piped) {
    const embed = toPipedEmbed(piped)
    if (embed) return { videoUrl: undefined, videoEmbedUrl: embed }
  }

  // If we only have a status ID, fall back to Twitframe
  const twitframe = twitframeFromStatus(statusId, tweetUrl)
  if (twitframe) return { videoUrl: undefined, videoEmbedUrl: twitframe }

  return { videoUrl: undefined, videoEmbedUrl: undefined }
}

function extractTweets(markdown: string): TweetItem[] {
  const cleaned = markdown
    .replace(/\r/g, "")
    .replace(/^Title:.*$/m, "")
    .replace(/^URL Source:.*$/m, "")
    .replace(/^Markdown Content:/m, "")

  const blocks = cleaned
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter((b) => b.length > 0 && b !== "Markdown Content:")

  const tweets: TweetItem[] = []
  let pending: {
    text: string
    imageUrls?: string[]
    videoUrl?: string
    videoEmbedUrl?: string
    statusId?: string
    tweetUrl?: string
  } | null = null

  for (const block of blocks) {
    if (/^\d+[,\d]*$/.test(block)) continue // skip count-only lines

    const urls = extractUrls(block)
    const imageUrls = extractImages(block)
    const { statusId, statusUrl } = extractStatus(block, urls)
    const tweetUrl = buildTweetUrl(statusId, statusUrl)
    const { videoUrl, videoEmbedUrl } = extractVideo(urls, statusId, tweetUrl)
    const textOnly = stripImages(block)
    const hasMedia = imageUrls.length > 0 || !!videoUrl || !!videoEmbedUrl || !!statusId
    const hasText = textOnly.trim().length >= 8 || (textOnly.trim().length > 0 && hasMedia)
    const isMediaOnly = !hasText && hasMedia

    if (hasText) {
      if (pending) {
        tweets.push({
          id: pending.statusId ? `tweet-${pending.statusId}` : `tweet-${tweets.length}`,
          text: truncate(pending.text),
          tweetUrl: pending.tweetUrl ?? "https://x.com/DNAbyss_EN",
          url: pending.tweetUrl ?? "https://x.com/DNAbyss_EN",
          imageUrl: pending.imageUrls?.[0],
          imageUrls: pending.imageUrls?.length ? pending.imageUrls : undefined,
          videoUrl: pending.videoUrl,
          videoEmbedUrl: pending.videoEmbedUrl,
          statusId: pending.statusId
        })
      }
      pending = { text: textOnly, imageUrls, videoUrl, videoEmbedUrl, statusId, tweetUrl }
    } else if (isMediaOnly && pending) {
      pending.imageUrls = pending.imageUrls?.length ? pending.imageUrls : imageUrls
      pending.videoUrl = pending.videoUrl ?? videoUrl
      pending.videoEmbedUrl = pending.videoEmbedUrl ?? videoEmbedUrl
      pending.statusId = pending.statusId ?? statusId
      pending.tweetUrl = pending.tweetUrl ?? tweetUrl
    }
  }

  if (pending) {
    tweets.push({
      id: pending.statusId ? `tweet-${pending.statusId}` : `tweet-${tweets.length}`,
      text: truncate(pending.text),
      tweetUrl: pending.tweetUrl ?? "https://x.com/DNAbyss_EN",
      url: pending.tweetUrl ?? "https://x.com/DNAbyss_EN",
      imageUrl: pending.imageUrls?.[0],
      imageUrls: pending.imageUrls?.length ? pending.imageUrls : undefined,
      videoUrl: pending.videoUrl,
      videoEmbedUrl: pending.videoEmbedUrl,
      statusId: pending.statusId
    })
  }

  return tweets.slice(0, 6)
}

// Ensure this runs on Node.js runtime (not Edge)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const res = await fetch(TWITTER_PROXY, {
      headers: { 
        "User-Agent": "AbyssBuilder/1.0",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
      },
      next: { revalidate: 120 },
      // Add timeout
      signal: AbortSignal.timeout(10000) // 10 second timeout
    })

    if (!res.ok) {
      console.error(`Twitter proxy failed: ${res.status} ${res.statusText}`);
      return NextResponse.json({ 
        error: "twitter_fetch_failed",
        tweets: [] 
      }, { status: 200 }) // Return 200 so client can handle gracefully
    }

    const markdown = await res.text()
    const tweets = extractTweets(markdown)

    if (!tweets.length) {
      return NextResponse.json({ 
        error: "twitter_empty",
        tweets: [] 
      }, { status: 200 }) // Return 200 so client can handle gracefully
    }

    return NextResponse.json({ tweets }, {
      headers: {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
      },
    })
  } catch (error) {
    console.error('Twitter fetch error:', error);
    return NextResponse.json({ 
      error: "twitter_fetch_error",
      tweets: [] 
    }, { status: 200 }) // Return 200 so client can handle gracefully
  }
}
