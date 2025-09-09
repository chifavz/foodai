import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LoadingProvider } from './contexts/LoadingContext';
import { DarkModeProvider } from './contexts/DarkModeContext';

// Import components
import LandingPage from './components/LandingPage';
import GeneratedMenu from './components/ChefDashboard';
import CustomerInterface from './components/CustomerInterface';
import AIWaitress from './components/AIWaitress';
import ProfileSetup from './components/ProfileSetup';
import OrderRedirect from './components/OrderRedirect';
import History from './components/History';
import Projects from './components/Projects';

import MealFinder from './components/MealFinder';

import RestaurantDiscovery from './components/RestaurantDiscovery';

// Import pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Order from './pages/Order';
import Profile from './pages/Profile';
import Preferences from './pages/Preferences';
import Recommendations from './pages/Recommendations';
import Tracking from './pages/Tracking';
import Feedback from './pages/Feedback';

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
              <Route path="/chef" element={<GeneratedMenu />} />
              <Route path="/menu" element={<GeneratedMenu />} />
              <Route path="/customer" element={<CustomerInterface />} />
              <Route path="/ai-waitress" element={<AIWaitress />} />
              <Route path="/profile-setup" element={<ProfileSetup />} />
              <Route path="/checkout" element={<OrderRedirect />} />
              <Route path="/history" element={<History />} />
              <Route path="/projects" element={<Projects />} />

              <Route path="/meal-finder" element={<MealFinder />} />


              <Route path="/discover" element={<RestaurantDiscovery />} />

              <Route path="/home" element={<Home />} />
              <Route path="/order" element={<Order />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/preferences" element={<Preferences />} />
              <Route path="/recommendations" element={<Recommendations />} />
              <Route path="/tracking" element={<Tracking />} />
              <Route path="/feedback" element={<Feedback />} />

            </Routes>
          </div>
        </Router>
      </LoadingProvider>
    </DarkModeProvider>
  );
}

export default App;