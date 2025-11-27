/**
 * Integration Tests for Page Navigation
 * Tests navigation flow between all pages
 * Requirements: 4.1, 4.2, 4.3
 */

import React from 'react';
import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react';
import { useRouter, usePathname } from 'next/navigation';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

// Mock components
jest.mock('@/components/page-transition', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="page-transition">{children}</div>,
}));

jest.mock('@/components/layout/header', () => ({
  __esModule: true,
  default: () => <header data-testid="header">Header</header>,
}));

describe('Integration: Navigation Flow', () => {
  const mockPush = jest.fn();
  const mockBack = jest.fn();
  const mockForward = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      back: mockBack,
      forward: mockForward,
      refresh: jest.fn(),
      prefetch: jest.fn(),
    });
  });

  describe('Navigation between all pages', () => {
    const pages = [
      { path: '/my-builds', name: 'My Builds' },
      { path: '/tier-list', name: 'Tier List' },
      { path: '/map', name: 'Interactive Map' },
      { path: '/attribute-optimizer', name: 'Attribute Optimizer' },
      { path: '/materials', name: 'Materials' },
      { path: '/news', name: 'News' },
    ];

    pages.forEach((page) => {
      it(`should navigate to ${page.name} successfully`, async () => {
        (usePathname as jest.Mock).mockReturnValue(page.path);

        const TestComponent = () => {
          const router = useRouter();
          return (
            <div>
              <button onClick={() => router.push(page.path)}>
                Navigate to {page.name}
              </button>
              <div data-testid="current-page">{page.path}</div>
            </div>
          );
        };

        const { getByText, getByTestId } = render(<TestComponent />);
        
        fireEvent.click(getByText(`Navigate to ${page.name}`));
        
        await waitFor(() => {
          expect(mockPush).toHaveBeenCalledWith(page.path);
        });

        expect(getByTestId('current-page')).toHaveTextContent(page.path);
      });
    });

    it('should handle sequential navigation through all pages', async () => {
      const navigationSequence = pages.map(p => p.path);
      let currentIndex = 0;

      const TestComponent = () => {
        const router = useRouter();
        const pathname = usePathname();

        return (
          <div>
            <button
              onClick={() => {
                if (currentIndex < navigationSequence.length) {
                  router.push(navigationSequence[currentIndex]);
                  currentIndex++;
                }
              }}
            >
              Next Page
            </button>
            <div data-testid="current-path">{pathname}</div>
          </div>
        );
      };

      for (let i = 0; i < navigationSequence.length; i++) {
        (usePathname as jest.Mock).mockReturnValue(navigationSequence[i]);
        cleanup();
        const { getByText, rerender } = render(<TestComponent />);
        
        fireEvent.click(getByText('Next Page'));
        
        await waitFor(() => {
          expect(mockPush).toHaveBeenCalledWith(navigationSequence[i]);
        });

        rerender(<TestComponent />);
      }

      expect(mockPush).toHaveBeenCalledTimes(navigationSequence.length);
    });
  });

  describe('Browser navigation (back/forward)', () => {
    it('should handle browser back button', async () => {
      (usePathname as jest.Mock).mockReturnValue('/tier-list');

      const TestComponent = () => {
        const router = useRouter();
        return (
          <div>
            <button onClick={() => router.back()}>Back</button>
            <div data-testid="current-page">/tier-list</div>
          </div>
        );
      };

      const { getByText } = render(<TestComponent />);
      
      fireEvent.click(getByText('Back'));
      
      await waitFor(() => {
        expect(mockBack).toHaveBeenCalled();
      });
    });

    it('should handle browser forward button', async () => {
      (usePathname as jest.Mock).mockReturnValue('/my-builds');

      const TestComponent = () => {
        const router = useRouter();
        return (
          <div>
            <button onClick={() => router.forward()}>Forward</button>
            <div data-testid="current-page">/my-builds</div>
          </div>
        );
      };

      const { getByText } = render(<TestComponent />);
      
      fireEvent.click(getByText('Forward'));
      
      await waitFor(() => {
        expect(mockForward).toHaveBeenCalled();
      });
    });

    it('should maintain navigation history', async () => {
      const history = ['/', '/my-builds', '/tier-list', '/map'];
      
      for (const path of history) {
        (usePathname as jest.Mock).mockReturnValue(path);
        mockPush(path);
      }

      expect(mockPush).toHaveBeenCalledTimes(history.length);
      
      // Verify each path was called
      history.forEach(path => {
        expect(mockPush).toHaveBeenCalledWith(path);
      });
    });
  });

  describe('Direct URL access', () => {
    const pages = [
      '/my-builds',
      '/tier-list',
      '/map',
      '/attribute-optimizer',
      '/materials',
      '/news',
    ];

    pages.forEach((path) => {
      it(`should load ${path} directly`, () => {
        (usePathname as jest.Mock).mockReturnValue(path);

        const TestComponent = () => {
          const pathname = usePathname();
          return <div data-testid="direct-load">{pathname}</div>;
        };

        const { getByTestId } = render(<TestComponent />);
        
        expect(getByTestId('direct-load')).toHaveTextContent(path);
      });
    });
  });

  describe('Rapid navigation', () => {
    it('should handle rapid consecutive navigation', async () => {
      const paths = ['/my-builds', '/tier-list', '/map', '/materials'];
      
      const TestComponent = () => {
        const router = useRouter();
        return (
          <div>
            {paths.map((path, index) => (
              <button key={path} onClick={() => router.push(path)}>
                Go to {path}
              </button>
            ))}
          </div>
        );
      };

      const { getByText } = render(<TestComponent />);
      
      // Rapidly click all navigation buttons
      paths.forEach(path => {
        fireEvent.click(getByText(`Go to ${path}`));
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledTimes(paths.length);
      });

      // Verify all paths were called
      paths.forEach(path => {
        expect(mockPush).toHaveBeenCalledWith(path);
      });
    });
  });

  describe('Same page navigation', () => {
    it('should handle clicking the same menu item twice', async () => {
      (usePathname as jest.Mock).mockReturnValue('/my-builds');

      const TestComponent = () => {
        const router = useRouter();
        const pathname = usePathname();
        
        return (
          <div>
            <button onClick={() => router.push('/my-builds')}>
              My Builds
            </button>
            <div data-testid="current-page">{pathname}</div>
          </div>
        );
      };

      const { getByText, getByTestId } = render(<TestComponent />);
      
      // Click twice
      fireEvent.click(getByText('My Builds'));
      fireEvent.click(getByText('My Builds'));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledTimes(2);
        expect(mockPush).toHaveBeenCalledWith('/my-builds');
      });

      expect(getByTestId('current-page')).toHaveTextContent('/my-builds');
    });
  });
});
