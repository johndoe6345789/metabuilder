/**
 * useResponsiveSidebar Hook
 * Manages responsive sidebar behavior and mobile detection
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseResponsiveSidebarReturn {
  isMobile: boolean;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
}

/**
 * Custom hook for responsive sidebar logic
 * Detects mobile screen size and auto-closes sidebar on resize transition to mobile
 */
export const useResponsiveSidebar = (
  sidebarOpen: boolean,
  onSidebarChange: (open: boolean) => void
): UseResponsiveSidebarReturn => {
  const [isMobile, setIsMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const wasMobileRef = useRef(false);
  const onSidebarChangeRef = useRef(onSidebarChange);
  onSidebarChangeRef.current = onSidebarChange;

  const toggleCollapsed = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  // Handle window resize — only auto-close when transitioning to mobile
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      const wasDesktop = !wasMobileRef.current;
      wasMobileRef.current = mobile;
      setIsMobile(mobile);

      // Auto-close sidebar only when crossing the desktop → mobile boundary
      if (mobile && wasDesktop) {
        onSidebarChangeRef.current(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Call on mount

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    isMobile,
    isCollapsed,
    setIsCollapsed,
    toggleCollapsed
  };
};
