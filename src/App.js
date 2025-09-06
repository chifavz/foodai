import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LoadingProvider } from './contexts/LoadingContext';
import { DarkModeProvider } from './contexts/DarkModeContext';

// Import components
import LandingPage from './components/LandingPage';
import ChefDashboard from './components/ChefDashboard';
import CustomerInterface from './components/CustomerInterface';
import AIWaitress from './components/AIWaitress';
import ProfileSetup from './components/ProfileSetup';
import OrderRedirect from './components/OrderRedirect';
import History from './components/History';
import RestaurantDiscovery from './components/RestaurantDiscovery';

// Import pages
import Login from './pages/Login';
import Signup from './pages/Signup';

function App() {
  return (
    <DarkModeProvider>
      <LoadingProvider>
        <Router>
          <div className="App dark:bg-gray-900 min-h-screen transition-colors">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/chef" element={<ChefDashboard />} />
              <Route path="/customer" element={<CustomerInterface />} />
              <Route path="/ai-waitress" element={<AIWaitress />} />
              <Route path="/profile-setup" element={<ProfileSetup />} />
              <Route path="/checkout" element={<OrderRedirect />} />
              <Route path="/history" element={<History />} />
              <Route path="/discover" element={<RestaurantDiscovery />} />
            </Routes>
          </div>
        </Router>
      </LoadingProvider>
    </DarkModeProvider>
  );
}

export default App;