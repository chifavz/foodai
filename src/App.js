import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LoadingProvider } from './contexts/LoadingContext';

// Import components
import LandingPage from './components/LandingPage';
import ChefDashboard from './components/ChefDashboard';
import CustomerInterface from './components/CustomerInterface';
import AIWaitress from './components/AIWaitress';
import ProfileSetup from './components/ProfileSetup';
import OrderRedirect from './components/OrderRedirect';
import History from './components/History';

function App() {
  return (
    <LoadingProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/chef" element={<ChefDashboard />} />
            <Route path="/customer" element={<CustomerInterface />} />
            <Route path="/ai-waitress" element={<AIWaitress />} />
            <Route path="/profile-setup" element={<ProfileSetup />} />
            <Route path="/checkout" element={<OrderRedirect />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </div>
      </Router>
    </LoadingProvider>
  );
}

export default App;