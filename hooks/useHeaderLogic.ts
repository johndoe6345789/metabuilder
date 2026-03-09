/**
 * useHeaderLogic Hook
 * Business logic for header component including logout and user menu
 */

import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { logout, selectUser, selectIsAuthenticated } from '@metabuilder/redux-slices';

export interface UseHeaderLogicReturn {
  user: any;
  isAuthenticated: boolean;
  showUserMenu: boolean;
  setShowUserMenu: (show: boolean) => void;
  handleLogout: () => void;
  toggleUserMenu: () => void;
}

/**
 * Custom hook for header component logic
 * Manages user menu state and logout functionality
 */
export const useHeaderLogic = (): UseHeaderLogicReturn => {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = useCallback(() => {
    // Clear localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');

    // Clear Redux state
    dispatch(logout());

    // Close menu
    setShowUserMenu(false);

    // Redirect to login
    router.push('/login');
  }, [dispatch, router]);

  const toggleUserMenu = useCallback(() => {
    setShowUserMenu((prev) => !prev);
  }, []);

  return {
    user,
    isAuthenticated,
    showUserMenu,
    setShowUserMenu,
    handleLogout,
    toggleUserMenu
  };
};
