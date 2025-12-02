/**
 * CompactWeaponSelector Component Tests
 * 
 * Tests for the weapon selection functionality including:
 * - Select weapons for both presets (Requirement 6.1, 6.2)
 * - Change refinement levels (Requirement 6.3)
 * - Verify stats update correctly (Requirement 6.4)
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CompactWeaponSelector } from '../CompactWeaponSelector';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';

// Mock the WEAPONS data
jest.mock('@/data/weapons', () => ({
  WEAPONS: [
    {
      id: 1,
      name: 'Test Ranged Weapon',
      category: 'Ranged',
      refinement_data: [
        { level: 0, effect: 'Base effect', stats: { ATK: '100', 'Crit Rate': '5%' } },
        { level: 1, effect: 'Level 1 effect', stats: { ATK: '110', 'Crit Rate': '6%' } },
        { level: 2, effect: 'Level 2 effect', stats: { ATK: '120', 'Crit Rate': '7%' } },
        { level: 3, effect: 'Level 3 effect', stats: { ATK: '130', 'Crit Rate': '8%' } },
        { level: 4, effect: 'Level 4 effect', stats: { ATK: '140', 'Crit Rate': '9%' } },
        { level: 5, effect: 'Level 5 effect with a very long description that should be collapsible when displayed in the UI', stats: { ATK: '150', 'Crit Rate': '10%' } },
      ],
    },
    {
      id: 2,
      name: 'Another Ranged Weapon',
      category: 'Ranged',
      refinement_data: [
        { level: 0, effect: 'Another base effect', stats: { ATK: '90', 'Skill DMG': '10%' } },
        { level: 5, effect: 'Another max effect', stats: { ATK: '140', 'Skill DMG': '20%' } },
      ],
    },
    {
      id: 3,
      name: 'Test Melee Weapon',
      category: 'Melee',
      refinement_data: [
        { level: 0, effect: 'Melee base effect', stats: { ATK: '80', DEF: '50' } },
        { level: 5, effect: 'Melee max effect', stats: { ATK: '130', DEF: '100' } },
      ],
    },
    {
      id: 4,
      name: 'Consonance Weapon',
      category: 'Consonance',
      refinement_data: [
        { level: 0, effect: 'Consonance base', stats: { ATK: '70' } },
        { level: 5, effect: 'Consonance max', stats: { ATK: '120' } },
      ],
    },
  ],
}));

describe('CompactWeaponSelector', () => {
  const defaultProps = {
    category: 'Ranged' as const,
    selectedWeapon: null,
    refinement: 0,
    onSelectWeapon: jest.fn(),
    onRefinementChange: jest.fn(),
    gradient: 'from-cyan-400 to-blue-500',
    label: 'Range Weapon A',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Requirement 6.1 & 6.2: Weapon Selection', () => {
    it('should render with label', () => {
      render(<CompactWeaponSelector {...defaultProps} />);
      
      expect(screen.getByText('Range Weapon A')).toBeInTheDocument();
    });

    it('should render label with gradient styling', () => {
      render(<CompactWeaponSelector {...defaultProps} />);
      
      const label = screen.getByText('Range Weapon A');
      expect(label).toHaveClass('bg-gradient-to-r');
      expect(label).toHaveClass('from-cyan-400');
      expect(label).toHaveClass('to-blue-500');
    });

    it('should show "Select Weapon" placeholder when no weapon selected', () => {
      render(<CompactWeaponSelector {...defaultProps} />);
      
      expect(screen.getByText('Select Weapon')).toBeInTheDocument();
    });

    it('should show selected weapon name when weapon is selected', () => {
      const selectedWeapon = {
        id: 1,
        name: 'Test Ranged Weapon',
        category: 'Ranged',
        refinement_data: [{ level: 0, effect: 'Base', stats: { ATK: '100' } }],
      };
      
      render(<CompactWeaponSelector {...defaultProps} selectedWeapon={selectedWeapon} />);
      
      expect(screen.getByText('Test Ranged Weapon')).toBeInTheDocument();
    });

    it('should open dropdown when clicked', () => {
      render(<CompactWeaponSelector {...defaultProps} />);
      
      const dropdownButton = screen.getByText('Select Weapon');
      fireEvent.click(dropdownButton);
      
      // Should show search input
      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    });

    it('should filter weapons by category', () => {
      render(<CompactWeaponSelector {...defaultProps} category="Ranged" />);
      
      const dropdownButton = screen.getByText('Select Weapon');
      fireEvent.click(dropdownButton);
      
      // Should show Ranged weapons
      expect(screen.getByText('Test Ranged Weapon')).toBeInTheDocument();
      expect(screen.getByText('Another Ranged Weapon')).toBeInTheDocument();
      
      // Should not show Melee or Consonance weapons
      expect(screen.queryByText('Test Melee Weapon')).not.toBeInTheDocument();
      expect(screen.queryByText('Consonance Weapon')).not.toBeInTheDocument();
    });

    it('should filter weapons by Melee category', () => {
      render(<CompactWeaponSelector {...defaultProps} category="Melee" />);
      
      const dropdownButton = screen.getByText('Select Weapon');
      fireEvent.click(dropdownButton);
      
      expect(screen.getByText('Test Melee Weapon')).toBeInTheDocument();
      expect(screen.queryByText('Test Ranged Weapon')).not.toBeInTheDocument();
    });

    it('should filter weapons by Consonance category', () => {
      render(<CompactWeaponSelector {...defaultProps} category="Consonance" />);
      
      const dropdownButton = screen.getByText('Select Weapon');
      fireEvent.click(dropdownButton);
      
      expect(screen.getByText('Consonance Weapon')).toBeInTheDocument();
      expect(screen.queryByText('Test Ranged Weapon')).not.toBeInTheDocument();
    });

    it('should filter weapons by search term', () => {
      render(<CompactWeaponSelector {...defaultProps} />);
      
      const dropdownButton = screen.getByText('Select Weapon');
      fireEvent.click(dropdownButton);
      
      const searchInput = screen.getByPlaceholderText('Search...');
      fireEvent.change(searchInput, { target: { value: 'Another' } });
      
      expect(screen.getByText('Another Ranged Weapon')).toBeInTheDocument();
      expect(screen.queryByText('Test Ranged Weapon')).not.toBeInTheDocument();
    });

    it('should call onSelectWeapon when weapon is selected', () => {
      render(<CompactWeaponSelector {...defaultProps} />);
      
      const dropdownButton = screen.getByText('Select Weapon');
      fireEvent.click(dropdownButton);
      
      const weaponOption = screen.getByText('Test Ranged Weapon');
      fireEvent.click(weaponOption);
      
      expect(defaultProps.onSelectWeapon).toHaveBeenCalledWith(
        expect.objectContaining({ id: 1, name: 'Test Ranged Weapon' })
      );
    });

    it('should close dropdown after selecting weapon', async () => {
      render(<CompactWeaponSelector {...defaultProps} />);
      
      const dropdownButton = screen.getByText('Select Weapon');
      fireEvent.click(dropdownButton);
      
      const weaponOption = screen.getByText('Test Ranged Weapon');
      fireEvent.click(weaponOption);
      
      // Dropdown should close
      await waitFor(() => {
        expect(screen.queryByPlaceholderText('Search...')).not.toBeInTheDocument();
      });
    });

    it('should have "None" option to deselect weapon', () => {
      render(<CompactWeaponSelector {...defaultProps} />);
      
      const dropdownButton = screen.getByText('Select Weapon');
      fireEvent.click(dropdownButton);
      
      expect(screen.getByText('None')).toBeInTheDocument();
    });

    it('should call onSelectWeapon with null when "None" is selected', () => {
      const selectedWeapon = {
        id: 1,
        name: 'Test Ranged Weapon',
        category: 'Ranged',
        refinement_data: [{ level: 0, effect: 'Base', stats: { ATK: '100' } }],
      };
      
      render(<CompactWeaponSelector {...defaultProps} selectedWeapon={selectedWeapon} />);
      
      const dropdownButton = screen.getByText('Test Ranged Weapon');
      fireEvent.click(dropdownButton);
      
      const noneOption = screen.getByText('None');
      fireEvent.click(noneOption);
      
      expect(defaultProps.onSelectWeapon).toHaveBeenCalledWith(null);
    });

    it('should highlight currently selected weapon in dropdown', () => {
      const selectedWeapon = {
        id: 1,
        name: 'Test Ranged Weapon',
        category: 'Ranged',
        refinement_data: [{ level: 0, effect: 'Base', stats: { ATK: '100' } }],
      };
      
      render(<CompactWeaponSelector {...defaultProps} selectedWeapon={selectedWeapon} />);
      
      const dropdownButton = screen.getByText('Test Ranged Weapon');
      fireEvent.click(dropdownButton);
      
      // Find the selected weapon option in dropdown
      const weaponOptions = screen.getAllByText('Test Ranged Weapon');
      const dropdownOption = weaponOptions.find(el => el.closest('button')?.classList.contains('bg-white/10'));
      expect(dropdownOption).toBeInTheDocument();
    });
  });

  describe('Requirement 6.3: Refinement Level Changes', () => {
    const selectedWeapon = {
      id: 1,
      name: 'Test Ranged Weapon',
      category: 'Ranged',
      refinement_data: [
        { level: 0, effect: 'Base effect', stats: { ATK: '100', 'Crit Rate': '5%' } },
        { level: 1, effect: 'Level 1 effect', stats: { ATK: '110', 'Crit Rate': '6%' } },
        { level: 2, effect: 'Level 2 effect', stats: { ATK: '120', 'Crit Rate': '7%' } },
        { level: 3, effect: 'Level 3 effect', stats: { ATK: '130', 'Crit Rate': '8%' } },
        { level: 4, effect: 'Level 4 effect', stats: { ATK: '140', 'Crit Rate': '9%' } },
        { level: 5, effect: 'Level 5 effect', stats: { ATK: '150', 'Crit Rate': '10%' } },
      ],
    };

    it('should show refinement slider when weapon is selected', () => {
      render(<CompactWeaponSelector {...defaultProps} selectedWeapon={selectedWeapon} />);
      
      expect(screen.getByText('Refinement')).toBeInTheDocument();
      expect(screen.getByRole('slider')).toBeInTheDocument();
    });

    it('should not show refinement slider when no weapon is selected', () => {
      render(<CompactWeaponSelector {...defaultProps} />);
      
      expect(screen.queryByText('Refinement')).not.toBeInTheDocument();
      expect(screen.queryByRole('slider')).not.toBeInTheDocument();
    });

    it('should display current refinement level', () => {
      render(<CompactWeaponSelector {...defaultProps} selectedWeapon={selectedWeapon} refinement={3} />);
      
      expect(screen.getByText('Lv.3')).toBeInTheDocument();
    });

    it('should call onRefinementChange when slider is changed', () => {
      render(<CompactWeaponSelector {...defaultProps} selectedWeapon={selectedWeapon} refinement={0} />);
      
      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '4' } });
      
      expect(defaultProps.onRefinementChange).toHaveBeenCalledWith(4);
    });

    it('should have slider range from 0 to 5', () => {
      render(<CompactWeaponSelector {...defaultProps} selectedWeapon={selectedWeapon} />);
      
      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('min', '0');
      expect(slider).toHaveAttribute('max', '5');
    });

    it('should display refinement level markers (0-5)', () => {
      render(<CompactWeaponSelector {...defaultProps} selectedWeapon={selectedWeapon} />);
      
      // Check for level markers
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });

  describe('Requirement 6.4: Stats Display', () => {
    const selectedWeapon = {
      id: 1,
      name: 'Test Ranged Weapon',
      category: 'Ranged',
      refinement_data: [
        { level: 0, effect: 'Base effect', stats: { ATK: '100', 'Crit Rate': '5%' } },
        { level: 3, effect: 'Level 3 effect', stats: { ATK: '130', 'Crit Rate': '8%' } },
        { level: 5, effect: 'Level 5 effect with a very long description that should be collapsible', stats: { ATK: '150', 'Crit Rate': '10%' } },
      ],
    };

    it('should display weapon stats for current refinement level', () => {
      render(<CompactWeaponSelector {...defaultProps} selectedWeapon={selectedWeapon} refinement={0} />);
      
      expect(screen.getByText('ATK')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('Crit Rate')).toBeInTheDocument();
      expect(screen.getByText('5%')).toBeInTheDocument();
    });

    it('should update stats display when refinement changes', () => {
      const { rerender } = render(
        <CompactWeaponSelector {...defaultProps} selectedWeapon={selectedWeapon} refinement={0} />
      );
      
      expect(screen.getByText('100')).toBeInTheDocument();
      
      rerender(
        <CompactWeaponSelector {...defaultProps} selectedWeapon={selectedWeapon} refinement={3} />
      );
      
      expect(screen.getByText('130')).toBeInTheDocument();
      expect(screen.getByText('8%')).toBeInTheDocument();
    });

    it('should display weapon effect text', () => {
      render(<CompactWeaponSelector {...defaultProps} selectedWeapon={selectedWeapon} refinement={0} />);
      
      expect(screen.getByText('Effect')).toBeInTheDocument();
      expect(screen.getByText('Base effect')).toBeInTheDocument();
    });

    it('should update effect text when refinement changes', () => {
      const { rerender } = render(
        <CompactWeaponSelector {...defaultProps} selectedWeapon={selectedWeapon} refinement={0} />
      );
      
      expect(screen.getByText('Base effect')).toBeInTheDocument();
      
      rerender(
        <CompactWeaponSelector {...defaultProps} selectedWeapon={selectedWeapon} refinement={3} />
      );
      
      expect(screen.getByText('Level 3 effect')).toBeInTheDocument();
    });

    it('should have collapsible effect text for long descriptions', () => {
      render(<CompactWeaponSelector {...defaultProps} selectedWeapon={selectedWeapon} refinement={5} />);
      
      // Effect section should have a toggle button (ChevronUp icon)
      const effectSection = screen.getByText('Effect').closest('button');
      expect(effectSection).toBeInTheDocument();
    });

    it('should toggle effect text expansion when clicked', () => {
      // Use a weapon with a long effect text (>100 chars)
      const weaponWithLongEffect = {
        id: 1,
        name: 'Test Ranged Weapon',
        category: 'Ranged',
        refinement_data: [
          { 
            level: 0, 
            effect: 'This is a very long effect description that exceeds one hundred characters to trigger the collapsible behavior in the component UI', 
            stats: { ATK: '100' } 
          },
        ],
      };
      
      render(<CompactWeaponSelector {...defaultProps} selectedWeapon={weaponWithLongEffect} refinement={0} />);
      
      const effectButton = screen.getByText('Effect').closest('button');
      
      // Initially collapsed (has line-clamp-2)
      const effectText = screen.getByText(/This is a very long effect/);
      expect(effectText).toHaveClass('line-clamp-2');
      
      // Click to expand
      fireEvent.click(effectButton!);
      
      // Should no longer have line-clamp
      expect(effectText).not.toHaveClass('line-clamp-2');
    });
  });

  describe('Dropdown behavior', () => {
    it('should close dropdown when clicking outside', async () => {
      render(
        <div>
          <CompactWeaponSelector {...defaultProps} />
          <div data-testid="outside">Outside</div>
        </div>
      );
      
      // Open dropdown
      const dropdownButton = screen.getByText('Select Weapon');
      fireEvent.click(dropdownButton);
      
      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
      
      // Click outside
      fireEvent.mouseDown(screen.getByTestId('outside'));
      
      await waitFor(() => {
        expect(screen.queryByPlaceholderText('Search...')).not.toBeInTheDocument();
      });
    });

    it('should rotate chevron icon when dropdown is open', () => {
      render(<CompactWeaponSelector {...defaultProps} />);
      
      const dropdownButton = screen.getByText('Select Weapon').closest('button');
      
      // Initially not rotated - check the class attribute
      let chevron = dropdownButton?.querySelector('[data-icon="ChevronDown"]');
      expect(chevron).toBeInTheDocument();
      expect(chevron?.getAttribute('class')).not.toContain('rotate-180');
      
      // Open dropdown
      fireEvent.click(dropdownButton!);
      
      // Re-query the chevron after state change
      chevron = dropdownButton?.querySelector('[data-icon="ChevronDown"]');
      
      // Should be rotated - check the class attribute contains rotate-180
      expect(chevron?.getAttribute('class')).toContain('rotate-180');
    });

    it('should clear search when weapon is selected', async () => {
      // We need to track the selected weapon state
      const onSelectWeapon = jest.fn();
      
      const { rerender } = render(
        <CompactWeaponSelector {...defaultProps} onSelectWeapon={onSelectWeapon} />
      );
      
      // Open dropdown and search
      const dropdownButton = screen.getByText('Select Weapon');
      fireEvent.click(dropdownButton);
      
      const searchInput = screen.getByPlaceholderText('Search...');
      fireEvent.change(searchInput, { target: { value: 'Test' } });
      
      // Select weapon
      const weaponOption = screen.getByText('Test Ranged Weapon');
      fireEvent.click(weaponOption);
      
      // Verify onSelectWeapon was called
      expect(onSelectWeapon).toHaveBeenCalled();
      
      // Simulate the parent updating the selected weapon
      const selectedWeapon = {
        id: 1,
        name: 'Test Ranged Weapon',
        category: 'Ranged',
        refinement_data: [{ level: 0, effect: 'Base', stats: { ATK: '100' } }],
      };
      
      rerender(
        <CompactWeaponSelector {...defaultProps} selectedWeapon={selectedWeapon} onSelectWeapon={onSelectWeapon} />
      );
      
      // Reopen dropdown
      fireEvent.click(screen.getByText('Test Ranged Weapon'));
      
      // Search should be cleared
      const newSearchInput = screen.getByPlaceholderText('Search...');
      expect(newSearchInput).toHaveValue('');
    });
  });

  describe('Animation and transitions', () => {
    it('should have animation classes for stats section', () => {
      const selectedWeapon = {
        id: 1,
        name: 'Test Ranged Weapon',
        category: 'Ranged',
        refinement_data: [{ level: 0, effect: 'Base', stats: { ATK: '100' } }],
      };
      
      const { container } = render(
        <CompactWeaponSelector {...defaultProps} selectedWeapon={selectedWeapon} />
      );
      
      const animatedSection = container.querySelector('.animate-in');
      expect(animatedSection).toBeInTheDocument();
    });
  });
});
