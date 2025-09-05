import React, { createContext, useContext, useState } from 'react';

const LoadingContext = createContext();

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const startLoading = () => {
    setIsLoading(true);
    setError(null);
  };

  const stopLoading = () => {
    setIsLoading(false);
  };

  const setLoadingError = (error) => {
    setError(error);
    setIsLoading(false);
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <LoadingContext.Provider value={{
      isLoading,
      error,
      startLoading,
      stopLoading,
      setLoadingError,
      clearError
    }}>
      {children}
    </LoadingContext.Provider>
  );
};

export default LoadingContext;