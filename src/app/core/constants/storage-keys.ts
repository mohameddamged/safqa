/**
 * localStorage/sessionStorage key names used by TokenStorageService.
 * Centralized so a rename never requires hunting through call sites.
 */
export const STORAGE_KEYS = {
  accessToken: 'safqa_access_token',
  refreshToken: 'safqa_refresh_token',
  user: 'safqa_user',
  /** Marker written alongside the tokens so we know which Storage backend to read from on boot. */
  rememberMe: 'safqa_remember_me',
} as const;
