/**
 * Tests for MainLayout Component
 * 
 * Verifies that MainLayout correctly:
 * - Wraps PageTransition with SafePageTransition
 * - Renders Header and Navigation
 * - Provides loading indicator
 * - Handles page transitions with configuration
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MainLayout from '../main-layout';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/test-path'),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  })),
}));

// Mock child components
jest.mock('../header', () => {
  return function MockHeader() {
    return <header data-testid="mock-header">Header</header>;
  };
});

jest.mock('@/components/navigation-progress', () => ({
  NavigationProgress: function MockNavigationProgress() {
    return <div data-testid="mock-navigation-progress">Navigation Progress</div>;
  },
}));

jest.mock('@/components/page-transition', () => ({
  PageTransition: function MockPageTransition({ children }: { children: React.ReactNode }) {
    return <div data-testid="mock-page-transition">{children}</div>;
  },
}));

jest.mock('@/components/safe-page-transition', () => {
  return function MockSafePageTransition({ children }: { children: React.ReactNode }) {
    return <div data-testid="mock-safe-page-transition">{children}</div>;
  };
});

describe('MainLayout', () => {
  it('renders all main components', () => {
    render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>
    );

    // Verify Header is rendered
    expect(screen.getByTestId('mock-header')).toBeInTheDocument();

    // Verify NavigationProgress is rendered
    expect(screen.getByTestId('mock-navigation-progress')).toBeInTheDocument();

    // Verify SafePageTransition wrapper is present
    expect(screen.getByTestId('mock-safe-page-transition')).toBeInTheDocument();

    // Verify PageTransition is present
    expect(screen.getByTestId('mock-page-transition')).toBeInTheDocument();

    // Verify children content is rendered
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders main content with correct structure', () => {
    render(
      <MainLayout>
        <div>Page Content</div>
      </MainLayout>
    );

    // Verify main element exists with correct id
    const mainElement = screen.getByRole('main');
    expect(mainElement).toBeInTheDocument();
    expect(mainElement).toHaveAttribute('id', 'main-content');

    // Verify content is inside main element
    expect(mainElement).toHaveTextContent('Page Content');
  });

  it('has correct layout structure', () => {
    const { container } = render(
      <MainLayout>
        <div>Content</div>
      </MainLayout>
    );

    // Verify root div has correct classes
    const rootDiv = container.firstChild as HTMLElement;
    expect(rootDiv).toHaveClass('min-h-screen', 'bg-background');
  });

  it('renders children correctly', () => {
    const testContent = (
      <div>
        <h1>Test Heading</h1>
        <p>Test paragraph</p>
      </div>
    );

    render(<MainLayout>{testContent}</MainLayout>);

    expect(screen.getByText('Test Heading')).toBeInTheDocument();
    expect(screen.getByText('Test paragraph')).toBeInTheDocument();
  });
});
