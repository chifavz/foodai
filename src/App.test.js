import { render, screen } from '@testing-library/react';
import App from './App';

test('renders FoodAI app with navigation', () => {
  render(<App />);
  const titleElement = screen.getByText(/FoodAI/i);
  expect(titleElement).toBeInTheDocument();
});
