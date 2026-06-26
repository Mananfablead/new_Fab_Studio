import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/services/api';

export interface WatermarkSettingsState {
  enabled: boolean;
  type: 'image' | 'text';
  image: string | null;
  text: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  opacity: number;
  scale: number;
  isTiled: boolean;
  imageFile: File | null;
  loading: boolean;
  error: string | null;
}

const initialState: WatermarkSettingsState = {
  enabled: false,
  type: 'image',
  image: null,
  text: '© PhotoFab Studio',
  position: 'bottom-right',
  opacity: 50,
  scale: 20,
  isTiled: false,
  imageFile: null,
  loading: false,
  error: null,
};

export const fetchWatermarkSettings = createAsyncThunk(
  'watermark/fetchSettings',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/watermark/settings');
      return data.data || data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.response?.data?.error?.message || 'Failed to fetch watermark settings'
      );
    }
  }
);

export const updateWatermarkSettings = createAsyncThunk(
  'watermark/updateSettings',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = (getState() as any).watermark;
      const formData = new FormData();
      const isEnabled = !!(state.image || state.imageFile);
      formData.append('enabled', isEnabled ? '1' : '0');
      formData.append('type', 'image');
      formData.append('text', state.text || '');
      formData.append('position', state.position);
      formData.append('opacity', String(state.opacity));
      formData.append('scale', String(state.scale));
      formData.append('isTiled', state.isTiled ? '1' : '0');

      // If image is a File object (added later or handled via uploadWatermarkImage)
      // but for settings update, usually we send the path. 
      // If the backend expects the file here:
      if (state.imageFile) {
        formData.append('watermark', state.imageFile);
      } else if (state.image && !state.image.startsWith('data:')) {
        formData.append('watermark', state.image);
      }

      // Many backends don't support PUT with FormData/Multipart. 
      // Using POST with _method=PUT as a safer alternative.
      formData.append('_method', 'post');
      const { data } = await api.post('/watermark', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // The API returns { success: true, settings: { ... } }
      return data.settings || data.data || data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.response?.data?.error?.message || 'Failed to update watermark settings'
      );
    }
  }
);

export const uploadWatermarkImage = createAsyncThunk(
  'watermark/uploadImage',
  async (file: File, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('watermark', file);
      const { data } = await api.post('/watermark/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data.data || data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.response?.data?.error?.message || 'Failed to upload watermark logo'
      );
    }
  }
);

const watermarkSlice = createSlice({
  name: 'watermark',
  initialState,
  reducers: {
    setWatermarkState(state, action: PayloadAction<Partial<WatermarkSettingsState>>) {
      return { ...state, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWatermarkSettings.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWatermarkSettings.fulfilled, (state, action) => {
        state.loading = false;
        const p = action.payload?.settings || action.payload?.data || action.payload;
        if (p) {
          state.enabled = p.enabled !== undefined ? Boolean(p.enabled) : state.enabled;
          state.type = p.type || state.type;
          state.image = p.image_url || p.image || state.image;
          state.text = p.text || state.text;
          state.position = p.position || state.position;
          state.opacity = p.opacity !== undefined ? Number(p.opacity) : state.opacity;
          state.scale = p.scale !== undefined ? Number(p.scale) : state.scale;
          state.isTiled = p.isTiled !== undefined || p.is_tiled !== undefined
            ? Boolean(p.isTiled ?? p.is_tiled)
            : state.isTiled;
        }
      })
      .addCase(fetchWatermarkSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateWatermarkSettings.fulfilled, (state, action) => {
        state.loading = false;
        const p = action.payload?.settings || action.payload?.data || action.payload;
        if (p) {
          state.enabled = p.enabled !== undefined ? Boolean(p.enabled) : state.enabled;
          state.type = p.type || state.type;
          state.image = p.image_url || p.image || state.image;
          state.text = p.text || state.text;
          state.position = p.position || state.position;
          state.opacity = p.opacity !== undefined ? Number(p.opacity) : state.opacity;
          state.scale = p.scale !== undefined ? Number(p.scale) : state.scale;
          state.isTiled = p.isTiled !== undefined || p.is_tiled !== undefined
            ? Boolean(p.isTiled ?? p.is_tiled)
            : state.isTiled;
        }
      })
      .addCase(uploadWatermarkImage.fulfilled, (state, action) => {
        if (action.payload && action.payload.image) {
          state.image = action.payload.image;
        }
      });
  },
});

export const { setWatermarkState } = watermarkSlice.actions;
export default watermarkSlice.reducer;
