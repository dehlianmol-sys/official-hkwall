import { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from '@/lib/router-compat';
import { useStore } from '@/lib/store';
import { useBanners, walletUserId } from '@/lib/v2data';
import { copyText, onClick, setText } from '@/lib/v2dom';
import HomeRef from './HomeRef';
import HomeTransactions from '@/components/v2/HomeTransactions';
import { preloadAppImages, preloadImages } from '@/lib/preload';
import { resolveCachedImage } from '@/lib/imageCache';
import type { Deposit } from '@/lib/types';

const NOTICE_SEEN_KEY = 'hkwallet_notice_seen_v1';

/** Home screen — the uploaded design wired to the live account and banners. */
export default function HomeV2() {
  const rootRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { currentUser, deposits } = useStore();
  const { normal, notice } = useBanners();

  const userId = walletUserId(currentUser?.phone);

  // Profile, balance and totals
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    setText(root, '.profile h1', currentUser?.name ?? 'Guest');
    setText(root, '#user-id', userId);
    const mine = deposits.filter((d) => d.userId === currentUser?.id && d.status === 'Success');
    const totalDeposit = mine.reduce((sum, d) => sum + d.amount, 0);
    setText(root, '.balance-value', String(Math.round(currentUser?.wallet ?? 0)));
    setText(root, '.deposit-value', String(Math.round(totalDeposit)));
    setText(root, '.withdrawal-value', '0');
  }, [currentUser, deposits, userId]);

  // Promotion carousel fed by the banners the admin uploads
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const track = root.querySelector<HTMLElement>('#carousel-track');
    const dots = root.querySelector<HTMLElement>('.carousel-dots');
    if (!track || !dots) return;
    if (!normal.length) return;

    track.innerHTML = '';
    dots.innerHTML = '';
    normal.forEach((banner, i) => {
      const slide = document.createElement('div');
      slide.className = 'slide';
      slide.setAttribute('role', 'group');
      slide.setAttribute('aria-roledescription', 'slide');
      slide.setAttribute('aria-label', `${i + 1} of ${normal.length}`);
      const img = document.createElement('img');
      void resolveCachedImage(banner.imageUrl, banner.id).then((url) => { img.src = url; });
      img.alt = `Promotion ${i + 1}`;
      img.draggable = false;
      slide.appendChild(img);
      track.appendChild(slide);

      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'carousel-dot';
      dot.setAttribute('aria-label', `Show promotion ${i + 1}`);
      dot.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
      dot.addEventListener('click', () => show(i));
      dots.appendChild(dot);
    });

    let index = 0;
    const show = (next: number) => {
      index = (next + normal.length) % normal.length;
      track.style.transform = `translateX(-${index * 100}%)`;
      Array.from(dots.children).forEach((d, i) =>
        d.setAttribute('aria-pressed', i === index ? 'true' : 'false'),
      );
    };
    show(0);
    const timer = normal.length > 1 ? setInterval(() => show(index + 1), 4000) : null;
    return () => { if (timer) clearInterval(timer); };
  }, [normal]);

  // Daily notice banner: shown once per session, sized to whatever image the admin uploads
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !notice) return;
    const dialog = root.querySelector<HTMLDialogElement>('#notice-dialog');
    const image = root.querySelector<HTMLImageElement>('#notice-image');
    if (!dialog || !image) return;
    image.hidden = false;
    void resolveCachedImage(notice.imageUrl, `notice-${notice.id}`).then((url) => { image.src = url; });
    image.alt = notice.title || 'Notice';
    image.removeAttribute('width');
    image.removeAttribute('height');
    image.style.width = '100%';
    image.style.height = 'auto';
    image.style.maxHeight = '70vh';
    image.style.objectFit = 'contain';

    const title = root.querySelector<HTMLElement>('#notice-title');
    if (title && notice.title) {
      title.classList.remove('sr-only');
      title.textContent = notice.title;
    }
    let textEl = root.querySelector<HTMLElement>('#notice-body-text');
    if (notice.text) {
      if (!textEl) {
        textEl = document.createElement('p');
        textEl.id = 'notice-body-text';
        textEl.style.cssText = 'margin:10px 14px 0;font-size:14px;line-height:1.5;color:#33413b;';
        image.insertAdjacentElement('afterend', textEl);
      }
      textEl.textContent = notice.text;
    }

    let seen = false;
    try { seen = sessionStorage.getItem(NOTICE_SEEN_KEY) === notice.id; } catch { /* ignore */ }
    if (!seen && typeof dialog.showModal === 'function') {
      dialog.showModal();
      try { sessionStorage.setItem(NOTICE_SEEN_KEY, notice.id); } catch { /* ignore */ }
    }
    const closers = Array.from(dialog.querySelectorAll<HTMLElement>('[data-close-dialog]'));
    const close = () => dialog.close();
    closers.forEach((c) => c.addEventListener('click', close));
    return () => closers.forEach((c) => c.removeEventListener('click', close));
  }, [notice]);

  // Buttons
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const cleanups = [
      onClick(root, '#copy-id', () => { void copyText(userId); }),
      onClick(root, '#notifications', () => navigate('/message')),
      onClick(root, '[data-action="my"]', () => navigate('/mine')),
      onClick(root, '[data-action="usdt"]', () => navigate('/usdt-deposit')),
      onClick(root, '[data-action="task"]', () => navigate('/task')),
      onClick(root, '[data-action="team"]', () => navigate('/team')),
      onClick(root, '[data-action="order"]', () => navigate('/orders')),
      onClick(root, '#newcomer-rewards', () => navigate('/task')),
      onClick(root, '.detail-button', (e) => { e.stopPropagation(); navigate('/score'); }),
      onClick(root, '.see-all[data-action="transactions"]', () => navigate('/orders')),
      onClick(root, '[data-action="top-up"]', () => navigate('/deposit')),
      onClick(root, '[data-action="support"]', () => navigate('/customer-service')),
      onClick(root, '#notice-dialog [data-close-dialog]', () => {}),
    ];
    return () => cleanups.forEach((fn) => fn());
  }, [navigate, userId, notice]);

  // Preload every card image once, so nothing pops in half-loaded later.
  useEffect(() => {
    preloadAppImages();
  }, []);

  useEffect(() => {
    preloadImages(normal.map((b) => b.imageUrl).concat(notice?.imageUrl ?? []));
  }, [normal, notice]);

  const myTransactions = useMemo(
    () =>
      deposits
        .filter((d) => d.userId === currentUser?.id)
        .slice()
        .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
        .slice(0, 5),
    [deposits, currentUser?.id],
  );

  const openProcessing = (order: Deposit) => {
    try { sessionStorage.setItem('hkwallet_selected_order', order.id); } catch { /* ignore */ }
    navigate(order.transactionType.toLowerCase().includes('usdt') ? '/usdt-deposit' : '/order');
  };

  return (
    <div ref={rootRef}>
      <HomeRef
        transactions={
          myTransactions.length > 0 ? (
            <HomeTransactions deposits={myTransactions} onOpenProcessing={openProcessing} />
          ) : undefined
        }
      />
    </div>
  );
}
