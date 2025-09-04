import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

test('foodai app renders without crashing', () => {
  // Simple smoke test to ensure the app renders
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
});
