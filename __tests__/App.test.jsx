import { render, screen } from '@testing-library/react';
import App from '../src/App.jsx';

test('laat de hero titel zien', () => {
  render(<App />);
  const heading = screen.getByRole('heading', { name: /Taxi 951/i, level: 1 });
  expect(heading).toBeInTheDocument();
});
