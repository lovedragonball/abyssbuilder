# Requirements Document

## Introduction

This feature enhances the social media feed integration in the News Updates section to provide reliable video playback for Twitter/X content and improved fallback mechanisms for Facebook feeds. Currently, the Twitter fallback cards fail to display or play videos properly, and Facebook embeds are frequently blocked by browser privacy settings or X-Frame-Options headers. This enhancement will implement robust fallback strategies with proper video embedding, iframe handling, and user-friendly error states.

The solution will maintain the existing design aesthetic while adding intelligent content detection, multiple fallback paths, and clear user messaging when third-party content cannot be embedded.

## Requirements

### Requirement 1: Twitter Video Playback in Fallback Mode

**User Story:** As a user viewing the news page, I want to see and play Twitter videos directly within the fallback card when the official X widget fails to load, so that I can view video content without leaving the site.

#### Acceptance Criteria

1. WHEN the Twitter API proxy returns tweet data THEN the system SHALL extract and normalize video URLs from multiple sources (direct mp4, YouTube, piped.video, Twitter status links)
2. WHEN a tweet contains a direct mp4 video URL THEN the fallback card SHALL render an HTML5 `<video>` element with controls, preload metadata, and poster image
3. WHEN a tweet contains a YouTube or piped.video URL THEN the fallback card SHALL convert it to an embeddable iframe URL and render it with proper aspect ratio
4. WHEN a tweet contains a Twitter status ID but no direct video URL THEN the system SHALL generate a twitframe.com embed URL and render it in an iframe
5. WHEN rendering video iframes THEN the system SHALL include proper `allow` attributes (autoplay, fullscreen, encrypted-media, clipboard-write, web-share) and `allowFullScreen` property
6. WHEN rendering video content THEN the container SHALL maintain a responsive aspect ratio (16:9) using CSS techniques
7. WHEN no video is available THEN the fallback card SHALL display the tweet text and image as before

### Requirement 2: Twitter API Data Normalization

**User Story:** As a developer maintaining the Twitter integration, I want the API route to return consistently structured data with all necessary video metadata, so that the frontend component can reliably render different video types.

#### Acceptance Criteria

1. WHEN the Twitter API route processes feed data THEN it SHALL extract status IDs from Twitter/X URLs using regex pattern matching
2. WHEN a tweet contains video-related URLs THEN the system SHALL identify and extract: direct mp4 URLs, video.twimg.com URLs, YouTube URLs (youtube.com/watch and youtu.be), piped.video URLs, and Twitter status URLs
3. WHEN multiple video sources are found THEN the system SHALL prioritize direct mp4 URLs over embed URLs
4. WHEN a Twitter status URL is found but no direct video THEN the system SHALL include the status URL as `videoUrl` and the extracted ID as `statusId`
5. WHEN returning tweet data THEN each tweet object SHALL include: `id`, `text`, `url`, `imageUrl` (optional), `videoUrl` (optional), `statusId` (optional), and `videoEmbedUrl` (optional)
6. WHEN processing markdown content THEN the system SHALL correctly parse image links, strip markdown formatting, and extract clean text content

### Requirement 3: Twitter Video Rendering Component

**User Story:** As a user viewing Twitter fallback cards, I want videos to be displayed with proper controls and formatting, so that I can watch content seamlessly within the page.

#### Acceptance Criteria

1. WHEN rendering a fallback tweet with `videoEmbedUrl` THEN the component SHALL render an iframe with: `src` set to `videoEmbedUrl`, `loading="lazy"`, `referrerPolicy="no-referrer-when-downgrade"`, proper `allow` attributes, and `allowFullScreen` enabled
2. WHEN rendering a fallback tweet with `videoUrl` ending in .mp4 or containing video.twimg.com THEN the component SHALL render an HTML5 video element with: `controls` attribute, `preload="metadata"`, `poster` set to `imageUrl` if available, and a source element with `type="video/mp4"`
3. WHEN rendering video iframes THEN the container SHALL use CSS to maintain aspect ratio (e.g., `aspect-video` class or padding-top technique)
4. WHEN rendering HTML5 video elements THEN the container SHALL be responsive with `max-h-[400px]` constraint
5. WHEN a video fails to load THEN the component SHALL display the tweet text and image as fallback content
6. WHEN rendering any fallback tweet THEN the component SHALL include a "View on X" link that opens the original tweet in a new tab

### Requirement 4: URL-to-Embed Conversion Utility

**User Story:** As a developer, I want a reusable utility function that converts various video URLs into embeddable formats, so that the component can handle multiple video platforms consistently.

#### Acceptance Criteria

1. WHEN given a YouTube URL with format `youtube.com/watch?v=VIDEO_ID` THEN the utility SHALL return `https://www.youtube.com/embed/VIDEO_ID`
2. WHEN given a YouTube short URL with format `youtu.be/VIDEO_ID` THEN the utility SHALL return `https://www.youtube.com/embed/VIDEO_ID`
3. WHEN given a piped.video URL THEN the utility SHALL extract the video ID and return `https://piped.video/embed/VIDEO_ID`
4. WHEN given a Twitter status URL or status ID THEN the utility SHALL return `https://twitframe.com/show?url=https://twitter.com/i/status/STATUS_ID` with proper URL encoding
5. WHEN given an invalid URL or unsupported format THEN the utility SHALL return the original URL unchanged
6. WHEN URL parsing fails THEN the utility SHALL catch the error and return the original URL

### Requirement 5: Facebook Feed Fallback Strategy

**User Story:** As a user viewing the news page, I want to see Facebook content or have clear alternatives when the embed is blocked, so that I can access the social media feed even with privacy settings enabled.

#### Acceptance Criteria

1. WHEN the Facebook Page plugin loads successfully THEN the system SHALL display the standard Facebook embed with timeline, cover photo, and facepile
2. WHEN the Facebook SDK fails to load within a reasonable timeout THEN the system SHALL display a fallback UI with explanatory message
3. WHEN the Facebook embed is blocked by X-Frame-Options or privacy settings THEN the fallback UI SHALL display a message explaining the issue
4. WHEN displaying the fallback UI THEN the system SHALL provide a button to open the Facebook page in a new tab (desktop URL)
5. WHEN displaying the fallback UI THEN the system SHALL provide a button to open the mobile/lite Facebook view (m.facebook.com) in a new tab
6. WHEN the user clicks "Reload" in the fallback UI THEN the system SHALL attempt to reload the Facebook SDK and re-render the embed
7. WHEN the Facebook embed is not visible after SDK loads THEN the system SHALL detect this state and show the fallback UI

### Requirement 6: Facebook Video Embed Support

**User Story:** As a user, I want to view Facebook videos directly in the feed when available, so that I can watch video content without navigating away from the site.

#### Acceptance Criteria

1. WHEN a specific Facebook video URL is provided THEN the system SHALL render it using the Facebook video plugin iframe (`facebook.com/plugins/video.php?href=ENCODED_URL`)
2. WHEN rendering a Facebook video iframe THEN the system SHALL include: `allowFullScreen` attribute, proper `allow` attributes (autoplay, clipboard-write, encrypted-media, picture-in-picture, web-share), and a responsive aspect ratio container
3. WHEN a Facebook video fails to load THEN the system SHALL display a fallback message with a direct link to the video
4. WHEN no specific video URL is provided THEN the system SHALL use the standard Page plugin embed

### Requirement 7: Fallback UI Design and Messaging

**User Story:** As a user, I want clear and helpful messages when social media content cannot be embedded, so that I understand why content is missing and know how to access it.

#### Acceptance Criteria

1. WHEN displaying a Twitter fallback message THEN the UI SHALL show: "Unable to load tweets" message, and a link to open @DNAbyss_EN on X/Twitter
2. WHEN displaying a Facebook fallback message THEN the UI SHALL show: "The Facebook feed cannot be displayed" message, explanation about privacy settings or ad blockers, "Open on Facebook" button, and "Open Lite View" button
3. WHEN displaying fallback UI THEN the styling SHALL match the existing card design (gray background, subtle borders, consistent typography)
4. WHEN displaying fallback buttons THEN they SHALL use the platform's brand color (Twitter: #1DA1F2, Facebook: #1877F2)
5. WHEN a user hovers over fallback links THEN they SHALL show visual feedback (underline, color change)
6. WHEN fallback content is displayed THEN it SHALL be accessible with proper ARIA labels and keyboard navigation

### Requirement 8: Error Handling and CORS Considerations

**User Story:** As a developer, I want the system to gracefully handle CORS restrictions and third-party blocking, so that the application remains stable and provides useful feedback to users.

#### Acceptance Criteria

1. WHEN a video iframe fails to load due to CORS or X-Frame-Options THEN the system SHALL not crash and SHALL display the fallback content
2. WHEN a direct video URL fails to load due to CORS THEN the HTML5 video element SHALL display its native error UI
3. WHEN the Twitter API proxy fails THEN the system SHALL display the fallback message with external link
4. WHEN the Facebook SDK fails to load THEN the system SHALL display the fallback UI after a reasonable timeout (5-8 seconds)
5. WHEN third-party scripts are blocked by browser extensions THEN the system SHALL detect the failure and show appropriate fallback UI
6. WHEN rendering iframes THEN the system SHALL NOT use overly restrictive `sandbox` attributes that prevent legitimate content from loading

### Requirement 9: TypeScript Type Safety

**User Story:** As a developer, I want proper TypeScript types for all social media data structures, so that the code is maintainable and type-safe.

#### Acceptance Criteria

1. WHEN defining tweet data structures THEN the type SHALL include: `id: string`, `text: string`, `url: string`, `imageUrl?: string`, `videoUrl?: string`, `videoEmbedUrl?: string`, and `statusId?: string`
2. WHEN defining component props THEN all props SHALL have explicit types with JSDoc comments
3. WHEN using URL parsing functions THEN the return types SHALL be properly typed (string | undefined)
4. WHEN handling API responses THEN the response types SHALL match the defined data structures
5. WHEN TypeScript compilation runs THEN there SHALL be no type errors in the social media components

### Requirement 10: Performance and Loading States

**User Story:** As a user, I want social media content to load efficiently without blocking the page, so that I can access other content while feeds are loading.

#### Acceptance Criteria

1. WHEN rendering video iframes THEN they SHALL use `loading="lazy"` attribute to defer loading until visible
2. WHEN rendering HTML5 video elements THEN they SHALL use `preload="metadata"` to minimize initial bandwidth usage
3. WHEN the Twitter widget is loading THEN the system SHALL display a loading spinner with "Loading tweets..." message
4. WHEN the Facebook SDK is loading THEN the system SHALL display a loading spinner with "Loading Facebook SDK..." message
5. WHEN fallback data is being fetched THEN the loading state SHALL remain visible until data arrives or timeout occurs
6. WHEN multiple social cards are rendered THEN they SHALL load independently without blocking each other
