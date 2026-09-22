import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

import type { HomeBanner } from '@/lib/v2data';

interface GuidedInstallModalProps {
  open: boolean;
  appName: string;
  slides: HomeBanner[];
  onClose: () => void;
  onConfirm: () => void;
}

export default function GuidedInstallModal({ open, appName, slides, onClose, onConfirm }: GuidedInstallModalProps) {
  const [index, setIndex] = useState(0);
  const [seconds, setSeconds] = useState(3);

  useEffect(() => {
    if (!open) return;
    setIndex(0);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setSeconds(3);
    const interval = window.setInterval(() => {
      setSeconds((value) => {
        if (value <= 1) {
          window.clearInterval(interval);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [open, index]);

  if (!open) return null;

  const hasSlides = slides.length > 0;
  const lastSlide = !hasSlides || index === slides.length - 1;
  const current = slides[index];

  return (
    <div className="tutorial-overlay" role="dialog" aria-modal="true" aria-labelledby="tutorial-title">
      <div className="tutorial-dialog animate-scale-in">
        <header className="tutorial-header">
          <button type="button" className="tutorial-icon-button" onClick={onClose} aria-label="Close tutorial">
            <X size={21} />
          </button>
          <div>
            <h2 id="tutorial-title">Open Chrome Browser</h2>
            <p>{hasSlides ? `Step ${index + 1} of ${slides.length}` : `${appName} download`}</p>
          </div>
          <span className="tutorial-header-spacer" aria-hidden="true" />
        </header>

        <div className="tutorial-image-wrap">
          {current ? (
            <img src={current.imageUrl} alt={`Tutorial step ${index + 1}`} className="tutorial-image" />
          ) : (
            <div className="tutorial-empty">
              <strong>Continue in Chrome</strong>
              <span>Chrome will open the {appName} APK download.</span>
            </div>
          )}
        </div>

        {hasSlides && (
          <div className="tutorial-dots" aria-label="Tutorial progress">
            {slides.map((slide, slideIndex) => (
              <span key={slide.id} className={slideIndex === index ? 'is-active' : ''} />
            ))}
          </div>
        )}

        <footer className="tutorial-footer">
          <button
            type="button"
            className="tutorial-back"
            onClick={() => setIndex((value) => Math.max(0, value - 1))}
            disabled={index === 0}
          >
            <ChevronLeft size={18} /> Back
          </button>
          <button
            type="button"
            className="tutorial-next"
            disabled={seconds > 0}
            onClick={() => {
              if (lastSlide) onConfirm();
              else setIndex((value) => value + 1);
            }}
          >
            {seconds > 0 ? `${lastSlide ? 'Confirm' : 'Next'} (${seconds}s)` : lastSlide ? 'Confirm & Open Chrome' : 'Next'}
            {seconds === 0 && !lastSlide && <ChevronRight size={18} />}
          </button>
        </footer>
      </div>
    </div>
  );
}