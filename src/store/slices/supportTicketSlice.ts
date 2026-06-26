import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/services/api';

export interface SupportTicketData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  priority: string;
  description: string;
}

export interface SupportTicket extends SupportTicketData {
  id: string;
  createdAt: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
}

interface SupportTicketState {
  tickets: SupportTicket[];
  loading: boolean;
  submitting: boolean;
  success: boolean;
  error: string | null;
  successMessage: string | null;
  currentTicket: SupportTicket | null;
}

const initialState: SupportTicketState = {
  tickets: [],
  loading: false,
  submitting: false,
  success: false,
  error: null,
  successMessage: null,
  currentTicket: null,
};

// ─── Async Thunks ────────────────────────────────────────────────────────────

export const submitSupportTicket = createAsyncThunk(
  'supportTicket/submit',
  async (payload: SupportTicketData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/api/support/tickets', payload);
      return data as SupportTicket;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to submit support ticket. Please try again.';
      return rejectWithValue(errorMsg);
    }
  }
);

export const fetchSupportTickets = createAsyncThunk(
  'supportTicket/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/api/support/tickets');
      return data as SupportTicket[];
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch support tickets.';
      return rejectWithValue(errorMsg);
    }
  }
);

export const fetchSupportTicketById = createAsyncThunk(
  'supportTicket/fetchById',
  async (ticketId: string, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/api/support/tickets/${ticketId}`);
      return data as SupportTicket;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch support ticket.';
      return rejectWithValue(errorMsg);
    }
  }
);

// ─── Slice ───────────────────────────────────────────────────────────────────

const supportTicketSlice = createSlice({
  name: 'supportTicket',
  initialState,
  reducers: {
    clearSupportMessage(state) {
      state.success = false;
      state.error = null;
      state.successMessage = null;
    },
    resetSupportTicketState(state) {
      state.loading = false;
      state.submitting = false;
      state.success = false;
      state.error = null;
      state.successMessage = null;
      state.currentTicket = null;
    },
    clearCurrentTicket(state) {
      state.currentTicket = null;
    },
  },
  extraReducers: (builder) => {
    // submitSupportTicket
    builder
      .addCase(submitSupportTicket.pending, (state) => {
        state.submitting = true;
        state.error = null;
        state.success = false;
        state.successMessage = null;
      })
      .addCase(submitSupportTicket.fulfilled, (state, action) => {
        state.submitting = false;
        state.success = true;
        state.successMessage = 'Support ticket submitted successfully! We\'ll get back to you soon.';
        state.error = null;
        state.tickets.push(action.payload);
        state.currentTicket = action.payload;
      })
      .addCase(submitSupportTicket.rejected, (state, action) => {
        state.submitting = false;
        state.success = false;
        state.error = action.payload as string;
        state.successMessage = null;
      });

    // fetchSupportTickets
    builder
      .addCase(fetchSupportTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSupportTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets = action.payload;
        state.error = null;
      })
      .addCase(fetchSupportTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // fetchSupportTicketById
    builder
      .addCase(fetchSupportTicketById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSupportTicketById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTicket = action.payload;
        state.error = null;
      })
      .addCase(fetchSupportTicketById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSupportMessage, resetSupportTicketState, clearCurrentTicket } = supportTicketSlice.actions;
export default supportTicketSlice.reducer;
