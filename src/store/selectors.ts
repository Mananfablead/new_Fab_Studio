import { RootState } from './index';

// ─── Auth Selectors ───────────────────────────────────────────────────────────
export const selectUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: RootState) => state.auth.loading;
export const selectOtpLoading = (state: RootState) => state.auth.otpLoading;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectOtpSent = (state: RootState) => state.auth.otpSent;
export const selectToken = (state: RootState) => state.auth.token;

// ─── Groups Selectors ─────────────────────────────────────────────────────────
export const selectGroups = (state: RootState) => state.groups.groups;
export const selectGroupsLoading = (state: RootState) => state.groups.loading;
export const selectGroupsError = (state: RootState) => state.groups.error;
export const selectCurrentGroup = (state: RootState) => state.groups.currentGroup;
export const selectCurrentGroupLoading = (state: RootState) => state.groups.currentGroupLoading;
export const selectGroupsTotal = (state: RootState) => state.groups.total;
export const selectInviteCode = (state: RootState) => state.groups.inviteCode;
export const selectInviteLink = (state: RootState) => state.groups.inviteLink;

export const selectGroupById = (groupId: string) => (state: RootState) =>
  state.groups.groups.find((g) => g.id === groupId);

// ─── Photos Selectors ─────────────────────────────────────────────────────────
export const selectPhotos = (state: RootState) => state.photos.photos;
export const selectPhotosLoading = (state: RootState) => state.photos.loading;
export const selectUploadLoading = (state: RootState) => state.photos.uploadLoading;
export const selectPhotosError = (state: RootState) => state.photos.error;
export const selectFavoritedPhotos = (state: RootState) => state.photos.favoritedPhotos;
export const selectSelectedPhotos = (state: RootState) => state.photos.selectedPhotos;
export const selectCartItems = (state: RootState) => state.photos.cartItems;
export const selectPhotosTotal = (state: RootState) => state.photos.total;
export const selectDownloadLoading = (state: RootState) => state.photos.downloadLoading;
export const selectDownloadingPhotoId = (state: RootState) => state.photos.downloadingPhotoId;
export const selectBulkDownloadLoading = (state: RootState) => state.photos.bulkDownloadLoading;
export const selectDeleteLoading = (state: RootState) => state.photos.deleteLoading;
export const selectDeletingPhotoIds = (state: RootState) => state.photos.deletingPhotoIds;
export const selectFolders = (state: RootState) => state.photos.folders;

export const selectHighlightPhotos = (state: RootState) =>
  state.photos.photos.filter((p) => p.tags.includes('highlight'));

export const selectFavoritePhotos = (state: RootState) =>
  state.photos.photos.filter((p) => state.photos.favoritedPhotos.includes(p.id));

// ─── Notifications Selectors ──────────────────────────────────────────────────
export const selectNotifications = (state: RootState) => state.notifications.notifications;
export const selectUnreadNotifications = (state: RootState) => state.notifications.unreadNotifications;
export const selectNotificationsLoading = (state: RootState) => state.notifications.loading;
export const selectUnreadNotificationsLoading = (state: RootState) => state.notifications.unreadLoading;
export const selectNotificationDeleteLoading = (state: RootState) => state.notifications.deleteLoading;
export const selectDeletingNotificationId = (state: RootState) => state.notifications.deletingId;
export const selectMarkingReadId = (state: RootState) => state.notifications.markingReadId;
export const selectMarkingAllRead = (state: RootState) => state.notifications.markingAllRead;
export const selectUnreadCount = (state: RootState) => state.notifications.unreadCount;

// ─── Wallet Selectors ─────────────────────────────────────────────────────────
export const selectWalletBalance = (state: RootState) => state.wallet.balance;
export const selectWalletCurrency = (state: RootState) => state.wallet.currency;
export const selectTransactions = (state: RootState) => state.wallet.transactions;
export const selectWalletLoading = (state: RootState) => state.wallet.loading;
export const selectTransactionsLoading = (state: RootState) => state.wallet.transactionsLoading;

// ─── UI Selectors ─────────────────────────────────────────────────────────────
export const selectGlobalLoading = (state: RootState) => state.ui.globalLoading;
export const selectApiMode = (state: RootState) => state.ui.apiMode;
export const selectShowCreateGroupModal = (state: RootState) => state.ui.showCreateGroupModal;
export const selectShowJoinGroupModal = (state: RootState) => state.ui.showJoinGroupModal;

// ─── Participants Selectors ───────────────────────────────────────────────────
export const selectParticipants = (state: RootState) => state.participants.participants;
export const selectParticipantsLoading = (state: RootState) => state.participants.loading;
export const selectParticipantsError = (state: RootState) => state.participants.error;
export const selectParticipantsPagination = (state: RootState) => state.participants.pagination;
export const selectCurrentGroupId = (state: RootState) => state.participants.currentGroupId;

export const selectParticipantById = (participantId: string) => (state: RootState) =>
  state.participants.participants.find((p) => p.id === participantId);

export const selectParticipantsByRole = (role: string) => (state: RootState) =>
  state.participants.participants.filter((p) => p.role === role);

// ─── Portfolio Selectors ──────────────────────────────────────────────────────
export const selectPortfolioSlug = (state: RootState) => state.portfolio.slug;
export const selectPortfolioWebsiteUrl = (state: RootState) => state.portfolio.websiteUrl;
export const selectPortfolioAbout = (state: RootState) => state.portfolio.about;
export const selectPortfolioCoverImage = (state: RootState) => state.portfolio.coverImage;
export const selectPortfolioPhotos = (state: RootState) => state.portfolio.photos;
export const selectPortfolioServices = (state: RootState) => state.portfolio.services;
export const selectPortfolioLoading = (state: RootState) => state.portfolio.loading;
export const selectPortfolioUploadLoading = (state: RootState) => state.portfolio.uploadLoading;
export const selectPortfolioServiceLoading = (state: RootState) => state.portfolio.serviceLoading;
export const selectPortfolioError = (state: RootState) => state.portfolio.error;
export const selectPortfolioName = (state: RootState) => state.portfolio.name;
export const selectPortfolioPhone = (state: RootState) => state.portfolio.phone;
export const selectPortfolioSocialLinks = (state: RootState) => state.portfolio.socialLinks;

// ─── Plans Selectors ──────────────────────────────────────────────────────────
export const selectPlans = (state: RootState) => state.plans.plans;
export const selectPlansRole = (state: RootState) => state.plans.plansRole;
export const selectActivePlan = (state: RootState) => state.plans.activePlan;
export const selectPlansLoading = (state: RootState) => state.plans.loading;
export const selectPlansError = (state: RootState) => state.plans.error;
export const selectSelectingPlanId = (state: RootState) => state.plans.selectingPlanId;
export const selectInquiryLoading = (state: RootState) => state.plans.inquiryLoading;
export const selectInquiryError = (state: RootState) => state.plans.inquiryError;
export const selectInquirySuccess = (state: RootState) => state.plans.inquirySuccess;
export const selectUserDetails = (state: RootState) => state.plans.userDetails;
export const selectUserDetailsLoading = (state: RootState) => state.plans.userDetailsLoading;
export const selectUserDetailsFetched = (state: RootState) => state.plans.userDetailsFetched;

// ─── Support Ticket Selectors ─────────────────────────────────────────────────
export const selectSupportTickets = (state: RootState) => state.supportTicket.tickets;
export const selectSupportTicketLoading = (state: RootState) => state.supportTicket.loading;
export const selectSupportTicketSubmitting = (state: RootState) => state.supportTicket.submitting;
export const selectSupportTicketSuccess = (state: RootState) => state.supportTicket.success;
export const selectSupportTicketError = (state: RootState) => state.supportTicket.error;
export const selectSupportTicketSuccessMessage = (state: RootState) => state.supportTicket.successMessage;
export const selectCurrentSupportTicket = (state: RootState) => state.supportTicket.currentTicket;

// ─── Videos Selectors ─────────────────────────────────────────────────────────
export const selectVideos = (state: RootState) => state.videos.videos;
export const selectVideosLoading = (state: RootState) => state.videos.loading;
export const selectVideosTotal = (state: RootState) => state.videos.total;
export const selectVideoDownloadLoading = (state: RootState) => state.videos.downloadLoading;
export const selectDownloadingVideoId = (state: RootState) => state.videos.downloadingVideoId;
export const selectVideosError = (state: RootState) => state.videos.error;
