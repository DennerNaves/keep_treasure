import { useEffect, useState } from 'react';

export function useOrientation() {
  const [isPortrait, setIsPortrait] = useState(() => window.innerHeight > window.innerWidth);

  useEffect(() => {
    const checkOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };

    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  return isPortrait;
}
