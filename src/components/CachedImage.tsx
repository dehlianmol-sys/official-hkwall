import { useEffect, useState } from 'react';
import { resolveCachedImage } from '@/lib/imageCache';

interface CachedImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  /** Remote/public URL of the image. */
  src: string;
  alt: string;
  /** Stable identity of the asset; a changed src for the same key drops the old cache entry. */
  cacheKey?: string;
  /** Extra classes for the skeleton placeholder. */
  skeletonClassName?: string;
  /** Used when a database-backed image is missing or cannot be downloaded. */
  fallbackSrc?: string;
}

/**
 * Renders any image cache-first: local copy when available, otherwise one
 * network fetch that is stored locally for every later render.
 */
export default function CachedImage({
  src,
  alt,
  cacheKey,
  className = '',
  skeletonClassName = '',
  fallbackSrc,
  ...rest
}: CachedImageProps) {
  const [resolved, setResolved] = useState('');

  useEffect(() => {
    let alive = true;
    setResolved('');
    if (!src) return;
    resolveCachedImage(src, cacheKey)
      .then((url) => { if (alive) setResolved(url); })
      .catch(() => { if (alive) setResolved(src); });
    return () => { alive = false; };
  }, [src, cacheKey]);

  if (!resolved) {
    return <span className={`hk-img-skeleton ${className} ${skeletonClassName}`} aria-hidden="true" />;
  }

  return (
    <img
      src={resolved}
      alt={alt}
      className={className}
      {...rest}
      onError={(event) => {
        rest.onError?.(event);
        if (fallbackSrc && event.currentTarget.src !== new URL(fallbackSrc, window.location.href).href) {
          event.currentTarget.src = fallbackSrc;
        }
      }}
    />
  );
}
