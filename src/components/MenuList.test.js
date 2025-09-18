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
  },
  {
    id: 3,
    name: 'Italian Pasta',
    description: 'Delicious pasta',
    chef: 'Test Chef',
    restaurant_name: 'Italian Place',
    cuisine: 'Italian',
    category: 'Main Course',
    price: 18,
    rating: 4.3,
    image: '🍝',
    allergens: ['gluten']
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
    expect(screen.getByText('🤖 AI found 3 meals matching your preferences')).toBeInTheDocument();
  });

  test('filters items by search term', () => {
    render(<MenuList {...defaultProps} searchTerm="pizza" />);
    
    expect(screen.getByText('Test Pizza')).toBeInTheDocument();
    expect(screen.queryByText('Test Salad')).not.toBeInTheDocument();
    expect(screen.getByText('🤖 AI found 1 meal matching your preferences (filtered by "pizza")')).toBeInTheDocument();
  });

  test('shows loading state', () => {
    render(<MenuList {...defaultProps} isLoading={true} />);
    
    // Check for skeleton loaders
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  test('shows no results message when no items match', () => {
    render(<MenuList {...defaultProps} searchTerm="nonexistent" />);
    
    expect(screen.getByText('No meals found')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your preferences or search terms')).toBeInTheDocument();
  });

  test('displays restaurant count correctly', () => {
    render(<MenuList {...defaultProps} />);
    
    expect(screen.getByText('From 3 partner restaurants')).toBeInTheDocument();
  });

  test('handles similar search filtering', () => {
    render(<MenuList {...defaultProps} searchTerm="Similar to Test Pizza" />);
    
    // Should show only Italian Pasta as similar (same cuisine: Italian, same chef: Test Chef)
    expect(screen.getByText('🤖 AI found 1 meal matching your preferences (filtered by "Similar to Test Pizza")')).toBeInTheDocument();
    expect(screen.getByText('Italian Pasta')).toBeInTheDocument();
    expect(screen.queryByText('Test Salad')).not.toBeInTheDocument(); // Different cuisine, category, chef
    expect(screen.queryByText('Test Pizza')).not.toBeInTheDocument(); // Original item should be excluded
  });
});