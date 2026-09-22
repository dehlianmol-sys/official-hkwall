/**
 * Add Wallet / Add Tool catalogue.
 *
 * Only five personal payment apps are in service (Mobikwik, Phonepe, Paytm,
 * Freecharge, IndusPay). Every other entry stays visible but unavailable.
 *
 * `apkUrl` points at the public `apks` Supabase Storage bucket. Upload each APK
 * there with the exact file name (freecharge.apk, phonepe.apk, mobikwik.apk,
 * paytm.apk) and the Download button serves it — no repo push needed, and
 * Supabase allows files up to 50 MB (GitHub's web upload stops at 25 MB).
 */
import { getLogoUrl } from './storage';

/**
 * APKs are served from the GitHub release "apk" (no 25 MB upload limit).
 * File names exactly as uploaded in that release.
 */
const RELEASE_BASE = 'https://github.com/dehlianmol-sys/official-hkwallet.online/releases/download/apk';
export function releaseApkUrl(fileName: string): string {
  return `${RELEASE_BASE}/${fileName}`;
}

export type ToolCategory = 'personal' | 'business';

export interface WalletTool {
  id: string;
  category: ToolCategory;
  name: string;
  logoUrl: string;
  min?: number;
  max?: number;
  payout?: boolean;
  bonus?: string;
  available: boolean;
  /** UPI handles this app issues; the user picks one after entering the phone. */
  handles: string[];
  /** Filled in later by the owner. */
  apkUrl: string | null;
}

/** One teaching video is shared by every supported app. */
/**
 * Teaching video shown on the Add Wallet steps.
 * Paste the final link here and it is used everywhere.
 */
export const TEACHING_VIDEO_URL = 'https://youtu.be/ysA960kbEKA';

export const UNAVAILABLE_LABEL = 'Unavailable in service';

export const WALLET_TOOLS: WalletTool[] = [
  {
    id: 'freecharge', category: 'personal', name: 'Freecharge', logoUrl: getLogoUrl('Freecharge.png'),
    min: 200, max: 100000, payout: true, available: true, handles: ['@freecharge', '@fc'], apkUrl: releaseApkUrl('freecharge.apk'),
  },
  {
    id: 'phonepe', category: 'personal', name: 'Phonepe', logoUrl: getLogoUrl('Phonepe.png'),
    min: 100, max: 2000, available: true, handles: ['@ybl', '@ibl', '@axl'], apkUrl: releaseApkUrl('phonpe.apk'),
  },
  {
    id: 'mobikwik', category: 'personal', name: 'Mobikwik', logoUrl: getLogoUrl('MobiKwik.jpg'),
    min: 100, max: 100000, payout: true, available: true, handles: ['@mbkns', '@mbk', '@ikwik'], apkUrl: releaseApkUrl('mobikek.apk'),
  },
  {
    id: 'paytm', category: 'personal', name: 'Paytm', logoUrl: getLogoUrl('Paytm.png'),
    min: 10, max: 100000, payout: true, available: true,
    handles: ['@paytm', '@ptyes', '@ptaxis', '@ptsbi', '@pthdfc'], apkUrl: releaseApkUrl('paytm.apk'),
  },
  {
    id: 'induspay', category: 'personal', name: 'IndusPay', logoUrl: getLogoUrl('Induspay.png'),
    min: 10, max: 100000, available: true, handles: ['@indus', '@indusind', '@indie'], apkUrl: null,
  },
  {
    id: 'bharatpe', category: 'personal', name: 'BharatpeBiz', logoUrl: getLogoUrl('Bharatpaybusiness.png'),
    min: 10, max: 100000, available: false, handles: [], apkUrl: null,
  },
  {
    id: 'navi', category: 'personal', name: 'Navi', logoUrl: getLogoUrl('Navi.png'),
    min: 50, max: 3000, available: false, handles: ['@naviaxis', '@navi'], apkUrl: null,
  },
  {
    id: 'paytm-biz', category: 'business', name: 'Paytm Business', logoUrl: getLogoUrl('Paytmbusiness.png'),
    min: 10, max: 100000, bonus: 'Binding Bonus', available: false, handles: [], apkUrl: null,
  },
  {
    id: 'googlepay-biz', category: 'business', name: 'GooglePay Business', logoUrl: getLogoUrl('Googlepay.png'),
    min: 50, max: 500, available: false, handles: [], apkUrl: null,
  },
];

export function toolById(id: string): WalletTool | undefined {
  return WALLET_TOOLS.find((t) => t.id === id);
}

/** Buy-side apps; the rest of the linked accounts land in the Sell tab. */
const BUY_TOOLS = new Set(['mobikwik', 'freecharge', 'induspay']);

export function tabTypeFor(toolId: string): 'Buy' | 'Sell' {
  return BUY_TOOLS.has(toolId) ? 'Buy' : 'Sell';
}

export function buildUpiOptions(tool: WalletTool, phone: string): string[] {
  return tool.handles.map((h) => `${phone}${h}`);
}
