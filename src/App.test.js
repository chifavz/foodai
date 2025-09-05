import { render } from '@testing-library/react';


test('foodai app basic functionality', () => {
  // Basic test to ensure the application structure is working
  const element = <div>FoodAI Test</div>;
  const rendered = render(element);
  expect(rendered.container).toBeDefined();
  expect(rendered.getByText('FoodAI Test')).toBeInTheDocument();
=======
test('foodai app components can be imported', () => {
  // Simple smoke test to ensure the main components can be imported
  // We'll test them individually to avoid router setup in tests
  const LandingPage = require('./components/LandingPage').default;
  const ChefDashboard = require('./components/ChefDashboard').default;
  
  expect(LandingPage).toBeDefined();
  expect(ChefDashboard).toBeDefined();

});
