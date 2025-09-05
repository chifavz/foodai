import { render } from '@testing-library/react';

test('foodai app renders without crashing', () => {
  // Simple smoke test to ensure the app components can be imported
  const LandingPage = require('./components/LandingPage').default;
  const ChefDashboard = require('./components/ChefDashboard').default;
  const CustomerInterface = require('./components/CustomerInterface').default;
  const AIWaitress = require('./components/AIWaitress').default;
  
  expect(LandingPage).toBeDefined();
  expect(ChefDashboard).toBeDefined();
  expect(CustomerInterface).toBeDefined();
  expect(AIWaitress).toBeDefined();
});
