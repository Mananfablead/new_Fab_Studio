import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/services/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PortfolioService {
  id?: string | number;
  title: string;
  enabled: boolean;
  pricing: string;
  currency: string;
  icon?: File | null;
  iconUrl?: string | null;
  sortOrder?: number;
}

export interface PortfolioState {
  slug: string | null;
  websiteUrl: string;
  about: string;
  coverImage: string | null;   // URL returned from server
  photos: string[];
  services: PortfolioService[];
  loading: boolean;
  uploadLoading: boolean;
  serviceLoading: boolean;
  error: string | null;
  name?: string;
  phone?: string;
  socialLinks?: { platform: string; url: string }[];
}

const initialState: PortfolioState = {
  slug: null,
  websiteUrl: '',
  about: '',
  coverImage: null,
  photos: [],
  services: [],
  loading: false,
  uploadLoading: false,
  serviceLoading: false,
  error: null,
  name: '',
  phone: '',
  socialLinks: [],
};

function normalizeService(raw: any, fallback?: Partial<PortfolioService>): PortfolioService {
  return {
    id: raw?.id ?? fallback?.id,
    title: raw?.title ?? raw?.service_type ?? fallback?.title ?? '',
    enabled: raw?.isActive ?? raw?.is_active ?? raw?.enabled ?? fallback?.enabled ?? false,
    pricing: raw?.price != null ? String(raw.price) : raw?.pricing ?? fallback?.pricing ?? '',
    currency: raw?.currency ?? fallback?.currency ?? 'INR',
    iconUrl: raw?.iconUrl ?? raw?.icon_url ?? raw?.icon ?? fallback?.iconUrl ?? null,
    sortOrder: raw?.sortOrder ?? raw?.sort_order ?? fallback?.sortOrder,
  };
}

function upsertService(state: PortfolioState, service: PortfolioService) {
  const byIdIndex = service.id != null
    ? state.services.findIndex((existing) => String(existing.id) === String(service.id))
    : -1;
  const byTitleIndex = byIdIndex === -1
    ? state.services.findIndex(
        (existing) => existing.title.toLowerCase() === service.title.toLowerCase()
      )
    : -1;

  const index = byIdIndex !== -1 ? byIdIndex : byTitleIndex;
  if (index !== -1) {
    state.services[index] = service;
  } else {
    state.services.push(service);
  }
}

// ─── Async Thunks ─────────────────────────────────────────────────────────────

/** GET /v2/portfolio — fetch portfolio data */
export const fetchPortfolio = createAsyncThunk(
  'portfolio/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/v2/portfolio');
      return data.data || data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to fetch portfolio'
      );
    }
  }
);

/** PUT /v2/portfolio — update websiteUrl, about, coverImage, name, phone, and socialLinks */
export const updatePortfolio = createAsyncThunk(
  'portfolio/update',
  async (
    payload: {
      website_url: string;
      about: string;
      cover_image?: File | null;
      name?: string;
      phone?: string;
      socialLinks?: { platform: string; url: string }[];
    },
    { rejectWithValue }
  ) => {
    try {
      // Always use multipart/form-data so cover_image can be included
      const formData = new FormData();
      formData.append('websiteUrl', payload.website_url);
      formData.append('about', payload.about);
      if (payload.cover_image) {
        formData.append('coverImage', payload.cover_image);
      }
      if (payload.name !== undefined) {
        formData.append('name', payload.name);
      }
      if (payload.phone !== undefined) {
        formData.append('phone', payload.phone);
      }
      if (payload.socialLinks) {
        payload.socialLinks.forEach((link, i) => {
          formData.append(`socialLinks[${i}][platform]`, link.platform);
          formData.append(`socialLinks[${i}][url]`, link.url.trim());
        });
      }
      formData.append('_method', 'PUT');
      const response = await api.post('/v2/portfolio', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.data || response.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to update portfolio'
      );
    }
  }
);

/** POST /v2/portfolio/photos — upload portfolio images (multipart/form-data) */
export const uploadPortfolioPhotos = createAsyncThunk(
  'portfolio/uploadPhotos',
  async (files: File[], { rejectWithValue }) => {
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('photos[]', file));
      const { data } = await api.post('/v2/portfolio/photos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.data || data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to upload portfolio photos'
      );
    }
  }
);

/** POST /v2/portfolio/services — add a new service */
export const addPortfolioService = createAsyncThunk(
  'portfolio/addService',
  async (service: PortfolioService, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('title', service.title);
      formData.append('price', String(parseFloat(service.pricing) || 0));
      formData.append('isActive', service.enabled ? '1' : '0');
      formData.append('currency', service.currency || 'INR');
      if (service.icon) {
        formData.append('icon', service.icon);
      }
      if (service.sortOrder !== undefined) {
        formData.append('sortOrder', String(service.sortOrder));
      }

      const { data } = await api.post('/v2/portfolio/services', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.data || data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to add service'
      );
    }
  }
);

/** PUT /v2/portfolio/services/{serviceId} — update an existing service */
export const updatePortfolioService = createAsyncThunk(
  'portfolio/updateService',
  async (
    { serviceId, service }: { serviceId: string | number; service: PortfolioService },
    { rejectWithValue }
  ) => {
    try {
      const formData = new FormData();
      formData.append('title', service.title);
      formData.append('price', String(parseFloat(service.pricing) || 0));
      formData.append('isActive', service.enabled ? '1' : '0');
      formData.append('currency', service.currency || 'INR');
      if (service.icon) {
        formData.append('icon', service.icon);
      }
      if (service.sortOrder !== undefined) {
        formData.append('sortOrder', String(service.sortOrder));
      }

      // Note: Some APIs require POST with _method=PUT for multipart updates, 
      // but assuming standard PUT works or using api instance handles it.
      const { data } = await api.post(`/v2/portfolio/services/${serviceId}?_method=PUT`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.data || data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to update service'
      );
    }
  }
);

/** DELETE /v2/portfolio/services/{serviceId} — delete a service */
export const deletePortfolioService = createAsyncThunk(
  'portfolio/deleteService',
  async (serviceId: string | number, { rejectWithValue }) => {
    try {
      await api.delete(`/v2/portfolio/services/${serviceId}`);
      return serviceId;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to delete service'
      );
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    clearPortfolioError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ── fetchPortfolio ──────────────────────────────────────────────────────
    builder
      .addCase(fetchPortfolio.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPortfolio.fulfilled, (state, action) => {
        state.loading = false;
        // Response shape: { success: true, portfolio: { slug, websiteUrl, about, photos, services } }
        const p = action.payload?.portfolio ?? action.payload;
        state.slug       = p.slug ?? state.slug;
        state.websiteUrl = p.websiteUrl ?? p.website_url ?? state.websiteUrl;
        state.about      = p.about ?? state.about;
        state.coverImage = p.coverImage ?? p.cover_image ?? state.coverImage;
        state.name       = p.name ?? p.user?.name ?? state.name;
        state.phone      = p.phone ?? p.user?.phone ?? state.phone;
        if (p.socialLinks) {
          state.socialLinks = p.socialLinks;
        } else if (p.user?.business?.socialLinks) {
          const s = p.user.business.socialLinks;
          if (Array.isArray(s)) {
            state.socialLinks = s;
          } else if (s && typeof s === 'object') {
            state.socialLinks = Object.entries(s).map(([platform, url]) => ({ platform, url: String(url) })).filter(l => l.url);
          }
        }
        // Normalise photos → array of URL strings
        if (Array.isArray(p.photos)) {
          state.photos = p.photos.map((ph: any) => ph.imageUrl ?? ph.image_url ?? ph);
        }
        // Normalise services to internal shape
        if (Array.isArray(p.services)) {
          state.services = p.services.map((svc: any) => normalizeService(svc));
        }
      })
      .addCase(fetchPortfolio.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // ── updatePortfolio ─────────────────────────────────────────────────────
    builder
      .addCase(updatePortfolio.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePortfolio.fulfilled, (state, action) => {
        state.loading = false;
        const p = action.payload?.portfolio ?? action.payload;
        state.websiteUrl = p.websiteUrl ?? p.website_url ?? state.websiteUrl;
        state.about      = p.about ?? state.about;
        state.coverImage = p.coverImage ?? p.cover_image ?? state.coverImage;
        state.name       = p.name ?? state.name;
        state.phone      = p.phone ?? state.phone;
        if (p.socialLinks) {
          state.socialLinks = p.socialLinks;
        }
      })
      .addCase(updatePortfolio.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // ── uploadPortfolioPhotos ───────────────────────────────────────────────
    builder
      .addCase(uploadPortfolioPhotos.pending, (state) => {
        state.uploadLoading = true;
        state.error = null;
      })
      .addCase(uploadPortfolioPhotos.fulfilled, (state, action) => {
        state.uploadLoading = false;
        // Normalise the response — API returns objects like { imageUrl: "..." }
        // so extract the URL string the same way fetchPortfolio does
        const raw: any[] = action.payload?.photos ?? action.payload ?? [];
        const incoming: string[] = Array.isArray(raw)
          ? raw.map((ph: any) =>
              typeof ph === 'string' ? ph : ph.imageUrl ?? ph.image_url ?? ph.url ?? ''
            ).filter(Boolean)
          : [];
        state.photos = [...state.photos, ...incoming];
      })
      .addCase(uploadPortfolioPhotos.rejected, (state, action) => {
        state.uploadLoading = false;
        state.error = action.payload as string;
      });

    // ── addPortfolioService ─────────────────────────────────────────────────
    builder
      .addCase(addPortfolioService.pending, (state) => {
        state.serviceLoading = true;
        state.error = null;
      })
      .addCase(addPortfolioService.fulfilled, (state, action) => {
        state.serviceLoading = false;
        // Response shape: { service: { id, title, price, isActive, currency } }
        const raw = action.payload?.service ?? action.payload;
        const request = action.meta.arg;
        const newService = normalizeService(raw, request);
        upsertService(state, newService);
      })
      .addCase(addPortfolioService.rejected, (state, action) => {
        state.serviceLoading = false;
        state.error = action.payload as string;
      });

    // ── updatePortfolioService ──────────────────────────────────────────────
    builder
      .addCase(updatePortfolioService.pending, (state) => {
        state.serviceLoading = true;
        state.error = null;
      })
      .addCase(updatePortfolioService.fulfilled, (state, action) => {
        state.serviceLoading = false;
        // Response shape: { service: { id, title, price, isActive, currency } }
        const raw = action.payload?.service ?? action.payload;
        const request = action.meta.arg.service;
        const updated = normalizeService(raw, request);
        upsertService(state, updated);
      })
      .addCase(updatePortfolioService.rejected, (state, action) => {
        state.serviceLoading = false;
        state.error = action.payload as string;
      });
    
    // ── deletePortfolioService ──────────────────────────────────────────────
    builder
      .addCase(deletePortfolioService.pending, (state) => {
        state.serviceLoading = true;
        state.error = null;
      })
      .addCase(deletePortfolioService.fulfilled, (state, action) => {
        state.serviceLoading = false;
        const deletedId = action.payload;
        state.services = state.services.filter((s) => String(s.id) !== String(deletedId));
      })
      .addCase(deletePortfolioService.rejected, (state, action) => {
        state.serviceLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearPortfolioError } = portfolioSlice.actions;
export default portfolioSlice.reducer;
