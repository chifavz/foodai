import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import ChefDashboard from './components/ChefDashboard';
import CustomerInterface from './components/CustomerInterface';
import AIWaitress from './components/AIWaitress';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import ForgotPassword from './components/auth/ForgotPassword';
import UserPreferences from './components/auth/UserPreferences';
import ProfileDashboard from './components/profile/ProfileDashboard';
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
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/signup" element={<Signup />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/preferences" element={<UserPreferences />} />
          <Route path="/profile" element={<ProfileDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
