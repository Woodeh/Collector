import { useState, type ImgHTMLAttributes } from 'react';
import { ImageOff } from 'lucide-react';

interface ImageWithFallbackProps extends ImgHTMLAttributes<HTMLImageElement> {
  wrapperClassName?: string;
  fallbackLabel?: string;
}

const ImageWithFallback = ({ src, alt = '', className = '', wrapperClassName = '', fallbackLabel, onLoad, onError, ...props }: ImageWithFallbackProps) => {
  const [loadedSrc, setLoadedSrc] = useState<string | undefined>();
  const [failedSrc, setFailedSrc] = useState<string | undefined>();
  const currentSrc = typeof src === 'string' ? src : undefined;
  const loaded = Boolean(currentSrc && loadedSrc === currentSrc);
  const failed = !currentSrc || failedSrc === currentSrc;

  return (
    <div className={`relative overflow-hidden bg-[#121212] ${wrapperClassName}`}>
      {!loaded && !failed && <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-[#202024] to-[#151518]" aria-hidden="true" />}
      {failed ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-gray-700" role="img" aria-label={fallbackLabel || alt || 'Image unavailable'}>
          <ImageOff size={32} aria-hidden="true" />
          {fallbackLabel && <span className="px-3 text-center text-[9px] font-black uppercase tracking-wider">{fallbackLabel}</span>}
        </div>
      ) : (
        <img
          {...props}
          src={src}
          alt={alt}
          className={`${className} transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={(event) => { setLoadedSrc(currentSrc); onLoad?.(event); }}
          onError={(event) => { setFailedSrc(currentSrc); onError?.(event); }}
        />
      )}
    </div>
  );
};

export default ImageWithFallback;
