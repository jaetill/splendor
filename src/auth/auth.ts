// OAuth 2.0 Authorization Code + PKCE against the shared Cognito Hosted UI.
// Ported from the sibling apps (meal-planner/carto). No client secret — PKCE
// replaces it for public SPA clients. splendor gates on authentication only;
// there is no group check (any pool user may play).
//
// Flow: startLogin() -> Cognito -> /callback.html -> handleCallback() -> /

import { COGNITO } from './config';

const STORAGE = {
  pkceVerifier: 'sp.pkce.verifier',
  state: 'sp.oauth.state',
  idToken: 'sp.id.token',
  accessToken: 'sp.access.token',
  refreshToken: 'sp.refresh.token',
  expiresAt: 'sp.expires.at',
} as const;

interface TokenResponse {
  id_token?: string;
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
}

// ── Helpers ─────────────────────────────────────────────────────

function base64UrlEncode(input: Uint8Array | ArrayBuffer): string {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  let str = '';
  for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i]);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function randomString(bytes = 32): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return base64UrlEncode(arr);
}

async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(digest);
}

function authBase(): string {
  return `https://${COGNITO.domain}`;
}

function storeTokens(tokens: TokenResponse): void {
  if (tokens.id_token) localStorage.setItem(STORAGE.idToken, tokens.id_token);
  if (tokens.access_token) localStorage.setItem(STORAGE.accessToken, tokens.access_token);
  if (tokens.refresh_token) localStorage.setItem(STORAGE.refreshToken, tokens.refresh_token);
  if (tokens.expires_in) {
    const expiresAt = Date.now() + tokens.expires_in * 1000;
    localStorage.setItem(STORAGE.expiresAt, String(expiresAt));
  }
}

function clearTokens(): void {
  Object.values(STORAGE).forEach((k) => {
    localStorage.removeItem(k);
    sessionStorage.removeItem(k);
  });
}

// ── Public API ──────────────────────────────────────────────────

export async function startLogin(): Promise<void> {
  const verifier = randomString();
  const state = randomString();
  const challenge = await sha256(verifier);

  sessionStorage.setItem(STORAGE.pkceVerifier, verifier);
  sessionStorage.setItem(STORAGE.state, state);

  const url = new URL(`${authBase()}/oauth2/authorize`);
  url.searchParams.set('client_id', COGNITO.clientId);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', COGNITO.scopes.join(' '));
  url.searchParams.set('redirect_uri', COGNITO.redirectUri);
  url.searchParams.set('state', state);
  url.searchParams.set('code_challenge', challenge);
  url.searchParams.set('code_challenge_method', 'S256');

  window.location.assign(url.toString());
}

export async function handleCallback(): Promise<void> {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const returnedState = params.get('state');
  const expectedState = sessionStorage.getItem(STORAGE.state);
  const verifier = sessionStorage.getItem(STORAGE.pkceVerifier);
  const error = params.get('error');

  if (error)
    throw new Error(`Cognito returned error: ${error} — ${params.get('error_description') ?? ''}`);
  if (!code) throw new Error('No authorization code in callback');
  if (!verifier) throw new Error('Missing PKCE verifier — start a fresh sign-in');
  if (returnedState !== expectedState) throw new Error('State mismatch — possible CSRF, aborting');

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: COGNITO.clientId,
    code,
    redirect_uri: COGNITO.redirectUri,
    code_verifier: verifier,
  });

  const res = await fetch(`${authBase()}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!res.ok) {
    throw new Error(`Token exchange failed (${res.status}): ${await res.text()}`);
  }

  storeTokens((await res.json()) as TokenResponse);
  sessionStorage.removeItem(STORAGE.pkceVerifier);
  sessionStorage.removeItem(STORAGE.state);
}

export function logout(): void {
  clearTokens();
  const url = new URL(`${authBase()}/logout`);
  url.searchParams.set('client_id', COGNITO.clientId);
  url.searchParams.set('logout_uri', COGNITO.logoutUri);
  window.location.assign(url.toString());
}

export function isAuthenticated(): boolean {
  const expiresAt = Number(localStorage.getItem(STORAGE.expiresAt));
  // Treat tokens as expired 60s early to avoid a race with the auth server clock.
  return Boolean(localStorage.getItem(STORAGE.idToken) && Date.now() < expiresAt - 60_000);
}
