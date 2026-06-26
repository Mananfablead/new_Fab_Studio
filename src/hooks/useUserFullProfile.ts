import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserFullProfile } from '@/store/slices/authSlice';
import type { RootState, AppDispatch } from '@/store';

let isFetching = false;

/**
 * Hook to automatically fetch full user profile with business info
 * Call this hook in components that need user.business data
 * 
 * API Endpoint: GET /users/{user_id}/profile
 */
export function useUserFullProfile() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading, error } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Fetch user profile on mount to ensure fresh database state is loaded
    if (user?.id && !isFetching) {
      isFetching = true;
      dispatch(fetchUserFullProfile(user.id)).unwrap().finally(() => {
        isFetching = false;
      });
    }
  }, [dispatch, user?.id]);

  return { 
    user, 
    loading, 
    error,
    // Refetch function for manual refresh
    refetch: () => user?.id && dispatch(fetchUserFullProfile(user.id))
  };
}
