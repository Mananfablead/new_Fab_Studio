import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/services/api';

export interface BusinessSettingsState {
  businessName: string;
  applyToPortfolio: boolean;
  logo: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: BusinessSettingsState = {
  businessName: '',
  applyToPortfolio: true,
  logo: null,
  loading: false,
  error: null,
};

export const fetchBusinessSettings = createAsyncThunk(
  'business/fetchSettings',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/business/settings');
      return data.data || data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to fetch business settings'
      );
    }
  }
);

export const updateBusinessSettings = createAsyncThunk(
  'business/updateSettings',
  async (payload: { name: string; flipbook_portfolio_enabled: boolean }, { rejectWithValue }) => {
    try {
      // Send both variations just in case
      const body = {
        ...payload,
        business_name: payload.name,
      };
      const { data } = await api.put('/business/settings', body);
      return data.data || data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to update business settings'
      );
    }
  }
);

export const uploadFlipbookLogo = createAsyncThunk(
  'business/uploadLogo',
  async (file: File | string, { rejectWithValue }) => {
    try {
      let logoData: string;

      if (file instanceof File) {
        // Convert File to Base64 string
        logoData = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      } else {
        logoData = file;
      }

      // If the backend says "must be a string", we send as JSON or simple string parameter
      const { data } = await api.post('/business/flipbook-logo', { logo: logoData });
      return data.data || data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to upload flipbook logo'
      );
    }
  }
);

const businessSlice = createSlice({
  name: 'business',
  initialState,
  reducers: {
    setBusinessState(state, action: PayloadAction<Partial<BusinessSettingsState>>) {
      return { ...state, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBusinessSettings.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBusinessSettings.fulfilled, (state, action) => {
        state.loading = false;
        const p = action.payload?.settings || action.payload?.data || action.payload;
        if (p) {
          state.businessName = p.name || p.business_name || state.businessName;
          state.applyToPortfolio = p.flipbook_portfolio_enabled !== undefined
            ? Boolean(p.flipbook_portfolio_enabled)
            : p.apply_to_portfolio !== undefined
              ? Boolean(p.apply_to_portfolio)
              : state.applyToPortfolio;
          state.logo = p.logo_url || p.logo || state.logo;
        }
      })
      .addCase(fetchBusinessSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateBusinessSettings.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateBusinessSettings.fulfilled, (state, action) => {
        state.loading = false;
        const p = action.payload;
        state.businessName = p.name || state.businessName;
        state.applyToPortfolio = p.flipbook_portfolio_enabled !== undefined ? Boolean(p.flipbook_portfolio_enabled) : state.applyToPortfolio;
      })
      .addCase(updateBusinessSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(uploadFlipbookLogo.pending, (state) => {
        state.loading = true;
      })
      .addCase(uploadFlipbookLogo.fulfilled, (state, action) => {
        state.loading = false;
        state.logo = action.payload.logo_url || action.payload.logo || state.logo;
      })
      .addCase(uploadFlipbookLogo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setBusinessState } = businessSlice.actions;
export default businessSlice.reducer;
