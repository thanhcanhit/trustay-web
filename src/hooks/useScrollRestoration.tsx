'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

const scrollPositions: Record<string, number> = {};

export function useScrollRestoration(key: string) {
  const pathname = usePathname();
  const scrollKey = `${pathname}-${key}`;
  const isRestoringRef = useRef(false);

  useEffect(() => {
    // Khôi phục scroll position khi component mount
    const savedPosition = scrollPositions[scrollKey];
    if (savedPosition && !isRestoringRef.current) {
      isRestoringRef.current = true;
      // Sử dụng requestAnimationFrame để đảm bảo DOM đã render
      requestAnimationFrame(() => {
        window.scrollTo(0, savedPosition);
        isRestoringRef.current = false;
      });
    }

    // Lưu scroll position khi component unmount
    return () => {
      scrollPositions[scrollKey] = window.scrollY;
    };
  }, [scrollKey]);

  // Lưu scroll position khi user scroll
  useEffect(() => {
    const saveScrollPosition = () => {
      scrollPositions[scrollKey] = window.scrollY;
    };

    window.addEventListener('scroll', saveScrollPosition, { passive: true });
    return () => window.removeEventListener('scroll', saveScrollPosition);
  }, [scrollKey]);
}
