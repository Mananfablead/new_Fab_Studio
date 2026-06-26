import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/services/api';

export interface FlipbookSettingsState {
  businessName: string;
  applyToPortfolio: boolean;
  logo: string | null;
  logoLoading: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: FlipbookSettingsState = {
  businessName: '',
  applyToPortfolio: true,
  logo: null,
  logoLoading: false,
  loading: false,
  error: null,
};

// ─── Thunks ──────────────────────────────────────────────────────────────────

export const fetchFlipbookSettings = createAsyncThunk(
  'flipbook/fetchSettings',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/business/settings');
      return data.data || data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to fetch flipbook settings'
      );
    }
  }
);

export const updateFlipbookSettings = createAsyncThunk(
  'flipbook/updateSettings',
  async (
    payload: { name: string; flipbook_portfolio_enabled: boolean },
    { rejectWithValue }
  ) => {
    try {
      const body = {
        ...payload,
        business_name: payload.name,
      };
      const { data } = await api.put('/business/settings', body);
      return data.data || data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to update flipbook settings'
      );
    }
  }
);

/**
 * POST /api/business/flipbook-logo
 * Sends the logo as multipart/form-data with field name "logo"
 */
export const uploadFlipbookLogoFile = createAsyncThunk(
  'flipbook/uploadLogo',
  async (file: File, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('logo', file);

      const { data } = await api.post('/business/flipbook-logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      return data.data || data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to upload flipbook logo'
      );
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const flipbookSlice = createSlice({
  name: 'flipbook',
  initialState,
  reducers: {
    setFlipbookState(state, action: PayloadAction<Partial<FlipbookSettingsState>>) {
      return { ...state, ...action.payload };
    },
    clearFlipbookError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchFlipbookSettings
    builder
      .addCase(fetchFlipbookSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFlipbookSettings.fulfilled, (state, action) => {
        state.loading = false;
        const p = action.payload?.settings || action.payload?.data || action.payload;
        if (p) {
          state.businessName = p.name || p.business_name || state.businessName;
          state.applyToPortfolio =
            p.flipbook_portfolio_enabled !== undefined
              ? Boolean(p.flipbook_portfolio_enabled)
              : p.apply_to_portfolio !== undefined
              ? Boolean(p.apply_to_portfolio)
              : state.applyToPortfolio;
          state.logo = p.logo_url || p.logo || state.logo;
        }
      })
      .addCase(fetchFlipbookSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // updateFlipbookSettings
    builder
      .addCase(updateFlipbookSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateFlipbookSettings.fulfilled, (state, action) => {
        state.loading = false;
        const p = action.payload;
        if (p) {
          state.businessName = p.name || p.business_name || state.businessName;
          state.applyToPortfolio =
            p.flipbook_portfolio_enabled !== undefined
              ? Boolean(p.flipbook_portfolio_enabled)
              : state.applyToPortfolio;
        }
      })
      .addCase(updateFlipbookSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // uploadFlipbookLogoFile
    builder
      .addCase(uploadFlipbookLogoFile.pending, (state) => {
        state.logoLoading = true;
        state.error = null;
      })
      .addCase(uploadFlipbookLogoFile.fulfilled, (state, action) => {
        state.logoLoading = false;
        // Accept common response shapes: logo_url, logo, url, path
        const p = action.payload;
        state.logo =
          p?.logo_url || p?.logo || p?.url || p?.path || state.logo;
      })
      .addCase(uploadFlipbookLogoFile.rejected, (state, action) => {
        state.logoLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setFlipbookState, clearFlipbookError } = flipbookSlice.actions;
export default flipbookSlice.reducer;
