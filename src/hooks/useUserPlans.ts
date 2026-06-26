import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store';
import { fetchUserDetails, resetUserDetails } from '@/store/slices/plansSlice';
import { selectUserDetails, selectUserDetailsLoading, selectUserDetailsFetched } from '@/store/selectors';

/**
 * Hook to access user plans and details.
 * Data is fetched once and cached in Redux — safe to call from multiple components
 * without triggering duplicate API calls.
 *
 * API Endpoint: POST /plans/user-details (called once globally)
 */
export function useUserPlans() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const userPlansData = useAppSelector(selectUserDetails);
  const loading = useAppSelector(selectUserDetailsLoading);
  const fetched = useAppSelector(selectUserDetailsFetched);

  useEffect(() => {
    if (user?.id && !fetched && !loading) {
      dispatch(fetchUserDetails(parseInt(user.id)));
    }
  }, [dispatch, user?.id, fetched, loading]);

  return {
    userPlansData,
    loading,
    error: useAppSelector((state) => state.plans.userDetailsError),
    refetch: () => {
      if (user?.id) {
        // Reset fetched flag so the condition guard allows a new request
        dispatch(resetUserDetails());
        dispatch(fetchUserDetails(parseInt(user.id)));
      }
    },
    fetchUserPlans: (userId?: number) => {
      const id = userId ?? (user?.id ? parseInt(user.id) : undefined);
      if (id) dispatch(fetchUserDetails(id));
    },
  };
}
