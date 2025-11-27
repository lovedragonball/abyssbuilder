# Implementation Plan

- [ ] 1. Enhance Twitter API route with video extraction
  - Update the `TweetItem` type to include `videoEmbedUrl` and ensure `statusId` is properly typed
  - Implement the `extractVideo` function that identifies and extracts video URLs from markdown content (mp4, YouTube, piped.video, Twitter status links)
  - Update the `extractTweets` function to call `extractVideo` and populate the new fields in each TweetItem
  - Add logic to prioritize direct mp4 URLs over embed URLs when multiple video sources are found
  - Test the API route with sample markdown containing various video URL formats
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [ ] 2. Create URL-to-embed conversion utility
  - Add the `toEmbedUrl` function in TwitterCard.tsx that converts various video URLs to embeddable formats
  - Implement YouTube URL detection and conversion (youtube.com/watch?v= and youtu.be/)
  - Implement piped.video URL detection and conversion
  - Implement Twitter status URL detection and twitframe URL generation with proper encoding
  - Add error handling with try-catch to return original URL on parsing failures
  - Write helper function `isDirectVideo` to check if a URL is a direct mp4 or video.twimg.com link
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [ ] 3. Update TwitterCard component with video rendering logic
  - [ ] 3.1 Add video rendering priority logic in fallback mode
    - Implement conditional rendering: check for `videoEmbedUrl` first, then `videoUrl`, then `imageUrl`, then text-only
    - Create inline VideoIframe component with proper iframe attributes (allow, allowFullScreen, loading, referrerPolicy)
    - Create inline HTML5Video component with video element, controls, preload, and poster attributes
    - Add responsive aspect ratio container using `aspect-video` class for iframes
    - Add responsive container with `max-h-[400px]` constraint for HTML5 video
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 1.2, 1.3, 1.4, 1.5, 1.6_
  
  - [ ] 3.2 Integrate toEmbedUrl utility in rendering logic
    - Call `toEmbedUrl` when `videoUrl` exists but is not a direct video file
    - Pass both `videoUrl` and `statusId` to the utility function
    - Render the returned embed URL in an iframe component
    - Ensure fallback to image+text when video rendering fails
    - _Requirements: 3.6, 1.7_

- [ ] 4. Implement FacebookCard state management
  - Add `FacebookState` type definition with "loading", "ready", "error", and "alternate" states
  - Add state hooks for `state`, `isLoaded`, and `showAlternate`
  - Implement timeout logic that transitions to "error" state after 8 seconds if SDK doesn't load
  - Add cleanup for timeout in useEffect return function
  - Implement state transition handlers: handleReload, handleAlternateView
  - _Requirements: 5.2, 5.7_

- [ ] 5. Create FacebookCard fallback UI
  - Design and implement the fallback message component with explanatory text about privacy settings/ad blockers
  - Add "Open on Facebook" button linking to desktop URL (https://www.facebook.com/DuelNightAbyss)
  - Add "Open Lite View" button linking to mobile URL (m.facebook.com)
  - Add "Reload" button that resets state and attempts to reload the SDK
  - Style buttons with Facebook brand color (#1877F2) and consistent card styling
  - Implement conditional rendering based on `state` value
  - _Requirements: 5.3, 5.4, 5.5, 5.6, 7.2, 7.3, 7.4, 7.5_

- [ ] 6. Add TypeScript type safety improvements
  - Ensure all TweetItem fields have proper type annotations with JSDoc comments
  - Add return type annotations to `extractVideo`, `extractStatus`, and `toEmbedUrl` functions
  - Add prop type interfaces for any new inline components (VideoIframe, HTML5Video)
  - Verify no TypeScript errors in TwitterCard.tsx and FacebookCard.tsx
  - Add type guards where necessary (e.g., checking if videoUrl ends with .mp4)
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 7. Enhance error handling and fallback messaging
  - Update TwitterCard error state to show clear "Unable to load tweets" message with external link
  - Ensure all video iframes have descriptive `title` attributes for accessibility
  - Add fallback text inside video elements for browsers that don't support video tag
  - Verify that CORS errors in video elements display native browser error UI
  - Test that iframe blocking doesn't crash the component
  - _Requirements: 7.1, 7.6, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [ ] 8. Add accessibility improvements
  - Add `role="region"` and `aria-label` to TwitterCard and FacebookCard containers
  - Add `aria-live="polite"` to loading and error state containers
  - Add `aria-busy` attribute that reflects loading state
  - Ensure all external links have descriptive text (no "click here")
  - Verify keyboard navigation works for all buttons and links
  - Test with screen reader to ensure loading states and errors are announced
  - _Requirements: 7.6_

- [ ] 9. Optimize performance
  - Verify all iframes use `loading="lazy"` attribute
  - Verify all video elements use `preload="metadata"`
  - Ensure all useEffect hooks have proper dependency arrays
  - Ensure all timeouts are cleaned up in useEffect return functions
  - Test that components don't cause unnecessary re-renders
  - Verify API route uses `next: { revalidate: 120 }` for caching
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

- [ ] 10. Test Twitter video functionality
  - Test rendering of direct mp4 video URLs in HTML5 video element
  - Test rendering of YouTube URLs converted to iframe embeds
  - Test rendering of piped.video URLs converted to iframe embeds
  - Test rendering of Twitter status URLs via twitframe iframe
  - Test fallback to image+text when no video is available
  - Test "View on X" link opens correct URL in new tab
  - Verify video aspect ratios are maintained on mobile and desktop
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [ ] 11. Test Facebook fallback functionality
  - Test that standard Facebook Page plugin loads when SDK is available
  - Test that fallback UI appears after 8-second timeout when SDK fails
  - Test "Open on Facebook" button opens correct desktop URL
  - Test "Open Lite View" button opens correct mobile URL
  - Test "Reload" button resets state and attempts to reload SDK
  - Test with ad blocker enabled to verify fallback UI appears
  - Test with browser privacy settings enabled
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

- [ ] 12. Cross-browser and responsive testing
  - Test in Chrome with and without ad blocker
  - Test in Firefox with and without tracking protection
  - Test in Safari with and without privacy settings
  - Test in Edge browser
  - Test mobile layout (< 640px width)
  - Test tablet layout (640px - 1024px width)
  - Test desktop layout (> 1024px width)
  - Verify video aspect ratios on all screen sizes
  - _Requirements: 10.6_
