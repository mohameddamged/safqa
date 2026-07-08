import { Injectable } from '@angular/core';
import { STORAGE_KEYS } from '../constants/storage-keys';
import { UserData } from '../models';

/**
 * Wraps browser storage for auth state.
 *
 * "Remember Me" (from the Login screen checkbox) decides *which* Storage
 * backend persists the session:
 *  - checked   -> localStorage (survives browser restarts)
 *  - unchecked -> sessionStorage (cleared when the tab/browser closes)
 *
 * All reads/writes go through this service so the rest of the app never
 * touches `localStorage`/`sessionStorage` directly or has to know which
 * backend is currently active.
 */
@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  private get activeStorage(): Storage {
    return this.rememberMe ? localStorage : sessionStorage;
  }

  /** Whether the session should persist across browser restarts. */
  private get rememberMe(): boolean {
    return localStorage.getItem(STORAGE_KEYS.rememberMe) === 'true';
  }

  setSession(params: {
    accessToken: string;
    refreshToken: string;
    user: UserData;
    rememberMe: boolean;
  }): void {
    // The remember-me flag itself always lives in localStorage so it
    // survives long enough to tell us, on next boot, where to look.
    localStorage.setItem(STORAGE_KEYS.rememberMe, String(params.rememberMe));

    const storage = params.rememberMe ? localStorage : sessionStorage;
    storage.setItem(STORAGE_KEYS.accessToken, params.accessToken);
    storage.setItem(STORAGE_KEYS.refreshToken, params.refreshToken);
    storage.setItem(STORAGE_KEYS.user, JSON.stringify(params.user));
  }

  updateAccessToken(accessToken: string, refreshToken: string): void {
    this.activeStorage.setItem(STORAGE_KEYS.accessToken, accessToken);
    this.activeStorage.setItem(STORAGE_KEYS.refreshToken, refreshToken);
  }

  getAccessToken(): string | null {
    return this.activeStorage.getItem(STORAGE_KEYS.accessToken);
  }

  getRefreshToken(): string | null {
    return this.activeStorage.getItem(STORAGE_KEYS.refreshToken);
  }

  getUser(): UserData | null {
    const raw = this.activeStorage.getItem(STORAGE_KEYS.user);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as UserData;
    } catch {
      return null;
    }
  }

  hasSession(): boolean {
    return !!this.getAccessToken();
  }

  clear(): void {
    for (const storage of [localStorage, sessionStorage]) {
      storage.removeItem(STORAGE_KEYS.accessToken);
      storage.removeItem(STORAGE_KEYS.refreshToken);
      storage.removeItem(STORAGE_KEYS.user);
    }
    localStorage.removeItem(STORAGE_KEYS.rememberMe);
  }
}
