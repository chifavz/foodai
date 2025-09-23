import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

export default function ChefSignup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ 
    restaurantName: '', 
    chefName: '', 
    email: '', 
    password: '', 
    phone: '', 
    address: '',
    cuisineType: '',
    businessLicense: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Replace the URL below with your backend endpoint
      await axios.post(`${API_BASE_URL}/chef-signup`, form);
      
      // For demo purposes, create mock chef user and navigate
      const mockChefUser = {
        id: Date.now(),
        type: 'chef',
        restaurantName: form.restaurantName,
        chefName: form.chefName,
        email: form.email,
        phone: form.phone,
        address: form.address,
        cuisineType: form.cuisineType,
        businessLicense: form.businessLicense,
        verified: false,
        preferences: {
          businessHours: '9:00 AM - 10:00 PM',
          deliveryRadius: '5 miles',
          acceptingOrders: true
        }
      };
      
      localStorage.setItem('chef', JSON.stringify(mockChefUser));
      localStorage.setItem('token', 'mock-chef-token');
      
      // Navigate to chef dashboard
      navigate('/chef');
    } catch (err) {
      // For demo, allow signup with any valid data
      if (form.restaurantName && form.chefName && form.email && form.password) {
        const mockChefUser = {
          id: Date.now(),
          type: 'chef',
          restaurantName: form.restaurantName,
          chefName: form.chefName,
          email: form.email,
          phone: form.phone,
          address: form.address,
          cuisineType: form.cuisineType,
          businessLicense: form.businessLicense,
          verified: false,
          preferences: {
            businessHours: '9:00 AM - 10:00 PM',
            deliveryRadius: '5 miles',
            acceptingOrders: true
          }
        };
        
        localStorage.setItem('chef', JSON.stringify(mockChefUser));
        localStorage.setItem('token', 'mock-chef-token');
        navigate('/chef');
      } else {
        setError('Please fill in all required fields');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-bold text-red-600 hover:text-red-700 transition-colors">
            🍽️ FoodAI
          </Link>
          <p className="text-gray-600 mt-2">Join our culinary community</p>
        </div>

        {/* Signup Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Restaurant Registration</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="restaurantName">
                  Restaurant Name *
                </label>
                <input
                  type="text"
                  id="restaurantName"
                  name="restaurantName"
                  value={form.restaurantName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Your restaurant name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="chefName">
                  Chef Name *
                </label>
                <input
                  type="text"
                  id="chefName"
                  name="chefName"
                  value={form.chefName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Head chef name"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="restaurant@example.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
                  Password *
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Create a secure password"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="phone">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="(555) 123-4567"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="cuisineType">
                  Cuisine Type
                </label>
                <select
                  id="cuisineType"
                  name="cuisineType"
                  value={form.cuisineType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Select cuisine type</option>
                  <option value="italian">Italian</option>
                  <option value="american">American</option>
                  <option value="asian">Asian</option>
                  <option value="mexican">Mexican</option>
                  <option value="mediterranean">Mediterranean</option>
                  <option value="indian">Indian</option>
                  <option value="french">French</option>
                  <option value="fusion">Fusion</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="address">
                Restaurant Address
              </label>
              <textarea
                id="address"
                name="address"
                value={form.address}
                onChange={handleChange}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Full restaurant address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="businessLicense">
                Business License Number
              </label>
              <input
                type="text"
                id="businessLicense"
                name="businessLicense"
                value={form.businessLicense}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Business license/permit number"
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Creating Restaurant Account...' : 'Join FoodAI as Restaurant'}
            </button>
          </form>
          
          {/* Demo Notice */}
          <div className="mt-6 p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-red-800">
              <strong>Demo Mode:</strong> Fill in the required fields (*) to continue to chef dashboard. 
              Your restaurant will be verified by our team within 24 hours.
            </p>
          </div>
          
          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have a restaurant account?{' '}
              <Link to="/login" className="text-red-600 hover:text-red-700 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
        
        {/* Quick Access */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}