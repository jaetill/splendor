import './sentry';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { isAuthenticated, startLogin } from './auth/auth';

// Auth gate at the entry point so App's hooks never run for a signed-out user.
// splendor sits behind Cognito authentication (any pool user) — no group check.
const root = createRoot(document.getElementById('root')!);

if (isAuthenticated()) {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
} else {
  root.render(
    <StrictMode>
      <div className="setup">
        <h1 className="setup__title">Splendor</h1>
        <p className="setup__subtitle">Signing you in…</p>
      </div>
    </StrictMode>,
  );
  startLogin();
}
