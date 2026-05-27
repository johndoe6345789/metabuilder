import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchUserProfile } from '@/store/slices/profilesSlice';
import {
  selectUserProfile,
  selectProfilesLoading,
} from '@/store/selectors';

export function useProfilePage(username: string) {
  const dispatch = useAppDispatch();
  const user = useAppSelector(
    state => selectUserProfile(state, username)
  );
  const loading = useAppSelector(selectProfilesLoading);

  useEffect(() => {
    if (username) dispatch(fetchUserProfile(username));
  }, [username, dispatch]);

  return { user, loading };
}
