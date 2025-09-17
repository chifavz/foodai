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
        console.log("Cart data:", savedCart);
        
        // Ensure savedCart is always an array
        setCart(Array.isArray(savedCart) ? savedCart : []);
      } catch (err) {
        setError('Failed to load cart');
        console.error('Failed to load cart:', err);
        setCart([]); // Ensure cart is always an array even on error
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, []);

  // Save cart whenever it changes
  useEffect(() => {
    if (!loading && Array.isArray(cart) && cart.length > 0) {
      apiService.saveCart(cart).catch(err => {
        console.error('Failed to save cart:', err);
      });
    }
  }, [cart, loading]);

  const addToCart = (item) => {
    // Ensure cart is an array before manipulating
    const currentCart = Array.isArray(cart) ? cart : [];
    const existingItem = currentCart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCart(currentCart.map(cartItem => 
        cartItem.id === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...currentCart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (id) => {
    // Ensure cart is an array before filtering
    const currentCart = Array.isArray(cart) ? cart : [];
    setCart(currentCart.filter(item => item.id !== id));
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(id);
    } else {
      // Ensure cart is an array before mapping
      const currentCart = Array.isArray(cart) ? cart : [];
      setCart(currentCart.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const getTotalPrice = () => {
    // Ensure cart is an array before using reduce
    if (!Array.isArray(cart)) {
      return 0;
    }
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
    itemCount: Array.isArray(cart) ? cart.length : 0,
    totalItems: Array.isArray(cart) ? cart.reduce((total, item) => total + item.quantity, 0) : 0
  };
}

export default useCart;