import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authReducer from './slices/authSlice';
import groupsReducer from './slices/groupsSlice';
import photosReducer from './slices/photosSlice';
import notificationsReducer from './slices/notificationsSlice';
import walletReducer from './slices/walletSlice';
import uiReducer from './slices/uiSlice';
import participantsReducer from './slices/participantsSlice';
import teamReducer from './slices/teamSlice';
import watermarkReducer from './slices/watermarkSlice';
import businessReducer from './slices/businessSlice';
import flipbookReducer from './slices/flipbookSlice';
import portfolioReducer from './slices/portfolioSlice';
import plansReducer from './slices/plansSlice';
import contactReducer from './slices/contactSlice';
import supportTicketReducer from './slices/supportTicketSlice';
import videosReducer from './slices/videosSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    groups: groupsReducer,
    photos: photosReducer,
    notifications: notificationsReducer,
    wallet: walletReducer,
    ui: uiReducer,
    participants: participantsReducer,
    team: teamReducer,
    watermark: watermarkReducer,
    business: businessReducer,
    flipbook: flipbookReducer,
    portfolio: portfolioReducer,
    plans: plansReducer,
    contact: contactReducer,
    supportTicket: supportTicketReducer,
    videos: videosReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'photos/upload/pending',
          'videos/upload/pending',
          'business/uploadLogo/pending',
          'flipbook/uploadLogo/pending',
        ],
        ignoredPaths: [],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks - inhe useDispatch/useSelector ki jagah use karo
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
