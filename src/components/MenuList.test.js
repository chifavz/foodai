import React from 'react';
import { render, screen } from '@testing-library/react';
import MenuList from './MenuList';

const mockMenuItems = [
  {
    id: 1,
    name: 'Test Pizza',
    description: 'Delicious test pizza',
    chef: 'Test Chef',
    restaurant_name: 'Test Restaurant',
    cuisine: 'Italian',
    category: 'Main Course',
    price: 20,
    rating: 4.5,
    image: '🍕',
    allergens: ['gluten', 'dairy']
  },
  {
    id: 2,
    name: 'Test Salad',
    description: 'Fresh test salad',
    chef: 'Another Chef',
    restaurant_name: 'Healthy Place',
    cuisine: 'American',
    category: 'Appetizer',
    price: 15,
    rating: 4.2,
    image: '🥗',
    allergens: []
  }
];

const defaultProps = {
  menuItems: mockMenuItems,
  searchTerm: '',
  isLoading: false,
  onItemSelect: jest.fn(),
  onAddToCart: jest.fn(),
  onShowSimilar: jest.fn(),
  onFilterByCuisine: jest.fn()
};

describe('MenuList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders menu items correctly', () => {
    render(<MenuList {...defaultProps} />);
    
    expect(screen.getByText('Test Pizza')).toBeInTheDocument();
    expect(screen.getByText('Test Salad')).toBeInTheDocument();
    expect(screen.getByText('🤖 AI found 2 meals matching your preferences')).toBeInTheDocument();
  });

  test('filters items by search term', () => {
    render(<MenuList {...defaultProps} searchTerm="pizza" />);
    
    expect(screen.getByText('Test Pizza')).toBeInTheDocument();
    expect(screen.queryByText('Test Salad')).not.toBeInTheDocument();
    expect(screen.getByText('🤖 AI found 1 meal matching your preferences (filtered by "pizza")')).toBeInTheDocument();
  });

  test('shows loading state', () => {
    render(<MenuList {...defaultProps} isLoading={true} />);
    
    // Check for skeleton loaders - should have 6 skeleton items
    const skeletonItems = document.querySelectorAll('.bg-white.rounded-lg.shadow-sm.p-6');
    expect(skeletonItems.length).toBe(6);
  });

  test('shows no results message when no items match', () => {
    render(<MenuList {...defaultProps} searchTerm="nonexistent" />);
    
    expect(screen.getByText('No meals found')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your preferences or search terms')).toBeInTheDocument();
  });

  test('displays restaurant count correctly', () => {
    render(<MenuList {...defaultProps} />);
    
    expect(screen.getByText('From 2 partner restaurants')).toBeInTheDocument();
  });

  test('handles similar search filtering', () => {
    render(<MenuList {...defaultProps} searchTerm="Similar to Test Pizza" />);
    
    // Should show the AI found text with proper count
    expect(screen.getByText(/🤖 AI found \d+ meals? matching your preferences/)).toBeInTheDocument();
  });
});