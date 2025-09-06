'use client';

import { useState } from 'react';
import Image from 'next/image';

interface SafeImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  onError?: () => void;
  fallback?: React.ReactNode;
}

export default function SafeImage({ 
  src, 
  alt, 
  fill = false, 
  className = '', 
  onError,
  fallback
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);
  const [useUnoptimized, setUseUnoptimized] = useState(false);

  const handleError = () => {
    if (!useUnoptimized) {
      // First try unoptimized
      setUseUnoptimized(true);
    } else {
      // If unoptimized also fails, show error state
      setHasError(true);
      onError?.();
    }
  };

  if (hasError) {
    return fallback || (
      <div className={`flex items-center justify-center bg-slate-100 dark:bg-slate-700 ${className}`}>
        <span className="text-slate-400 text-xs">Image not available</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      className={className}
      onError={handleError}
      unoptimized={useUnoptimized}
      priority={false}
    />
  );
}
