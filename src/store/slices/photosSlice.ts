import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/services/api';

export interface Photo {
  id: string;
  url: string;
  thumbnail: string;
  liked: boolean; // mapped from isFavorite || isLiked
  isFavorite?: boolean;
  isLiked?: boolean;
  date: string;
  tags: string[];
  price?: number;
  isPremium?: boolean;
  isSelectedByClient?: boolean;
  is_selected_by_client?: boolean;
  is_selected_by_client?: boolean;
  is_in_flipbook?: boolean;
  groupId?: string;
  folderId?: string;
  likes_count?: number;
}

export interface Folder {
  id: string;
  name: string;
  photoCount?: number;
  photos?: Photo[];
  createdAt?: string;
}

interface PhotosState {
  photos: Photo[];
  folders: Folder[];
  loading: boolean;
  foldersLoading: boolean;
  uploadLoading: boolean;
  deleteLoading: boolean;
  deletingPhotoIds: string[];
  error: string | null;
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
  favoritedPhotos: string[];    // favorited photo IDs
  selectedPhotos: string[];    // selection mode ke liye
  cartItems: string[];         // purchase cart
  currentGroupId: string | null;
  downloadLoading: boolean;
  downloadingPhotoId: string | null;
  bulkDownloadLoading: boolean;
}

const initialState: PhotosState = {
  photos: [],
  folders: [],
  loading: false,
  foldersLoading: false,
  uploadLoading: false,
  deleteLoading: false,
  deletingPhotoIds: [],
  error: null,
  total: 0,
  page: 1,
  totalPages: 1,
  hasMore: false,
  favoritedPhotos: [],
  selectedPhotos: [],
  cartItems: [],
  currentGroupId: null,
  downloadLoading: false,
  downloadingPhotoId: null,
  bulkDownloadLoading: false,
};

// ─── Async Thunks ────────────────────────────────────────────────────────────

export const fetchPhotos = createAsyncThunk(
  'photos/fetchByGroup',
  async (
    params: {
      groupId: string;
      page?: number;
      limit?: number;
      folder?: string;
      sortBy?: string;
      sortOrder?: string;
      isLiked?: boolean;
      isFavorite?: boolean;
    },
    { rejectWithValue }
  ) => {
    try {
      const { groupId, ...queryParams } = params;
      if (queryParams.limit === undefined) {
        queryParams.limit = 50;
      }
      const { data } = await api.get(`/groups/${groupId}/photos`, {
        params: queryParams,
      });
      // API shape: { success, data: { photos: [...], pagination: { current_page, total_pages, per_page, total_items } } }
      const dataBlock = data.data || data;
      let photos = dataBlock.photos || dataBlock.items || data.photos || data.items || [];
      if (!Array.isArray(photos)) {
        photos = photos.data || photos.photos || photos.items || [];
      }
      if (!Array.isArray(photos)) photos = [];

      const pagination = dataBlock.pagination || data.pagination || data.meta || {};
      const total = pagination.total_items ?? pagination.total ?? photos.length;
      const page = pagination.current_page ?? pagination.page ?? 1;
      const totalPages = pagination.total_pages ?? pagination.last_page ?? 1;

      return {
        photos,
        total,
        page,
        totalPages,
        groupId,
        isLiked: params.isLiked || false,
      };
    } catch (err: any) {
      const message = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(', ')
        : err.response?.data?.message || err.response?.data?.error?.message || 'Failed to fetch photos';
      return rejectWithValue(message);
    }
  }
);

export const uploadPhotos = createAsyncThunk(
  'photos/upload',
  async (
    { groupId, files, folder, enableWatermark }: { groupId: string; files: File[]; folder?: string; enableWatermark?: boolean },
    { rejectWithValue }
  ) => {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files[]', file);
        formData.append('photos[]', file);
      });
      if (folder) formData.append('folder', folder);
      if (enableWatermark !== undefined) formData.append('enable_watermark', String(enableWatermark));
      formData.append('is_platform', 'web');

      const { data } = await api.post(`/groups/${groupId}/photos/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data as { uploadedCount: number; photos: Photo[] };
    } catch (err: any) {
      const message = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(', ')
        : err.response?.data?.message || err.response?.data?.error?.message || 'Failed to upload photos';
      return rejectWithValue(message);
    }
  }
);

export const deletePhotos = createAsyncThunk(
  'photos/delete',
  async (photoIds: string[], { rejectWithValue }) => {
    try {
      await api.delete('/photos', { data: { photoIds } });
      return photoIds;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error?.message);
    }
  }
);

export const favoritePhoto = createAsyncThunk(
  'photos/favorite',
  async (photoId: string, { rejectWithValue }) => {
    try {
      // Call both endpoints
      await Promise.all([
        api.post(`/photos/${photoId}/favorite`),
        api.post(`/photos/${photoId}/like`)
      ]);
      return photoId;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error?.message);
    }
  }
);

export const unfavoritePhoto = createAsyncThunk(
  'photos/unfavorite',
  async (photoId: string, { rejectWithValue }) => {
    try {
      // Call both endpoints
      await Promise.all([
        api.delete(`/photos/${photoId}/favorite`),
        api.delete(`/photos/${photoId}/like`)
      ]);
      return photoId;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error?.message);
    }
  }
);

export const toggleSelection = createAsyncThunk(
  'photos/toggleSelection',
  async (photoId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const groupId = state.photos.currentGroupId;
      if (!groupId) return rejectWithValue('Group ID not found');

      const { data } = await api.post(`/groups/${groupId}/select-photo`, { photoId });
      return { photoId, isSelected: data.isSelected ?? data.is_selected_by_client };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error?.message);
    }
  }
);

export const purchasePhoto = createAsyncThunk(
  'photos/purchase',
  async (
    { photoId, paymentMethod }: { photoId: string; paymentMethod: string },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.post(`/photos/${photoId}/purchase`, { paymentMethod });
      return { photoId, ...data };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error?.message);
    }
  }
);

export const purchaseAlbum = createAsyncThunk(
  'photos/purchaseAlbum',
  async (
    {
      groupId,
      photoIds,
      paymentMethod,
    }: { groupId: string; photoIds: string[]; paymentMethod: string },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.post(`/groups/${groupId}/album/purchase`, {
        photoIds,
        paymentMethod,
      });
      return { photoIds, ...data };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error?.message);
    }
  }
);

export const updatePhotoTags = createAsyncThunk(
  'photos/updateTags',
  async (
    { photoId, tags }: { photoId: string; tags: string[] },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.put(`/photos/${photoId}`, { tags });
      return data as Photo;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error?.message);
    }
  }
);

export const downloadPhoto = createAsyncThunk(
  'photos/download',
  async (photoId: string, { rejectWithValue }) => {
    try {
      // Always download without watermark - watermark is for display only
      const response = await api.get(`/photos/${photoId}/download?no_watermark=1`, {
        responseType: 'blob',
      });

      // Extract filename from content-disposition if available, or use a default
      const contentDisposition = response.headers['content-disposition'];
      let filename = `photo-${photoId}.jpg`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      // Create blob and trigger download
      const blob = new Blob([response.data], { type: response.data.type || 'image/jpeg' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return photoId;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to download photo';
      return rejectWithValue(message);
    }
  }
);

/**
 * Bulk / selective download via POST /api/photos/download
 *
 * Params:
 *   groupId      – required (maps to `group_id` form field)
 *   downloadType – 'all' | 'specific'  (maps to `download_type`)
 *   photoIds     – optional array of IDs when downloadType === 'specific'
 */
export const downloadPhotos = createAsyncThunk(
  'photos/downloadBulk',
  async (
    {
      groupId,
      downloadType = 'all',
      photoIds,
    }: { groupId: string; downloadType?: 'all' | 'specific'; photoIds?: string[] },
    { rejectWithValue }
  ) => {
    try {
      const formData = new FormData();
      // Map 'specific' to the API value — send 'specific' when downloading selected photos
      formData.append('download_type', downloadType);
      formData.append('group_id', groupId);
      // Always download without watermark - watermark is for display only
      formData.append('no_watermark', '1');

      if (downloadType === 'specific' && photoIds && photoIds.length > 0) {
        photoIds.forEach((id) => formData.append('photo_ids[]', id));
      }

      const response = await api.post('/photos/download', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        responseType: 'blob',
      });

      // Derive filename from Content-Disposition header or fall back to a default
      const contentDisposition = response.headers['content-disposition'];
      let filename = `photos-${groupId}.zip`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match?.[1]) filename = match[1];
      }

      // Trigger browser download
      const blob = new Blob([response.data], {
        type: String(response.headers['content-type'] || 'application/zip'),
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { groupId, downloadType };
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        'Failed to download photos';
      return rejectWithValue(message);
    }
  }
);

// ─── Async Thunks for Folders ────────────────────────────────────────────────

export const fetchFolders = createAsyncThunk(
  'photos/fetchFolders',
  async (groupId: string, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/groups/${groupId}/folders`);
      return (data.data || data.folders || data) as Folder[];
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.response?.data?.error?.message || 'Failed to fetch folders'
      );
    }
  }
);

export const createFolder = createAsyncThunk(
  'photos/createFolder',
  async (
    { groupId, name }: { groupId: string; name: string },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.post(`/groups/${groupId}/folders`, { name });
      return (data.data || data.folder || data) as Folder;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.response?.data?.error?.message || 'Failed to create folder'
      );
    }
  }
);

export const updateFolder = createAsyncThunk(
  'photos/updateFolder',
  async (
    { folderId, name }: { folderId: string; name: string },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.put(`/folders/${folderId}`, { name });
      return (data.data || data.folder || data) as Folder;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.response?.data?.error?.message || 'Failed to update folder'
      );
    }
  }
);

export const deleteFolder = createAsyncThunk(
  'photos/deleteFolder',
  async (folderId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/folders/${folderId}`);
      return folderId;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.response?.data?.error?.message || 'Failed to delete folder'
      );
    }
  }
);

export const transferFolderPhotos = createAsyncThunk(
  'photos/transferFolderPhotos',
  async (
    {
      source_folder_id,
      destination_folder_id,
    }: { source_folder_id: string; destination_folder_id: string },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.post('/folders/transfer', {
        source_folder_id,
        destination_folder_id,
      });
      return data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.response?.data?.error?.message || 'Failed to transfer photos'
      );
    }
  }
);

/**
 * Trigger AI face matching for a specific photo.
 * POST /photos/{photoId}/match-faces
 * This indexes the photo into the Face++ faceset so match-my-photos can find it.
 */
export const matchFacesForPhoto = createAsyncThunk(
  'photos/matchFaces',
  async (photoId: string, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/photos/${photoId}/match-faces`);
      return data as {
        success: boolean;
        message: string;
        faces_found: number;
        matches: { user_id: number; confidence: number }[];
      };
    } catch (err: any) {
      // Non-blocking — silently fail so it doesn't disrupt the gallery
      return rejectWithValue(
        err.response?.data?.message || err.response?.data?.error?.message || 'Failed to match faces'
      );
    }
  }
);

// ─── Slice ───────────────────────────────────────────────────────────────────

const photosSlice = createSlice({
  name: 'photos',
  initialState,
  reducers: {
    clearPhotosError(state) {
      state.error = null;
    },
    toggleSelectPhoto(state, action: PayloadAction<string>) {
      const id = action.payload;
      const idx = state.selectedPhotos.indexOf(id);
      if (idx === -1) {
        state.selectedPhotos.push(id);
      } else {
        state.selectedPhotos.splice(idx, 1);
      }
    },
    selectAllPhotos(state) {
      state.selectedPhotos = state.photos.map((p) => p.id);
    },
    clearSelection(state) {
      state.selectedPhotos = [];
    },
    toggleCartItem(state, action: PayloadAction<string>) {
      const id = action.payload;
      const idx = state.cartItems.indexOf(id);
      if (idx === -1) {
        state.cartItems.push(id);
      } else {
        state.cartItems.splice(idx, 1);
      }
    },
    clearCart(state) {
      state.cartItems = [];
    },
    // Mock data ke liye
    setPhotosFromMock(state, action: PayloadAction<Photo[]>) {
      state.photos = action.payload.map(p => ({
        ...p,
        liked: p.isFavorite || p.isLiked || p.liked
      }));
      state.total = action.payload.length;
      state.favoritedPhotos = state.photos.filter((p) => p.liked).map((p) => p.id);
      state.loading = false;
    },
    // Optimistic favorite toggle (offline ke liye)
    toggleFavoriteOptimistic(state, action: PayloadAction<string>) {
      const id = action.payload;
      const photo = state.photos.find((p) => p.id === id);
      if (photo) photo.liked = !photo.liked;
      const favoritedIdx = state.favoritedPhotos.indexOf(id);
      if (favoritedIdx === -1) {
        state.favoritedPhotos.push(id);
      } else {
        state.favoritedPhotos.splice(favoritedIdx, 1);
      }
    },
  },
  extraReducers: (builder) => {
    // fetchPhotos
    builder
      .addCase(fetchPhotos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPhotos.fulfilled, (state, action) => {
        state.loading = false;
        const isLikedFetch = action.payload?.isLiked || false;
        const rawPhotos = action.payload?.photos;
        const photosArray = Array.isArray(rawPhotos) ? rawPhotos : [];
        const photos = photosArray.map((p: any) => ({
          ...p,
          id: String(p.id),  // normalize to string — API may return numeric IDs
          date: p.created_at ? p.created_at.split('T')[0] : p.date,
          liked: p.isFavorite || p.isLiked || p.liked || (p.likes_count && p.likes_count > 0) || false,
          likes_count: p.likes_count || 0
        }));
        const total = action.payload?.total || 0;

        state.photos = photos;
        state.total = total;
        state.page = action.payload?.page || 1;
        state.totalPages = action.payload?.totalPages || 1;
        state.currentGroupId = action.payload?.groupId;
        state.hasMore = (action.payload?.page || 1) < (action.payload?.totalPages || 1);

        if (isLikedFetch) {
          // Merge liked photo IDs into favoritedPhotos — only if they are actually liked
          const likedIds = photos.filter(p => p.liked).map((p) => p.id);
          const merged = Array.from(new Set([...state.favoritedPhotos, ...likedIds]));
          state.favoritedPhotos = merged;
        } else {
          // For normal fetch, sync favoritedPhotos for the photos we just received
          const fetchedIds = photos.map(p => p.id);
          const currentLikesFromFetched = photos.filter(p => p.liked).map(p => p.id);
          
          // Remove fetched IDs from favoritedPhotos first, then add back the ones that are still liked
          const otherFavorited = state.favoritedPhotos.filter(id => !fetchedIds.includes(id));
          state.favoritedPhotos = Array.from(new Set([...otherFavorited, ...currentLikesFromFetched]));
        }
      })
      .addCase(fetchPhotos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // uploadPhotos
    builder
      .addCase(uploadPhotos.pending, (state) => {
        state.uploadLoading = true;
        state.error = null;
      })
      .addCase(uploadPhotos.fulfilled, (state, action) => {
        state.uploadLoading = false;
        const rawPhotos = action.payload?.photos || [];
        const newPhotos = rawPhotos.map((p: any) => ({
          ...p,
          id: String(p.id),
          date: p.created_at ? p.created_at.split('T')[0] : p.date,
          liked: p.isFavorite || p.isLiked || p.liked || (p.likes_count && p.likes_count > 0) || false,
          likes_count: p.likes_count || 0
        }));
        state.photos.unshift(...newPhotos);
        state.total += action.payload?.uploadedCount || 0;
      })
      .addCase(uploadPhotos.rejected, (state, action) => {
        state.uploadLoading = false;
        state.error = action.payload as string;
      });

    // deletePhotos
    builder
      .addCase(deletePhotos.pending, (state, action) => {
        state.deleteLoading = true;
        state.deletingPhotoIds = action.meta.arg;
        state.error = null;
      })
      .addCase(deletePhotos.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.deletingPhotoIds = [];
        state.photos = state.photos.filter((p) => !action.payload.includes(p.id));
        state.total = Math.max(0, state.total - action.payload.length);
        state.selectedPhotos = state.selectedPhotos.filter(
          (id) => !action.payload.includes(id)
        );
      })
      .addCase(deletePhotos.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deletingPhotoIds = [];
        state.error = action.payload as string;
      });

    // favoritePhoto
    builder
      .addCase(favoritePhoto.fulfilled, (state, action) => {
        const photo = state.photos.find((p) => p.id === action.payload);
        if (photo) {
          photo.liked = true;
          photo.isLiked = true;
          photo.isFavorite = true;
          photo.likes_count = (photo.likes_count || 0) + 1;
        }
        if (!state.favoritedPhotos.includes(action.payload)) {
          state.favoritedPhotos.push(action.payload);
        }
      });

    // unfavoritePhoto
    builder
      .addCase(unfavoritePhoto.fulfilled, (state, action) => {
        const photo = state.photos.find((p) => p.id === action.payload);
        if (photo) {
          photo.liked = false;
          photo.isLiked = false;
          photo.isFavorite = false;
          photo.likes_count = Math.max(0, (photo.likes_count || 0) - 1);
        }
        state.favoritedPhotos = state.favoritedPhotos.filter((id) => id !== action.payload);
      })
      .addCase(toggleSelection.fulfilled, (state, action) => {
        const photo = state.photos.find((p) => p.id === action.payload.photoId);
        if (photo) {
          photo.isSelectedByClient = action.payload.isSelected;
          photo.is_selected_by_client = action.payload.isSelected;
        }
      });

    // updatePhotoTags
    builder
      .addCase(updatePhotoTags.fulfilled, (state, action) => {
        const idx = state.photos.findIndex((p) => p.id === action.payload.id);
        if (idx !== -1) state.photos[idx] = action.payload;
      });

    // downloadPhoto (single photo – legacy)
    builder
      .addCase(downloadPhoto.pending, (state, action) => {
        state.downloadLoading = true;
        state.downloadingPhotoId = action.meta.arg;
        state.error = null;
      })
      .addCase(downloadPhoto.fulfilled, (state) => {
        state.downloadLoading = false;
        state.downloadingPhotoId = null;
      })
      .addCase(downloadPhoto.rejected, (state, action) => {
        state.downloadLoading = false;
        state.downloadingPhotoId = null;
        state.error = action.payload as string;
      });

    // downloadPhotos (bulk / selective via POST /api/photos/download)
    builder
      .addCase(downloadPhotos.pending, (state) => {
        state.bulkDownloadLoading = true;
        state.error = null;
      })
      .addCase(downloadPhotos.fulfilled, (state) => {
        state.bulkDownloadLoading = false;
      })
      .addCase(downloadPhotos.rejected, (state, action) => {
        state.bulkDownloadLoading = false;
        state.error = action.payload as string;
      });

    // fetchFolders
    builder
      .addCase(fetchFolders.pending, (state) => {
        state.foldersLoading = true;
      })
      .addCase(fetchFolders.fulfilled, (state, action) => {
        state.foldersLoading = false;
        state.folders = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchFolders.rejected, (state) => {
        state.foldersLoading = false;
      });

    // createFolder
    builder
      .addCase(createFolder.fulfilled, (state, action) => {
        state.folders.unshift(action.payload);
      })
      .addCase(updateFolder.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.folders.findIndex(f => String(f.id) === String(updated.id));
        if (idx !== -1) {
          state.folders[idx] = updated;
        }
      })
      .addCase(deleteFolder.fulfilled, (state, action) => {
        const folderId = action.payload;
        state.folders = state.folders.filter(f => String(f.id) !== String(folderId));
      })
      .addCase(transferFolderPhotos.fulfilled, (state, action) => {
        const payloadData = action.payload?.data || {};
        const source_folder_id = payloadData.source_folder_id;
        const destination_folder_id = payloadData.destination_folder_id;
        const photos_transferred = Number(payloadData.photos_transferred || 0);

        if (source_folder_id && destination_folder_id && photos_transferred > 0) {
          // Update source folder photo count
          const sourceIdx = state.folders.findIndex(f => String(f.id) === String(source_folder_id));
          if (sourceIdx !== -1) {
            const count = state.folders[sourceIdx].photoCount ?? 0;
            state.folders[sourceIdx].photoCount = Math.max(0, count - photos_transferred);
          }

          // Update destination folder photo count
          const destIdx = state.folders.findIndex(f => String(f.id) === String(destination_folder_id));
          if (destIdx !== -1) {
            const count = state.folders[destIdx].photoCount ?? 0;
            state.folders[destIdx].photoCount = count + photos_transferred;
          }
        }
      });
  },
});

export const {
  clearPhotosError,
  toggleSelectPhoto,
  selectAllPhotos,
  clearSelection,
  toggleCartItem,
  clearCart,
  setPhotosFromMock,
  toggleFavoriteOptimistic,
} = photosSlice.actions;
export default photosSlice.reducer;
