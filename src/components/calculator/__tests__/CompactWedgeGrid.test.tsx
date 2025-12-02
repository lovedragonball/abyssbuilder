/**
 * CompactWedgeGrid Component Tests
 * 
 * Tests for the wedge grid functionality including:
 * - Add wedges to all 8 slots (Requirement 4.1)
 * - Remove wedges (Requirement 4.2)
 * - Verify rarity colors and icons (Requirement 4.3)
 * - Test hover states (Requirement 4.4)
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CompactWedgeGrid } from '../CompactWedgeGrid';
import { DemonWedge } from '@/lib/demon-wedges-data';

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: { src: string; alt: string; fill?: boolean; className?: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img 
      src={props.src} 
      alt={props.alt} 
      data-testid="wedge-image"
      className={props.className}
    />
  ),
}));

// Mock TrialRankSelector
jest.mock('../TrialRankSelector', () => ({
  TrialRankSelector: ({ selectedRankLevel, onChange }: { selectedRankLevel: number | null; onChange: (rank: number | null) => void }) => (
    <button 
      data-testid="trial-rank-selector"
      onClick={() => onChange(selectedRankLevel === null ? 1 : null)}
    >
      Trial Rank: {selectedRankLevel ?? 'None'}
    </button>
  ),
}));

// Create mock wedge data
const createMockWedge = (id: string, rarity: number, name: string = 'Test Wedge'): DemonWedge => ({
  id,
  name,
  fullName: `${name} Full Name`,
  rarity,
  image: `/images/wedges/${id}.png`,
  description: 'Test description',
  effects: [],
  conditions: [],
  category: 'test',
});

// Create mock equipped wedge slot
const createMockSlot = (wedge: DemonWedge, level: number = 1, enabled: boolean = true) => ({
  wedge,
  level,
  enabled,
  conditions: {},
});

describe('CompactWedgeGrid', () => {
  const defaultProps = {
    slots: Array(8).fill(undefined),
    presetId: 'A' as const,
    title: 'Preset A',
    gradient: 'from-cyan-400 to-blue-500',
    onSlotClick: jest.fn(),
    onRemoveWedge: jest.fn(),
    onOpenDetails: jest.fn(),
    trialRank: null,
    onTrialRankChange: jest.fn(),
    onOpenConditionModal: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Requirement 4.1: 4x2 Grid Layout with 8 slots', () => {
    it('should render 8 slots in a grid', () => {
      render(<CompactWedgeGrid {...defaultProps} />);
      
      // Should have 8 empty slot buttons
      const emptySlots = screen.getAllByRole('button', { name: /Add wedge to Preset A slot/i });
      expect(emptySlots).toHaveLength(8);
    });

    it('should render header with title', () => {
      render(<CompactWedgeGrid {...defaultProps} />);
      
      expect(screen.getByText('Preset A')).toBeInTheDocument();
    });

    it('should render header with gradient styling', () => {
      render(<CompactWedgeGrid {...defaultProps} />);
      
      const title = screen.getByText('Preset A');
      expect(title).toHaveClass('bg-gradient-to-r');
      expect(title).toHaveClass('from-cyan-400');
      expect(title).toHaveClass('to-blue-500');
    });

    it('should render Trial Rank selector when onTrialRankChange is provided', () => {
      render(<CompactWedgeGrid {...defaultProps} />);
      
      expect(screen.getByTestId('trial-rank-selector')).toBeInTheDocument();
    });

    it('should render Configure Conditions button', () => {
      render(<CompactWedgeGrid {...defaultProps} />);
      
      expect(screen.getByText('Configure Conditions')).toBeInTheDocument();
    });

    it('should display all 8 slots when wedges are equipped', () => {
      const wedge = createMockWedge('test-1', 5, 'Test');
      const slots = Array(8).fill(null).map(() => createMockSlot(wedge));
      
      render(<CompactWedgeGrid {...defaultProps} slots={slots} />);
      
      // Should have 8 wedge images
      const wedgeImages = screen.getAllByTestId('wedge-image');
      expect(wedgeImages).toHaveLength(8);
    });
  });

  describe('Requirement 4.2: Empty slot with clickable placeholder', () => {
    it('should render empty slots with "+" icon placeholder', () => {
      render(<CompactWedgeGrid {...defaultProps} />);
      
      // Each empty slot should have a Plus icon (rendered as svg with data-icon="Plus")
      const plusIcons = document.querySelectorAll('[data-icon="Plus"]');
      expect(plusIcons).toHaveLength(8);
    });

    it('should call onSlotClick when empty slot is clicked', () => {
      render(<CompactWedgeGrid {...defaultProps} />);
      
      const emptySlots = screen.getAllByRole('button', { name: /Add wedge to Preset A slot/i });
      fireEvent.click(emptySlots[0]);
      
      expect(defaultProps.onSlotClick).toHaveBeenCalledWith(0);
    });

    it('should call onSlotClick with correct slot index', () => {
      render(<CompactWedgeGrid {...defaultProps} />);
      
      const emptySlots = screen.getAllByRole('button', { name: /Add wedge to Preset A slot/i });
      
      // Click slot 5 (index 4)
      fireEvent.click(emptySlots[4]);
      expect(defaultProps.onSlotClick).toHaveBeenCalledWith(4);
      
      // Click slot 8 (index 7)
      fireEvent.click(emptySlots[7]);
      expect(defaultProps.onSlotClick).toHaveBeenCalledWith(7);
    });

    it('should have proper aria-label for accessibility', () => {
      render(<CompactWedgeGrid {...defaultProps} presetId="B" />);
      
      const emptySlots = screen.getAllByRole('button', { name: /Add wedge to Preset B slot/i });
      expect(emptySlots[0]).toHaveAttribute('aria-label', 'Add wedge to Preset B slot 1');
      expect(emptySlots[7]).toHaveAttribute('aria-label', 'Add wedge to Preset B slot 8');
    });
  });

  describe('Requirement 4.3: Equipped slot with wedge icon, name, and rarity', () => {
    it('should display wedge image when equipped', () => {
      const wedge = createMockWedge('test-wedge', 5, 'Fire Wedge');
      const slots = [createMockSlot(wedge), ...Array(7).fill(undefined)];
      
      render(<CompactWedgeGrid {...defaultProps} slots={slots} />);
      
      const wedgeImage = screen.getByTestId('wedge-image');
      expect(wedgeImage).toHaveAttribute('src', '/images/wedges/test-wedge.png');
      expect(wedgeImage).toHaveAttribute('alt', 'Fire Wedge Full Name');
    });

    it('should display truncated wedge name below icon', () => {
      const wedge = createMockWedge('test-wedge', 5, 'Fire');
      const slots = [createMockSlot(wedge), ...Array(7).fill(undefined)];
      
      render(<CompactWedgeGrid {...defaultProps} slots={slots} />);
      
      expect(screen.getByText('Fire')).toBeInTheDocument();
    });

    it('should truncate long wedge names', () => {
      const wedge = createMockWedge('test-wedge', 5, 'VeryLongWedgeName');
      const slots = [createMockSlot(wedge), ...Array(7).fill(undefined)];
      
      render(<CompactWedgeGrid {...defaultProps} slots={slots} />);
      
      // Name should be truncated to 12 chars with ellipsis
      expect(screen.getByText('VeryLongWed…')).toBeInTheDocument();
    });

    it('should apply 5-star rarity border color (amber)', () => {
      const wedge = createMockWedge('test-wedge', 5, 'Legendary');
      const slots = [createMockSlot(wedge), ...Array(7).fill(undefined)];
      
      const { container } = render(<CompactWedgeGrid {...defaultProps} slots={slots} />);
      
      const equippedSlot = container.querySelector('.border-amber-500\\/50');
      expect(equippedSlot).toBeInTheDocument();
    });

    it('should apply 4-star rarity border color (purple)', () => {
      const wedge = createMockWedge('test-wedge', 4, 'Epic');
      const slots = [createMockSlot(wedge), ...Array(7).fill(undefined)];
      
      const { container } = render(<CompactWedgeGrid {...defaultProps} slots={slots} />);
      
      const equippedSlot = container.querySelector('.border-purple-500\\/50');
      expect(equippedSlot).toBeInTheDocument();
    });

    it('should apply 3-star rarity border color (blue)', () => {
      const wedge = createMockWedge('test-wedge', 3, 'Rare');
      const slots = [createMockSlot(wedge), ...Array(7).fill(undefined)];
      
      const { container } = render(<CompactWedgeGrid {...defaultProps} slots={slots} />);
      
      const equippedSlot = container.querySelector('.border-blue-500\\/50');
      expect(equippedSlot).toBeInTheDocument();
    });

    it('should apply default border color for other rarities', () => {
      const wedge = createMockWedge('test-wedge', 2, 'Common');
      const slots = [createMockSlot(wedge), ...Array(7).fill(undefined)];
      
      const { container } = render(<CompactWedgeGrid {...defaultProps} slots={slots} />);
      
      const equippedSlot = container.querySelector('.border-white\\/20');
      expect(equippedSlot).toBeInTheDocument();
    });

    it('should show fallback initial when no image is available', () => {
      const wedge = createMockWedge('test-wedge', 5, 'Fire');
      wedge.image = ''; // No image
      const slots = [createMockSlot(wedge), ...Array(7).fill(undefined)];
      
      render(<CompactWedgeGrid {...defaultProps} slots={slots} />);
      
      // Should show first letter of fullName
      expect(screen.getByText('F')).toBeInTheDocument();
    });

    it('should call onOpenDetails when equipped slot is clicked', () => {
      const wedge = createMockWedge('test-wedge', 5, 'Fire');
      const slot = createMockSlot(wedge, 3, true);
      const slots = [slot, ...Array(7).fill(undefined)];
      
      render(<CompactWedgeGrid {...defaultProps} slots={slots} />);
      
      // Click on the equipped slot (the div containing the wedge)
      const equippedSlot = screen.getByText('Fire').closest('.cursor-pointer');
      fireEvent.click(equippedSlot!);
      
      expect(defaultProps.onOpenDetails).toHaveBeenCalledWith(wedge, 3, true, {}, 0);
    });
  });

  describe('Requirement 4.4: Remove button on hover', () => {
    it('should render remove button on equipped slots', () => {
      const wedge = createMockWedge('test-wedge', 5, 'Fire');
      const slots = [createMockSlot(wedge), ...Array(7).fill(undefined)];
      
      render(<CompactWedgeGrid {...defaultProps} slots={slots} />);
      
      const removeButton = screen.getByRole('button', { name: /Remove wedge/i });
      expect(removeButton).toBeInTheDocument();
    });

    it('should call onRemoveWedge when remove button is clicked', () => {
      const wedge = createMockWedge('test-wedge', 5, 'Fire');
      const slots = [createMockSlot(wedge), ...Array(7).fill(undefined)];
      
      render(<CompactWedgeGrid {...defaultProps} slots={slots} />);
      
      const removeButton = screen.getByRole('button', { name: /Remove wedge/i });
      fireEvent.click(removeButton);
      
      expect(defaultProps.onRemoveWedge).toHaveBeenCalledWith(0);
    });

    it('should not trigger onOpenDetails when remove button is clicked', () => {
      const wedge = createMockWedge('test-wedge', 5, 'Fire');
      const slots = [createMockSlot(wedge), ...Array(7).fill(undefined)];
      
      render(<CompactWedgeGrid {...defaultProps} slots={slots} />);
      
      const removeButton = screen.getByRole('button', { name: /Remove wedge/i });
      fireEvent.click(removeButton);
      
      // onRemoveWedge should be called, but onOpenDetails should not
      expect(defaultProps.onRemoveWedge).toHaveBeenCalled();
      expect(defaultProps.onOpenDetails).not.toHaveBeenCalled();
    });

    it('should have remove button with X icon', () => {
      const wedge = createMockWedge('test-wedge', 5, 'Fire');
      const slots = [createMockSlot(wedge), ...Array(7).fill(undefined)];
      
      render(<CompactWedgeGrid {...defaultProps} slots={slots} />);
      
      const removeButton = screen.getByRole('button', { name: /Remove wedge/i });
      const xIcon = removeButton.querySelector('[data-icon="X"]');
      expect(xIcon).toBeInTheDocument();
    });
  });

  describe('Disabled/Enabled state', () => {
    it('should apply opacity and grayscale when wedge is disabled', () => {
      const wedge = createMockWedge('test-wedge', 5, 'Fire');
      const slot = createMockSlot(wedge, 1, false); // disabled
      const slots = [slot, ...Array(7).fill(undefined)];
      
      const { container } = render(<CompactWedgeGrid {...defaultProps} slots={slots} />);
      
      const disabledSlot = container.querySelector('.opacity-40.grayscale');
      expect(disabledSlot).toBeInTheDocument();
    });

    it('should not apply opacity when wedge is enabled', () => {
      const wedge = createMockWedge('test-wedge', 5, 'Fire');
      const slot = createMockSlot(wedge, 1, true); // enabled
      const slots = [slot, ...Array(7).fill(undefined)];
      
      const { container } = render(<CompactWedgeGrid {...defaultProps} slots={slots} />);
      
      const disabledSlot = container.querySelector('.opacity-40.grayscale');
      expect(disabledSlot).not.toBeInTheDocument();
    });
  });

  describe('Configure Conditions button', () => {
    it('should call onOpenConditionModal when clicked', () => {
      render(<CompactWedgeGrid {...defaultProps} />);
      
      const configureButton = screen.getByText('Configure Conditions');
      fireEvent.click(configureButton);
      
      expect(defaultProps.onOpenConditionModal).toHaveBeenCalled();
    });

    it('should have SlidersHorizontal icon', () => {
      render(<CompactWedgeGrid {...defaultProps} />);
      
      const configureButton = screen.getByText('Configure Conditions').closest('button');
      const icon = configureButton?.querySelector('[data-icon="SlidersHorizontal"]');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Trial Rank integration', () => {
    it('should pass trialRank to TrialRankSelector', () => {
      render(<CompactWedgeGrid {...defaultProps} trialRank={5} />);
      
      expect(screen.getByText('Trial Rank: 5')).toBeInTheDocument();
    });

    it('should call onTrialRankChange when trial rank changes', () => {
      render(<CompactWedgeGrid {...defaultProps} trialRank={null} />);
      
      const trialRankSelector = screen.getByTestId('trial-rank-selector');
      fireEvent.click(trialRankSelector);
      
      expect(defaultProps.onTrialRankChange).toHaveBeenCalledWith(1);
    });
  });

  describe('Mixed slots (some empty, some equipped)', () => {
    it('should correctly render mix of empty and equipped slots', () => {
      const wedge1 = createMockWedge('wedge-1', 5, 'Fire');
      const wedge2 = createMockWedge('wedge-2', 4, 'Ice');
      const wedge3 = createMockWedge('wedge-3', 3, 'Wind');
      
      const slots = [
        createMockSlot(wedge1),
        undefined,
        createMockSlot(wedge2),
        undefined,
        undefined,
        createMockSlot(wedge3),
        undefined,
        undefined,
      ];
      
      render(<CompactWedgeGrid {...defaultProps} slots={slots} />);
      
      // Should have 3 wedge images
      const wedgeImages = screen.getAllByTestId('wedge-image');
      expect(wedgeImages).toHaveLength(3);
      
      // Should have 5 empty slots
      const emptySlots = screen.getAllByRole('button', { name: /Add wedge to Preset A slot/i });
      expect(emptySlots).toHaveLength(5);
    });
  });
});
