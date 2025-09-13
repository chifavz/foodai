import React from 'react';

// Reusable Action Card component for restaurant and meal cards with Order, Call, Directions buttons
function ActionCard({ type, data, onAddToCart, onRestaurantSelect, className = "" }) {
  const isRestaurant = type === 'restaurant';
  const isMeal = type === 'meal';

  // Handle different action types
  const handleOrder = () => {
    if (isMeal && onAddToCart) {
      onAddToCart(data);
    } else if (isRestaurant && onRestaurantSelect) {
      onRestaurantSelect(data);
    } else if (isRestaurant) {
      // For restaurants, navigate to menu view or use external URL
      if (data.url) {
        window.open(data.url, '_blank');
      } else {
        // Default behavior - could integrate with restaurant menu navigation
        alert(`View menu for ${data.name} - Feature coming soon!`);
      }
    } else if (data.orderUrl || data.affiliateLink) {
      window.open(data.orderUrl || data.affiliateLink, '_blank');
    } else {
      // Fallback - could integrate with actual ordering system
      alert(`Order ${isRestaurant ? data.name : data.name} - Feature coming soon!`);
    }
  };

  const handleCall = () => {
    const phoneNumber = data.phone || data.phoneNumber || '+1-555-0123'; // Fallback number
    window.open(`tel:${phoneNumber}`, '_self');
  };

  const handleDirections = () => {
    const address = data.address || data.location || data.restaurant_name;
    if (address) {
      // Open Google Maps with directions
      const encodedAddress = encodeURIComponent(address);
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, '_blank');
    } else {
      alert('Address not available for directions');
    }
  };

  return (
    <div className={`bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow ${className}`}>
      {/* Card Content */}
      {isRestaurant ? (
        <div className="mb-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="font-semibold text-gray-900 text-lg">{data.name}</h4>
              <p className="text-sm text-gray-600">{data.cuisine || data.categories?.join(' • ') || data.description}</p>
              {(data.location && typeof data.location === 'string') && (
                <p className="text-xs text-gray-500 mt-1">📍 {data.location}</p>
              )}
              {(data.address && typeof data.address === 'string') && (
                <p className="text-xs text-gray-500 mt-1">📍 {data.address}</p>
              )}
            </div>
            {data.rating && (
              <div className="flex items-center text-yellow-500 text-sm">
                <span>⭐</span>
                <span className="ml-1">{data.rating}</span>
              </div>
            )}
          </div>
          {data.description && (
            <p className="text-sm text-gray-600 mb-2">{data.description}</p>
          )}
        </div>
      ) : (
        <div className="mb-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                {data.image && <span className="text-2xl mr-2">{data.image}</span>}
                <div>
                  <h4 className="font-semibold text-gray-900">{data.name}</h4>
                  {data.restaurant_name && (
                    <p className="text-xs text-gray-500">{data.restaurant_name}</p>
                  )}
                </div>
              </div>
              {data.description && (
                <p className="text-sm text-gray-600 mb-2">{data.description}</p>
              )}
            </div>
            <div className="text-right ml-4">
              <span className="text-xl font-bold text-purple-600">${data.price}</span>
              {data.rating && (
                <div className="flex items-center text-yellow-500 text-sm mt-1">
                  <span>⭐</span>
                  <span className="ml-1">{data.rating}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleOrder}
          className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
        >
          <span className="mr-1">🛒</span>
          Order
        </button>
        
        <button
          onClick={handleCall}
          className="flex-1 bg-green-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
        >
          <span className="mr-1">📞</span>
          Call
        </button>
        
        <button
          onClick={handleDirections}
          className="flex-1 bg-purple-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-purple-700 transition-colors flex items-center justify-center"
        >
          <span className="mr-1">🗺️</span>
          Directions
        </button>
      </div>
    </div>
  );
}

export default ActionCard;