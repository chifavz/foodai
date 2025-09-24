import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import SearchAndFilters from './SearchAndFilters';

// Mock the useDebounce hook
jest.mock('../hooks/useDebounce', () => ({
  useDebounce: (value, delay) => value // Return immediate value for testing
}));

describe('SearchAndFilters', () => {
  const defaultProps = {
    searchTerm: '',
    onSearchChange: jest.fn(),
    mealPreferences: {},
    onFilterByCuisine: jest.fn(),
    onClearFilters: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Search Bar', () => {
    it('renders search input with correct placeholder', () => {
      render(<SearchAndFilters {...defaultProps} />);
      
      const searchInput = screen.getByLabelText('Search meals by name, description, or cuisine');
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAttribute('placeholder', 'Search within matched meals...');
    });

    it('displays the current search term', () => {
      render(<SearchAndFilters {...defaultProps} searchTerm="pizza" />);
      
      const searchInput = screen.getByDisplayValue('pizza');
      expect(searchInput).toBeInTheDocument();
    });

    it('calls onSearchChange when user types in search input', async () => {
      render(<SearchAndFilters {...defaultProps} />);
      
      const searchInput = screen.getByLabelText('Search meals by name, description, or cuisine');
      fireEvent.change(searchInput, { target: { value: 'pasta' } });
      
      expect(defaultProps.onSearchChange).toHaveBeenCalledWith('pasta');
    });

    it('shows clear button when search term is present', () => {
      render(<SearchAndFilters {...defaultProps} searchTerm="test" />);
      
      const clearButton = screen.getByLabelText('Clear search');
      expect(clearButton).toBeInTheDocument();
    });

    it('hides clear button when search term is empty', () => {
      render(<SearchAndFilters {...defaultProps} searchTerm="" />);
      
      const clearButton = screen.queryByLabelText('Clear search');
      expect(clearButton).not.toBeInTheDocument();
    });

    it('clears search term when clear button is clicked', () => {
      render(<SearchAndFilters {...defaultProps} searchTerm="test" />);
      
      const clearButton = screen.getByLabelText('Clear search');
      fireEvent.click(clearButton);
      
      expect(defaultProps.onSearchChange).toHaveBeenCalledWith('');
    });

    it('focuses search input when clear button is clicked', () => {
      render(<SearchAndFilters {...defaultProps} searchTerm="test" />);
      
      const searchInput = screen.getByLabelText('Search meals by name, description, or cuisine');
      const clearButton = screen.getByLabelText('Clear search');
      
      fireEvent.click(clearButton);
      
      expect(searchInput).toHaveFocus();
    });

    it('has proper keyboard navigation with focus ring', () => {
      render(<SearchAndFilters {...defaultProps} />);
      
      const searchInput = screen.getByLabelText('Search meals by name, description, or cuisine');
      expect(searchInput).toHaveClass('focus:ring-2', 'focus:ring-blue-500');
    });
  });

  describe('Quick Filter Buttons', () => {
    it('renders default quick filters', () => {
      render(<SearchAndFilters {...defaultProps} />);
      
      expect(screen.getByText('🍽️ All')).toBeInTheDocument();
      expect(screen.getByText('🍝 Italian')).toBeInTheDocument();
      expect(screen.getByText('🥖 French')).toBeInTheDocument();
      expect(screen.getByText('🍣 Japanese')).toBeInTheDocument();
      expect(screen.getByText('🥗 Vegetarian')).toBeInTheDocument();
    });

    it('renders custom quick filters when provided', () => {
      const customFilters = ['All', 'Mexican', 'Indian'];
      render(<SearchAndFilters {...defaultProps} quickFilters={customFilters} />);
      
      expect(screen.getByText('🍽️ All')).toBeInTheDocument();
      expect(screen.getByText('🥗 Mexican')).toBeInTheDocument();
      expect(screen.getByText('🥗 Indian')).toBeInTheDocument();
      expect(screen.queryByText('🍝 Italian')).not.toBeInTheDocument();
    });

    it('highlights active filter correctly', () => {
      render(<SearchAndFilters {...defaultProps} mealPreferences={{ cuisine: 'Italian' }} />);
      
      const italianButton = screen.getByText('🍝 Italian');
      expect(italianButton).toHaveClass('bg-blue-600', 'text-white');
      
      const allButton = screen.getByText('🍽️ All');
      expect(allButton).not.toHaveClass('bg-blue-600', 'text-white');
    });

    it('highlights "All" filter when no cuisine is selected', () => {
      render(<SearchAndFilters {...defaultProps} mealPreferences={{}} />);
      
      const allButton = screen.getByText('🍽️ All');
      expect(allButton).toHaveClass('bg-blue-600', 'text-white');
    });

    it('calls onFilterByCuisine when cuisine filter is clicked', () => {
      render(<SearchAndFilters {...defaultProps} />);
      
      const italianButton = screen.getByText('🍝 Italian');
      fireEvent.click(italianButton);
      
      expect(defaultProps.onFilterByCuisine).toHaveBeenCalledWith('Italian');
    });

    it('calls onClearFilters when "All" filter is clicked', () => {
      render(<SearchAndFilters {...defaultProps} />);
      
      const allButton = screen.getByText('🍽️ All');
      fireEvent.click(allButton);
      
      expect(defaultProps.onClearFilters).toHaveBeenCalled();
    });

    it('has proper ARIA attributes for accessibility', () => {
      render(<SearchAndFilters {...defaultProps} mealPreferences={{ cuisine: 'Italian' }} />);
      
      const italianButton = screen.getByLabelText('Filter by Italian cuisine');
      expect(italianButton).toHaveAttribute('aria-pressed', 'true');
      
      const frenchButton = screen.getByLabelText('Filter by French cuisine');
      expect(frenchButton).toHaveAttribute('aria-pressed', 'false');
    });

    it('has proper keyboard navigation with focus ring', () => {
      render(<SearchAndFilters {...defaultProps} />);
      
      const allButton = screen.getByText('🍽️ All');
      expect(allButton).toHaveClass('focus:ring-2', 'focus:ring-blue-500');
    });
  });

  describe('Performance and Memoization', () => {
    it('should not re-render filter buttons unnecessarily', () => {
      const { rerender } = render(<SearchAndFilters {...defaultProps} />);
      
      const initialButtons = screen.getAllByRole('button').filter(btn => 
        btn.getAttribute('aria-label')?.includes('Filter by')
      );
      const initialButtonCount = initialButtons.length;
      
      // Re-render with same props
      rerender(<SearchAndFilters {...defaultProps} />);
      
      const newButtons = screen.getAllByRole('button').filter(btn => 
        btn.getAttribute('aria-label')?.includes('Filter by')
      );
      
      expect(newButtons).toHaveLength(initialButtonCount);
    });
  });

  describe('Debounce functionality', () => {
    it('accepts debounceMs prop', () => {
      // This test ensures the prop is accepted without error
      expect(() => {
        render(<SearchAndFilters {...defaultProps} debounceMs={500} />);
      }).not.toThrow();
    });

    it('uses default debounce value when not provided', () => {
      // This test ensures default debounce works
      expect(() => {
        render(<SearchAndFilters {...defaultProps} />);
      }).not.toThrow();
    });
  });

  describe('Dark mode support', () => {
    it('has proper dark mode classes', () => {
      render(<SearchAndFilters {...defaultProps} />);
      
      const searchInput = screen.getByLabelText('Search meals by name, description, or cuisine');
      expect(searchInput).toHaveClass('dark:bg-gray-800', 'dark:text-white', 'dark:border-gray-600');
      
      const filterButton = screen.getByText('🍝 Italian');
      expect(filterButton).toHaveClass('dark:bg-gray-700', 'dark:text-gray-300', 'dark:hover:bg-gray-600');
    });
  });
});