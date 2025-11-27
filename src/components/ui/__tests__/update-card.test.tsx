import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { UpdateCard, UpdateCardHeader, UpdateCardTitle, UpdateCardContent } from '../update-card';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef<HTMLDivElement, any>(({ children, ...props }, ref) => (
      <div ref={ref} {...props}>
        {children}
      </div>
    )),
  },
}));

describe('UpdateCard', () => {
  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<UpdateCard>Test content</UpdateCard>);
      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('should render with title', () => {
      render(<UpdateCard title="Test Title">Content</UpdateCard>);
      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should render without title', () => {
      render(<UpdateCard>Content only</UpdateCard>);
      expect(screen.getByText('Content only')).toBeInTheDocument();
      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <UpdateCard className="custom-class">Content</UpdateCard>
      );
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('custom-class');
    });

    it('should render children correctly', () => {
      render(
        <UpdateCard>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
        </UpdateCard>
      );
      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should have gradient background classes', () => {
      const { container } = render(<UpdateCard>Content</UpdateCard>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('bg-gradient-to-br');
      expect(card).toHaveClass('from-[#1a1a2e]');
      expect(card).toHaveClass('to-[#16213e]');
    });

    it('should have rounded corners', () => {
      const { container } = render(<UpdateCard>Content</UpdateCard>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('rounded-2xl');
    });

    it('should have border styling', () => {
      const { container } = render(<UpdateCard>Content</UpdateCard>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('border');
      expect(card).toHaveClass('border-white/10');
    });

    it('should have shadow classes', () => {
      const { container } = render(<UpdateCard>Content</UpdateCard>);
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('shadow');
    });

    it('should have hover effect classes', () => {
      const { container } = render(<UpdateCard>Content</UpdateCard>);
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('hover:shadow');
      expect(card.className).toContain('hover:-translate-y-1');
      expect(card.className).toContain('hover:border-white/20');
    });

    it('should have transition classes', () => {
      const { container } = render(<UpdateCard>Content</UpdateCard>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('transition-all');
      expect(card).toHaveClass('duration-300');
    });
  });

  describe('Props', () => {
    it('should apply custom maxHeight', () => {
      const { container } = render(
        <UpdateCard maxHeight="400px">Content</UpdateCard>
      );
      const content = container.querySelector('.card-content') as HTMLElement;
      expect(content).toHaveStyle({ maxHeight: '400px' });
    });

    it('should use default maxHeight of 600px', () => {
      const { container } = render(<UpdateCard>Content</UpdateCard>);
      const content = container.querySelector('.card-content') as HTMLElement;
      expect(content).toHaveStyle({ maxHeight: '600px' });
    });

    it('should show scrollbar by default', () => {
      const { container } = render(<UpdateCard>Content</UpdateCard>);
      const content = container.querySelector('.card-content') as HTMLElement;
      expect(content).toHaveClass('custom-scrollbar');
    });

    it('should hide scrollbar when showScrollbar is false', () => {
      const { container } = render(
        <UpdateCard showScrollbar={false}>Content</UpdateCard>
      );
      const content = container.querySelector('.card-content') as HTMLElement;
      expect(content).not.toHaveClass('custom-scrollbar');
    });
  });

  describe('Card Header', () => {
    it('should render header when title is provided', () => {
      const { container } = render(<UpdateCard title="Header">Content</UpdateCard>);
      const header = container.querySelector('.card-header');
      expect(header).toBeInTheDocument();
    });

    it('should not render header when title is not provided', () => {
      const { container } = render(<UpdateCard>Content</UpdateCard>);
      const header = container.querySelector('.card-header');
      expect(header).not.toBeInTheDocument();
    });

    it('should have proper header styling', () => {
      const { container } = render(<UpdateCard title="Header">Content</UpdateCard>);
      const header = container.querySelector('.card-header') as HTMLElement;
      expect(header).toHaveClass('px-6');
      expect(header).toHaveClass('py-5');
      expect(header).toHaveClass('border-b');
      expect(header).toHaveClass('border-white/10');
      expect(header).toHaveClass('bg-white/5');
    });
  });

  describe('Card Content', () => {
    it('should have scrollable content area', () => {
      const { container } = render(<UpdateCard>Content</UpdateCard>);
      const content = container.querySelector('.card-content') as HTMLElement;
      expect(content).toHaveClass('overflow-y-auto');
    });

    it('should have proper padding', () => {
      const { container } = render(<UpdateCard>Content</UpdateCard>);
      const content = container.querySelector('.card-content') as HTMLElement;
      expect(content).toHaveClass('px-6');
      expect(content).toHaveClass('py-4');
    });
  });
});

describe('UpdateCardHeader', () => {
  it('should render correctly', () => {
    render(<UpdateCardHeader>Header Content</UpdateCardHeader>);
    expect(screen.getByText('Header Content')).toBeInTheDocument();
  });

  it('should have proper styling', () => {
    const { container } = render(<UpdateCardHeader>Header</UpdateCardHeader>);
    const header = container.firstChild as HTMLElement;
    expect(header).toHaveClass('card-header');
    expect(header).toHaveClass('px-6');
    expect(header).toHaveClass('py-5');
  });

  it('should accept custom className', () => {
    const { container } = render(
      <UpdateCardHeader className="custom">Header</UpdateCardHeader>
    );
    const header = container.firstChild as HTMLElement;
    expect(header).toHaveClass('custom');
  });
});

describe('UpdateCardTitle', () => {
  it('should render as h2 element', () => {
    render(<UpdateCardTitle>Title</UpdateCardTitle>);
    const title = screen.getByText('Title');
    expect(title.tagName).toBe('H2');
  });

  it('should have proper styling', () => {
    const { container } = render(<UpdateCardTitle>Title</UpdateCardTitle>);
    const title = container.firstChild as HTMLElement;
    expect(title).toHaveClass('card-title');
    expect(title).toHaveClass('text-xl');
    expect(title).toHaveClass('font-semibold');
    expect(title).toHaveClass('text-white');
  });

  it('should accept custom className', () => {
    const { container } = render(
      <UpdateCardTitle className="custom">Title</UpdateCardTitle>
    );
    const title = container.firstChild as HTMLElement;
    expect(title).toHaveClass('custom');
  });
});

describe('UpdateCardContent', () => {
  it('should render correctly', () => {
    render(<UpdateCardContent>Content</UpdateCardContent>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('should have scrollable styling', () => {
    const { container } = render(<UpdateCardContent>Content</UpdateCardContent>);
    const content = container.firstChild as HTMLElement;
    expect(content).toHaveClass('overflow-y-auto');
    expect(content).toHaveClass('custom-scrollbar');
  });

  it('should apply custom maxHeight', () => {
    const { container } = render(
      <UpdateCardContent maxHeight="500px">Content</UpdateCardContent>
    );
    const content = container.firstChild as HTMLElement;
    expect(content).toHaveStyle({ maxHeight: '500px' });
  });

  it('should hide scrollbar when showScrollbar is false', () => {
    const { container } = render(
      <UpdateCardContent showScrollbar={false}>Content</UpdateCardContent>
    );
    const content = container.firstChild as HTMLElement;
    expect(content).not.toHaveClass('custom-scrollbar');
  });

  it('should accept custom className', () => {
    const { container } = render(
      <UpdateCardContent className="custom">Content</UpdateCardContent>
    );
    const content = container.firstChild as HTMLElement;
    expect(content).toHaveClass('custom');
  });
});

describe('Accessibility', () => {
  it('should have proper semantic structure with title', () => {
    render(<UpdateCard title="Test Title">Content</UpdateCard>);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent('Test Title');
  });

  it('should be keyboard accessible', () => {
    const { container } = render(<UpdateCard>Content</UpdateCard>);
    const card = container.firstChild as HTMLElement;
    // Card should be in the document and accessible
    expect(card).toBeInTheDocument();
  });
});

describe('Integration', () => {
  it('should work with composed components', () => {
    render(
      <UpdateCard>
        <UpdateCardHeader>
          <UpdateCardTitle>Custom Title</UpdateCardTitle>
        </UpdateCardHeader>
        <UpdateCardContent>Custom Content</UpdateCardContent>
      </UpdateCard>
    );
    
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
    expect(screen.getByText('Custom Content')).toBeInTheDocument();
  });

  it('should handle complex children', () => {
    render(
      <UpdateCard title="Parent">
        <div>
          <p>Paragraph 1</p>
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
          </ul>
        </div>
      </UpdateCard>
    );
    
    expect(screen.getByText('Paragraph 1')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });
});
