import { renderHook, act } from '@testing-library/react';
import useCart from './useCart';

// Mock the API service
jest.mock('../services/api', () => ({
  getCart: jest.fn(),
  saveCart: jest.fn(),
  clearCart: jest.fn(),
}));

import apiService from '../services/api';

describe('useCart hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should initialize with empty cart', () => {
    apiService.getCart.mockResolvedValue([]);
    
    const { result } = renderHook(() => useCart());
    
    expect(result.current.cart).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  test('should add item to cart', async () => {
    apiService.getCart.mockResolvedValue([]);
    
    const { result } = renderHook(() => useCart());
    
    const testItem = { id: 1, name: 'Test Item', price: 10 };
    
    act(() => {
      result.current.addToCart(testItem);
    });
    
    expect(result.current.cart).toEqual([{ ...testItem, quantity: 1 }]);
  });

  test('should update quantity when adding existing item', async () => {
    apiService.getCart.mockResolvedValue([]);
    
    const { result } = renderHook(() => useCart());
    
    const testItem = { id: 1, name: 'Test Item', price: 10 };
    
    act(() => {
      result.current.addToCart(testItem);
      result.current.addToCart(testItem);
    });
    
    expect(result.current.cart).toEqual([{ ...testItem, quantity: 2 }]);
  });

  test('should remove item from cart', async () => {
    apiService.getCart.mockResolvedValue([]);
    
    const { result } = renderHook(() => useCart());
    
    const testItem = { id: 1, name: 'Test Item', price: 10 };
    
    act(() => {
      result.current.addToCart(testItem);
      result.current.removeFromCart(1);
    });
    
    expect(result.current.cart).toEqual([]);
  });

  test('should calculate total price correctly', async () => {
    apiService.getCart.mockResolvedValue([]);
    
    const { result } = renderHook(() => useCart());
    
    const item1 = { id: 1, name: 'Item 1', price: 10 };
    const item2 = { id: 2, name: 'Item 2', price: 15 };
    
    act(() => {
      result.current.addToCart(item1);
      result.current.addToCart(item2);
    });
    
    expect(result.current.getTotalPrice()).toBe(25);
  });

  test('should update quantity correctly', async () => {
    apiService.getCart.mockResolvedValue([]);
    
    const { result } = renderHook(() => useCart());
    
    const testItem = { id: 1, name: 'Test Item', price: 10 };
    
    act(() => {
      result.current.addToCart(testItem);
      result.current.updateQuantity(1, 3);
    });
    
    expect(result.current.cart[0].quantity).toBe(3);
  });

  test('should remove item when quantity is set to 0', async () => {
    apiService.getCart.mockResolvedValue([]);
    
    const { result } = renderHook(() => useCart());
    
    const testItem = { id: 1, name: 'Test Item', price: 10 };
    
    act(() => {
      result.current.addToCart(testItem);
      result.current.updateQuantity(1, 0);
    });
    
    expect(result.current.cart).toEqual([]);
  });
});