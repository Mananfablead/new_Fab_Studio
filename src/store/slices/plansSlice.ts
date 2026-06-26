import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/services/api';

export interface Plan {
  id: string | number;
  name: string;
  slug?: string;
  description?: string;
  price: string | number;
  currency?: string;
  period?: string;
  billing_cycle?: string;
  // API capability fields
  max_photos?: number;
  max_videos?: number;
  max_storage_bytes?: number;
  max_events?: number;
  max_team_members?: number;
  has_custom_watermark?: boolean;
  has_face_recognition?: boolean;
  // Legacy / generic
  features?: string[] | Record<string, any>;
  icon?: string;
  color?: string;
  is_active?: boolean;
  is_purchased?: boolean | number | string;
  is_popular?: boolean;
  // subscription status flags
  current?: boolean;
  is_current?: boolean;
  subscribed?: boolean;
}

export interface PlanInquiryPayload {
  plan_id: string | number;
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface UserPlanData {
  id: number;
  name: string;
  email: string;
  plan_id: number;
  is_plan_purchased: boolean;
  plan_starts_at: string | null;
  plan_expires_at: string;
  // Capability flags from backend
  has_custom_watermark?: boolean;
  has_face_recognition?: boolean;
  has_bulk_download?: boolean;
  has_business_branding?: boolean;
  has_digital_album?: boolean;
  has_portfolio_website?: boolean;
  has_switch_downloads?: boolean;
  has_team_login?: boolean;
  has_view_client_favorites?: boolean;
}

export interface UserDetailsResponse {
  success: boolean;
  data: {
    user: UserPlanData;
    plans: Plan[];
  };
}

interface PlansState {
  plans: Plan[];
  plansRole: string | null;
  activePlan: Plan | null;
  loading: boolean;
  selectingPlanId: string | number | null;
  error: string | null;
  inquiryLoading: boolean;
  inquiryError: string | null;
  inquirySuccess: boolean;
  // user-details data (shared, fetched once)
  userDetails: UserDetailsResponse | null;
  userDetailsLoading: boolean;
  userDetailsError: string | null;
  userDetailsFetched: boolean; // guard against duplicate fetches
}

const initialState: PlansState = {
  plans: [],
  plansRole: null,
  activePlan: null,
  loading: false,
  selectingPlanId: null,
  error: null,
  inquiryLoading: false,
  inquiryError: null,
  inquirySuccess: false,
  userDetails: null,
  userDetailsLoading: false,
  userDetailsError: null,
  userDetailsFetched: false,
};

function parseApiError(err: any, fallback: string): string {
  const res = err.response?.data;
  if (res?.errors) {
    const msgs: string[] = [];
    for (const field of Object.keys(res.errors)) {
      const m = res.errors[field];
      if (Array.isArray(m)) msgs.push(...m);
    }
    if (msgs.length) return msgs.join(' ');
  }
  return res?.message || fallback;
}

export const fetchPlans = createAsyncThunk(
  'plans/fetchPlans',
  async (role: string | undefined, { rejectWithValue }) => {
    try {
      // Build endpoint based on role
      let endpoint = '/plans';
      if (role === 'photographer') {
        endpoint = '/plans/photographer';
      } else if (role === 'user') {
        endpoint = '/plans/user';
      }
      const { data } = await api.get(endpoint);
      return data;
    } catch (err: any) {
      return rejectWithValue(parseApiError(err, 'Failed to load plans.'));
    }
  },
);

export const selectPlan = createAsyncThunk(
  'plans/selectPlan',
  async (planId: string | number, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/plans/${planId}/subscribe`);
      return { planId, data };
    } catch (err: any) {
      return rejectWithValue(parseApiError(err, 'Failed to select plan.'));
    }
  },
);

export const fetchUserDetails = createAsyncThunk(
  'plans/fetchUserDetails',
  async (userId: number, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/plans/user-details', { user_id: userId });
      return data as UserDetailsResponse;
    } catch (err: any) {
      return rejectWithValue(parseApiError(err, 'Failed to fetch user details.'));
    }
  },
  {
    // Only run if not already fetched or currently in-flight
    condition: (_userId, { getState }) => {
      const { plans } = getState() as { plans: PlansState };
      return !plans.userDetailsFetched && !plans.userDetailsLoading;
    },
  },
);

export const submitPlanInquiry = createAsyncThunk(
  'plans/submitPlanInquiry',
  async (payload: PlanInquiryPayload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/plan-inquiries', payload);
      return data;
    } catch (err: any) {
      return rejectWithValue(parseApiError(err, 'Failed to submit inquiry.'));
    }
  },
);

const plansSlice = createSlice({
  name: 'plans',
  initialState,
  reducers: {
    setActivePlan(state, action) {
      state.activePlan = action.payload;
    },
    resetInquiryState(state) {
      state.inquiryLoading = false;
      state.inquiryError = null;
      state.inquirySuccess = false;
    },
    resetUserDetails(state) {
      state.userDetails = null;
      state.userDetailsFetched = false;
      state.userDetailsError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlans.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        // Handle various response shapes: { data: [...] }, { plans: [...] }, or plain array
        const plans: Plan[] = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.plans)
          ? payload.plans
          : [];
        state.plans = plans;
        state.plansRole = action.meta.arg ?? null;

        // Detect active plan from the list (is_active flag or current flag)
        const active = plans.find(
          (p: any) => p.is_active || p.current || p.is_current || p.subscribed,
        );
        state.activePlan = active ?? null;
      })
      .addCase(fetchPlans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(selectPlan.pending, (state, action) => {
        state.selectingPlanId = action.meta.arg;
        state.error = null;
      })
      .addCase(selectPlan.fulfilled, (state, action) => {
        state.selectingPlanId = null;
        const { planId } = action.payload;
        const chosen = state.plans.find((p) => String(p.id) === String(planId));
        if (chosen) state.activePlan = chosen;
      })
      .addCase(selectPlan.rejected, (state, action) => {
        state.selectingPlanId = null;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchUserDetails.pending, (state) => {
        state.userDetailsLoading = true;
        state.userDetailsError = null;
      })
      .addCase(fetchUserDetails.fulfilled, (state, action) => {
        state.userDetailsLoading = false;
        state.userDetailsFetched = true;
        if (action.payload) {
          state.userDetails = action.payload;
        }
      })
      .addCase(fetchUserDetails.rejected, (state, action) => {
        state.userDetailsLoading = false;
        state.userDetailsFetched = true; // stop retrying on failure — prevents infinite loop
        state.userDetailsError = action.payload as string;
      });

    builder
      .addCase(submitPlanInquiry.pending, (state) => {
        state.inquiryLoading = true;
        state.inquiryError = null;
        state.inquirySuccess = false;
      })
      .addCase(submitPlanInquiry.fulfilled, (state) => {
        state.inquiryLoading = false;
        state.inquirySuccess = true;
      })
      .addCase(submitPlanInquiry.rejected, (state, action) => {
        state.inquiryLoading = false;
        state.inquiryError = action.payload as string;
      });

    // Reset user-details cache on logout so a new user gets fresh data
    builder.addMatcher(
      (action) => action.type === 'auth/logout' || action.type === 'auth/logout/fulfilled',
      (state) => {
        state.userDetails = null;
        state.userDetailsFetched = false;
        state.userDetailsError = null;
      },
    );
  },
});

export const { setActivePlan, resetInquiryState, resetUserDetails } = plansSlice.actions;
export default plansSlice.reducer;
