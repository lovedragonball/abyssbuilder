'use client';

/**
 * Skip to Main Content Link
 * Provides keyboard users a way to skip navigation and jump directly to main content
 * Meets WCAG 2.1 Success Criterion 2.4.1 (Bypass Blocks)
 */
export default function SkipToMain() {
  return (
    <a
      href="#main-content"
      className="skip-to-main"
    >
      Skip to main content
    </a>
  );
}
