import { render, screen } from '@testing-library/react';
import App from './App';

test('tailwind css classes are applied correctly', () => {
  render(<App />);
  
  // Check that the header element exists and has the correct classes
  const header = document.querySelector('.App-header');
  expect(header).toBeInTheDocument();
  expect(header).toHaveClass('bg-blue-900');
  expect(header).toHaveClass('text-white');
  
  // Check that the code element has the correct Tailwind classes
  const codeElement = screen.getByText('src/App.js');
  expect(codeElement).toHaveClass('bg-gray-800');
  expect(codeElement).toHaveClass('px-2');
  expect(codeElement).toHaveClass('py-1');
  expect(codeElement).toHaveClass('rounded');
  
  // Check that the Learn React link has the correct classes
  const learnReactLink = screen.getByText('Learn React');
  expect(learnReactLink).toHaveClass('App-link');
  expect(learnReactLink).toHaveClass('text-blue-300');
  expect(learnReactLink).toHaveClass('hover:text-blue-100');
  expect(learnReactLink).toHaveClass('transition-colors');
  expect(learnReactLink).toHaveClass('duration-300');
});