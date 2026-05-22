// Entry point for /callback.html — exchanges the OAuth code for tokens, then
// returns to the app root. Paired with callback.html.

import { handleCallback } from './auth/auth';

handleCallback()
  .then(() => window.location.replace('/'))
  .catch((err: unknown) => {
    console.error('Sign-in callback failed', err);
    document.body.textContent = 'Sign-in failed. Return to the app and try again.';
  });
