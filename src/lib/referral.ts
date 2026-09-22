/**
 * Referral code capture & persistence.
 *
 * Every invite link (agent or user) carries a SHORT alphanumeric code:
 *   https://hkwallet.online/download?ref=AGT4926
 *   https://hkwallet.online/download?ref=USR82914
 *
 * The code is captured the moment ANY page is opened with ?ref= (or the legacy
 * /<code>/register path) and stored on the device, so it survives the SMS/OTP
 * steps, refreshes and navigation. Zero referral drops.
 */
export const REF_CODE_KEY = 'hkwallet_ref_code';

const CODE_RE = /^[A-Z0-9]{4,20}$/;

export function normalizeRefCode(raw: string | null | undefined): string {
  const code = (raw ?? '').trim().toUpperCase();
  return CODE_RE.test(code) ? code : '';
}

export function storeRefCode(raw: string | null | undefined): string {
  const code = normalizeRefCode(raw);
  if (!code || typeof window === 'undefined') return '';
  try {
    localStorage.setItem(REF_CODE_KEY, code);
  } catch {
    /* ignore */
  }
  return code;
}

export function readRefCode(): string {
  if (typeof window === 'undefined') return '';
  try {
    return normalizeRefCode(localStorage.getItem(REF_CODE_KEY));
  } catch {
    return '';
  }
}

export function clearRefCode(): void {
  try {
    localStorage.removeItem(REF_CODE_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Reads ?ref= / ?ref_code= / ?code= from the current URL, or a
 * /<CODE>/register style path, and persists it. Safe to call on every render.
 */
export function captureRefFromUrl(): string {
  if (typeof window === 'undefined') return '';
  const params = new URLSearchParams(window.location.search);
  const fromQuery =
    params.get('ref') ?? params.get('ref_code') ?? params.get('code') ?? params.get('invite');
  if (fromQuery) return storeRefCode(fromQuery);

  const match = window.location.pathname.match(/^\/([A-Za-z0-9]{4,20})\/register\/?$/);
  if (match?.[1]) return storeRefCode(match[1]);
  return readRefCode();
}

/** Short unique-ish code for a normal user, matching the AGT#### agent format. */
export function generateUserCode(): string {
  return `USR${Math.floor(10000 + Math.random() * 90000)}`;
}
