import React, { useEffect } from 'react';

function ItemDetailsModal({ item, onClose, onAddToCart }) {
  // Prevent background scroll - moved before early return
  useEffect(() => {
    if (item) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [item]);

  // Handle escape key and focus trap
  useEffect(() => {
    if (!item) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Focus trap
    const modal = document.querySelector('[role="dialog"]');
    if (modal) {
      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      const handleTabKey = (e) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement.focus();
              e.preventDefault();
            }
          }
        }
      };

      document.addEventListener('keydown', handleEscape);
      document.addEventListener('keydown', handleTabKey);
      
      // Focus first element
      if (firstElement) {
        firstElement.focus();
      }

      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.removeEventListener('keydown', handleTabKey);
      };
    }
  }, [item, onClose]);

  if (!item) return null;

  const handleAddToCart = () => {
    onAddToCart(item);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-screen overflow-y-auto border border-gray-200 dark:border-gray-700"
        role="dialog"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 
              id="modal-title"
              className="text-xl font-bold text-gray-900 dark:text-white"
            >
              {item.name}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-xl p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close modal"
            >
              ×
            </button>
          </div>
          
          <div className="text-6xl text-center mb-4">{item.image}</div>
          
          <p 
            id="modal-description"
            className="text-gray-600 dark:text-gray-400 mb-4"
          >
            {item.description}
          </p>
          
          <div className="space-y-3 mb-6">
            {item.restaurant_name && (
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Restaurant</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {item.restaurant_name}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Chef</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {item.chef}
              </span>
            </div>
            {item.cuisine && (
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Cuisine</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {item.cuisine}
                </span>
              </div>
            )}
            {item.diet && (
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Diet</span>
                <span className="font-medium text-gray-900 dark:text-white capitalize">
                  {item.diet}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Rating</span>
              <div className="flex items-center">
                <span className="text-yellow-400">⭐</span>
                <span className="ml-1 text-gray-900 dark:text-white">
                  {item.rating}
                </span>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Category</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {item.category}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Price</span>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                ${item.price}
              </span>
            </div>
            
            {item.allergens && item.allergens.length > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Allergens</span>
                <div className="flex flex-wrap gap-1">
                  {item.allergens.map(allergen => (
                    <span 
                      key={allergen} 
                      className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded-full text-xs"
                    >
                      {allergen}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg mb-4">
            <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
              🤖 AI Match Score
            </h4>
            <p className="text-blue-800 dark:text-blue-300 text-sm">
              This meal matches your preferences and dietary requirements. Our AI recommends it based on your profile and past selections.
            </p>
          </div>
          
          <button
            onClick={handleAddToCart}
            className="w-full bg-blue-600 dark:bg-blue-700 text-white py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-semibold"
            aria-label={`Add ${item.name} to cart for $${item.price}`}
          >
            Add to Cart - ${item.price}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ItemDetailsModal;