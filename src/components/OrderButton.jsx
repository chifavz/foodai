import React from 'react';

// Enhanced OrderButton component with affiliate link integration
const OrderButton = ({ 
  restaurantId, 
  restaurantName, 
  platform = 'ubereats', 
  affiliateId,
  className = '',
  children,
  cart = [],
  ...props 
}) => {
  // Affiliate link configurations
  const platformConfigs = {
    ubereats: {
      name: 'Uber Eats',
      baseUrl: 'https://www.ubereats.com',
      logo: '🚗',
      color: 'bg-black hover:bg-gray-800',
      getUrl: (affiliateId, restaurantId, restaurantName) => {
        const params = new URLSearchParams();
        if (affiliateId) params.append('aff_id', affiliateId);
        if (restaurantId) params.append('restaurant_id', restaurantId);
        if (restaurantName) params.append('search', restaurantName);
        
        return `https://www.ubereats.com/ubereats${params.toString() ? '?' + params.toString() : ''}`;
      },
    },
    doordash: {
      name: 'DoorDash',
      baseUrl: 'https://www.doordash.com',
      logo: '🏃‍♂️',
      color: 'bg-red-600 hover:bg-red-700',
      getUrl: (affiliateId, restaurantId, restaurantName) => {
        const params = new URLSearchParams();
        if (affiliateId) params.append('affiliate_id', affiliateId);
        if (restaurantName) params.append('q', restaurantName);
        
        return `https://www.doordash.com/store/${restaurantId}${params.toString() ? '?' + params.toString() : ''}`;
      },
    },
    grubhub: {
      name: 'Grubhub',
      baseUrl: 'https://www.grubhub.com',
      logo: '🍔',
      color: 'bg-orange-600 hover:bg-orange-700',
      getUrl: (affiliateId, restaurantId, restaurantName) => {
        const params = new URLSearchParams();
        if (affiliateId) params.append('affiliate', affiliateId);
        if (restaurantName) params.append('search', restaurantName);
        
        return `https://www.grubhub.com/restaurant/${restaurantId}${params.toString() ? '?' + params.toString() : ''}`;
      },
    },
  };

  const config = platformConfigs[platform] || platformConfigs.ubereats;
  
  // Generate the affiliate URL
  const affiliateUrl = config.getUrl(
    affiliateId || process.env.REACT_APP_AFFILIATE_ID || 'YOUR_AFFILIATE_ID',
    restaurantId,
    restaurantName
  );

  // Handle click tracking
  const handleClick = (e) => {
    // Track the click for analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'affiliate_click', {
        platform,
        restaurant_id: restaurantId,
        restaurant_name: restaurantName,
        cart_items: cart.length,
        cart_value: cart.reduce((total, item) => total + (item.price * item.quantity), 0),
      });
    }

    // Log for debugging
    console.log('Affiliate link clicked:', {
      platform,
      restaurantId,
      restaurantName,
      affiliateUrl,
      cart,
    });

    // If in development mode, show alert instead of redirecting
    if (process.env.NODE_ENV === 'development') {
      e.preventDefault();
      alert(`Redirecting to ${config.name}...\nURL: ${affiliateUrl}\n\n(Development mode - link disabled)`);
      return;
    }
  };

  // Default button content
  const defaultContent = (
    <>
      <span className="text-2xl mr-2">{config.logo}</span>
      Order on {config.name}
    </>
  );

  return (
    <a
      href={affiliateUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={`
        inline-flex items-center justify-center
        px-6 py-3 rounded-lg font-semibold text-white
        transition-colors duration-200
        ${config.color}
        ${className}
      `}
      {...props}
    >
      {children || defaultContent}
    </a>
  );
};

// Multi-platform order button component
export const MultiPlatformOrderButton = ({ 
  restaurantId, 
  restaurantName, 
  affiliateId,
  cart = [],
  className = '' 
}) => {
  const platforms = ['ubereats', 'doordash', 'grubhub'];
  
  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="font-semibold text-gray-900 mb-3">Order from:</h3>
      {platforms.map(platform => (
        <OrderButton
          key={platform}
          platform={platform}
          restaurantId={restaurantId}
          restaurantName={restaurantName}
          affiliateId={affiliateId}
          cart={cart}
          className="w-full"
        />
      ))}
    </div>
  );
};

// Compact order button for cart/checkout pages
export const CompactOrderButton = ({ 
  restaurantId, 
  restaurantName, 
  platform = 'ubereats',
  affiliateId,
  cart = [],
  className = '' 
}) => {
  return (
    <OrderButton
      platform={platform}
      restaurantId={restaurantId}
      restaurantName={restaurantName}
      affiliateId={affiliateId}
      cart={cart}
      className={`px-4 py-2 text-sm ${className}`}
    >
      <span className="text-lg mr-2">
        {platform === 'ubereats' ? '🚗' : platform === 'doordash' ? '🏃‍♂️' : '🍔'}
      </span>
      Order Now
    </OrderButton>
  );
};

export default OrderButton;