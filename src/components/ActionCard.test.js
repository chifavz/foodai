import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ActionCard from './ActionCard';

// Mock window.open
const mockOpen = jest.fn();
global.window.open = mockOpen;

describe('ActionCard Component', () => {
  const mockMealData = {
    id: 1,
    name: 'Test Meal',
    description: 'A test meal description',
    price: 25,
    rating: 4.5,
    restaurant_name: 'Test Restaurant',
    image: '🍕'
  };

  const mockRestaurantData = {
    id: 1,
    name: 'Test Restaurant',
    cuisine: 'Italian',
    location: 'Downtown',
    rating: 4.8
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders meal card with action buttons', () => {
    render(<ActionCard type="meal" data={mockMealData} />);
    
    expect(screen.getByText('Test Meal')).toBeInTheDocument();
    expect(screen.getByText('$25')).toBeInTheDocument();
    expect(screen.getByText('Order')).toBeInTheDocument();
    expect(screen.getByText('Call')).toBeInTheDocument();
    expect(screen.getByText('Directions')).toBeInTheDocument();
  });

  test('renders restaurant card with action buttons', () => {
    render(<ActionCard type="restaurant" data={mockRestaurantData} />);
    
    expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
    expect(screen.getByText('Italian')).toBeInTheDocument();
    expect(screen.getByText('Order')).toBeInTheDocument();
    expect(screen.getByText('Call')).toBeInTheDocument();
    expect(screen.getByText('Directions')).toBeInTheDocument();
  });

  test('call button opens phone dialer', () => {
    render(<ActionCard type="meal" data={mockMealData} />);
    
    const callButton = screen.getByText('Call');
    fireEvent.click(callButton);
    
    expect(mockOpen).toHaveBeenCalledWith('tel:+1-555-0123', '_self');
  });

  test('directions button opens Google Maps', () => {
    render(<ActionCard type="restaurant" data={mockRestaurantData} />);
    
    const directionsButton = screen.getByText('Directions');
    fireEvent.click(directionsButton);
    
    expect(mockOpen).toHaveBeenCalledWith(
      'https://www.google.com/maps/dir/?api=1&destination=Downtown',
      '_blank'
    );
  });

  test('order button calls onAddToCart for meals', () => {
    const mockAddToCart = jest.fn();
    render(<ActionCard type="meal" data={mockMealData} onAddToCart={mockAddToCart} />);
    
    const orderButton = screen.getByText('Order');
    fireEvent.click(orderButton);
    
    expect(mockAddToCart).toHaveBeenCalledWith(mockMealData);
  });
});