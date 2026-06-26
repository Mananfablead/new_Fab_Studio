import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/services/api';

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  role?: string;
  plan?: string;
  planName?: string;
  plan_id?: string | number;
}

interface ContactState {
  loading: boolean;
  success: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: ContactState = {
  loading: false,
  success: false,
  error: null,
  successMessage: null,
};

// ─── Async Thunks ────────────────────────────────────────────────────────────

export const submitContactForm = createAsyncThunk(
  'contact/submitForm',
  async (payload: ContactFormData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/contact-us', payload);
      return data as { success: boolean; message: string };
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to send message. Please try again.';
      return rejectWithValue(errorMsg);
    }
  }
);

// ─── Slice ───────────────────────────────────────────────────────────────────

const contactSlice = createSlice({
  name: 'contact',
  initialState,
  reducers: {
    clearContactMessage(state) {
      state.success = false;
      state.error = null;
      state.successMessage = null;
    },
    resetContactState(state) {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    // submitContactForm
    builder
      .addCase(submitContactForm.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.successMessage = null;
      })
      .addCase(submitContactForm.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.successMessage = action.payload.message || 'Thank you for your message! We\'ll get back to you soon.';
        state.error = null;
      })
      .addCase(submitContactForm.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload as string;
        state.successMessage = null;
      });
  },
});

export const { clearContactMessage, resetContactState } = contactSlice.actions;
export default contactSlice.reducer;
