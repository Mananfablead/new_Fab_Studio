import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/services/api';

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'photo' | 'invite' | 'payment' | 'system';
}

interface NotificationsState {
  notifications: Notification[];
  unreadNotifications: Notification[];
  loading: boolean;
  unreadLoading: boolean;
  deleteLoading: boolean;
  deletingId: string | null;
  markingReadId: string | null;
  markingAllRead: boolean;
  error: string | null;
  unreadCount: number;
}

const initialState: NotificationsState = {
  notifications: [],
  unreadNotifications: [],
  loading: false,
  unreadLoading: false,
  deleteLoading: false,
  deletingId: null,
  markingReadId: null,
  markingAllRead: false,
  error: null,
  unreadCount: 0,
};

// ─── Async Thunks ────────────────────────────────────────────────────────────

// Maps a raw API notification item to the Notification interface.
// The API returns `data` as a JSON string with fields: title, body, type, extra.
function mapApiNotification(raw: any): Notification {
  let parsed: any = {};
  if (typeof raw.data === 'string') {
    try {
      parsed = JSON.parse(raw.data);
    } catch {
      parsed = {};
    }
  } else if (typeof raw.data === 'object' && raw.data !== null) {
    parsed = raw.data;
  }

  const typeMap: Record<string, Notification['type']> = {
    photo: 'photo',
    invite: 'invite',
    payment: 'payment',
    system: 'system',
    info: 'system',
    warning: 'system',
    error: 'system',
  };

  return {
    id: raw.id,
    title: parsed.title ?? raw.title ?? '',
    message: parsed.body ?? parsed.message ?? raw.message ?? '',
    time: raw.created_at
      ? new Date(raw.created_at).toLocaleString()
      : '',
    read: raw.read_at !== null && raw.read_at !== undefined,
    type: typeMap[parsed.type ?? raw.type] ?? 'system',
  };
}

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchAll',
  async (
    params?: { page?: number; limit?: number; filter?: string; type?: string },
    { rejectWithValue }: any = {}
  ) => {
    try {
      const { data } = await api.get('/notifications', { params });
      // Handle both array response and object with notifications key
      if (Array.isArray(data)) {
        const notifications = data.map(mapApiNotification);
        const unreadCount = notifications.filter((n) => !n.read).length;
        return { notifications, unreadCount };
      }
      if (data?.data && Array.isArray(data.data)) {
        const notifications = data.data.map(mapApiNotification);
        const unreadCount = data.unreadCount ?? notifications.filter((n) => !n.read).length;
        return { notifications, unreadCount };
      }
      return data as { notifications: Notification[]; unreadCount: number };
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error?.message ?? err.response?.data?.message ?? 'Failed to fetch notifications'
      );
    }
  }
);

export const fetchUnreadNotifications = createAsyncThunk(
  'notifications/fetchUnread',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/notifications/unread');
      // Handle both array and object response shapes
      if (Array.isArray(data)) {
        return data.map(mapApiNotification);
      }
      if (data?.data && Array.isArray(data.data)) {
        return data.data.map(mapApiNotification);
      }
      if (data?.notifications && Array.isArray(data.notifications)) {
        return data.notifications.map(mapApiNotification);
      }
      return [] as Notification[];
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error?.message ?? err.response?.data?.message ?? 'Failed to fetch unread notifications'
      );
    }
  }
);

export const markNotificationRead = createAsyncThunk(
  'notifications/markRead',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      await api.post(`/notifications/${notificationId}/read`);
      return notificationId;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error?.message ?? err.response?.data?.message ?? 'Failed to mark notification as read'
      );
    }
  }
);

export const markAllNotificationsRead = createAsyncThunk(
  'notifications/markAllRead',
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/notifications/read-all');
      return true;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error?.message ?? err.response?.data?.message ?? 'Failed to mark all notifications as read'
      );
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/delete',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      return notificationId;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error?.message);
    }
  }
);

export const clearAllNotifications = createAsyncThunk(
  'notifications/clearAll',
  async (_, { rejectWithValue }) => {
    try {
      await api.delete('/notifications');
      return true;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error?.message);
    }
  }
);

// ─── Slice ───────────────────────────────────────────────────────────────────

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearNotificationsError(state) {
      state.error = null;
    },
    // Mock data ke liye
    setNotificationsFromMock(state, action) {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter((n: Notification) => !n.read).length;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    // fetchNotifications
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.notifications;
        state.unreadCount = action.payload.unreadCount;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // fetchUnreadNotifications
    builder
      .addCase(fetchUnreadNotifications.pending, (state) => {
        state.unreadLoading = true;
        state.error = null;
      })
      .addCase(fetchUnreadNotifications.fulfilled, (state, action) => {
        state.unreadLoading = false;
        state.unreadNotifications = action.payload;
        state.unreadCount = action.payload.length;
      })
      .addCase(fetchUnreadNotifications.rejected, (state, action) => {
        state.unreadLoading = false;
        state.error = action.payload as string;
      });

    // markNotificationRead
    builder
      .addCase(markNotificationRead.pending, (state, action) => {
        state.markingReadId = action.meta.arg;
        state.error = null;
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        state.markingReadId = null;
        // Update in notifications list
        const notif = state.notifications.find((n) => n.id === action.payload);
        if (notif && !notif.read) {
          notif.read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        // Remove from unread list
        state.unreadNotifications = state.unreadNotifications.filter(
          (n) => n.id !== action.payload
        );
      })
      .addCase(markNotificationRead.rejected, (state, action) => {
        state.markingReadId = null;
        state.error = action.payload as string;
      });

    // markAllNotificationsRead
    builder
      .addCase(markAllNotificationsRead.pending, (state) => {
        state.markingAllRead = true;
        state.error = null;
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.markingAllRead = false;
        state.notifications.forEach((n) => (n.read = true));
        state.unreadNotifications = [];
        state.unreadCount = 0;
      })
      .addCase(markAllNotificationsRead.rejected, (state, action) => {
        state.markingAllRead = false;
        state.error = action.payload as string;
      });

    // deleteNotification
    builder
      .addCase(deleteNotification.pending, (state, action) => {
        state.deleteLoading = true;
        state.deletingId = action.meta.arg;
        state.error = null;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.deletingId = null;
        // Remove from both lists
        const wasUnread = state.notifications.find((n) => n.id === action.payload && !n.read);
        if (wasUnread) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications = state.notifications.filter((n) => n.id !== action.payload);
        state.unreadNotifications = state.unreadNotifications.filter((n) => n.id !== action.payload);
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deletingId = null;
        state.error = action.payload as string;
      });

    // clearAllNotifications
    builder.addCase(clearAllNotifications.fulfilled, (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    });
  },
});

export const { clearNotificationsError, setNotificationsFromMock } =
  notificationsSlice.actions;
export default notificationsSlice.reducer;
