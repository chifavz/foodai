import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CartSummary from './CartSummary';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const defaultProps = {
  cart: [],
  updateQuantity: jest.fn(),
  getTotalPrice: jest.fn(() => 0),
  totalItems: 0,
  loading: false,
  error: null,
};

const renderCartSummary = (props = {}) => {
  return render(
    <BrowserRouter>
      <CartSummary {...defaultProps} {...props} />
    </BrowserRouter>
  );
};

describe('CartSummary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders empty cart message when cart is empty', () => {
    renderCartSummary();
    
    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
    expect(screen.getByText('Add some delicious meals to get started!')).toBeInTheDocument();
  });

  test('renders loading state', () => {
    renderCartSummary({ loading: true });
    
    expect(screen.getByText('🤖 Your AI Selection')).toBeInTheDocument();
    // Check for loading skeleton elements
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  test('renders error state', () => {
    renderCartSummary({ error: 'Failed to load cart' });
    
    expect(screen.getByText('⚠️ Failed to load cart')).toBeInTheDocument();
  });

  test('renders cart items correctly', () => {
    const mockCart = [
      {
        id: 1,
        name: 'Test Item',
        price: 10,
        quantity: 2,
        restaurant_name: 'Test Restaurant'
      }
    ];
    
    renderCartSummary({
      cart: mockCart,
      getTotalPrice: () => 20,
      totalItems: 2
    });
    
    expect(screen.getByText('Test Item')).toBeInTheDocument();
    expect(screen.getByText('$10 each')).toBeInTheDocument();
    expect(screen.getByText('📍 Test Restaurant')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // quantity
  });

  test('calls updateQuantity when quantity buttons are clicked', () => {
    const mockUpdateQuantity = jest.fn();
    const mockCart = [
      {
        id: 1,
        name: 'Test Item',
        price: 10,
        quantity: 2,
        restaurant_name: 'Test Restaurant'
      }
    ];
    
    renderCartSummary({
      cart: mockCart,
      updateQuantity: mockUpdateQuantity,
      getTotalPrice: () => 20,
      totalItems: 2
    });
    
    const increaseButton = screen.getByLabelText('Increase quantity of Test Item');
    const decreaseButton = screen.getByLabelText('Decrease quantity of Test Item');
    
    fireEvent.click(increaseButton);
    expect(mockUpdateQuantity).toHaveBeenCalledWith(1, 3);
    
    fireEvent.click(decreaseButton);
    expect(mockUpdateQuantity).toHaveBeenCalledWith(1, 1);
  });

  test('displays total price correctly', () => {
    const mockCart = [
      { id: 1, name: 'Test Item', price: 10, quantity: 2 }
    ];
    
    renderCartSummary({
      cart: mockCart,
      getTotalPrice: () => 20,
      totalItems: 2
    });
    
    expect(screen.getByText('Estimated Total: $20.00')).toBeInTheDocument();
  });

  test('shows item count and restaurant count', () => {
    const mockCart = [
      { id: 1, name: 'Item 1', price: 10, quantity: 2, restaurant_name: 'Restaurant A' },
      { id: 2, name: 'Item 2', price: 15, quantity: 1, restaurant_name: 'Restaurant B' }
    ];
    
    renderCartSummary({
      cart: mockCart,
      getTotalPrice: () => 35,
      totalItems: 3
    });
    
    expect(screen.getByText('3 items from 2 restaurants')).toBeInTheDocument();
  });

  test('navigates to checkout when connect button is clicked', () => {
    const mockCart = [
      { id: 1, name: 'Test Item', price: 10, quantity: 1 }
    ];
    
    renderCartSummary({
      cart: mockCart,
      getTotalPrice: () => 10,
      totalItems: 1
    });
    
    const checkoutButton = screen.getByLabelText('Connect with restaurants to place order');
    fireEvent.click(checkoutButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/checkout', { state: { cart: mockCart } });
  });
});