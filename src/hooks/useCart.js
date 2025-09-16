import { useState, useEffect } from 'react';
import apiService from '../services/api';

function useCart() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load cart data on mount
  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);
      setError(null);
      try {
        const savedCart = await apiService.getCart();
        setCart(savedCart);
      } catch (err) {
        setError('Failed to load cart');
        console.error('Failed to load cart:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, []);

  // Save cart whenever it changes
  useEffect(() => {
    if (!loading && cart.length > 0) {
      apiService.saveCart(cart).catch(err => {
        console.error('Failed to save cart:', err);
      });
    }
  }, [cart, loading]);

  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem.id === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(id);
    } else {
      setCart(cart.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const clearCart = async () => {
    try {
      await apiService.clearCart();
      setCart([]);
    } catch (err) {
      setError('Failed to clear cart');
      console.error('Failed to clear cart:', err);
    }
  };

  return {
    cart,
    setCart,
    loading,
    error,
    addToCart,
    removeFromCart,
    updateQuantity,
    getTotalPrice,
    clearCart,
    itemCount: cart.length,
    totalItems: cart.reduce((total, item) => total + item.quantity, 0)
  };
}

export default useCart;