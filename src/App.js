import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Signup from './pages/Signup';
import Preferences from './pages/Preferences';
import Home from './pages/Home';
import Recommendations from './pages/Recommendations';
import Order from './pages/Order';
import Tracking from './pages/Tracking';
import Feedback from './pages/Feedback';
import Profile from './pages/Profile';
import './App.css';

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