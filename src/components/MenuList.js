import React, { useMemo } from 'react';
import { MenuItemSkeleton } from './SkeletonLoader';

function MenuList({
  menuItems = [],
  recommendedItems = [],
  sofiaMessage = '',       // 🌟 Sophia chat message
  searchTerm = '',
  isLoading = false,
  onItemSelect,
  onAddToCart,
  onShowSimilar,
  onFilterByCuisine
}) {
  // Filter menuItems based on searchTerm
  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const searchMatch =
        !searchTerm ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.chef.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.restaurant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.cuisine?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchTerm.toLowerCase());

      if (searchTerm.startsWith('Similar to ')) {
        const itemName = searchTerm.replace('Similar to ', '');
        const referenceItem = menuItems.find(menuItem =>
          menuItem.name.toLowerCase().includes(itemName.toLowerCase())
        );
        if (referenceItem) {
          return (
            item.id !== referenceItem.id &&
            (item.cuisine === referenceItem.cuisine ||
              item.category === referenceItem.category ||
              item.chef === referenceItem.chef ||
              item.diet === referenceItem.diet)
          );
        }
      }

      return searchMatch;
    });
  }, [menuItems, searchTerm]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {Array.from({ length: 6 }).map((_, index) => (
          <MenuItemSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (filteredItems.length === 0 && recommendedItems.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No meals found
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Try adjusting your preferences or search terms
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Sophia Recommendations */}
      {recommendedItems.length > 0 && (
        <div className="mb-8">
          {sofiaMessage && (
            <div className="mb-4 p-4 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-gray-800 dark:text-purple-100">
              🤖 Sophia says: {sofiaMessage}
            </div>
          )}
          <h2 className="text-xl font-bold mb-4">👩‍🍳 Sophia Recommends</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendedItems.map(item => (
              <div
                key={item.id}
                className="relative bg-gradient-to-r from-pink-100 to-purple-100 p-4 rounded-lg shadow hover:shadow-md transition-shadow"
              >
                {/* Top Pick Badge */}
                <span className="absolute top-2 right-2 bg-yellow-400 text-white text-xs font-semibold px-2 py-1 rounded-full shadow">
                  🌟 Top Pick
                </span>

                <h3 className="font-bold text-lg">{item.name}</h3>
                <p className="text-sm text-gray-700">{item.description}</p>

                <div className="flex gap-2 mt-2">
                  {item.affiliateLinks?.grubhub && (
                    <a
                      href={item.affiliateLinks.grubhub}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600"
                    >
                      Grubhub
                    </a>
                  )}
                  {item.affiliateLinks?.chownow && (
                    <a
                      href={item.affiliateLinks.chownow}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-600"
                    >
                      ChowNow
                    </a>
                  )}
                </div>

                <button
                  onClick={() => onAddToCart(item)}
                  className="mt-3 w-full bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700 transition-colors"
                >
                  🛒 Add to Order
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results Count */}
      {filteredItems.length > 0 && (
        <div className="mb-4 flex justify-between items-center">
          <p className="text-gray-600 dark:text-gray-400">
            🤖 AI found {filteredItems.length} {filteredItems.length === 1 ? 'meal' : 'meals'} matching your preferences
            {searchTerm && ` (filtered by "${searchTerm}")`}
          </p>
          <p className="text-sm text-blue-600 dark:text-blue-400">
            From {new Set(filteredItems.map(item => item.restaurant_name)).size} partner restaurants
          </p>
        </div>
      )}

      {/* Full Menu List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {filteredItems.map(item => (
          <div
            key={item.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-200 dark:border-gray-700"
          >
            <div className="p-6">
              <div className="text-4xl text-center mb-4">{item.image}</div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{item.name}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">{item.description}</p>

              {item.restaurant_name && (
                <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-lg mb-3">
                  <div className="flex items-center text-sm">
                    <span className="text-blue-600 dark:text-blue-400">🏪</span>
                    <span className="text-blue-800 dark:text-blue-200 ml-1 font-medium">{item.restaurant_name}</span>
                  </div>
                  {item.cuisine && (
                    <div className="flex items-center text-xs text-blue-700 dark:text-blue-300 mt-1">
                      <span>🍽️ {item.cuisine} • {item.diet}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-500 dark:text-gray-400 text-sm">by {item.chef}</span>
                <div className="flex items-center">
                  <span className="text-yellow-400">⭐</span>
                  <span className="text-gray-600 dark:text-gray-400 text-sm ml-1">{item.rating}</span>
                </div>
              </div>

              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => onShowSimilar(item)}
                  className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                >
                  🔍 Show Similar
                </button>
                {item.cuisine && (
                  <button
                    onClick={() => onFilterByCuisine(item.cuisine)}
                    className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                  >
                    🍽️ {item.cuisine}
                  </button>
                )}
              </div>

              <button
                onClick={() => onAddToCart(item)}
                className="w-full bg-blue-600 dark:bg-blue-700 text-white py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
              >
                🛒 Add to Order
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default MenuList;
