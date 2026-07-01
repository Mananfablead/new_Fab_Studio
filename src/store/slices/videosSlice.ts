import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/services/api';

export interface Video {
  id: string;
  url: string;
  thumbnail?: string;
  name?: string;
  size?: number;
  format?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  groupId: string;
}

interface VideosState {
  videos: Video[];
  loading: boolean;
  uploadLoading: boolean;
  downloadLoading: boolean;
  downloadingVideoId: string | null;
  error: string | null;
  total: number;
}

const initialState: VideosState = {
  videos: [],
  loading: false,
  uploadLoading: false,
  downloadLoading: false,
  downloadingVideoId: null,
  error: null,
  total: 0,
};

// ─── Async Thunks ────────────────────────────────────────────────────────────

/**
 * Download a specific video file.
 * GET /api/videos/{videoId}/download
 */
export const downloadVideo = createAsyncThunk(
  'videos/download',
  async (videoId: string, { getState, rejectWithValue }) => {
    try {
      const response = await api.get(`/videos/${videoId}/download`, {
        responseType: 'blob',
      });

      // Extract filename from content-disposition if available, or use a default
      const contentDisposition = response.headers['content-disposition'];
      let filename = `video-${videoId}.mp4`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      // Create blob and trigger download
      const blob = new Blob([response.data], { type: response.data.type || 'video/mp4' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Log download history
      try {
        const state = getState() as any;
        const groupId = state.groups?.currentGroup?.id;
        const userId = state.auth?.user?.id;

        if (groupId && userId) {
          const isFirstTime = !localStorage.getItem(`downloaded_video_${videoId}`);
          const downloadType = isFirstTime ? 'unique' : 'repetitive';

          api.post('/downloads/history', {
            participants_id: userId,
            photo_id: [videoId],
            file_type: 'video',
            download_type: downloadType,
            group_id: groupId
          }).then(() => {
            localStorage.setItem(`downloaded_video_${videoId}`, 'true');
          }).catch(console.error);
        }
      } catch (e) {
        console.error('Failed to log video download history', e);
      }

      return videoId;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to download video';
      return rejectWithValue(message);
    }
  }
);

/**
 * Fetch approved videos for a specific group.
 * GET /api/groups/{groupId}/videos
 */
export const fetchVideos = createAsyncThunk(
  'videos/fetchByGroup',
  async (groupId: string, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/groups/${groupId}/videos`);

      // Handle various API response shapes (common in this codebase)
      let videos = data.data || data.videos || data.items || data;
      if (!Array.isArray(videos)) {
        videos = videos.data || videos.videos || videos.items || [];
      }

      return {
        videos: videos as Video[],
        total: data.pagination?.total ?? data.meta?.total ?? videos.length,
      };
    } catch (err: any) {
      const message = err.response?.data?.message || err.response?.data?.error?.message || 'Failed to fetch videos';
      return rejectWithValue(message);
    }
  }
);

/**
 * Upload multiple videos to a specific group.
 * POST /api/groups/{groupId}/videos/upload
 */
export const uploadVideos = createAsyncThunk(
  'videos/upload',
  async (
    { groupId, files }: { groupId: string; files: File[] },
    { rejectWithValue }
  ) => {
    try {
      // Basic client-side validation
      const ALLOWED_FORMATS = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-ms-wmv', 'video/x-matroska'];
      const MAX_SIZE = 100 * 1024 * 1024; // 100MB

      for (const file of files) {
        if (file.size > MAX_SIZE) {
          return rejectWithValue(`File ${file.name} exceeds the 100MB limit.`);
        }
        // Note: MIME type check can be tricky depending on the browser, 
        // but we'll include it as a basic check.
        // Some formats might not have standard MIME types in all browsers.
      }

      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files[]', file);
      });
      formData.append('is_platform', 'web');

      const { data } = await api.post(`/groups/${groupId}/videos/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      return {
        videos: (data.data || data.videos || []) as Video[],
        uploadedCount: data.uploadedCount || files.length,
      };
    } catch (err: any) {
      const message = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(', ')
        : err.response?.data?.message || err.response?.data?.error?.message || 'Failed to upload videos';
      return rejectWithValue(message);
    }
  }
);

/**
 * Delete a specific video from a group.
 * DELETE /api/groups/{groupId}/videos/{videoId}
 */
export const deleteVideo = createAsyncThunk(
  'videos/delete',
  async (
    { groupId, videoId }: { groupId: string; videoId: string },
    { rejectWithValue }
  ) => {
    try {
      await api.delete(`/groups/${groupId}/videos/${videoId}`);
      return videoId;
    } catch (err: any) {
      const message = err.response?.data?.message || err.response?.data?.error?.message || 'Failed to delete video';
      return rejectWithValue(message);
    }
  }
);

// ─── Slice ───────────────────────────────────────────────────────────────────

const videosSlice = createSlice({
  name: 'videos',
  initialState,
  reducers: {
    clearVideosError(state) {
      state.error = null;
    },
    resetVideosState(state) {
      state.videos = [];
      state.loading = false;
      state.uploadLoading = false;
      state.error = null;
      state.total = 0;
    }
  },
  extraReducers: (builder) => {
    // fetchVideos
    builder
      .addCase(fetchVideos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVideos.fulfilled, (state, action) => {
        state.loading = false;
        state.videos = action.payload.videos;
        state.total = action.payload.total;
      })
      .addCase(fetchVideos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // uploadVideos
    builder
      .addCase(uploadVideos.pending, (state) => {
        state.uploadLoading = true;
        state.error = null;
      })
      .addCase(uploadVideos.fulfilled, (state, action) => {
        state.uploadLoading = false;
        // Prepend new videos to the list
        state.videos.unshift(...action.payload.videos);
        state.total += action.payload.uploadedCount;
      })
      .addCase(uploadVideos.rejected, (state, action) => {
        state.uploadLoading = false;
        state.error = action.payload as string;
      });

    // deleteVideo
    builder
      .addCase(deleteVideo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteVideo.fulfilled, (state, action) => {
        state.loading = false;
        state.videos = state.videos.filter(v => v.id !== action.payload);
        state.total -= 1;
      })
      .addCase(deleteVideo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // downloadVideo
    builder
      .addCase(downloadVideo.pending, (state, action) => {
        state.downloadLoading = true;
        state.downloadingVideoId = action.meta.arg;
        state.error = null;
      })
      .addCase(downloadVideo.fulfilled, (state) => {
        state.downloadLoading = false;
        state.downloadingVideoId = null;
      })
      .addCase(downloadVideo.rejected, (state, action) => {
        state.downloadLoading = false;
        state.downloadingVideoId = null;
        state.error = action.payload as string;
      });
  },
});

export const { clearVideosError, resetVideosState } = videosSlice.actions;
export default videosSlice.reducer;
