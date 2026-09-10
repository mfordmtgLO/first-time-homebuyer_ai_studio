import { useState, useEffect } from 'react';

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isMobileUA = /iphone|ipad|ipod|android|blackberry|mini|windows\sce|palm|mobile/i.test(userAgent);
    return isMobileUA || window.innerWidth < 1024;
  });

  useEffect(() => {
    const checkIsMobile = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isMobileUA = /iphone|ipad|ipod|android|blackberry|mini|windows\sce|palm|mobile/i.test(userAgent);
      setIsMobile(isMobileUA || window.innerWidth < 1024);
    };

    checkIsMobile();

    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
}

