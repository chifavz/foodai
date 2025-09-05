import { render } from '@testing-library/react';

test('foodai app components can be imported', () => {
  // Simple smoke test to ensure the main components can be imported
  // We'll test them individually to avoid router setup in tests
  const LandingPage = require('./components/LandingPage').default;
  const ChefDashboard = require('./components/ChefDashboard').default;
  
  expect(LandingPage).toBeDefined();
  expect(ChefDashboard).toBeDefined();
});
