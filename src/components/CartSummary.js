import React from 'react';
import { useNavigate } from 'react-router-dom';

function CartSummary({ 
  cart, 
  updateQuantity, 
  getTotalPrice, 
  totalItems,
  loading, 
  error 
}) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="lg:w-80">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sticky top-8 border border-gray-200 dark:border-gray-700">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lg:w-80">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sticky top-8 border border-gray-200 dark:border-gray-700">
          <div className="text-red-600 dark:text-red-400 text-center">
            <p className="text-sm">⚠️ {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:w-80">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sticky top-8 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          🤖 Your AI Selection
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          We'll connect you with the restaurants for ordering
        </p>
        
        {cart.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">🛒</div>
            <p className="text-gray-500 dark:text-gray-400 font-medium mb-2">
              Your cart is empty
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm">
              Add some delicious meals to get started!
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {cart.map(item => (
                <div 
                  key={item.id} 
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {item.name}
                    </h4>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      ${item.price} each
                    </p>
                    {item.restaurant_name && (
                      <p className="text-blue-600 dark:text-blue-400 text-xs">
                        📍 {item.restaurant_name}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center"
                      aria-label={`Decrease quantity of ${item.name}`}
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-gray-900 dark:text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center"
                      aria-label={`Increase quantity of ${item.name}`}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t dark:border-gray-600 pt-4">
              <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg mb-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  🎯 <strong>AI Referral Service:</strong> We'll connect you with each restaurant to place your order directly. No delivery fees from us!
                </p>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  Estimated Total: ${getTotalPrice().toFixed(2)}
                </span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-4 text-center">
                {totalItems} {totalItems === 1 ? 'item' : 'items'} from {new Set(cart.map(item => item.restaurant_name)).size} {new Set(cart.map(item => item.restaurant_name)).size === 1 ? 'restaurant' : 'restaurants'}
              </div>
              <button 
                onClick={() => {
                  navigate('/checkout', { state: { cart } });
                }}
                className="w-full bg-green-600 dark:bg-green-700 text-white py-3 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors font-semibold"
                aria-label="Connect with restaurants to place order"
              >
                🏪 Connect with Restaurants
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CartSummary;