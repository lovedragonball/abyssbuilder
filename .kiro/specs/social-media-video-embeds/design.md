# Design Document

## Overview

This design document outlines the architecture and implementation strategy for enhancing the social media feed integration in the News Updates section. The solution focuses on two main areas:

1. **Twitter Video Playback**: Implementing a robust fallback system that can detect, extract, and render videos from multiple sources (direct mp4, YouTube, piped.video, Twitter embeds) when the official X widget fails.

2. **Facebook Feed Reliability**: Creating a multi-tier fallback strategy that gracefully handles embed blocking, provides alternate viewing options, and maintains a consistent user experience.

The design follows the existing component patterns in the codebase (TwitterCard, RedditCard, FacebookCard) and maintains consistency with the current UI/UX design language.

## Architecture

### High-Level Component Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  NewsUpdatesSection                          │
│  (src/components/news/news-updates-section.tsx)             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ├─────────────────────────────────┐
                            │                                 │
                ┌───────────▼──────────┐         ┌───────────▼──────────┐
                │   TwitterCard        │         │   FacebookCard       │
                │  (Enhanced)          │         │   (Enhanced)         │
                └───────────┬──────────┘         └───────────┬──────────┘
                            │                                 │
                ┌───────────▼──────────┐         ┌───────────▼──────────┐
                │ /api/social/twitter  │         │  Facebook SDK        │
                │  (Enhanced)          │         │  + Fallback Logic    │
                └──────────────────────┘         └──────────────────────┘
```

### Data Flow

#### Twitter Video Flow

```
1. TwitterCard mounts
   ↓
2. Attempt to load official X widget
   ↓
3. Simultaneously (after timeout), fetch fallback data from API
   ↓
4. API fetches from Nitter proxy (r.jina.ai)
   ↓
5. API parses markdown, extracts:
   - Text content
   - Image URLs
   - Video URLs (mp4, YouTube, piped, status links)
   - Status IDs
   ↓
6. API returns normalized TweetItem[]
   ↓
7. TwitterCard receives fallback data
   ↓
8. If widget fails, render fallback cards with:
   - Video iframe (if videoEmbedUrl exists)
   - OR HTML5 video (if videoUrl is mp4)
   - OR image + text
```

#### Facebook Embed Flow

```
1. FacebookCard mounts
   ↓
2. Load Facebook SDK script
   ↓
3. Render Facebook Page Plugin with data attributes
   ↓
4. Monitor SDK load state (timeout: 8 seconds)
   ↓
5. If SDK loads successfully:
   - Display embedded feed
   ↓
6. If SDK fails or embed blocked:
   - Show fallback UI with:
     * Explanatory message
     * "Open on Facebook" button
     * "Open Lite View" button
     * "Reload" button
```

## Components and Interfaces

### 1. Enhanced TweetItem Type

**Location**: `src/app/api/social/twitter/route.ts`

```typescript
type TweetItem = {
  /** Unique identifier for the tweet */
  id: string
  
  /** Tweet text content (cleaned, truncated) */
  text: string
  
  /** Canonical URL to the tweet */
  url: string
  
  /** Preview image URL (optional) */
  imageUrl?: string
  
  /** Direct video URL (mp4) or external video link (optional) */
  videoUrl?: string
  
  /** Iframe-embeddable video URL (optional) */
  videoEmbedUrl?: string
  
  /** Twitter status ID extracted from URL (optional) */
  statusId?: string
}
```

**Design Rationale**: 
- Separating `videoUrl` and `videoEmbedUrl` allows the component to choose the best rendering method
- `statusId` enables fallback to twitframe when direct video isn't available
- All video-related fields are optional to maintain backward compatibility

### 2. Video URL Extraction Logic

**Location**: `src/app/api/social/twitter/route.ts`

```typescript
function extractVideo(markdownBlock: string): {
  videoUrl?: string
  videoEmbedUrl?: string
  statusId?: string
}
```

**Algorithm**:

1. Extract status ID from Twitter/X URLs using regex: `/status\/(\d{10,})/i`
2. Find all URLs in the markdown block using `URL_PATTERN`
3. Normalize URLs (add https:// if missing)
4. Identify video URLs by checking for:
   - `.mp4` extension
   - `video.twimg.com` domain
   - `piped.video` domain
   - `youtube.com/watch` or `youtu.be/` patterns
5. Priority order:
   - Direct mp4 → set as `videoUrl`
   - YouTube/piped → set as `videoUrl` (will be converted to embed)
   - Status URL → set as `videoUrl` with `statusId`
6. Return object with extracted values

**Design Rationale**:
- Prioritizes direct video files for better performance
- Supports multiple video platforms for flexibility
- Falls back to twitframe for Twitter-native videos

### 3. URL-to-Embed Conversion Utility

**Location**: `src/components/news/TwitterCard.tsx`

```typescript
function toEmbedUrl(url: string, statusId?: string): string
```

**Conversion Rules**:

| Input Pattern | Output Format | Example |
|--------------|---------------|---------|
| `youtube.com/watch?v=ID` | `youtube.com/embed/ID` | `https://www.youtube.com/embed/dQw4w9WgXcQ` |
| `youtu.be/ID` | `youtube.com/embed/ID` | `https://www.youtube.com/embed/dQw4w9WgXcQ` |
| `piped.video/watch?v=ID` | `piped.video/embed/ID` | `https://piped.video/embed/dQw4w9WgXcQ` |
| Twitter URL + statusId | `twitframe.com/show?url=...` | `https://twitframe.com/show?url=https%3A%2F%2Ftwitter.com%2Fi%2Fstatus%2F123456` |
| Other | Return unchanged | Original URL |

**Error Handling**:
- Wrap in try-catch to handle malformed URLs
- Return original URL if parsing fails
- Use URL API for robust parsing

**Design Rationale**:
- Centralizes embed URL logic for maintainability
- Handles multiple platforms with a single function
- Gracefully degrades on errors

### 4. TwitterCard Video Rendering Logic

**Location**: `src/components/news/TwitterCard.tsx`

**Rendering Priority** (in fallback mode):

```typescript
// Pseudo-code for rendering logic
if (tweet.videoEmbedUrl) {
  return <VideoIframe src={tweet.videoEmbedUrl} />
} else if (tweet.videoUrl && isDirectVideo(tweet.videoUrl)) {
  return <HTML5Video src={tweet.videoUrl} poster={tweet.imageUrl} />
} else if (tweet.videoUrl) {
  // Convert to embed URL and render iframe
  const embedUrl = toEmbedUrl(tweet.videoUrl, tweet.statusId)
  return <VideoIframe src={embedUrl} />
} else if (tweet.imageUrl) {
  return <ImagePreview src={tweet.imageUrl} />
} else {
  return <TextOnly text={tweet.text} />
}
```

**VideoIframe Component** (inline):

```typescript
<div className="relative w-full aspect-video overflow-hidden rounded-md border border-gray-800/60 bg-black/60">
  <iframe
    className="absolute inset-0 w-full h-full"
    src={videoEmbedUrl}
    title="Tweet video"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowFullScreen
    loading="lazy"
    referrerPolicy="no-referrer-when-downgrade"
  />
</div>
```

**HTML5Video Component** (inline):

```typescript
<div className="w-full overflow-hidden rounded-md border border-gray-800/60 bg-black/60">
  <video
    className="w-full h-auto max-h-[400px]"
    controls
    preload="metadata"
    poster={imageUrl}
  >
    <source src={videoUrl} type="video/mp4" />
    Your browser does not support the video tag.
  </video>
</div>
```

**Design Rationale**:
- Aspect ratio container (`aspect-video`) prevents layout shift
- `loading="lazy"` improves initial page load performance
- `preload="metadata"` balances UX and bandwidth
- Fallback text in video element for accessibility

### 5. FacebookCard Fallback State Management

**Location**: `src/components/news/FacebookCard.tsx`

**State Machine**:

```typescript
type FacebookState = 
  | "loading"      // SDK is loading
  | "ready"        // SDK loaded, embed visible
  | "error"        // SDK failed or embed blocked
  | "alternate"    // User requested alternate view

const [state, setState] = React.useState<FacebookState>("loading")
const [showAlternate, setShowAlternate] = React.useState(false)
```

**State Transitions**:

```
loading → ready (SDK loads successfully)
loading → error (timeout or SDK failure)
error → loading (user clicks "Reload")
error → alternate (user clicks "Try Alternate View")
alternate → error (user clicks "Back to Embed")
```

**Timeout Logic**:

```typescript
React.useEffect(() => {
  const timeout = setTimeout(() => {
    if (!isLoaded) {
      setState("error")
    }
  }, 8000) // 8 second timeout

  return () => clearTimeout(timeout)
}, [isLoaded])
```

**Design Rationale**:
- Clear state machine prevents ambiguous UI states
- Timeout ensures users aren't stuck on loading indefinitely
- Alternate view provides escape hatch for blocked embeds

### 6. FacebookCard Fallback UI

**Fallback Message Component**:

```typescript
<div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
  <div className="text-gray-300 text-sm">
    <p className="font-medium mb-2">The Facebook feed cannot be displayed</p>
    <p className="text-xs text-gray-400">
      This may be due to privacy settings, ad blockers, or browser restrictions.
    </p>
  </div>
  
  <div className="flex flex-col sm:flex-row gap-3">
    <a
      href="https://www.facebook.com/DuelNightAbyss"
      target="_blank"
      rel="noopener noreferrer"
      className="px-4 py-2 bg-[#1877F2] text-white rounded-md hover:bg-[#1877F2]/90 transition-colors"
    >
      Open on Facebook
    </a>
    
    <a
      href="https://m.facebook.com/DuelNightAbyss"
      target="_blank"
      rel="noopener noreferrer"
      className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
    >
      Open Lite View
    </a>
    
    <button
      onClick={handleReload}
      className="px-4 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-800 transition-colors"
    >
      Reload
    </button>
  </div>
</div>
```

**Design Rationale**:
- Clear explanation helps users understand the issue
- Multiple action buttons provide options
- Consistent styling with existing card design
- Mobile-responsive button layout

### 7. Facebook Video Plugin Support

**Video Embed Component** (optional enhancement):

```typescript
interface FacebookVideoProps {
  videoUrl: string
}

function FacebookVideoEmbed({ videoUrl }: FacebookVideoProps) {
  const encodedUrl = encodeURIComponent(videoUrl)
  const embedUrl = `https://www.facebook.com/plugins/video.php?href=${encodedUrl}&show_text=false&width=500`
  
  return (
    <div className="relative w-full aspect-video overflow-hidden rounded-md border border-gray-800/60 bg-black/60">
      <iframe
        className="absolute inset-0 w-full h-full"
        src={embedUrl}
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
      />
    </div>
  )
}
```

**Usage**:

```typescript
// In FacebookCard component
{videoUrl ? (
  <FacebookVideoEmbed videoUrl={videoUrl} />
) : (
  <div className="fb-page" data-href={pageUrl} ... />
)}
```

**Design Rationale**:
- Separates video embed logic from page plugin
- Reuses aspect ratio container pattern
- Provides path for future video-specific features

## Data Models

### API Response Structure

**Twitter API Response** (`/api/social/twitter`):

```typescript
{
  tweets: TweetItem[]
}

// Error response
{
  error: "twitter_fetch_failed" | "twitter_empty" | "twitter_fetch_error"
}
```

**TweetItem Structure** (detailed):

```typescript
{
  id: "tweet-0",                    // Sequential ID
  text: "Check out our new update!", // Cleaned text (max 420 chars)
  url: "https://twitter.com/DNAbyss_EN", // Profile or status URL
  imageUrl: "https://pbs.twimg.com/media/...", // Optional preview
  videoUrl: "https://video.twimg.com/...", // Optional video
  videoEmbedUrl: "https://www.youtube.com/embed/...", // Optional embed
  statusId: "1234567890123456789" // Optional status ID
}
```

### Component Props

**TwitterCard Props** (no props, uses internal state):

```typescript
// No props needed - component is self-contained
export function TwitterCard() { ... }
```

**FacebookCard Props** (no props, uses internal state):

```typescript
// No props needed - component is self-contained
export function FacebookCard() { ... }
```

**Design Rationale**:
- Self-contained components match existing pattern (RedditCard)
- Configuration (usernames, URLs) is hardcoded for simplicity
- Future enhancement: accept props for reusability

## Error Handling

### Twitter Error Scenarios

| Scenario | Detection | Handling |
|----------|-----------|----------|
| Widget script fails to load | Script onerror event | Show fallback UI immediately |
| Widget timeout | 9-second timeout | Show fallback UI |
| API fetch fails | HTTP error status | Show "Unable to load tweets" message |
| API returns empty | tweets.length === 0 | Show "Unable to load tweets" message |
| Video iframe blocked | Browser blocks iframe | Iframe shows browser's native error |
| Video file CORS error | Video element error event | Video shows native error UI |

### Facebook Error Scenarios

| Scenario | Detection | Handling |
|----------|-----------|----------|
| SDK script fails | Script onerror or timeout | Show fallback UI with buttons |
| Embed blocked by X-Frame-Options | Timeout + no visible content | Show fallback UI |
| Ad blocker blocks SDK | Script blocked | Show fallback UI |
| Privacy settings block embed | Timeout + no visible content | Show fallback UI |
| Video iframe blocked | Browser blocks iframe | Show fallback message |

### Error Recovery Strategies

1. **Graceful Degradation**: Always provide a working external link
2. **User Control**: Reload and alternate view buttons
3. **Clear Messaging**: Explain why content can't be shown
4. **No Crashes**: All errors caught and handled
5. **Accessibility**: Error states have proper ARIA labels

## Testing Strategy

### Unit Tests

**Twitter API Route** (`src/app/api/social/twitter/route.ts`):

```typescript
describe("Twitter API Route", () => {
  it("should extract status ID from Twitter URLs", () => {
    const markdown = "https://twitter.com/user/status/1234567890"
    const result = extractStatus(markdown)
    expect(result.statusId).toBe("1234567890")
  })
  
  it("should prioritize direct mp4 URLs", () => {
    const markdown = "https://video.twimg.com/video.mp4 https://youtube.com/watch?v=abc"
    const result = extractVideo(markdown)
    expect(result.videoUrl).toContain("video.twimg.com")
  })
  
  it("should handle malformed URLs gracefully", () => {
    const markdown = "not a url"
    const result = extractVideo(markdown)
    expect(result.videoUrl).toBeUndefined()
  })
})
```

**URL Conversion Utility** (`src/components/news/TwitterCard.tsx`):

```typescript
describe("toEmbedUrl", () => {
  it("should convert YouTube watch URLs to embed URLs", () => {
    const result = toEmbedUrl("https://youtube.com/watch?v=abc123")
    expect(result).toBe("https://www.youtube.com/embed/abc123")
  })
  
  it("should convert youtu.be URLs to embed URLs", () => {
    const result = toEmbedUrl("https://youtu.be/abc123")
    expect(result).toBe("https://www.youtube.com/embed/abc123")
  })
  
  it("should create twitframe URL with status ID", () => {
    const result = toEmbedUrl("https://twitter.com/user/status/123", "123")
    expect(result).toContain("twitframe.com")
    expect(result).toContain("123")
  })
  
  it("should return original URL for unsupported formats", () => {
    const url = "https://example.com/video"
    const result = toEmbedUrl(url)
    expect(result).toBe(url)
  })
})
```

### Integration Tests

**TwitterCard Component**:

```typescript
describe("TwitterCard", () => {
  it("should render loading state initially", () => {
    render(<TwitterCard />)
    expect(screen.getByText("Loading tweets...")).toBeInTheDocument()
  })
  
  it("should render fallback cards when widget fails", async () => {
    // Mock widget failure
    mockTwitterWidget.mockRejectedValue(new Error("failed"))
    
    // Mock API success
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ tweets: [mockTweet] })
    })
    
    render(<TwitterCard />)
    
    await waitFor(() => {
      expect(screen.getByText(mockTweet.text)).toBeInTheDocument()
    })
  })
  
  it("should render video iframe when videoEmbedUrl exists", async () => {
    const tweetWithVideo = {
      ...mockTweet,
      videoEmbedUrl: "https://www.youtube.com/embed/abc"
    }
    
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ tweets: [tweetWithVideo] })
    })
    
    render(<TwitterCard />)
    
    await waitFor(() => {
      const iframe = screen.getByTitle("Tweet video")
      expect(iframe).toHaveAttribute("src", tweetWithVideo.videoEmbedUrl)
    })
  })
})
```

**FacebookCard Component**:

```typescript
describe("FacebookCard", () => {
  it("should show loading state while SDK loads", () => {
    render(<FacebookCard />)
    expect(screen.getByText("Loading Facebook SDK...")).toBeInTheDocument()
  })
  
  it("should show fallback UI after timeout", async () => {
    jest.useFakeTimers()
    render(<FacebookCard />)
    
    act(() => {
      jest.advanceTimersByTime(8000)
    })
    
    await waitFor(() => {
      expect(screen.getByText(/cannot be displayed/i)).toBeInTheDocument()
    })
    
    jest.useRealTimers()
  })
  
  it("should provide external links in fallback UI", async () => {
    jest.useFakeTimers()
    render(<FacebookCard />)
    
    act(() => {
      jest.advanceTimersByTime(8000)
    })
    
    await waitFor(() => {
      const fbLink = screen.getByText("Open on Facebook")
      expect(fbLink).toHaveAttribute("href", expect.stringContaining("facebook.com"))
    })
    
    jest.useRealTimers()
  })
})
```

### Manual Testing Checklist

**Twitter Video Playback**:
- [ ] Direct mp4 videos play in HTML5 video element
- [ ] YouTube videos render in iframe and play
- [ ] piped.video links render in iframe
- [ ] Twitter status links render via twitframe
- [ ] Videos have proper aspect ratio (no stretching)
- [ ] Video controls are accessible
- [ ] Fallback to image+text works when no video
- [ ] "View on X" link opens correct tweet

**Facebook Embed**:
- [ ] Standard embed loads when SDK is available
- [ ] Fallback UI appears when SDK is blocked
- [ ] "Open on Facebook" button works
- [ ] "Open Lite View" button works
- [ ] "Reload" button re-attempts SDK load
- [ ] Timeout triggers fallback (8 seconds)
- [ ] Layout remains stable during state changes

**Cross-Browser Testing**:
- [ ] Chrome (with/without ad blocker)
- [ ] Firefox (with/without tracking protection)
- [ ] Safari (with/without privacy settings)
- [ ] Edge

**Responsive Testing**:
- [ ] Mobile layout (< 640px)
- [ ] Tablet layout (640px - 1024px)
- [ ] Desktop layout (> 1024px)
- [ ] Video aspect ratios on all sizes

## Performance Considerations

### Optimization Strategies

1. **Lazy Loading**:
   - All iframes use `loading="lazy"` attribute
   - Videos use `preload="metadata"` to minimize bandwidth
   - Defer social SDK loading with Next.js `Script` component

2. **Timeout Management**:
   - Twitter widget timeout: 9 seconds
   - Twitter fallback fetch timeout: 8 seconds
   - Facebook SDK timeout: 8 seconds
   - All timeouts are cleaned up on unmount

3. **API Caching**:
   - Twitter API uses Next.js `revalidate: 120` (2 minutes)
   - Reduces load on Nitter proxy
   - Improves response time for subsequent requests

4. **Bundle Size**:
   - No additional dependencies required
   - Reuse existing patterns (fetch, React hooks)
   - Inline utility functions to avoid extra modules

5. **Render Optimization**:
   - Use `React.useState` and `React.useEffect` efficiently
   - Avoid unnecessary re-renders with proper dependency arrays
   - Clean up effects to prevent memory leaks

### Performance Metrics

**Target Metrics**:
- Initial page load: < 3 seconds
- Time to interactive: < 5 seconds
- Twitter fallback fetch: < 2 seconds
- Facebook SDK load: < 3 seconds
- Video iframe load: < 4 seconds (network dependent)

**Monitoring**:
- Use browser DevTools Network tab to verify lazy loading
- Check Console for timeout warnings
- Monitor bundle size with Next.js build output

## Security Considerations

### Content Security Policy (CSP)

**Required Directives**:

```
frame-src: 
  - https://platform.twitter.com
  - https://twitframe.com
  - https://www.youtube.com
  - https://piped.video
  - https://www.facebook.com
  - https://m.facebook.com

script-src:
  - https://platform.twitter.com
  - https://connect.facebook.net

img-src:
  - https://pbs.twimg.com
  - https://video.twimg.com
  - https://scontent.xx.fbcdn.net
```

### XSS Prevention

1. **URL Sanitization**:
   - All URLs are validated before rendering
   - Use URL API to parse and validate
   - Reject javascript: and data: URLs

2. **Text Content**:
   - Tweet text is already sanitized by API
   - React automatically escapes text content
   - No `dangerouslySetInnerHTML` used

3. **Iframe Sandboxing**:
   - Use `allow` attribute to restrict capabilities
   - Avoid overly permissive `sandbox` attributes
   - Set `referrerPolicy` to limit information leakage

### CORS Handling

1. **API Proxy**:
   - Twitter API uses r.jina.ai proxy to avoid CORS
   - Proxy handles authentication and rate limiting
   - No direct client-side API calls

2. **Video Loading**:
   - Direct video URLs may fail due to CORS
   - Fallback to iframe embeds when CORS fails
   - Browser shows native error UI for blocked content

3. **Facebook SDK**:
   - SDK loaded from official CDN
   - Uses crossOrigin="anonymous" attribute
   - Respects browser privacy settings

## Accessibility

### ARIA Labels and Roles

**TwitterCard**:
```typescript
<div role="region" aria-label="Twitter Feed">
  <div aria-live="polite" aria-busy={status === "loading"}>
    {/* Content */}
  </div>
</div>
```

**FacebookCard**:
```typescript
<div role="region" aria-label="Facebook Feed">
  <div aria-live="polite" aria-busy={isLoading}>
    {/* Content */}
  </div>
</div>
```

### Keyboard Navigation

1. **Links**: All external links are keyboard accessible
2. **Buttons**: Reload and alternate view buttons are focusable
3. **Videos**: Native video controls are keyboard accessible
4. **Iframes**: Embedded content inherits platform accessibility

### Screen Reader Support

1. **Loading States**: Announced via `aria-live="polite"`
2. **Error Messages**: Wrapped in `role="alert"`
3. **Video Titles**: Iframes have descriptive `title` attributes
4. **Link Text**: Clear, descriptive link text (no "click here")

## Future Enhancements

### Potential Improvements

1. **Video Thumbnail Generation**:
   - Extract video thumbnails for better previews
   - Show play button overlay on thumbnails
   - Lazy load actual video on user interaction

2. **Instagram Integration**:
   - Add InstagramCard component
   - Use similar fallback strategy
   - Support Instagram video embeds

3. **YouTube Playlist Support**:
   - Detect YouTube playlist URLs
   - Render playlist embed instead of single video
   - Show playlist navigation controls

4. **Caching Layer**:
   - Cache API responses in localStorage
   - Show cached content while fetching fresh data
   - Implement stale-while-revalidate pattern

5. **Analytics**:
   - Track fallback usage rates
   - Monitor video play rates
   - Identify most common failure modes

6. **User Preferences**:
   - Allow users to choose default view (widget vs fallback)
   - Remember alternate view preference
   - Provide "always use lite view" option

### Extensibility

**Adding New Video Platforms**:

1. Add platform detection in `extractVideo`:
```typescript
if (u.includes("vimeo.com")) {
  const id = u.pathname.split("/").pop()
  return { videoUrl: u, videoEmbedUrl: `https://player.vimeo.com/video/${id}` }
}
```

2. Add conversion in `toEmbedUrl`:
```typescript
if (u.hostname.includes("vimeo.com")) {
  const id = u.pathname.split("/").pop()
  return `https://player.vimeo.com/video/${id}`
}
```

3. Update CSP directives to allow new domain

**Adding New Social Platforms**:

1. Create new component following existing pattern:
```typescript
export function InstagramCard() {
  // Similar structure to TwitterCard/FacebookCard
}
```

2. Add to NewsUpdatesSection grid:
```typescript
<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
  <TwitterCard />
  <RedditCard />
  <FacebookCard />
  <InstagramCard />
</div>
```

3. Create API route if needed:
```typescript
// src/app/api/social/instagram/route.ts
export async function GET() {
  // Fetch and parse Instagram data
}
```

## Migration Strategy

### Implementation Phases

**Phase 1: Twitter Video Enhancement** (Priority: High)
- Update `TweetItem` type with new fields
- Implement `extractVideo` function in API route
- Add `toEmbedUrl` utility function
- Update TwitterCard rendering logic
- Test with various video sources

**Phase 2: Facebook Fallback UI** (Priority: High)
- Add state management for fallback
- Implement timeout logic
- Create fallback UI component
- Add reload functionality
- Test across browsers

**Phase 3: Testing and Refinement** (Priority: Medium)
- Write unit tests for utilities
- Write integration tests for components
- Perform cross-browser testing
- Optimize performance
- Fix edge cases

**Phase 4: Documentation and Monitoring** (Priority: Low)
- Update component documentation
- Add inline code comments
- Set up error monitoring
- Create troubleshooting guide

### Backward Compatibility

- All changes are additive (new optional fields)
- Existing functionality remains unchanged
- Fallback behavior only activates on failure
- No breaking changes to component APIs

### Rollback Plan

If issues arise:
1. Revert to previous component versions
2. API changes are backward compatible (optional fields)
3. No database migrations required
4. No user data affected

## Conclusion

This design provides a robust, maintainable solution for enhancing social media video playback and embed reliability. The architecture follows existing patterns, maintains type safety, and provides clear fallback paths for various failure scenarios. The implementation is phased to allow incremental development and testing, with clear extension points for future enhancements.
