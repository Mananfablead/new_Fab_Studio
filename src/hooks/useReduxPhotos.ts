import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  fetchPhotos,
  setPhotosFromMock,
  favoritePhoto,
  unfavoritePhoto,
  toggleFavoriteOptimistic,
  deletePhotos,
  uploadPhotos,
  downloadPhoto,
  downloadPhotos,
} from '@/store/slices/photosSlice';
import { selectPhotos, selectPhotosLoading, selectUploadLoading, selectFavoritedPhotos, selectSelectedPhotos, selectApiMode, selectDownloadLoading, selectDownloadingPhotoId, selectDeleteLoading, selectDeletingPhotoIds, selectBulkDownloadLoading, selectCurrentGroup, selectPhotosError } from '@/store/selectors';
import { galleryPhotos } from '@/lib/mock-data';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Custom hook to manage photos with Redux
 */
export function useReduxPhotos(groupId: string | undefined) {
  const dispatch = useAppDispatch();
  const apiMode = useAppSelector(selectApiMode);
  const photos = useAppSelector(selectPhotos);
  const loading = useAppSelector(selectPhotosLoading);
  const uploadLoading = useAppSelector(selectUploadLoading);
  const favoritedPhotos = useAppSelector(selectFavoritedPhotos);
  const selectedPhotos = useAppSelector(selectSelectedPhotos);
  const downloadLoading = useAppSelector(selectDownloadLoading);
  const downloadingPhotoId = useAppSelector(selectDownloadingPhotoId);
  const deleteLoading = useAppSelector(selectDeleteLoading);
  const deletingPhotoIds = useAppSelector(selectDeletingPhotoIds);
  const bulkDownloadLoading = useAppSelector(selectBulkDownloadLoading);
  const error = useAppSelector(selectPhotosError);

  const currentGroup = useAppSelector(selectCurrentGroup);
  const { user } = useAuth();

  // Check if current user is the group owner or an admin
  const isTeamMember = (currentGroup as any)?.team_members?.some(
    (member: any) => String(member.user_id) === String(user?.id)
  );

  const isGroupAdmin = (currentGroup as any)?.participants?.some(
    (p: any) => String(p.id) === String(user?.id) && p.role?.toLowerCase() === 'admin'
  );

  const isBypassUser =
    String(user?.id) === String((currentGroup as any)?.ownerId) ||
    String(user?.id) === String((currentGroup as any)?.createdBy) ||
    String(user?.id) === String((currentGroup as any)?.owner?.id) ||
    isTeamMember ||
    isGroupAdmin;

  // Derive sortBy/sortOrder from group settings
  const groupSortBy = (currentGroup as any)?.sortBy as string | undefined;

  // Map group sortBy value to API params
  const getSortParams = (sortBy?: string): { sortBy?: string; sortOrder?: string } => {
    switch (sortBy) {
      case 'newest':
        return { sortBy: 'created_at', sortOrder: 'desc' };
      case 'oldest':
        return { sortBy: 'created_at', sortOrder: 'asc' };
      case 'name':
        return { sortBy: 'name', sortOrder: 'asc' };
      default:
        return { sortBy: 'created_at', sortOrder: 'desc' };
    }
  };

  useEffect(() => {
    if (!groupId) return;
    if (apiMode === 'live') {
      // Use default sort params on initial load; client-side sorting handles
      // subsequent sort changes. Do NOT include groupSortBy in deps — that
      // would restart the fetch every time the group object updates (e.g. after
      // matchMyPhotos), causing an infinite cascade loop.
      const sortParams = getSortParams(groupSortBy);
      dispatch(fetchPhotos({ groupId, ...sortParams }));
    } else {
      // Mock mode
      dispatch(setPhotosFromMock(galleryPhotos as any));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, groupId, apiMode]); // intentionally omit groupSortBy — see comment above

  const handleToggleLike = async (photoId: string) => {
    const isLiked = favoritedPhotos.includes(photoId);
    if (apiMode === 'live') {
      if (isLiked) {
        await dispatch(unfavoritePhoto(photoId));
      } else {
        await dispatch(favoritePhoto(photoId));
      }
    } else {
      // Mock mode - optimistic update
      dispatch(toggleFavoriteOptimistic(photoId));
    }
  };

  const handleDeletePhotos = async (photoIds: string[]) => {
    if (apiMode === 'live') {
      const result = await dispatch(deletePhotos(photoIds));
      if (deletePhotos.fulfilled.match(result)) {
        toast({ title: 'Success', description: `${photoIds.length} photo(s) deleted` });
      } else {
        toast({ title: 'Error', description: result.payload as string, variant: 'destructive' });
      }
    } else {
      // Mock mode - local delete
      dispatch(setPhotosFromMock(photos.filter((p) => !photoIds.includes(p.id)) as any));
      toast({ title: 'Success', description: `${photoIds.length} photo(s) deleted` });
    }
  };

  const handleUploadPhotos = async (files: File[]) => {
    if (!groupId) return;
    if (apiMode === 'live') {
      const result = await dispatch(uploadPhotos({ groupId, files }));
      if (uploadPhotos.fulfilled.match(result)) {
        toast({
          title: 'Success',
          description: `${result.payload.uploadedCount} photo(s) uploaded`,
        });
      } else {
        toast({ title: 'Error', description: result.payload as string, variant: 'destructive' });
      }
    } else {
      toast({ title: 'Info', description: 'Upload works in live API mode only' });
    }
  };

  const handleDownloadPhoto = async (photoId: string) => {
    // Permission check
    const allowDownloading = currentGroup?.viewDownload?.allowDownloading ?? true;
    if (!allowDownloading && !isBypassUser) {
      toast({
        title: 'Download Restricted',
        description: 'Single photo downloads are disabled for this group.',
        variant: 'destructive',
      });
      return;
    }

    if (apiMode === 'live') {
      const result = await dispatch(downloadPhoto(photoId));
      if (downloadPhoto.rejected.match(result)) {
        toast({ title: 'Error', description: result.payload as string, variant: 'destructive' });
      }
    } else {
      // Mock mode fallback logic (already exists in PhotoGallery, but can be centralized here)
      toast({ title: 'Info', description: 'Download works best in live mode' });
    }
  };

  /**
   * Bulk / selective download via POST /api/photos/download
   * @param downloadType 'all' downloads everything in the group; 'specific' downloads specific photos
   * @param photoIds     required when downloadType === 'specific'
   */
  const handleDownloadPhotos = async (
    downloadType: 'all' | 'specific' = 'all',
    photoIds?: string[]
  ) => {
    if (!groupId) return;

    // Permission check for bulk download
    const bulkDownloads = currentGroup?.viewDownload?.bulkDownloads ?? false;
    if (!bulkDownloads && !isBypassUser) {
      toast({
        title: 'Bulk Download Restricted',
        description: 'Bulk downloads are disabled for this group.',
        variant: 'destructive',
      });
      return;
    }

    if (apiMode === 'live') {
      const result = await dispatch(
        downloadPhotos({ groupId, downloadType, photoIds })
      );
      if (downloadPhotos.fulfilled.match(result)) {
        toast({ title: 'Download started', description: 'Your photos are being downloaded.' });
      } else {
        toast({
          title: 'Error',
          description: (result.payload as string) || 'Failed to download photos',
          variant: 'destructive',
        });
      }
    } else {
      toast({ title: 'Info', description: 'Bulk download works in live API mode only' });
    }
  };

  return {
    photos,
    loading,
    uploadLoading,
    favoritedPhotos,
    selectedPhotos,
    handleToggleLike,
    handleDeletePhotos,
    handleUploadPhotos,
    handleDownloadPhoto,
    handleDownloadPhotos,
    downloadLoading,
    downloadingPhotoId,
    bulkDownloadLoading,
    deleteLoading,
    deletingPhotoIds,
    error,
  };
}
