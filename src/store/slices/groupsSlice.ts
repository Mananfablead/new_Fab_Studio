import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/services/api';
import { EventType } from '@/lib/mock-data';
import axios from 'axios';

export interface GroupMonetization {
  enabled: boolean;
  sellPhotos?: boolean;
  paidDownloads?: boolean;
  pricePerPhoto: number;
  pricePerAlbum?: number;
  currency: string;
  clientAlbumSelection?: boolean;
  maxSelections?: number;
  watermarkText?: string;
}

export interface GroupViewDownloadSettings {
  allowDownloading: boolean;
  enableSharing: boolean;
  enableScreenshots: boolean;
  downloadQuality: 'original' | 'high' | 'medium' | 'low';
  bulkDownloads: boolean;
  viewingPlatform: 'web' | 'app' | 'both';
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  eventDate?: string;
  location?: string;
  coverImage: string;
  photoCount: number;
  participantCount: number;
  memberCount?: number;
  createdAt: string;
  updatedAt?: string;
  type: "private" | "public";
  eventType?: EventType;
  joinCode?: string;
  inviteLink?: string;
  sortBy?: string;
  enableWatermark?: boolean;
  privacy?: {
    allowMemberEdit: boolean;
    allowJoinByLink: boolean;
    allowAnonymousView: boolean;
    requireFaceVerification: boolean;
    uploadPermission: string | null;
  };
  owner?: {
    id: number;
    name: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatar?: string;
    logo?: string;
    businessName?: string;
    businessEmail?: string;
    businessPhone?: string;
    businessWebsite?: string;
    businessAddress?: string;
    whatsappNumber?: string;
    socialLinks?: { platform: string; url: string }[];
    owner?: {
      id?: number;
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      avatar?: string;
      logo?: string;
      businessName?: string;
      businessEmail?: string;
      businessPhone?: string;
      businessWebsite?: string;
      businessAddress?: string;
      whatsappNumber?: string;
      socialLinks?: { platform: string; url: string }[];
    };
  };
  participants?: {
    id: number;
    name: string;
    email: string;
    role: string;
    canUpload: number;
  }[];
  monetization?: GroupMonetization;
  viewDownload?: GroupViewDownloadSettings;
  flipbook?: {
    enabled: boolean;
    autoPlay: boolean;
    showPageNumbers: boolean;
    animation: string;
    backgroundColor: string;
    backgroundMusic: string | null;
  };
  branding?: {
    name: string | null;
    logo: string | null;
    show: boolean;
    onLoginPage: boolean;
    website?: string | null;
    email?: string | null;
    phone?: string | null;
    socialLinks?: { platform: string; url: string }[];
  };
  team_members?: {
    id: number;
    photographer_id: number;
    user_id: number;
    name: string;
    email?: string;
    role?: string;
    status?: string;
    permissions?: string;
    [key: string]: any;
  }[];
  albumDownloadPin?: string | null;
  sponsors?: any[];
  watermark?: {
    type: string;
    opacity: string | number;
    tiled: boolean;
    position: string;
    scale: string | number;
    image_url?: string;
    watermark_image?: string;
    watermark_text?: string;
  };
  flipbook_photos_data?: { id: string, url: string }[];
}

export interface CreateGroupPayload {
  name: string;
  description?: string;
  eventDate?: string;
  location?: string;
  type: "private" | "public";
  eventType?: EventType;
  coverImage?: string;
  monetization?: {
    enabled?: boolean;
    pricePerPhoto?: number;
    currency?: string;
    clientAlbumSelection?: boolean;
    maxSelections?: number;
    watermarkText?: string;
  };
}

interface GroupsState {
  groups: Group[];
  currentGroup: Group | null;
  loading: boolean;
  currentGroupLoading: boolean;
  error: string | null;
  total: number;
  page: number;
  hasMore: boolean;
  inviteCode: string | null;
  inviteLink: string | null;
  qrLink: string | null;
  matchMyPhotosLoading: boolean;
  matchMyPhotosResult: {
    success: boolean;
    message: string;
    matches_found: number;
    photos: any[];
  } | null;
  matchMyPhotosError: string | null;
  myPhotos: any[];
  myPhotosLoading: boolean;
  myPhotosTotal: number;
  myPhotosError: string | null;
}

const initialState: GroupsState = {
  groups: [],
  currentGroup: null,
  loading: false,
  currentGroupLoading: false,
  error: null,
  total: 0,
  page: 1,
  hasMore: false,
  inviteCode: null,
  inviteLink: null,
  qrLink: null,
  matchMyPhotosLoading: false,
  matchMyPhotosResult: null,
  matchMyPhotosError: null,
  myPhotos: [],
  myPhotosLoading: false,
  myPhotosTotal: 0,
  myPhotosError: null,
};

// ─── Batch Upload Helper Function ─────────────────────────────────────────────

interface UploadProgress {
  completedFiles: number;
  totalFiles: number;
  percentage: number;
  currentBatch: number;
  totalBatches: number;
}

interface UploadFilesInBatchesParams {
  files: File[];
  groupId: string;
  onProgress?: (progress: UploadProgress) => void;
  apiBaseUrl?: string;
}

export const uploadFilesInBatches = async ({
  files,
  groupId,
  onProgress,
  apiBaseUrl = 'https://stag.fablead-studio.com/services/api'
}: UploadFilesInBatchesParams): Promise<any> => {
  const BATCH_SIZE = 10;
  const totalFiles = files.length;
  const totalBatches = Math.ceil(totalFiles / BATCH_SIZE);
  let completedFiles = 0;
  let allResponses: any[] = [];

  console.log(`Starting batch upload: ${totalFiles} files in ${totalBatches} batches`);

  for (let i = 0; i < totalBatches; i++) {
    const batchNumber = i + 1;
    const startIndex = i * BATCH_SIZE;
    const endIndex = Math.min(startIndex + BATCH_SIZE, totalFiles);
    const batch = files.slice(startIndex, endIndex);
    const batchFileCount = batch.length;

    console.log(`\n=== Batch ${batchNumber}/${totalBatches} ===`);
    console.log(`Uploading files ${startIndex + 1}-${endIndex} (${batchFileCount} files)`);

    try {
      const formData = new FormData();
      batch.forEach((file) => {
        formData.append('photos[]', file);
      });

      const response = await axios.post(
        `${apiBaseUrl}/groups/${groupId}/photos/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 300000, // 5 minutes timeout for large uploads
        }
      );

      completedFiles += batchFileCount;
      allResponses.push(response.data);

      const percentage = Math.round((completedFiles / totalFiles) * 100);

      console.log(`✓ Batch ${batchNumber} completed successfully`);
      console.log(`  Uploaded: ${completedFiles}/${totalFiles} files (${percentage}%)`);
      console.log(`  API Response:`, response.data);

      if (onProgress) {
        onProgress({
          completedFiles,
          totalFiles,
          percentage,
          currentBatch: batchNumber,
          totalBatches,
        });
      }

    } catch (error: any) {
      console.error(`✗ Batch ${batchNumber} failed`);
      console.error(`  Error:`, error.response?.data || error.message);
      console.error(`  Files uploaded so far: ${completedFiles}/${totalFiles}`);

      throw new Error(
        `Batch ${batchNumber} upload failed (files ${startIndex + 1}-${endIndex}). ` +
        `Already uploaded: ${completedFiles} files. ` +
        `Error: ${error.response?.data?.message || error.response?.data?.error?.message || error.message}`
      );
    }
  }

  console.log(`\n✓ All batches completed successfully! Total files uploaded: ${completedFiles}`);
  return allResponses;
};

// ─── Async Thunks ────────────────────────────────────────────────────────────

export const fetchGroups = createAsyncThunk(
  'groups/fetchAll',
  async (
    params: { search?: string; visibility?: string; page?: number; limit?: number } = {},
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.get('/groups', { params });
      // Map participantCount from participants array or memberCount
      const groups = data.groups.map((group: any) => ({
        ...group,
        ownerId: group.ownerId || group.owner_id,
        createdBy: group.createdBy || group.created_by,
        participantCount: group.participantCount || group.memberCount || group.participants?.length || 0,
      }));
      return { ...data, groups } as { groups: Group[]; total: number; page: number; limit: number };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.response?.data?.error?.message || err.message || 'Failed to fetch groups');
    }
  }
);

export const fetchGroupById = createAsyncThunk(
  'groups/fetchById',
  async (groupId: string, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/groups/${groupId}`);
      const groupData = data.group || data.data || data;
      const inviteLink = data.inviteLink || data.invite_link || groupData.inviteLink || groupData.invite_link;
      const joinCode = data.joinCode || data.join_code || groupData.joinCode || groupData.join_code;

      // Normalize owner fields — API returns owner.owner with actual business details
      const rawOwner = groupData.owner;
      const rawOwnerDetails = rawOwner?.owner || rawOwner; // nested owner.owner has business fields
      const normalizedOwner = rawOwner ? {
        ...rawOwner,
        id: rawOwner.id,
        name: rawOwner.name || '',
        // Flatten nested owner details onto the owner object
        firstName: rawOwnerDetails?.firstName || '',
        lastName: rawOwnerDetails?.lastName || '',
        email: rawOwnerDetails?.email || rawOwner.email || '',
        phone: rawOwnerDetails?.phone || rawOwner.phone || '',
        avatar: rawOwnerDetails?.avatar || rawOwner.avatar || '',
        logo: rawOwnerDetails?.logo || rawOwner.logo || '',
        businessName: rawOwnerDetails?.businessName || '',
        businessEmail: rawOwnerDetails?.businessEmail || '',
        businessPhone: rawOwnerDetails?.businessPhone || '',
        businessWebsite: rawOwnerDetails?.businessWebsite || '',
        businessAddress: rawOwnerDetails?.businessAddress || '',
        whatsappNumber: rawOwnerDetails?.whatsappNumber || '',
        owner: rawOwner.owner, // keep original nested structure too
      } : rawOwner;

      return {
        ...groupData,
        owner: normalizedOwner,
        inviteLink,
        joinCode,
        ownerId: groupData.ownerId || groupData.owner_id,
        createdBy: groupData.createdBy || groupData.created_by,
        participantCount: groupData.participantCount || groupData.memberCount || groupData.participants?.length || 0,
      } as Group;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.response?.data?.error?.message || err.message || 'Failed to fetch group');
    }
  }
);

export const createGroup = createAsyncThunk(
  'groups/create',
  async (payload: CreateGroupPayload, { rejectWithValue, getState }) => {
    try {
      const { data } = await api.post('/groups', { ...payload, is_platform: 'web' });
      const groupData = data.group || data.data || data;
      const inviteLink = data.inviteLink || data.invite_link || groupData.inviteLink || groupData.invite_link;
      const joinCode = data.joinCode || data.join_code || groupData.joinCode || groupData.join_code;

      // Inject current user id as createdBy/ownerId so isGroupOwner check works immediately
      const state = getState() as { auth: { user: { id: string } | null } };
      const userId = state.auth.user?.id;

      return {
        ...groupData,
        inviteLink,
        joinCode,
        createdBy: groupData.createdBy || groupData.created_by || userId,
        ownerId: groupData.ownerId || groupData.owner_id || userId,
        participantCount: groupData.participantCount || groupData.memberCount || groupData.participants?.length || 0,
      } as Group;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.response?.data?.error?.message || err.message || 'Failed to create group');
    }
  }
);

export const updateGroup = createAsyncThunk(
  'groups/update',
  async (
    { groupId, payload }: { groupId: string; payload: Partial<Group> },
    { rejectWithValue, getState }
  ) => {
    try {
      const { data } = await api.put(`/groups/${groupId}`, payload);
      const groupData = data.group || data.data || data;

      // Preserve permission-critical fields from current Redux state if the API
      // response doesn't include them or returns empty arrays (update endpoints
      // often return partial/empty data for relational fields).
      const state = getState() as { groups: { currentGroup: Group | null } };
      const existing = state.groups.currentGroup;

      const preserveIfEmpty = <T>(incoming: T[] | undefined | null, fallback: T[] | undefined): T[] | undefined => {
        if (!incoming || (Array.isArray(incoming) && incoming.length === 0)) return fallback;
        return incoming;
      };

      return {
        ...groupData,
        team_members: preserveIfEmpty(groupData.team_members, existing?.team_members),
        participants: preserveIfEmpty(groupData.participants, existing?.participants),
        owner: groupData.owner ?? existing?.owner,
      } as Group;
    } catch (err: any) {
      const message = err.response?.data?.message || err.response?.data?.error?.message || 'Failed to update group';
      return rejectWithValue(message);
    }
  }
);

export const deleteGroup = createAsyncThunk(
  'groups/delete',
  async (groupId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/groups/${groupId}`);
      return groupId;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.response?.data?.error?.message || err.message || 'Failed to delete group');
    }
  }
);

export const joinGroup = createAsyncThunk(
  'groups/join',
  async (joinCode: string, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/groups/join', { joinCode, is_platform: 'web' });
      const groupData = data.group || data.data || data;
      const inviteLink = data.inviteLink || data.invite_link || groupData.inviteLink || groupData.invite_link;
      const parsedJoinCode = data.joinCode || data.join_code || groupData.joinCode || groupData.join_code || joinCode;

      return {
        ...groupData,
        inviteLink,
        joinCode: parsedJoinCode,
        ownerId: groupData.ownerId || groupData.owner_id,
        createdBy: groupData.createdBy || groupData.created_by,
        participantCount: groupData.participantCount || groupData.memberCount || groupData.participants?.length || 0,
      } as Group;
    } catch (err: any) {
      if (err.response?.status === 409 || err.response?.data?.message?.includes("Already a member")) {
        try {
          const { data } = await api.get('/groups');
          const groups = data.groups || data.data || [];
          const matchedGroup = groups.find((g: any) => g.joinCode === joinCode || g.join_code === joinCode);
          if (matchedGroup) {
            return {
              ...matchedGroup,
              participantCount: matchedGroup.participantCount || matchedGroup.memberCount || matchedGroup.participants?.length || 0,
            } as Group;
          }
        } catch (e) {
          console.error("Failed to find group in user's groups after 409 Conflict:", e);
        }
      }
      const message = err.response?.data?.message || err.response?.data?.error?.message || "Already a member of this group or failed to join.";
      return rejectWithValue(message);
    }
  }
);

export const leaveGroup = createAsyncThunk(
  'groups/leave',
  async (groupId: string, { rejectWithValue }) => {
    try {
      await api.post(`/groups/${groupId}/leave`);
      return groupId;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.response?.data?.error?.message || err.message || 'Failed to leave group');
    }
  }
);

export const fetchGroupQR = createAsyncThunk(
  'groups/fetchQR',
  async (groupId: string, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/qr/generate/${groupId}`);
      return data as { success: boolean; qrLink: string };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch QR code');
    }
  }
);

export const generateInvite = createAsyncThunk(
  'groups/generateInvite',
  async (groupId: string, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/groups/${groupId}/invite`);
      return data as { inviteCode: string; inviteLink: string };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error?.message);
    }
  }
);

export const updateMonetizationSettings = createAsyncThunk(
  'groups/updateMonetization',
  async (
    { groupId, payload }: { groupId: string; payload: Partial<GroupMonetization> },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.put(`/groups/${groupId}/monetization`, payload);
      return { groupId, monetization: data as GroupMonetization };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error?.message);
    }
  }
);

export const updateViewDownloadSettings = createAsyncThunk(
  'groups/updateViewDownload',
  async (
    { groupId, payload }: { groupId: string; payload: Partial<GroupViewDownloadSettings> },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.put(`/groups/${groupId}/settings/view-download`, payload);
      const settings = data.settings || data.data || data;
      return { groupId, settings: settings as GroupViewDownloadSettings };
    } catch (err: any) {
      const message = err.response?.data?.message || err.response?.data?.error?.message || 'Failed to update view & download settings';
      return rejectWithValue(message);
    }
  }
);

export const uploadGroupPhotos = createAsyncThunk(
  'groups/uploadPhotos',
  async (
    { groupId, files, onUploadProgress }: { groupId: string; files: File[]; onUploadProgress?: (progressEvent: any) => void },
    { rejectWithValue }
  ) => {
    try {
      const responses = await uploadFilesInBatches({
        files,
        groupId,
        onProgress: (progress) => {
          if (onUploadProgress) {
            onUploadProgress({
              loaded: progress.completedFiles,
              total: progress.totalFiles,
            });
          }
        },
      });

      // Return the last response or combined data
      const lastResponse = responses[responses.length - 1];
      return lastResponse;
    } catch (err: any) {
      const message = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(', ')
        : err.response?.data?.message || err.response?.data?.error?.message || err.message || 'Failed to upload photos';
      return rejectWithValue(message);
    }
  }
);

export const matchMyPhotos = createAsyncThunk(
  'groups/matchMyPhotos',
  async (groupId: string, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/groups/${groupId}/match-my-photos-by-cluster`);
      return data as {
        success: boolean;
        message: string;
        matches_found: number;
        photo_ids: number[];
        photos: any[];
      };
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.response?.data?.error?.message || err.message || 'Failed to match photos'
      );
    }
  }
);

export const fetchMyPhotos = createAsyncThunk(
  'groups/fetchMyPhotos',
  async ({ groupId, per_page = 20 }: { groupId: string; per_page?: number }, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/groups/${groupId}/my-photos`, { params: { per_page } });
      return data as {
        success: boolean;
        total: number;
        photos: any[];
        pagination: {
          total: number;
          current_page: number;
          per_page: number;
          last_page: number;
        };
      };
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.response?.data?.error?.message || err.message || 'Failed to fetch my photos'
      );
    }
  }
);

// ─── Slice ───────────────────────────────────────────────────────────────────

const groupsSlice = createSlice({
  name: 'groups',
  initialState,
  reducers: {
    clearGroupError(state) {
      state.error = null;
    },
    setCurrentGroup(state, action: PayloadAction<Group | null>) {
      state.currentGroup = action.payload;
    },
    clearInvite(state) {
      state.inviteCode = null;
      state.inviteLink = null;
    },
    // Mock data ke liye - jab backend ready na ho
    setGroupsFromMock(state, action: PayloadAction<Group[]>) {
      state.groups = action.payload;
      state.total = action.payload.length;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    // fetchGroups
    builder
      .addCase(fetchGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGroups.fulfilled, (state, action) => {
        state.loading = false;
        state.groups = action.payload.groups;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.hasMore = action.payload.groups.length < action.payload.total;
      })
      .addCase(fetchGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // fetchGroupById
    builder
      .addCase(fetchGroupById.pending, (state) => {
        state.currentGroupLoading = true;
        state.error = null;
      })
      .addCase(fetchGroupById.fulfilled, (state, action) => {
        state.currentGroupLoading = false;
        state.currentGroup = action.payload;
        // groups list mein bhi update karo
        const idx = state.groups.findIndex((g) => g.id === action.payload.id);
        if (idx !== -1) state.groups[idx] = action.payload;
      })
      .addCase(fetchGroupById.rejected, (state, action) => {
        state.currentGroupLoading = false;
        state.error = action.payload as string;
      });

    // createGroup
    builder
      .addCase(createGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGroup.fulfilled, (state, action) => {
        state.loading = false;
        // Inject createdBy from the action meta if not present in response
        const group = action.payload;
        state.groups.unshift(group);
        state.total += 1;
      })
      .addCase(createGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // updateGroup
    builder
      .addCase(updateGroup.fulfilled, (state, action) => {
        const idx = state.groups.findIndex((g) => g.id === action.payload.id);
        if (idx !== -1) state.groups[idx] = { ...state.groups[idx], ...action.payload };
        if (state.currentGroup?.id === action.payload.id) {
          const update = action.payload;
          // For relational fields, only overwrite if the incoming value is a non-empty array.
          // The update API often returns [] or omits these fields entirely — preserve existing.
          const keepIfEmpty = <T>(incoming: T[] | undefined | null, existing: T[] | undefined): T[] | undefined =>
            (!incoming || (Array.isArray(incoming) && incoming.length === 0)) ? existing : incoming;

          state.currentGroup = {
            ...state.currentGroup,
            ...update,
            team_members: keepIfEmpty(update.team_members, state.currentGroup.team_members),
            participants: keepIfEmpty(update.participants, state.currentGroup.participants),
            owner: update.owner ?? state.currentGroup.owner,
          };
        }
      });

    // deleteGroup
    builder
      .addCase(deleteGroup.fulfilled, (state, action) => {
        state.groups = state.groups.filter((g) => g.id !== action.payload);
        state.total -= 1;
        if (state.currentGroup?.id === action.payload) {
          state.currentGroup = null;
        }
      });

    // joinGroup
    builder
      .addCase(joinGroup.fulfilled, (state, action) => {
        state.loading = false;
        const exists = state.groups.find((g) => g.id === action.payload.id);
        if (!exists) {
          state.groups.unshift(action.payload);
          state.total += 1;
        }
      })
      .addCase(joinGroup.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // leaveGroup
    builder
      .addCase(leaveGroup.fulfilled, (state, action) => {
        state.groups = state.groups.filter((g) => g.id !== action.payload);
        state.total -= 1;
        // Clear currentGroup if the user left the current group
        if (state.currentGroup?.id === action.payload) {
          state.currentGroup = null;
        }
      });

    // generateInvite
    builder
      .addCase(generateInvite.fulfilled, (state, action) => {
        state.inviteCode = action.payload.inviteCode;
        state.inviteLink = action.payload.inviteLink;
      });

    // fetchGroupQR
    builder
      .addCase(fetchGroupQR.fulfilled, (state, action) => {
        state.qrLink = action.payload.qrLink;
      });

    // updateMonetizationSettings
    builder
      .addCase(updateMonetizationSettings.fulfilled, (state, action) => {
        const { groupId, monetization } = action.payload;
        const idx = state.groups.findIndex((g) => g.id === groupId);
        if (idx !== -1) state.groups[idx].monetization = monetization;
        if (state.currentGroup?.id === groupId) {
          state.currentGroup.monetization = monetization;
        }
      })
      .addCase(updateViewDownloadSettings.fulfilled, (state, action) => {
        const { groupId, settings } = action.payload;
        const idx = state.groups.findIndex((g) => g.id === groupId);
        if (idx !== -1) state.groups[idx].viewDownload = settings;
        if (state.currentGroup?.id === groupId) {
          state.currentGroup.viewDownload = settings;
        }
      });

    // uploadGroupPhotos
    builder
      .addCase(uploadGroupPhotos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadGroupPhotos.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.photoCount && state.currentGroup) {
          state.currentGroup.photoCount = action.payload.photoCount;
        }
      })
      .addCase(uploadGroupPhotos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // matchMyPhotos
    builder
      .addCase(matchMyPhotos.pending, (state) => {
        state.matchMyPhotosLoading = true;
        state.matchMyPhotosError = null;
        state.matchMyPhotosResult = null;
        state.myPhotos = [];
        state.myPhotosTotal = 0;
      })
      .addCase(matchMyPhotos.fulfilled, (state, action) => {
        state.matchMyPhotosLoading = false;
        state.matchMyPhotosResult = action.payload;
        // Populate myPhotos directly from the match response so the tab
        // shows results immediately without waiting for fetchMyPhotos
        const rawPhotos: any[] = action.payload?.photos || [];
        // Always update myPhotos — even if empty (clears stale results from previous group)
        state.myPhotos = rawPhotos.map((p: any) => ({
          ...p,
          id: String(p.id),
          url: p.url || p.imageUrl || p.image_url || p.thumbnail_url || '',
          thumbnail: p.thumbnail || p.thumbnail_url || p.url || p.imageUrl || '',
          date: p.created_at ? p.created_at.split('T')[0] : (p.date || ''),
          liked: p.is_favorite || p.is_liked || p.isFavorite || p.isLiked || p.liked || false,
          isFavorite: p.is_favorite || p.isFavorite || false,
          isLiked: p.is_liked || p.isLiked || false,
          isSelectedByClient: p.is_selected_by_client || p.isSelectedByClient || false,
          is_selected_by_client: p.is_selected_by_client || false,
          isPremium: p.is_premium || p.isPremium || false,
        }));
        state.myPhotosTotal = state.myPhotos.length;
      })
      .addCase(matchMyPhotos.rejected, (state, action) => {
        state.matchMyPhotosLoading = false;
        state.matchMyPhotosError = action.payload as string;
      });

    // fetchMyPhotos
    builder
      .addCase(fetchMyPhotos.pending, (state) => {
        state.myPhotosLoading = true;
        state.myPhotosError = null;
      })
      .addCase(fetchMyPhotos.fulfilled, (state, action) => {
        state.myPhotosLoading = false;
        const rawPhotos: any[] = action.payload.photos || [];
        state.myPhotos = rawPhotos.map((p: any) => ({
          ...p,
          id: String(p.id),
          url: p.url || p.imageUrl || p.image_url || p.thumbnail_url || '',
          thumbnail: p.thumbnail || p.thumbnail_url || p.url || p.imageUrl || '',
          date: p.created_at ? p.created_at.split('T')[0] : (p.date || ''),
          liked: p.is_favorite || p.is_liked || p.isFavorite || p.isLiked || p.liked || false,
          isFavorite: p.is_favorite || p.isFavorite || false,
          isLiked: p.is_liked || p.isLiked || false,
          isSelectedByClient: p.is_selected_by_client || p.isSelectedByClient || false,
          is_selected_by_client: p.is_selected_by_client || false,
          isPremium: p.is_premium || p.isPremium || false,
        }));
        state.myPhotosTotal = action.payload.total || state.myPhotos.length;
      })
      .addCase(fetchMyPhotos.rejected, (state, action) => {
        state.myPhotosLoading = false;
        state.myPhotosError = action.payload as string;
      });
  },
});

export const { clearGroupError, setCurrentGroup, clearInvite, setGroupsFromMock } =
  groupsSlice.actions;
export default groupsSlice.reducer;
