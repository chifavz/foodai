import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import ChefDashboard from './components/ChefDashboard';
import CustomerInterface from './components/CustomerInterface';
import AIWaitress from './components/AIWaitress';
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
        </Routes>
      </div>
    </Router>
  );
}

export default App;
