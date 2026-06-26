import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/services/api';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface TeamRole {
  id: string;
  name: string;
}

interface TeamState {
  members: TeamMember[];
  roles: TeamRole[];
  loading: boolean;
  error: string | null;
}

const initialState: TeamState = {
  members: [
    { id: '1', name: 'Amit Kumar', email: 'amit@fabphoto.com', role: 'editor' },
    { id: '2', name: 'Priya Singh', email: 'priya@fabphoto.com', role: 'photographer' },
  ],
  roles: [],
  loading: false,
  error: null,
};

// ─── Async Thunks ────────────────────────────────────────────────────────────

export const fetchTeamMembers = createAsyncThunk(
  'team/fetchMembers',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/team-members');
      return (data.data || data.members || data) as TeamMember[];
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.response?.data?.error?.message || 'Failed to fetch team members'
      );
    }
  }
);

export const fetchTeamRoles = createAsyncThunk(
  'team/fetchRoles',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/team-members/roles');
      return (data.data || data.roles || data) as TeamRole[];
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.response?.data?.error?.message || 'Failed to fetch roles'
      );
    }
  }
);

export const addTeamMember = createAsyncThunk(
  'team/addMember',
  async (payload: any, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/team-members', payload);
      let member = data.data || data.member || data.teamMember || data.user || data;
      
      if (!member.email && typeof data === 'object') {
        const found = Object.values(data).find(
          (val: any) => val && typeof val === 'object' && (val.email || val.role)
        );
        if (found) member = found;
      }
      
      return member as TeamMember;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.response?.data?.error?.message || 'Failed to add team member'
      );
    }
  }
);

export const updateTeamMember = createAsyncThunk(
  'team/updateMember',
  async (
    { id, payload }: { id: string; payload: Partial<TeamMember> },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.put(`/team-members/${id}`, payload);
      return (data.data || data.member || data) as TeamMember;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.response?.data?.error?.message || 'Failed to update team member'
      );
    }
  }
);

export const deleteTeamMember = createAsyncThunk(
  'team/deleteMember',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/team-members/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.response?.data?.error?.message || 'Failed to delete team member'
      );
    }
  }
);

// ─── Slice ───────────────────────────────────────────────────────────────────

const teamSlice = createSlice({
  name: 'team',
  initialState,
  reducers: {
    clearTeamError(state) {
      state.error = null;
    },
    setTeamMembersFromMock(state, action: PayloadAction<TeamMember[]>) {
      state.members = action.payload;
    }
  },
  extraReducers: (builder) => {
    // fetchTeamMembers
    builder
      .addCase(fetchTeamMembers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeamMembers.fulfilled, (state, action) => {
        state.loading = false;
        if (Array.isArray(action.payload)) {
          state.members = action.payload;
        } else if (action.payload && typeof action.payload === 'object') {
          const possibleArray = Object.values(action.payload).find(val => Array.isArray(val));
          state.members = (possibleArray as TeamMember[]) || [];
        } else {
          state.members = [];
        }
      })
      .addCase(fetchTeamMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // fetchTeamRoles
    builder
      .addCase(fetchTeamRoles.fulfilled, (state, action) => {
        if (Array.isArray(action.payload)) {
          state.roles = action.payload;
        } else if (action.payload && typeof action.payload === 'object') {
          const possibleArray = Object.values(action.payload).find(val => Array.isArray(val));
          state.roles = (possibleArray as TeamRole[]) || [];
        } else {
          state.roles = [];
        }
      });

    // addTeamMember
    builder
      .addCase(addTeamMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addTeamMember.fulfilled, (state, action) => {
        state.loading = false;
        state.members.push(action.payload);
      })
      .addCase(addTeamMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // updateTeamMember
    builder
      .addCase(updateTeamMember.fulfilled, (state, action) => {
        const idx = state.members.findIndex((m) => m.id === action.payload.id);
        if (idx !== -1) state.members[idx] = action.payload;
      });

    // deleteTeamMember
    builder
      .addCase(deleteTeamMember.fulfilled, (state, action) => {
        state.members = state.members.filter((m) => m.id !== action.payload);
      });
  },
});

export const { clearTeamError, setTeamMembersFromMock } = teamSlice.actions;
export default teamSlice.reducer;
