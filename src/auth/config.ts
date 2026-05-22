// Cognito Hosted UI config for the shared jaetill.com pool. Non-secret — the
// client is public (PKCE), so these values are safe to ship in the bundle.

const PROD_ORIGIN = 'https://splendor.jaetill.com';

// In dev the origin is whatever localhost port Vite picked; the Cognito client
// registers callback URLs for 5173 and 5300. In prod it's the fixed apex above.
const origin = import.meta.env.DEV ? window.location.origin : PROD_ORIGIN;

export const COGNITO = {
  region: 'us-east-2',
  userPoolId: 'us-east-2_xneeJzaDJ',
  domain: 'just.jaetill.com',
  clientId: '4o3dja4seo8or2q3i33v9hc02s',
  redirectUri: `${origin}/callback.html`,
  logoutUri: `${origin}/`,
  scopes: ['openid', 'email', 'profile', 'aws.cognito.signin.user.admin'],
} as const;
