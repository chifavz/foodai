import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LoadingProvider } from './contexts/LoadingContext';


function App() {
  return (
    <Router>
      <nav className="bg-white shadow mb-6">
        <div className="container mx-auto px-4 py-3 flex flex-wrap gap-4 justify-center">
          <Link className="text-blue-600 hover:underline" to="/">Home</Link>
          <Link className="text-blue-600 hover:underline" to="/signup">Sign Up</Link>
          <Link className="text-blue-600 hover:underline" to="/preferences">Preferences</Link>
          <Link className="text-blue-600 hover:underline" to="/recommendations">Recommendations</Link>
          <Link className="text-blue-600 hover:underline" to="/order">Order</Link>
          <Link className="text-blue-600 hover:underline" to="/tracking">Tracking</Link>
          <Link className="text-blue-600 hover:underline" to="/feedback">Feedback</Link>
          <Link className="text-blue-600 hover:underline" to="/profile">Profile</Link>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/preferences" element={<Preferences />} />
        <Route path="/recommendations" element={<Recommendations />} />
        <Route path="/order" element={<Order />} />
        <Route path="/tracking" element={<Tracking />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;
=======
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