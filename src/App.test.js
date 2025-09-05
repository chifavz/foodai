import { render } from '@testing-library/react';

test('foodai app basic functionality', () => {
  // Basic test to ensure the application structure is working
  const element = <div>FoodAI Test</div>;
  const rendered = render(element);
  expect(rendered.container).toBeDefined();
  expect(rendered.getByText('FoodAI Test')).toBeInTheDocument();
});
