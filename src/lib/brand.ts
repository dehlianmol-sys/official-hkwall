/**
 * Single source of truth for brand assets and download links.
 *
 * The logo comes from the SAME source the admin panel uses:
 * the `logos` storage bucket, file `Vivrapaylogo.png`.
 * Replace that file in storage and it updates everywhere (admin + user side).
 */
import { getLogoUrl } from './storage';

export const APP_NAME = 'Hkwallet';
export const APP_TAGLINE = 'Earn Money Online';

/** Existing HK Wallet mark used only while the database logo is unavailable. */
export const APP_LOGO_FALLBACK = '/favicon.png';

/**
 * The real logo always comes from the database storage bucket the admin panel
 * uploads to, so user side and admin side can never drift apart.
 */
const databaseLogoUrl = getLogoUrl('Vivrapaylogo.png');
export const DATABASE_APP_LOGO = databaseLogoUrl ? `${databaseLogoUrl}?v=20260921` : '';
export const APP_LOGO = DATABASE_APP_LOGO || APP_LOGO_FALLBACK;

/**
 * The signed main APK ships with the site itself:
 * `public/downloads/hkwallet.apk`. Yahi original placing hai — isse mat badlo.
 */
export const APK_URL = '/downloads/hkwallet.apk';
export const APK_FILENAME = 'hkwallet.apk';

export const SITE_ORIGIN = 'https://hkwallet.online';
/** Canonical invite link: browser visitors are sent to the APK download page. */
export const referralLink = (code: string) =>
  `${SITE_ORIGIN}/download?ref=${encodeURIComponent(code.trim().toUpperCase())}`;

/** Referral rebate levels shown across the app. */
export const REBATE_LEVELS = [
  { name: 'Level 1', rate: '4%' },
  { name: 'Level 2', rate: '1.5%' },
  { name: 'Level 3', rate: '0.3%' },
];

/** Default referral commission for a normal user, in percent. */
export const DEFAULT_COMMISSION_PERCENT = 4;
