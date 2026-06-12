'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 minutes en millisecondes

export default function InactivityHandler() {
  const router = useRouter();
  const pathname = usePathname();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      router.push('/login');
    }
  };

  const resetTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(logout, INACTIVITY_LIMIT);
  };

  useEffect(() => {
    // Ne pas activer le timer sur les pages publiques
    const publicPages = ['/', '/login', '/signup'];
    if (publicPages.includes(pathname)) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      return;
    }

    // Événements à surveiller pour l'activité
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    // Initialiser le timer
    resetTimer();

    // Ajouter les écouteurs d'événements
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    // Nettoyage
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [pathname]);

  return null;
}
