/**
 * useResponsiveSidebar Hook
 * Manages responsive sidebar behavior and mobile detection
 */

import { useState, useEffect, useCallback } from 'react';

export interface UseResponsiveSidebarReturn {
  isMobile: boolean;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
}

/**
 * Custom hook for responsive sidebar logic
 * Detects mobile screen size and auto-closes sidebar on mobile
 */
export const useResponsiveSidebar = (
  sidebarOpen: boolean,
  onSidebarChange: (open: boolean) => void
): UseResponsiveSidebarReturn => {
  const [isMobile, setIsMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapsed = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      // Auto-close sidebar on mobile if it's open
      if (mobile && sidebarOpen) {
        onSidebarChange(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Call on mount

    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen, onSidebarChange]);

  return {
    isMobile,
    isCollapsed,
    setIsCollapsed,
    toggleCollapsed
  };
};
