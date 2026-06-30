import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, useNavigate } from "react-router-dom";
import { Provider, useSelector } from "react-redux";
import { store } from "@/store";
import type { RootState } from "@/store";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { WatermarkProvider } from "@/contexts/WatermarkContext";
import LoginPage from "./pages/LoginPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import Dashboard from "./pages/Dashboard";
import PhotoGallery from "./pages/PhotoGallery";
import AnalyticsPage from "./pages/AnalyticsPage";
import HelpPage from "./pages/HelpPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import DeleteAccountPage from "./pages/DeleteAccountPage";
import TutorialsPage from "./pages/TutorialsPage";
import AboutPage from "./pages/AboutPage";
import PricingPage from "./pages/PricingPage";
import LandingPage from "./pages/landing/LandingPage";
import AboutUsPage from "./pages/landing/AboutUsPage";
import ContactUsPage from "./pages/landing/ContactUsPage";
import LandingPricingPage from "./pages/landing/PricingPage";
import BusinessSettings from "./pages/BusinessSettings";
import ProfileSettings from "./pages/settings/ProfileSettings";
import PreferencesSettings from "./pages/settings/PreferencesSettings";
import BrandingSettings from "./pages/settings/BrandingSettings";
import TeamSettings from "./pages/settings/TeamSettings";
import FlipbookSettings from "./pages/settings/FlipbookSettings";
import WatermarkSettings from "./pages/settings/WatermarkSettings";
import PortfolioSettings from "./pages/settings/PortfolioSettings";
import PortfolioPage from "./pages/PortfolioPage";
import WalletPage from "./pages/settings/WalletPage";
import TransactionsPage from "./pages/settings/TransactionsPage";
import InvoiceDetailsPage from "./pages/settings/InvoiceDetailsPage";
import PrivacySecurityPage from "./pages/PrivacySecurityPage";
import GroupChat from "./pages/GroupChat";
import GroupSettings from "./pages/GroupSettings";
import GeneralSettings from "./components/group-settings/GeneralSettings";
import ParticipantsSettings from "./components/group-settings/ParticipantsSettings";
import PrivacySettings from "./components/group-settings/PrivacySettings";
import FoldersSettings from "./components/group-settings/FoldersSettings";
import GroupDesignSettings from "./components/group-settings/DesignSettings";
import ViewDownloadSettings from "./components/group-settings/ViewDownloadSettings";
import GroupFlipbookSettings from "./components/group-settings/FlipbookSettings";
import GroupBrandingSettings from "./components/group-settings/BrandingSettings";
import FavoritesSettings from "./components/group-settings/FavoritesSettings";
import NotFound from "./pages/NotFound";
import SetPasswordModal from "./components/modals/SetPasswordModal";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { checkPassword, logout } from "@/store/slices/authSlice";
import NotificationsPage from "./pages/NotificationsPage";
import ChatBot from "./components/ChatBot";
import InvitePage from "./pages/InvitePage";
import ScrollToTop from "./components/ScrollToTop";
import SEOHead from "./components/SEOHead";
import SubscriptionPlansModal from "./components/modals/SubscriptionPlansModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useUserPlans } from "@/hooks/useUserPlans";
import { useMaintenance } from "@/hooks/useMaintenance";
import MaintenancePage from "./pages/MaintenancePage";
import { Loader2 } from "lucide-react";
import {
  requestNotificationPermission,
  onMessageListener,
} from "./notification";
import { testNotification } from "./testNotification";

// Extend Window interface to include testNotification function
declare global {
  interface Window {
    testNotification?: () => boolean;
  }
}

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <PhotographerPlanGate>{children}</PhotographerPlanGate>;
}

function isActivePlanFlag(value: unknown) {
  return value === true || value === 1 || value === "1";
}

function usePhotographerPlanLock() {
  const user = useSelector((state: RootState) => state.auth.user);
  const isPasswordSet = useSelector(
    (state: RootState) => state.auth.isPasswordSet,
  );
  const { userPlansData, loading, error } = useUserPlans();
  const shouldCheckPlan = user?.role === "photographer" && isPasswordSet === true;
  const userPlan = userPlansData?.data?.plans?.[0];
  const hasActivePlan = !!(
    isActivePlanFlag(userPlansData?.data?.user?.is_plan_purchased) ||
    isActivePlanFlag(userPlan?.is_purchased) ||
    isActivePlanFlag(userPlan?.is_active)
  );

  return {
    error,
    isCheckingPlan: shouldCheckPlan && loading && !userPlansData,
    isPlanLocked: shouldCheckPlan && !loading && !hasActivePlan,
  };
}

function PhotographerPlanGate({ children }: { children: React.ReactNode }) {
  const { isCheckingPlan, isPlanLocked, error } = usePhotographerPlanLock();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [showPlanAlert, setShowPlanAlert] = useState(false);

  const handleForcedInquiryClose = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  if (!isCheckingPlan && !isPlanLocked) return <>{children}</>;

  if (isCheckingPlan) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">Checking your plan...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 text-center">
      <div className="max-w-md space-y-2">
        <h1 className="text-xl font-heading font-semibold text-foreground">
          Choose a plan to continue
        </h1>
        <p className="text-sm text-muted-foreground">
          Photographer accounts need an active plan before accessing the workspace.
          {error ? ` ${error}` : ""}
        </p>
      </div>
      <SubscriptionPlansModal
        open={true}
        onOpenChange={(open) => {
          if (!open) setShowPlanAlert(true);
        }}
        onInquiryClose={handleForcedInquiryClose}
      />
      <AlertDialog open={showPlanAlert} onOpenChange={setShowPlanAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Plan Required</AlertDialogTitle>
            <AlertDialogDescription>
              You must select a subscription plan to continue using the application. Please choose a plan that fits your needs.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowPlanAlert(false)}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ChatBotGate() {
  const { isCheckingPlan, isPlanLocked } = usePhotographerPlanLock();
  if (isCheckingPlan || isPlanLocked) return null;
  return <ChatBot />;
}

function GlobalAuthCheck() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, isPasswordSet } = useAppSelector(
    (state) => state.auth,
  );

  useEffect(() => {
    if (isAuthenticated && user?.id && isPasswordSet === null) {
      dispatch(checkPassword(user.id));
    }
  }, [isAuthenticated, user?.id, isPasswordSet, dispatch]);

  // Initialize Firebase notifications
  useEffect(() => {
    const initNotifications = async () => {
      try {
        const token = await requestNotificationPermission();
        if (token) {
          // Listen for foreground messages
          onMessageListener()
            .then(async (payload) => {
              if (payload) {
                // Show notification in foreground
                if (payload.notification) {
                  // Handle different notification data structures
                  let title, body;

                  if (
                    typeof payload.notification === "object" &&
                    payload.notification !== null
                  ) {
                    title = payload.notification.title || "Notification";
                    body = payload.notification.body || "";
                  } else {
                    // Fallback if notification data is in different format
                    title = "Notification";
                    body = "You have a new message";
                  }

                  // Show notification via Service Worker (works in foreground + background)
                  if (Notification.permission === "granted") {
                    try {
                      // Use Service Worker showNotification — works reliably in Chrome foreground
                      if ("serviceWorker" in navigator) {
                        navigator.serviceWorker.ready.then((registration) => {
                          registration
                            .showNotification(title, {
                              body: body,
                              icon: "/favicon.ico",
                              badge: "/favicon.ico",
                              tag: "firebase-foreground-" + Date.now(),
                              requireInteraction: true,
                              data: { url: window.location.href },
                            })
                            .then(() => {
                              console.log(
                                "Service Worker notification shown:",
                                title,
                              );
                            })
                            .catch((err) => {
                              console.error("SW showNotification failed:", err);
                              // Fallback: direct Notification API
                              const n = new Notification(title, {
                                body,
                                icon: "/favicon.ico",
                              });
                              setTimeout(() => n.close(), 8000);
                            });
                        });
                      } else {
                        // Fallback: direct Notification API
                        const notification = new Notification(title, {
                          body: body,
                          icon: "/favicon.ico",
                          badge: "/favicon.ico",
                          tag: "firebase-foreground",
                        });
                        setTimeout(() => notification.close(), 8000);
                        notification.onclick = () => {
                          window.focus();
                          notification.close();
                        };
                      }

                      // Extract OTP from notification body
                      const otpMatch = body.match(/\b\d{4,6}\b/);
                      if (
                        otpMatch &&
                        body.toLowerCase().includes("verification code")
                      ) {
                        const otpCode = otpMatch[0];
                        console.log("Auto-filling OTP:", otpCode);

                        // Store OTP in localStorage for LoginPage to access
                        localStorage.setItem("autoFillOTP", otpCode);

                        // Trigger custom event for LoginPage to listen
                        window.dispatchEvent(
                          new CustomEvent("otpAutoFill", {
                            detail: { otp: otpCode },
                          }),
                        );
                      }
                    } catch (error) {
                      console.error(
                        "Error creating browser notification:",
                        error,
                      );
                    }
                  } else {
                    console.log("Notification permission not granted");
                  }
                } else {
                  // No notification data in payload
                }
              }
            })
            .catch((err) => {
              // Failed to receive foreground messages
            });
        } else {
          // Firebase notifications not available
        }
      } catch (error) {
        // Failed to initialize notifications
      }
    };

    initNotifications();

    // Add test notification function to window for debugging
    if (typeof window !== "undefined") {
      window.testNotification = testNotification;
    }
  }, []);

  return <SetPasswordModal />;
}

function AppRoutes() {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );

  return (
    <Routes>
      {/* Public Landing Pages */}
      <Route path="/home" element={<LandingPage />} />
      <Route path="/aboutus" element={<AboutUsPage />} />
      <Route path="/contact-us" element={<ContactUsPage />} />
      <Route path="/pricing" element={<LandingPricingPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/delete-account" element={<DeleteAccountPage />} />
      <Route
        path="/reset-password/:userId/:token"
        element={<ResetPasswordPage />}
      />
      <Route path="/join/:token" element={<InvitePage />} />
      <Route path="/portfolio/:userId" element={<PortfolioPage />} />

      {/* Auth Routes */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/home" replace />
          )
        }
      />
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
        }
      />
      <Route path="/signup" element={<Navigate to="/login" replace />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/gallery/:groupId"
        element={
          <ProtectedRoute>
            <PhotoGallery />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat/:groupId"
        element={
          <ProtectedRoute>
            <GroupChat />
          </ProtectedRoute>
        }
      />
      <Route
        path="/group-settings/:groupId"
        element={
          <ProtectedRoute>
            <GroupSettings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <AnalyticsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/help"
        element={
          <ProtectedRoute>
            <HelpPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tutorials"
        element={
          <ProtectedRoute>
            <TutorialsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/about"
        element={
          <ProtectedRoute>
            <AboutPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pricing"
        element={
          <ProtectedRoute>
            <PricingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/privacy-security"
        element={
          <ProtectedRoute>
            <PrivacySecurityPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <BusinessSettings />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/settings/profile" replace />} />
        <Route path="profile" element={<ProfileSettings />} />
        <Route path="preferences" element={<PreferencesSettings />} />
        <Route path="branding" element={<BrandingSettings />} />
        <Route path="team" element={<TeamSettings />} />
        <Route path="flipbook" element={<FlipbookSettings />} />
        <Route path="watermark" element={<WatermarkSettings />} />
        <Route path="portfolio" element={<PortfolioSettings />} />
        <Route path="wallet" element={<WalletPage />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="transactions/:transactionId" element={<InvoiceDetailsPage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function MaintenanceGate({ children }: { children: React.ReactNode }) {
  const { isLive, message, loading, checkStatus } = useMaintenance();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground font-medium animate-pulse">Initializing Fablead Studio...</p>
      </div>
    );
  }

  if (!isLive) {
    return <MaintenancePage message={message} onRetry={checkStatus} isRetrying={loading} />;
  }

  return <>{children}</>;
}

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <WatermarkProvider>
            <BrowserRouter>
              <MaintenanceGate>
                <ScrollToTop />
                <SEOHead />
                <GlobalAuthCheck />
                <AppRoutes />
                <ChatBotGate />
              </MaintenanceGate>
            </BrowserRouter>
          </WatermarkProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </Provider>
);

export default App;
