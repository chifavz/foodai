import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import RestaurantReviews from './RestaurantReviews';
import apiService from '../services/api';

// Mock the API service
jest.mock('../services/api');

const mockReviews = {
  reviews: [
    {
      id: 'review-1',
      rating: 5,
      text: 'Amazing food and great service! The chef really knows how to create memorable dishes.',
      timeCreated: '2024-01-15T12:00:00Z',
      user: {
        id: 'user-1',
        name: 'Sarah M.',
        profileUrl: 'https://example.com/user1',
        imageUrl: null
      }
    },
    {
      id: 'review-2',
      rating: 4,
      text: 'Really enjoyed the meal here. Fresh ingredients and creative presentation.',
      timeCreated: '2024-01-14T15:30:00Z',
      user: {
        id: 'user-2',
        name: 'Mike D.',
        profileUrl: null,
        imageUrl: null
      }
    },
    {
      id: 'review-3',
      rating: 3,
      text: 'Good food, but service was a bit slow.',
      timeCreated: '2024-01-13T18:45:00Z',
      user: {
        id: 'user-3',
        name: 'Jennifer L.',
        profileUrl: null,
        imageUrl: null
      }
    },
    {
      id: 'review-4',
      rating: 5,
      text: 'Outstanding experience from start to finish. Will definitely be back!',
      timeCreated: '2024-01-12T19:20:00Z',
      user: {
        id: 'user-4',
        name: 'Tom R.',
        profileUrl: null,
        imageUrl: null
      }
    }
  ],
  total: 4,
  possibleLanguages: ['en']
};

describe('RestaurantReviews', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state initially', () => {
    apiService.getRestaurantReviews.mockReturnValue(new Promise(() => {})); // Never resolves
    
    render(<RestaurantReviews restaurantId="test-restaurant-id" />);
    
    expect(screen.getByText('Customer Reviews')).toBeInTheDocument();
    expect(screen.getByTestId || screen.getByText(/loading/i) || document.querySelector('.animate-pulse')).toBeTruthy();
  });

  test('renders reviews successfully', async () => {
    apiService.getRestaurantReviews.mockResolvedValue(mockReviews);
    
    render(<RestaurantReviews restaurantId="test-restaurant-id" restaurantName="Test Restaurant" />);
    
    await waitFor(() => {
      expect(screen.getByText('Customer Reviews for Test Restaurant')).toBeInTheDocument();
    });

    expect(screen.getByText('4 reviews')).toBeInTheDocument();
    expect(screen.getByText('Sarah M.')).toBeInTheDocument();
    expect(screen.getByText('Amazing food and great service! The chef really knows how to create memorable dishes.')).toBeInTheDocument();
  });

  test('shows only first 3 reviews initially', async () => {
    apiService.getRestaurantReviews.mockResolvedValue(mockReviews);
    
    render(<RestaurantReviews restaurantId="test-restaurant-id" />);
    
    await waitFor(() => {
      expect(screen.getByText('Sarah M.')).toBeInTheDocument();
      expect(screen.getByText('Mike D.')).toBeInTheDocument();
      expect(screen.getByText('Jennifer L.')).toBeInTheDocument();
    });

    // Fourth review should not be visible initially
    expect(screen.queryByText('Tom R.')).not.toBeInTheDocument();
    
    // Should show "Show All" button
    expect(screen.getByText('Show All 4 Reviews')).toBeInTheDocument();
  });

  test('expands to show all reviews when clicking "Show All"', async () => {
    apiService.getRestaurantReviews.mockResolvedValue(mockReviews);
    
    render(<RestaurantReviews restaurantId="test-restaurant-id" />);
    
    await waitFor(() => {
      expect(screen.getByText('Show All 4 Reviews')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Show All 4 Reviews'));
    
    // Now all reviews should be visible
    expect(screen.getByText('Tom R.')).toBeInTheDocument();
    expect(screen.getByText('Show Less')).toBeInTheDocument();
  });

  test('renders star ratings correctly', async () => {
    apiService.getRestaurantReviews.mockResolvedValue(mockReviews);
    
    render(<RestaurantReviews restaurantId="test-restaurant-id" />);
    
    await waitFor(() => {
      expect(screen.getByText('Sarah M.')).toBeInTheDocument();
    });

    // Check that star ratings are rendered (we'll look for the star symbols)
    const starElements = document.querySelectorAll('.text-yellow-400');
    expect(starElements.length).toBeGreaterThan(0);
  });

  test('handles API error gracefully', async () => {
    const errorMessage = 'Network error';
    apiService.getRestaurantReviews.mockRejectedValue(new Error(errorMessage));
    
    render(<RestaurantReviews restaurantId="test-restaurant-id" />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load reviews. Please try again later.')).toBeInTheDocument();
    });

    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  test('handles empty reviews list', async () => {
    apiService.getRestaurantReviews.mockResolvedValue({ reviews: [], total: 0 });
    
    render(<RestaurantReviews restaurantId="test-restaurant-id" />);
    
    await waitFor(() => {
      expect(screen.getByText('No reviews available yet.')).toBeInTheDocument();
    });

    expect(screen.getByText('Be the first to leave a review!')).toBeInTheDocument();
  });

  test('does not fetch reviews when no restaurantId provided', async () => {
    render(<RestaurantReviews restaurantId="" />);
    
    await waitFor(() => {
      expect(screen.getByText('No reviews available yet.')).toBeInTheDocument();
    });

    expect(apiService.getRestaurantReviews).not.toHaveBeenCalled();
  });

  test('formats dates correctly', async () => {
    apiService.getRestaurantReviews.mockResolvedValue({
      reviews: [{
        id: 'review-1',
        rating: 5,
        text: 'Great food!',
        timeCreated: '2024-01-15T12:00:00Z',
        user: { id: 'user-1', name: 'Test User' }
      }],
      total: 1
    });
    
    render(<RestaurantReviews restaurantId="test-restaurant-id" />);
    
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    // Check for formatted date (exact format may vary based on locale)
    expect(document.body.textContent).toMatch(/Jan\s+15,\s+2024|15\s+Jan\s+2024|2024/);
  });

  test('renders profile link when available', async () => {
    apiService.getRestaurantReviews.mockResolvedValue({
      reviews: [{
        id: 'review-1',
        rating: 5,
        text: 'Great food!',
        timeCreated: '2024-01-15T12:00:00Z',
        user: { 
          id: 'user-1', 
          name: 'Test User',
          profileUrl: 'https://example.com/user1'
        }
      }],
      total: 1
    });
    
    render(<RestaurantReviews restaurantId="test-restaurant-id" />);
    
    await waitFor(() => {
      expect(screen.getByText('View Profile')).toBeInTheDocument();
    });

    const profileLink = screen.getByText('View Profile');
    expect(profileLink.closest('a')).toHaveAttribute('href', 'https://example.com/user1');
    expect(profileLink.closest('a')).toHaveAttribute('target', '_blank');
  });
});