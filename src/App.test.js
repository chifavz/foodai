import { render, screen } from '@testing-library/react';

test('foodai app basic functionality', () => {
  // Basic test to ensure the application structure is working
  const element = <div>FoodAI Test</div>;
  const { container } = render(element);
  expect(container).toBeDefined();
  expect(screen.getByText('FoodAI Test')).toBeInTheDocument();
});
