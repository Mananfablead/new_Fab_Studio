import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchParticipants } from '@/store/slices/participantsSlice';
import {
  selectParticipants,
  selectParticipantsLoading,
  selectParticipantsPagination,
} from '@/store/selectors';

/**
 * Custom hook to load group participants from API
 * @param groupId - The group ID to fetch participants for
 * @param page - Optional page number (default: 1)
 * @param limit - Optional limit per page (default: 20)
 */
export function useReduxParticipants(groupId?: string, page: number = 1, limit: number = 20) {
  const dispatch = useAppDispatch();
  const participants = useAppSelector(selectParticipants);
  const loading = useAppSelector(selectParticipantsLoading);
  const pagination = useAppSelector(selectParticipantsPagination);

  useEffect(() => {
    if (!groupId) return;

    dispatch(fetchParticipants({ groupId, page, limit }));
  }, [dispatch, groupId, page, limit]);

  return { participants, loading, pagination };
}
