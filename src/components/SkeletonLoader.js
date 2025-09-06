import React from 'react';

const SkeletonLoader = ({ className = '', children, loading = true }) => {
  if (!loading) return children;

  return (
    <div className={`animate-pulse ${className}`}>
      {children}
    </div>
  );
};

// Menu item skeleton
export const MenuItemSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
    <div className="text-center mb-4">
      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto"></div>
    </div>
    <div className="space-y-3">
      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
      <div className="flex justify-between items-center pt-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
      </div>
      <div className="flex justify-between items-center">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
      </div>
    </div>
  </div>
);

// Chat message skeleton
export const ChatMessageSkeleton = () => (
  <div className="flex justify-start">
    <div className="bg-gray-100 dark:bg-gray-800 max-w-xs lg:max-w-md px-4 py-3 rounded-lg">
      <div className="flex items-center mb-2">
        <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded-full mr-2"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
      </div>
    </div>
  </div>
);

// Profile form skeleton
export const ProfileFormSkeleton = () => (
  <div className="space-y-6">
    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
    <div className="space-y-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        </div>
      ))}
    </div>
    <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
  </div>
);

export default SkeletonLoader;