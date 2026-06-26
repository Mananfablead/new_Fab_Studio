import { useUserPlans } from './useUserPlans';
import { useAppSelector } from '@/store';

export interface PlanLimits {
  maxEvents: number | null;
  maxPhotos: number | null;
  maxVideos: number | null;
  maxStorageBytes: number | null;
  isPlanActive: boolean;
}

export interface LimitCheckResult {
  allowed: boolean;
  message: string;
}

export function usePlanLimits() {
  const { userPlansData } = useUserPlans();
  const groups = useAppSelector((state) => state.groups.groups);
  const user = useAppSelector((state) => state.auth.user);

  const plan = userPlansData?.data?.plans?.[0];
  const isPlanActive = !!(
    userPlansData?.data?.user?.is_plan_purchased === true ||
    plan?.is_purchased === true ||
    plan?.is_active === true
  );

  const limits: PlanLimits = {
    maxEvents: plan?.max_events ?? null,
    maxPhotos: plan?.max_photos ?? null,
    maxVideos: plan?.max_videos ?? null,
    maxStorageBytes: plan?.max_storage_bytes ?? null,
    isPlanActive,
  };

  // Current usage
  const currentEventCount = groups?.length ?? 0;
  const usedStorageBytes: number = (user as any)?.storage_used_bytes ?? 0;

  /**
   * Check if user can create a new group (event)
   */
  function checkEventLimit(): LimitCheckResult {
    if (!isPlanActive || limits.maxEvents === null) {
      return { allowed: true, message: '' };
    }
    if (currentEventCount >= limits.maxEvents) {
      return {
        allowed: false,
        message: `You've reached your plan limit of ${limits.maxEvents} event${limits.maxEvents === 1 ? '' : 's'}. Please upgrade your plan to create more groups.`,
      };
    }
    return { allowed: true, message: '' };
  }

  /**
   * Check if user can upload photos (pass count of new photos being uploaded)
   */
  function checkPhotoLimit(currentGroupPhotoCount: number, newPhotoCount: number): LimitCheckResult {
    if (!isPlanActive || limits.maxPhotos === null) {
      return { allowed: true, message: '' };
    }
    if (currentGroupPhotoCount + newPhotoCount > limits.maxPhotos) {
      const remaining = Math.max(0, limits.maxPhotos - currentGroupPhotoCount);
      return {
        allowed: false,
        message: `You can only upload ${remaining} more photo${remaining === 1 ? '' : 's'}. Your plan allows a maximum of ${limits.maxPhotos} photos.`,
      };
    }
    return { allowed: true, message: '' };
  }

  /**
   * Check if user can upload videos (pass count of new videos being uploaded)
   */
  function checkVideoLimit(currentGroupVideoCount: number, newVideoCount: number): LimitCheckResult {
    if (!isPlanActive || limits.maxVideos === null) {
      return { allowed: true, message: '' };
    }
    if (currentGroupVideoCount + newVideoCount > limits.maxVideos) {
      const remaining = Math.max(0, limits.maxVideos - currentGroupVideoCount);
      return {
        allowed: false,
        message: `You can only upload ${remaining} more video${remaining === 1 ? '' : 's'}. Your plan allows a maximum of ${limits.maxVideos} videos.`,
      };
    }
    return { allowed: true, message: '' };
  }

  /**
   * Check if user has enough storage for new files
   */
  function checkStorageLimit(newFileSizeBytes: number): LimitCheckResult {
    if (!isPlanActive || limits.maxStorageBytes === null) {
      return { allowed: true, message: '' };
    }
    if (usedStorageBytes + newFileSizeBytes > limits.maxStorageBytes) {
      const remainingGB = ((limits.maxStorageBytes - usedStorageBytes) / (1024 ** 3)).toFixed(1);
      const totalGB = (limits.maxStorageBytes / (1024 ** 3)).toFixed(1);
      return {
        allowed: false,
        message: `Not enough storage. You have ${remainingGB} GB remaining of your ${totalGB} GB plan limit.`,
      };
    }
    return { allowed: true, message: '' };
  }

  return {
    limits,
    isPlanActive,
    currentEventCount,
    usedStorageBytes,
    checkEventLimit,
    checkPhotoLimit,
    checkVideoLimit,
    checkStorageLimit,
  };
}
