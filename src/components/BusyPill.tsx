import { useEffect, useState } from 'react';
import { useRouterState } from '@tanstack/react-router';

const css = `
.hk-busy { position: fixed; inset: 0; z-index: 95; display: grid; place-items: center; pointer-events: none; }
.hk-busy-box { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 9px;
  width: 104px; height: 104px; border-radius: 12px; background: rgba(40, 40, 40, .88);
  box-shadow: 0 12px 30px rgba(0, 0, 0, .22); animation: hk-busy-in .18s ease; }
.hk-busy-spin { width: 26px; height: 26px; border: 3px solid rgba(255,255,255,.28); border-top-color: #fff;
  border-radius: 50%; animation: hk-busy-spin 850ms linear infinite; }
.hk-busy-text { color: #f3f5f6; font-size: 12px; letter-spacing: .2px; }
@keyframes hk-busy-spin { to { transform: rotate(360deg); } }
@keyframes hk-busy-in { from { opacity: 0; transform: scale(.94); } to { opacity: 1; transform: none; } }
`;

/**
 * Small dark square loader (same look as the OTP-sent message bubble).
 * Appears only when a page genuinely stalls, never blocks taps, and always
 * disappears on its own so the interface can never feel frozen.
 */
export default function BusyPill() {
  const isLoading = useRouterState({ select: (s) => s.status === 'pending' || s.isLoading });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setVisible(false);
      return;
    }
    const show = window.setTimeout(() => setVisible(true), 600);
    // Safety valve: never let the indicator stay on screen.
    const hide = window.setTimeout(() => setVisible(false), 5000);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, [isLoading]);

  if (!visible) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="hk-busy" role="status" aria-live="polite">
        <div className="hk-busy-box">
          <span className="hk-busy-spin" />
          <span className="hk-busy-text">Loading…</span>
        </div>
      </div>
    </>
  );
}
