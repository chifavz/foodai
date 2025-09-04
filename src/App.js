import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import ChefDashboard from './components/ChefDashboard';
import CustomerInterface from './components/CustomerInterface';
import AIWaitress from './components/AIWaitress';
import ProfileSetup from './components/ProfileSetup';
import History from './components/History';
import OrderRedirect from './components/OrderRedirect';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/chef" element={<ChefDashboard />} />
          <Route path="/customer" element={<CustomerInterface />} />
          <Route path="/ai-waitress" element={<AIWaitress />} />
          <Route path="/profile-setup" element={<ProfileSetup />} />
          <Route path="/history" element={<History />} />
          <Route path="/checkout" element={<OrderRedirect />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
