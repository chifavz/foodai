import React, { useState, useEffect } from 'react';
import apiService from '../services/api';

const RestaurantReviews = ({ restaurantId, restaurantName }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!restaurantId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await apiService.getRestaurantReviews(restaurantId);
        setReviews(response.reviews || []);
      } catch (err) {
        console.error('Failed to fetch reviews:', err);
        setError('Failed to load reviews. Please try again later.');
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [restaurantId]);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Recent';
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="text-yellow-400">★</span>);
    }
    
    if (hasHalfStar) {
      stars.push(<span key="half" className="text-yellow-400">☆</span>);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="text-gray-300">☆</span>);
    }

    return stars;
  };

  const displayedReviews = showAll ? reviews : reviews.slice(0, 3);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Reviews</h3>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="border-b border-gray-200 pb-4 last:border-b-0">
              <div className="flex items-center space-x-2 mb-2">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Reviews</h3>
        <div className="text-center py-8">
          <div className="text-red-500 text-4xl mb-2">⚠️</div>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Reviews</h3>
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-2">💬</div>
          <p className="text-gray-600">No reviews available yet.</p>
          <p className="text-sm text-gray-500 mt-1">Be the first to leave a review!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Customer Reviews {restaurantName && `for ${restaurantName}`}
        </h3>
        <span className="text-sm text-gray-500">
          {reviews.length} review{reviews.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-4">
        {displayedReviews.map((review) => (
          <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  {renderStars(review.rating)}
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {review.user?.name || 'Anonymous User'}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {formatDate(review.timeCreated)}
              </span>
            </div>
            
            <p className="text-gray-700 text-sm leading-relaxed">
              {review.text}
            </p>
            
            {review.user?.profileUrl && (
              <div className="mt-2">
                <a 
                  href={review.user.profileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  View Profile
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

      {reviews.length > 3 && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-purple-600 hover:text-purple-800 text-sm font-medium transition-colors"
          >
            {showAll ? 'Show Less' : `Show All ${reviews.length} Reviews`}
          </button>
        </div>
      )}

      {reviews.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Reviews are fetched from external sources and may not reflect all customer experiences.
          </p>
        </div>
      )}
    </div>
  );
};

export default RestaurantReviews;