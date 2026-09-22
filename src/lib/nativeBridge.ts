/**
 * Native (Web-to-Native / WebView wrapper) download bridge.
 *
 * Different Android wrapper builders inject their JS interface under different
 * names and with different method names. Instead of guessing one, we:
 *   1. try every known interface name, then
 *   2. scan `window` for any injected object/function that exposes a
 *      download-like method (works with unknown/custom builders).
 *
 * When a bridge is found the APK is handed to the native download manager, so
 * Android shows its own progress notification and the "Install unknown apps"
 * installer prompt. When no bridge exists we fall back to the plain web link.
 */

type AnyFn = (...args: unknown[]) => unknown;
type BridgeObj = Record<string, unknown>;

/** Interface names known to be injected by common wrapper builders. */
export const KNOWN_BRIDGE_NAMES = [
  'WTN',
  'WebToNativeInterface',
  'AndroidInterface',
  'Android',
  'AppInterfaceFunction',
  'AndroidBridge',
  'NativeBridge',
  'JSBridge',
  'AppBridge',
  'webtonative',
  'WebToNative',
  'ReactNativeWebView',
];

/** Method names known to trigger a native download. */
export const DOWNLOAD_METHODS = [
  'fileDownload',
  'downloadFile',
  'download',
  'startDownload',
  'downloadApk',
  'openFileDownload',
  'saveFile',
];

/** Standard browser globals that expose download/install-ish methods but are not app bridges. */
const BROWSER_GLOBALS = new Set([
  'navigator',
  'clientInformation',
  'external',
  'SpeechRecognition',
  'webkitSpeechRecognition',
  'speechSynthesis',
  'document',
  'window',
  'self',
  'top',
  'parent',
  'frames',
  'globalThis',
  'chrome',
  'caches',
  'applicationCache',
  'PaymentRequest',
]);

const win = (): BridgeObj | null =>
  typeof window === 'undefined' ? null : (window as unknown as BridgeObj);

function asObject(value: unknown): BridgeObj | null {
  if (!value) return null;
  if (typeof value === 'object' || typeof value === 'function') return value as BridgeObj;
  return null;
}

/** Every method name on an object that looks like a download entry point. */
function downloadMethodsOf(obj: BridgeObj): string[] {
  const names = new Set<string>();
  for (const m of DOWNLOAD_METHODS) {
    if (typeof obj[m] === 'function') names.add(m);
  }
  let cursor: object | null = obj;
  let depth = 0;
  while (cursor && depth < 3) {
    for (const key of Object.getOwnPropertyNames(cursor)) {
      if (!/download|savefile|install|apk/i.test(key)) continue;
      try {
        if (typeof (obj as BridgeObj)[key] === 'function') names.add(key);
      } catch {
        /* getter threw - ignore */
      }
    }
    cursor = Object.getPrototypeOf(cursor) as object | null;
    depth += 1;
  }
  return [...names];
}

export interface BridgeInfo {
  name: string;
  type: string;
  methods: string[];
  downloadMethods: string[];
}

/** All candidate native interfaces currently injected into `window`. */
export function findNativeBridges(): BridgeInfo[] {
  const w = win();
  if (!w) return [];
  const found = new Map<string, BridgeInfo>();

  const consider = (name: string, value: unknown) => {
    const obj = asObject(value);
    if (!obj || found.has(name)) return;
    let methods: string[] = [];
    try {
      methods = Object.getOwnPropertyNames(obj).filter((k) => {
        try {
          return typeof obj[k] === 'function';
        } catch {
          return false;
        }
      });
    } catch {
      /* ignore */
    }
    const downloadMethods = downloadMethodsOf(obj);
    if (!methods.length && !downloadMethods.length) return;
    found.set(name, { name, type: typeof value, methods, downloadMethods });
  };

  for (const name of KNOWN_BRIDGE_NAMES) consider(name, w[name]);

  // Unknown / custom builders: scan window for injected interface-ish objects.
  let keys: string[] = [];
  try {
    keys = Object.getOwnPropertyNames(w);
  } catch {
    keys = [];
  }
  for (const key of keys) {
    if (found.has(key)) continue;
    if (!/^[A-Za-z_$][\w$]*$/.test(key)) continue;
    if (/^(webkit|on|HTML|SVG|CSS|Intl|WebGL)/.test(key)) continue;
    if (BROWSER_GLOBALS.has(key)) continue;
    let value: unknown;
    try {
      value = w[key];
    } catch {
      continue;
    }
    const obj = asObject(value);
    if (!obj) continue;
    if (obj === w || value === (w as BridgeObj)['document']) continue;
    if (!downloadMethodsOf(obj).length) continue;
    consider(key, value);
  }

  return [...found.values()];
}

/** Bridges that actually expose at least one download method. */
export function downloadCapableBridges(): BridgeInfo[] {
  return findNativeBridges().filter((b) => b.downloadMethods.length > 0);
}

/** True when the site runs inside a native WebView wrapper app. */
export function isNativeApp(): boolean {
  if (findNativeBridges().length > 0) return true;
  if (typeof window === 'undefined') return false;
  return /;\s*wv\)|WebToNative/i.test(window.navigator.userAgent);
}

/** Human-readable report of what the wrapper app injects. Used by the debug button. */
export function describeNativeBridges(): string {
  if (typeof window === 'undefined') return 'No window (server render).';
  const bridges = findNativeBridges();
  const ua = window.navigator.userAgent;
  if (!bridges.length) {
    return [
      'No native JS bridge found on window.',
      'Running as a normal browser page — the web fallback download will be used.',
      `UA: ${ua}`,
    ].join('\n\n');
  }
  const lines = bridges.map((b) => {
    const dl = b.downloadMethods.length ? b.downloadMethods.join(', ') : 'none';
    const all = b.methods.length ? b.methods.slice(0, 25).join(', ') : '(none listed)';
    return `window.${b.name} (${b.type})\n  download methods: ${dl}\n  all methods: ${all}`;
  });
  return [`Found ${bridges.length} native interface(s):`, ...lines, `UA: ${ua}`].join('\n\n');
}

export interface NativeDownloadResult {
  ok: boolean;
  /** e.g. "WTN.fileDownload(object)" — which bridge call actually fired. */
  used: string | null;
  detail: string;
}

/**
 * Hand a file (APK) to the wrapper app's native download manager.
 * Tries every injected interface and every argument shape those SDKs accept.
 */
export function nativeDownload(url: string, fileName?: string): NativeDownloadResult {
  const name = fileName || url.split('/').pop()?.split('?')[0] || 'app.apk';
  const isApk = /\.apk(\?|$)/i.test(url) || name.toLowerCase().endsWith('.apk');
  const payload = {
    url,
    fileName: name,
    fileUrl: url,
    openFileAfterDownload: true,
    open: true,
    mimeType: isApk ? 'application/vnd.android.package-archive' : undefined,
  };

  const bridges = findNativeBridges();
  if (!bridges.length) return { ok: false, used: null, detail: 'No native bridge on window.' };

  const w = win();
  const tried: string[] = [];

  for (const bridge of bridges) {
    const obj = asObject(w?.[bridge.name]);
    if (!obj) continue;
    const methods = [...new Set([...bridge.downloadMethods, ...DOWNLOAD_METHODS])];
    for (const method of methods) {
      const fn = obj[method];
      if (typeof fn !== 'function') continue;
      const attempts: Array<{ label: string; args: unknown[] }> = [
        { label: 'object', args: [payload] },
        { label: 'json', args: [JSON.stringify(payload)] },
        { label: 'url+name', args: [url, name] },
        { label: 'url', args: [url] },
      ];
      for (const attempt of attempts) {
        try {
          (fn as AnyFn).apply(obj, attempt.args);
          return {
            ok: true,
            used: `${bridge.name}.${method}(${attempt.label})`,
            detail: `Native download requested via ${bridge.name}.${method}.`,
          };
        } catch (err) {
          tried.push(`${bridge.name}.${method}(${attempt.label}): ${(err as Error)?.message ?? 'error'}`);
        }
      }
    }
  }

  return {
    ok: false,
    used: null,
    detail: tried.length ? `All bridge calls failed:\n${tried.join('\n')}` : 'No download method on any bridge.',
  };
}

/**
 * Download a file the best way available: native bridge first (progress
 * notification + installer prompt), plain web link as the fallback.
 */
export function downloadWithBestBridge(url: string, fileName?: string): NativeDownloadResult {
  const result = nativeDownload(url, fileName);
  if (result.ok) return result;
  if (typeof window === 'undefined') return result;
  // Fallback: hand the URL to the WebView / browser downloader.
  try {
    const link = document.createElement('a');
    link.href = url;
    link.rel = 'noopener';
    link.target = '_self';
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch {
    try {
      window.location.href = url;
    } catch {
      /* ignore */
    }
  }
  return { ok: false, used: 'web-fallback', detail: `${result.detail}\nUsed the normal web download instead.` };
}
