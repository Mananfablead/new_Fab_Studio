import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/services/api';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  avatar: string;
  role: string;
  status?: string;
  isBlocked?: boolean;
  canUpload?: boolean;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface FetchParticipantsResponse {
  success: boolean;
  data: Participant[];
  pagination: PaginationInfo;
}

interface ParticipantsState {
  participants: Participant[];
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo;
  currentGroupId: string | null;
}

// ─── Initial State ───────────────────────────────────────────────────────────

const initialPagination: PaginationInfo = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
  hasNext: false,
  hasPrevious: false,
};

const initialState: ParticipantsState = {
  participants: [],
  loading: false,
  error: null,
  pagination: initialPagination,
  currentGroupId: null,
};

// ─── Async Thunks ────────────────────────────────────────────────────────────

export const fetchParticipants = createAsyncThunk(
  'participants/fetchAll',
  async (
    params: { groupId: string; page?: number; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      const { groupId, page = 1, limit = 20 } = params;
      const { data } = await api.get(`/groups/${groupId}/participants`, {
        params: { page, limit },
      });
      return data as FetchParticipantsResponse;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error?.message);
    }
  }
);

export const deleteParticipant = createAsyncThunk(
  'participants/delete',
  async (
    { groupId, participantId }: { groupId: string; participantId: string },
    { rejectWithValue }
  ) => {
    try {
      await api.delete(`/groups/${groupId}/participants/${participantId}`);
      return { participantId };
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.response?.data?.error?.message || 'Failed to delete participant'
      );
    }
  }
);

export const updateParticipantRole = createAsyncThunk(
  'participants/updateRole',
  async (
    { groupId, participantId, role }: { groupId: string; participantId: string; role: string },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.put(`/groups/${groupId}/participants/${participantId}/role`, { role });
      return { participantId, role, data };
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.response?.data?.error?.message || 'Failed to update role'
      );
    }
  }
);

export const blockParticipant = createAsyncThunk(
  'participants/block',
  async (
    { groupId, participantId }: { groupId: string; participantId: string },
    { rejectWithValue }
  ) => {
    try {
      await api.put(`/groups/${groupId}/participants/${participantId}/block`);
      return { participantId, isBlocked: true };
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.response?.data?.error?.message || 'Failed to block participant'
      );
    }
  }
);

export const unblockParticipant = createAsyncThunk(
  'participants/unblock',
  async (
    { groupId, participantId }: { groupId: string; participantId: string },
    { rejectWithValue }
  ) => {
    try {
      await api.put(`/groups/${groupId}/participants/${participantId}/unblock`);
      return { participantId, isBlocked: false };
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.response?.data?.error?.message || 'Failed to unblock participant'
      );
    }
  }
);

export const updateParticipantUpload = createAsyncThunk(
  'participants/updateUpload',
  async (
    { groupId, participantId, canUpload }: { groupId: string; participantId: string; canUpload: boolean },
    { rejectWithValue }
  ) => {
    try {
      await api.put(`/groups/${groupId}/participants/${participantId}/upload-permission`, {
        can_upload: canUpload ? 1 : 0,
      });
      return { participantId, canUpload };
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.response?.data?.error?.message || 'Failed to update upload permission'
      );
    }
  }
);

// ─── Slice ───────────────────────────────────────────────────────────────────

const participantsSlice = createSlice({
  name: 'participants',
  initialState,
  reducers: {
    clearParticipantsError(state) {
      state.error = null;
    },
    clearParticipants(state) {
      state.participants = [];
      state.pagination = initialPagination;
      state.currentGroupId = null;
      state.error = null;
    },
    setParticipantsFromMock(state, action: PayloadAction<Participant[]>) {
      state.participants = action.payload;
      state.pagination = {
        ...initialPagination,
        total: action.payload.length,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      };
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    // fetchParticipants
    builder
      .addCase(fetchParticipants.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchParticipants.fulfilled, (state, action) => {
        state.loading = false;
        state.participants = action.payload.data;
        state.pagination = action.payload.pagination;
        state.currentGroupId = action.meta.arg.groupId;
      })
      .addCase(fetchParticipants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // deleteParticipant
    builder
      .addCase(deleteParticipant.fulfilled, (state, action) => {
        state.participants = state.participants.filter(
          (p) => p.id !== action.payload.participantId
        );
        if (state.pagination) {
          state.pagination.total = Math.max(0, state.pagination.total - 1);
        }
      });

    // updateParticipantRole
    builder
      .addCase(updateParticipantRole.fulfilled, (state, action) => {
        const participant = state.participants.find(
          (p) => p.id === action.payload.participantId
        );
        if (participant) {
          participant.role = action.payload.role;
        }
      })
      .addCase(blockParticipant.fulfilled, (state, action) => {
        const participant = state.participants.find(
          (p) => String(p.id) === String(action.payload.participantId)
        );
        if (participant) {
          participant.isBlocked = action.payload.isBlocked;
        }
      })
      .addCase(unblockParticipant.fulfilled, (state, action) => {
        const participant = state.participants.find(
          (p) => String(p.id) === String(action.payload.participantId)
        );
        if (participant) {
          participant.isBlocked = action.payload.isBlocked;
        }
      });

    // updateParticipantUpload
    builder
      .addCase(updateParticipantUpload.fulfilled, (state, action) => {
        const participant = state.participants.find(
          (p) => String(p.id) === String(action.payload.participantId)
        );
        if (participant) {
          participant.canUpload = action.payload.canUpload;
        }
      });
  },
});

// ─── Exports ─────────────────────────────────────────────────────────────────

export const { clearParticipantsError, clearParticipants, setParticipantsFromMock } =
  participantsSlice.actions;

export default participantsSlice.reducer;
