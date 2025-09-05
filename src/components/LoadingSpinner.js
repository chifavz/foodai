import React from 'react';
import { useLoading } from '../contexts/LoadingContext';

const LoadingSpinner = ({ size = 'medium' }) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12'
  };

  return (
    <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]}`}></div>
  );
};

const LoadingOverlay = () => {
  const { isLoading, error } = useLoading();

  if (!isLoading && !error) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
        {isLoading && (
          <div className="text-center">
            <LoadingSpinner size="large" />
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        )}
        {error && (
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <p className="text-red-600 font-semibold mb-2">Error</p>
            <p className="text-gray-600 text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export { LoadingSpinner, LoadingOverlay };
export default LoadingSpinner;