import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/services/api';
import type { UserProfileResponse } from '@/types/userProfile';

export type UserRole = 'admin' | 'photographer' | 'user';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: UserRole;
  facialRecognitionRegistered?: boolean;
  /** Storage consumed by the user in bytes (from API: storage_used, storage_used_bytes, etc.) */
  storage_used_bytes?: number;
  faceRegistered?: boolean;
  selfieUrl?: string;
    business?: {
      businessName: string;
      businessPhone: string;
      businessEmail: string;
      businessWebsite: string;
      socialLinks: {
        instagram?: string;
        facebook?: string;
        twitter?: string;
        youtube?: string;
        vimeo?: string;
        whatsapp?: string;
      };
      showBusinessInfo: boolean;
      whatsappNumber?: string;
      logo?: string;
      // Legacy support
      name?: string;
      phone?: string;
      email?: string;
      website?: string;
    };
}

export interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'photographer' | 'user';
  otp: string;
  avatar?: string;
  user_id?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  otpLoading: boolean;
  error: string | null;
  otpSent: boolean;
  otpUserId: string | null;
  isVerified: boolean | null;
  isPasswordSet: boolean | null;
  forgotPasswordLoading: boolean;
  forgotPasswordSuccess: boolean;
}

// ─── Slice ───────────────────────────────────────────────────────────────────

const savedUser = localStorage.getItem("fabPhotoUser");
const savedToken = localStorage.getItem("fabPhotoToken");

const initialState: AuthState = {
  user: savedUser ? JSON.parse(savedUser) : null,
  token: savedToken || null,
  isAuthenticated: !!(savedUser && savedToken),
  loading: false,
  otpLoading: false,
  error: null,
  otpSent: false,
  otpUserId: null,
  isVerified: null,
  isPasswordSet: null,
  forgotPasswordLoading: false,
  forgotPasswordSuccess: false,
};

// ─── Async Thunks ────────────────────────────────────────────────────────────

// Parse backend validation errors into a single English string
function parseApiError(err: any, fallback: string): string {
  const res = err.response?.data;
  if (res?.errors) {
    // Laravel-style: { errors: { field: ["msg", ...] } }
    const allMessages: string[] = [];
    for (const field of Object.keys(res.errors)) {
      const msgs = res.errors[field];
      if (Array.isArray(msgs)) allMessages.push(...msgs);
    }
    if (allMessages.length > 0) return allMessages.join(" ");
  }
  return res?.message || fallback;
}

function mapUser(user: any, currentUser?: any): any {
  if (!user) return null;
  const firstName = user.firstName || user.first_name || user.name?.split(' ')[0] || currentUser?.firstName || '';
  const lastName = user.lastName || user.last_name || user.name?.split(' ').slice(1).join(' ') || currentUser?.lastName || '';
  const name = user.name || `${firstName} ${lastName}`.trim() || currentUser?.name || '';
  const avatar = user.avatar || user.avatar_url || user.profile_image || user.profile_picture || currentUser?.avatar || '';
  
  // Normalise storage_used_bytes from various API field names
  const storage_used_bytes =
    user.storage_used_bytes ??
    user.storage_used ??
    user.used_storage_bytes ??
    user.used_storage ??
    currentUser?.storage_used_bytes ??
    undefined;

  const res = {
    ...currentUser,
    ...user,
    firstName,
    lastName,
    name,
    avatar,
    storage_used_bytes,
    business: user.business || user.business_info || user.business_details || currentUser?.business || undefined,
  };
  
  if (res.business) {
    const b = res.business;
    b.businessName = b.business_name || b.name || currentUser?.business?.businessName || '';
    b.businessPhone = b.business_phone || b.phone || currentUser?.business?.businessPhone || '';
    b.businessEmail = b.business_email || b.email || currentUser?.business?.businessEmail || '';
    b.businessWebsite = b.business_website || b.website || currentUser?.business?.businessWebsite || '';
    b.whatsappNumber = b.whatsapp_number || b.whatsapp || currentUser?.business?.whatsappNumber || '';
    b.showBusinessInfo = b.show_in_gallery ?? b.showInfo ?? currentUser?.business?.showBusinessInfo ?? true;
    
    b.logo = b.logo || b.logo_url || b.business_logo || currentUser?.business?.logo || '';
    
    // Normalize socialLinks when backend returns an array
    if (Array.isArray(b.socialLinks)) {
      const normalized: Record<string, string> = {};
      b.socialLinks.forEach((link: any) => {
        const platform = String(link.platform || link.name || '').trim().toLowerCase();
        const url = String(link.url || link.value || link.link || '').trim();
        if (!platform || !url) return;
        normalized[platform] = url;
      });
      b.socialLinks = normalized;
    }

    if (!b.socialLinks) {
      b.socialLinks = {};
    }
  }
  
  return res;
}

export const sendOtp = createAsyncThunk(
  "auth/sendOtp",
  async (payload: { email?: string; phone?: string; fcm_token?: string; type?: 1 | 2 }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/auth/send-otp", payload);
      return data as {
        success: boolean;
        message: string;
        user_id?: string;
        userId?: string;
        is_verified?: number | string;
        data?: {
          user_id?: string;
          userId?: string;
          is_verified?: number | string;
        };
      };
    } catch (err: any) {
      return rejectWithValue(
        parseApiError(err, "Failed to send OTP. Please try again."),
      );
    }
  },
);

export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async (
    _payload: { email?: string; phone?: string; otp: string; user_id?: string },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await api.post("/auth/verify-otp", _payload);
      return data as { token: string; user: User };
    } catch (err: any) {
      return rejectWithValue(
        parseApiError(err, "Invalid OTP. Please try again."),
      );
    }
  },
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async (payload: SignupData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("firstName", payload.firstName);
      formData.append("lastName", payload.lastName);
      formData.append("email", payload.email);
      formData.append("phone", payload.phone);
      formData.append("role", payload.role);
      formData.append("is_platform", "web");
      formData.append("otp", payload.otp);
      if (payload.user_id) formData.append("user_id", payload.user_id);

      if (payload.avatar) {
        const res = await fetch(payload.avatar);
        const blob = await res.blob();
        const file = new File([blob], "avatar.jpg", {
          type: blob.type || "image/jpeg",
        });
        formData.append("avatar", file);
      }

      const { data } = await api.post("/auth/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data as { token: string; user: User };
    } catch (err: any) {
      return rejectWithValue(
        parseApiError(err, "Registration failed. Please try again."),
      );
    }
  },
);

export const registerFace = createAsyncThunk(
  "auth/registerFace",
  async (payload: { selfie: File }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("selfie", payload.selfie);
      
      const { data } = await api.post("/auth/register-face", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    } catch (err: any) {
      return rejectWithValue(
        parseApiError(err, "Failed to register face. Please try again."),
      );
    }
  },
);

export const checkFaceStatus = createAsyncThunk(
  "auth/checkFaceStatus",
  async (_, { rejectWithValue, getState }) => {
    try {
      // Fallback: read token directly from state in case the interceptor hasn't picked it up yet
      const state = getState() as { auth: { token: string | null } };
      const token = state.auth.token || localStorage.getItem("fabPhotoToken");

      const { data } = await api.get("/face/status", {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      return data as {
        success: boolean;
        registered: boolean;
        selfie_url?: string;
        selfie_url_new?: string;
      };
    } catch (err: any) {
      // Non-blocking: silently fail so it doesn't interrupt the login/register flow
      return rejectWithValue(parseApiError(err, "Failed to check face status."));
    }
  },
);

export const fetchUserProfile = createAsyncThunk(
  "auth/fetchProfile",
  async (userId: string, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/users/${userId}`);
      return data as User;
    } catch (err: any) {
      return rejectWithValue(parseApiError(err, "Failed to load profile."));
    }
  },
);

export const fetchUserFullProfile = createAsyncThunk(
  "auth/fetchFullProfile",
  async (userId: string, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/users/${userId}/profile`);
      return data as UserProfileResponse;
    } catch (err: any) {
      return rejectWithValue(parseApiError(err, "Failed to load full profile."));
    }
  },
);

export const updateUserProfile = createAsyncThunk(
  "auth/updateProfile",
  async (
    { userId, payload }: { userId: string; payload: Partial<User> | FormData },
    { rejectWithValue },
  ) => {
    try {
      const isFormData = payload instanceof FormData;
      let response;
      
      if (isFormData) {
        // Many backends (like Laravel) don't support PUT with multipart/form-data.
        // The workaround is to use POST and add a _method field.
        payload.append('_method', 'PUT');
        response = await api.post(`/users/${userId}/profile`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        response = await api.put(`/users/${userId}/profile`, payload);
      }
      
      return response.data as User;
    } catch (err: any) {
      return rejectWithValue(parseApiError(err, "Failed to update profile."));
    }
  },
);

export const loginWithPassword = createAsyncThunk(
  "auth/loginWithPassword",
  async (
    payload: { email?: string; phone?: string; password?: string; otp?: string | number; type: 1 | 2 },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await api.post("/auth/login", payload);
      return data as { token: string; user: User };
    } catch (err: any) {
      return rejectWithValue(
        parseApiError(err, "Invalid credentials. Please try again."),
      );
    }
  },
);

export const checkPassword = createAsyncThunk(
  "auth/checkPassword",
  async (user_id: string, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/auth/check-password", { user_id });
      return data as {
        success: boolean;
        message: string;
        is_password_exists: boolean;
      };
    } catch (err: any) {
      return rejectWithValue(parseApiError(err, "Failed to check password."));
    }
  },
);

export const setPassword = createAsyncThunk(
  "auth/setPassword",
  async (
    payload: { user_id: string; password: string; confirm_password: string; token?: string },
    { rejectWithValue }
  ) => {
    try {
      console.log('API call to /auth/set-password with payload:', payload);
      const { data } = await api.post("/auth/set-password", payload);
      console.log('API response:', data);
      return data;
    } catch (err: any) {
      console.error('API error:', err);
      return rejectWithValue(parseApiError(err, "Failed to set password."));
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (
    payload: { user_id: string; password: string; confirm_password: string; token?: string },
    { rejectWithValue }
  ) => {
    try {
      console.log('API call to /auth/reset-password with payload:', payload);
      const { data } = await api.post("/auth/reset-password", payload);
      console.log('API response:', data);
      return data;
    } catch (err: any) {
      console.error('API error:', err);
      return rejectWithValue(parseApiError(err, "Failed to reset password."));
    }
  }
);

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (
    payload: { current_password: string; new_password: string; confirm_password: string },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await api.post("/auth/change-password", payload);
      return data as { success: boolean; message: string };
    } catch (err: any) {
      return rejectWithValue(parseApiError(err, "Failed to change password."));
    }
  },
);

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (
    payload: { email?: string; phone?: string },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await api.post("/auth/forget-password", {
        ...payload,
        role: "other",
      });
      return data as { success: boolean; message: string; email?: string; role?: string };
    } catch (err: any) {
      return rejectWithValue(parseApiError(err, "Failed to send reset link. Please try again."));
    }
  },
);

// ─── Async Thunk for Logout ──────────────────────────────────────────────────

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await api.post("/auth/logout");
      return { success: true };
    } catch (err: any) {
      // Even if API call fails, we still want to clear local state
      return { success: false };
    }
  },
);

// ─── Slice ───────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.otpUserId = null;
      state.isVerified = null;
      localStorage.removeItem("fabPhotoToken");
      localStorage.removeItem("fabPhotoUser");
    },
    clearError(state) {
      state.error = null;
      state.forgotPasswordSuccess = false;
    },
    resetOtpSent(state) {
      state.otpSent = false;
    },
    // Offline/mock login ke liye (jab backend ready na ho)
    setUserFromLocal(
      state,
      action: PayloadAction<{ user: User; token: string }>,
    ) {
      state.user = mapUser(action.payload.user);
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    updateAvatar(state, action: PayloadAction<string>) {
      if (state.user) {
        state.user.avatar = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    // sendOtp
    builder
      .addCase(sendOtp.pending, (state) => {
        state.otpLoading = true;
        state.error = null;
      })
      .addCase(sendOtp.fulfilled, (state, action) => {
        state.otpLoading = false;
        state.otpSent = true;
        // Store user_id from send-otp response — handle multiple possible field names
        const payload = action.payload;
        const userId =
          payload?.user_id ??
          payload?.userId ??
          payload?.data?.user_id ??
          payload?.data?.userId;
        if (userId) {
          state.otpUserId = String(userId);
        }
        // Store is_verified status
        const isVerified = payload?.is_verified ?? payload?.data?.is_verified;
        if (isVerified !== undefined) {
          state.isVerified = isVerified === 1 || isVerified === "1";
        }
      })
      .addCase(sendOtp.rejected, (state, action) => {
        state.otpLoading = false;
        state.error = action.payload as string;
      });

    // verifyOtp
    builder
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        state.user = mapUser(payload.user || payload.data || payload, state.user);
        state.token = payload.token || payload.data?.token || payload.user?.token || payload.data?.user?.token || payload.accessToken || payload.access_token || payload.data?.accessToken || payload.data?.access_token;
        if (state.token) {
          state.isAuthenticated = true;
          localStorage.setItem("fabPhotoToken", state.token);
        }
        if (state.user) localStorage.setItem("fabPhotoUser", JSON.stringify(state.user));
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // registerUser
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        state.user = mapUser(payload.user || payload.data || payload, state.user);
        state.token = payload.token || payload.data?.token || payload.user?.token || payload.data?.user?.token || payload.accessToken || payload.access_token || payload.data?.accessToken || payload.data?.access_token;
        state.isAuthenticated = true;
        if (state.token) localStorage.setItem("fabPhotoToken", state.token);
        if (state.user) localStorage.setItem("fabPhotoUser", JSON.stringify(state.user));
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // fetchUserProfile
    builder.addCase(fetchUserProfile.fulfilled, (state, action) => {
      state.user = action.payload;
    });

    // fetchUserFullProfile
    builder
      .addCase(fetchUserFullProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserFullProfile.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        state.user = mapUser(payload.user || payload.data || payload, state.user);
        if (state.user) localStorage.setItem("fabPhotoUser", JSON.stringify(state.user));
      })
      .addCase(fetchUserFullProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // updateUserProfile
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        state.user = mapUser(payload.user || payload.data || payload, state.user);
        if (state.user) localStorage.setItem("fabPhotoUser", JSON.stringify(state.user));
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // loginWithPassword
    builder
      .addCase(loginWithPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithPassword.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        state.user = mapUser(payload.user || payload.data || payload, state.user);
        state.token = payload.token || payload.data?.token || payload.user?.token || payload.data?.user?.token || payload.accessToken || payload.access_token || payload.data?.accessToken || payload.data?.access_token;
        state.isAuthenticated = true;
        if (state.token) localStorage.setItem("fabPhotoToken", state.token);
        else if (payload.user?.token) localStorage.setItem("fabPhotoToken", payload.user.token);
        if (state.user) localStorage.setItem("fabPhotoUser", JSON.stringify(state.user));
      })
      .addCase(loginWithPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // checkPassword
    builder.addCase(checkPassword.fulfilled, (state, action) => {
      state.isPasswordSet = action.payload.is_password_exists;
    });

    // setPassword
    builder.addCase(setPassword.fulfilled, (state) => {
      state.isPasswordSet = true;
    });

    // forgotPassword
    builder
      .addCase(forgotPassword.pending, (state) => {
        state.forgotPasswordLoading = true;
        state.error = null;
        state.forgotPasswordSuccess = false;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.forgotPasswordLoading = false;
        state.forgotPasswordSuccess = true;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.forgotPasswordLoading = false;
        state.error = action.payload as string;
      });

    // logoutUser
    builder
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
        state.otpUserId = null;
        state.isVerified = null;
        localStorage.removeItem("fabPhotoToken");
        localStorage.removeItem("fabPhotoUser");
      })
      .addCase(logoutUser.rejected, (state) => {
        state.loading = false;
        // Clear state even if API call fails
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
        state.otpUserId = null;
        state.isVerified = null;
        localStorage.removeItem("fabPhotoToken");
        localStorage.removeItem("fabPhotoUser");
      });

    // checkFaceStatus
    builder.addCase(checkFaceStatus.fulfilled, (state, action) => {
      if (state.user) {
        state.user.faceRegistered = action.payload.registered;
        state.user.selfieUrl = action.payload.selfie_url_new || action.payload.selfie_url;
        state.user.facialRecognitionRegistered = action.payload.registered;
        localStorage.setItem("fabPhotoUser", JSON.stringify(state.user));
      }
    });
  },
});

export const { logout, clearError, resetOtpSent, setUserFromLocal, updateAvatar } = authSlice.actions;
export default authSlice.reducer;
