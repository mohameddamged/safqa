/**
 * Minimal, dependency-free JWT payload decoder.
 *
 * We only ever need to *read* claims already issued by the backend
 * (Safqa.Bll/Services/TokenService/TokenService.cs) for UI concerns like
 * "is this token expired" or "what role does this user have" - we never
 * verify the signature client-side (that's meaningless without the secret,
 * and the backend re-validates every protected request anyway). Pulling in
 * a full jwt-decode dependency for this would be overkill.
 */

/** Claim type URIs used by ClaimTypes.* on the backend, kept exactly as emitted. */
export const JWT_CLAIM_TYPES = {
  nameIdentifier: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier',
  name: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name',
  email: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
  role: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role',
} as const;

export interface DecodedJwtPayload {
  sub?: string;
  jti?: string;
  /** Custom claim added explicitly in TokenService.CreateAccessTokenAsync. */
  UserId?: string;
  exp?: number;
  iss?: string;
  aud?: string;
  [JWT_CLAIM_TYPES.role]?: string | string[];
  [JWT_CLAIM_TYPES.name]?: string;
  [JWT_CLAIM_TYPES.email]?: string;
  [key: string]: unknown;
}

function base64UrlDecode(input: string): string {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = padded.length % 4;
  const withPadding = pad ? padded + '='.repeat(4 - pad) : padded;
  return decodeURIComponent(
    atob(withPadding)
      .split('')
      .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
      .join(''),
  );
}

export function decodeJwt(token: string): DecodedJwtPayload | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    return JSON.parse(base64UrlDecode(parts[1])) as DecodedJwtPayload;
  } catch {
    return null;
  }
}

/** True if the token is missing, malformed, or past its `exp` claim. */
export function isJwtExpired(token: string | null | undefined): boolean {
  if (!token) return true;
  const payload = decodeJwt(token);
  if (!payload?.exp) return true;
  const nowInSeconds = Date.now() / 1000;
  return payload.exp <= nowInSeconds;
}

/** Extracts the single role claim, handling both string and string[] cases. */
export function getRoleFromToken(token: string): string | null {
  const payload = decodeJwt(token);
  const role = payload?.[JWT_CLAIM_TYPES.role];
  if (!role) return null;
  return Array.isArray(role) ? role[0] ?? null : role;
}
