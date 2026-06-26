import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Global UI state - modals, loading overlays, etc.
interface UiState {
  globalLoading: boolean;
  loadingMessage: string;
  // Modal visibility
  showCreateGroupModal: boolean;
  showJoinGroupModal: boolean;
  showStorageModal: boolean;
  showSubscriptionModal: boolean;
  // API mode: 'live' = real API, 'mock' = mock data
  apiMode: 'live' | 'mock';
}

const initialState: UiState = {
  globalLoading: false,
  loadingMessage: '',
  showCreateGroupModal: false,
  showJoinGroupModal: false,
  showStorageModal: false,
  showSubscriptionModal: false,
  // Backend ready na ho tab 'mock', ready ho tab 'live' karo
  apiMode: (import.meta.env.VITE_API_MODE as 'live' | 'mock') || 'mock',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setGlobalLoading(state, action: PayloadAction<{ loading: boolean; message?: string }>) {
      state.globalLoading = action.payload.loading;
      state.loadingMessage = action.payload.message || '';
    },
    openCreateGroupModal(state) {
      state.showCreateGroupModal = true;
    },
    closeCreateGroupModal(state) {
      state.showCreateGroupModal = false;
    },
    openJoinGroupModal(state) {
      state.showJoinGroupModal = true;
    },
    closeJoinGroupModal(state) {
      state.showJoinGroupModal = false;
    },
    openStorageModal(state) {
      state.showStorageModal = true;
    },
    closeStorageModal(state) {
      state.showStorageModal = false;
    },
    openSubscriptionModal(state) {
      state.showSubscriptionModal = true;
    },
    closeSubscriptionModal(state) {
      state.showSubscriptionModal = false;
    },
    setApiMode(state, action: PayloadAction<'live' | 'mock'>) {
      state.apiMode = action.payload;
    },
  },
});

export const {
  setGlobalLoading,
  openCreateGroupModal,
  closeCreateGroupModal,
  openJoinGroupModal,
  closeJoinGroupModal,
  openStorageModal,
  closeStorageModal,
  openSubscriptionModal,
  closeSubscriptionModal,
  setApiMode,
} = uiSlice.actions;
export default uiSlice.reducer;
