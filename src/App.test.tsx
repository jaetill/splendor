import { createRoot, type Root } from 'react-dom/client';
import { act } from 'react';
import { test, expect, beforeEach, afterEach } from 'vitest';
import App from './App';

let container: HTMLElement;
let root: Root;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => {
    root.render(<App />);
  });
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  container.remove();
});

test('renders game title heading', () => {
  expect(container.querySelector('h1')?.textContent).toBe('Splendor');
});

test('renders New Game button on setup screen', () => {
  expect(container.querySelector('button')?.textContent).toBe('New Game');
});

test('New Game button transitions to game screen', () => {
  act(() => {
    (container.querySelector('button') as HTMLButtonElement).click();
  });
  expect(container.querySelector('h1')?.textContent).toBe('Splendor');
  expect(container.querySelector('button')?.textContent).toBe('Back');
});
