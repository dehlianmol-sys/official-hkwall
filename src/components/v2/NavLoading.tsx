import { useEffect, useState } from 'react';
import { useRouterState } from '@tanstack/react-router';

const css = `
.hk-navload { position: fixed; inset: 0; z-index: 90; display: grid; place-items: center; background: rgba(0,0,0,.82); }
.hk-navload-box { display: flex; flex-direction: column; align-items: center; gap: 12px; }
.hk-navload-spin { width: 34px; height: 34px; border: 3px solid rgba(255,255,255,.25); border-top-color: #ffffff; border-radius: 50%; animation: hk-navload-spin 900ms linear infinite; }
.hk-navload-text { color: #f2f4f5; font-size: 13px; letter-spacing: .2px; }
@keyframes hk-navload-spin { to { transform: rotate(360deg); } }
`;

/**
 * Only appears when a page genuinely stalls (slow connection), never on a
 * normal tap — so buttons keep feeling instant.
 */
export default function NavLoading() {
  const isLoading = useRouterState({ select: (s) => s.status === 'pending' || s.isLoading });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setVisible(false);
      return;
    }
    const timer = window.setTimeout(() => setVisible(true), 1200);
    return () => window.clearTimeout(timer);
  }, [isLoading]);

  if (!visible) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="hk-navload" role="status" aria-live="polite">
        <div className="hk-navload-box">
          <span className="hk-navload-spin" />
          <span className="hk-navload-text">Loading…</span>
        </div>
      </div>
    </>
  );
}
