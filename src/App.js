import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import ChefDashboard from './components/ChefDashboard';
import CustomerInterface from './components/CustomerInterface';
import ProfileSetup from './components/ProfileSetup';
import Signup from './pages/Signup';
import { LoadingProvider } from './contexts/LoadingContext';
import './App.css';

function App() {
  return (
    <LoadingProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/chef" element={<ChefDashboard />} />
            <Route path="/customer" element={<CustomerInterface />} />
            <Route path="/setup" element={<ProfileSetup />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </div>
      </Router>
    </LoadingProvider>
  );
}

export default App;
