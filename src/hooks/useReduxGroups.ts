import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchGroups, setGroupsFromMock } from '@/store/slices/groupsSlice';
import { selectGroups, selectGroupsLoading, selectApiMode } from '@/store/selectors';
import { mockGroups } from '@/lib/mock-data';

/**
 * Custom hook to load groups from API or mock data
 */
export function useReduxGroups() {
  const dispatch = useAppDispatch();
  const apiMode = useAppSelector(selectApiMode);
  const groups = useAppSelector(selectGroups);
  const loading = useAppSelector(selectGroupsLoading);

  useEffect(() => {
    if (apiMode === 'live') {
      dispatch(fetchGroups());
    } else {
      // Mock mode
      dispatch(setGroupsFromMock(mockGroups as any));
    }
  }, [dispatch, apiMode]);

  return { groups, loading };
}
