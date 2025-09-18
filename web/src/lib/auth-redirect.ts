// Utility functions for handling authentication redirects

const REDIRECT_KEY = 'auth_redirect_url';

export function setRedirectUrl(url: string) {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(REDIRECT_KEY, url);
  }
}

export function getRedirectUrl(): string | null {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem(REDIRECT_KEY);
  }
  return null;
}

export function clearRedirectUrl() {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(REDIRECT_KEY);
  }
}

export function handlePostLoginRedirect() {
  const redirectUrl = getRedirectUrl();
  if (redirectUrl) {
    clearRedirectUrl();
    window.location.href = redirectUrl;
    return true;
  }
  return false;
}
