import { useState } from 'react';

import { describeNativeBridges, downloadCapableBridges } from '@/lib/nativeBridge';

/**
 * Small "Debug Native Bridge" control (bottom of the download page).
 * Tapping it inside the Android wrapper app scans `window`, lists every
 * injected native JS interface and its download methods, and shows the result
 * on screen so the working bridge name can be confirmed on the phone.
 */
export default function NativeBridgeDebug() {
  const [report, setReport] = useState<string | null>(null);

  const scan = () => {
    const text = describeNativeBridges();
    setReport(text);
    const capable = downloadCapableBridges();
    const headline = capable.length
      ? `Bridge found: ${capable.map((b) => `${b.name}.${b.downloadMethods[0]}`).join(', ')}`
      : 'No native download bridge found (web fallback will be used).';
    try {
      window.alert(`${headline}\n\n${text}`);
    } catch {
      /* alert blocked - the on-page panel below still shows the report */
    }
  };

  const copy = () => {
    if (!report) return;
    try {
      void navigator.clipboard?.writeText(report);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="nbd-wrap">
      <button type="button" className="nbd-btn" onClick={scan}>
        Debug Native Bridge
      </button>
      {report ? (
        <div className="nbd-panel">
          <pre className="nbd-pre">{report}</pre>
          <div className="nbd-actions">
            <button type="button" className="nbd-mini" onClick={copy}>
              Copy
            </button>
            <button type="button" className="nbd-mini" onClick={() => setReport(null)}>
              Close
            </button>
          </div>
        </div>
      ) : null}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .nbd-wrap { padding: 10px 16px 24px; text-align: center; }
        .nbd-btn {
          background: rgba(255,255,255,.14); color: rgba(255,255,255,.72);
          border: 1px solid rgba(255,255,255,.25); border-radius: 999px;
          font-size: 11px; letter-spacing: .3px; padding: 6px 14px; opacity: .75;
        }
        .nbd-btn:active { opacity: 1; }
        .nbd-panel {
          margin: 10px auto 0; max-width: 420px; text-align: left;
          background: rgba(0,0,0,.72); border-radius: 12px; padding: 10px;
        }
        .nbd-pre {
          margin: 0; max-height: 260px; overflow: auto; white-space: pre-wrap;
          word-break: break-word; color: #d9f2ff; font-size: 11px; line-height: 1.45;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        }
        .nbd-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 8px; }
        .nbd-mini {
          background: rgba(255,255,255,.16); color: #fff; border: 0;
          border-radius: 8px; font-size: 11px; padding: 5px 12px;
        }
      `,
        }}
      />
    </div>
  );
}
