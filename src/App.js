import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LoadingProvider } from './contexts/LoadingContext';
import { LoadingOverlay } from './components/LoadingSpinner';
import LandingPage from './components/LandingPage';
import GeneratedMenu from './components/ChefDashboard';
import CustomerInterface from './components/CustomerInterface';
import AIWaitress from './components/AIWaitress';
import ProfileSetup from './components/ProfileSetup';
import History from './components/History';
import OrderRedirect from './components/OrderRedirect';
import './App.css';

function App() {
  return (
    <LoadingProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/chef" element={<GeneratedMenu />} />
            <Route path="/customer" element={<CustomerInterface />} />
            <Route path="/ai-waitress" element={<AIWaitress />} />
            <Route path="/profile-setup" element={<ProfileSetup />} />
            <Route path="/history" element={<History />} />
            <Route path="/checkout" element={<OrderRedirect />} />
          </Routes>
          <LoadingOverlay />
        </div>
      </Router>
    </LoadingProvider>
  );
}

export default App;
