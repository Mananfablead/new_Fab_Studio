import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Settings,
  Users,
  Shield,
  FolderOpen,
  Palette,
  Eye,
  BookOpen,
  Sparkles,
  Heart,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  LogOut,
  DollarSign,
  DownloadCloud,
} from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { useAuth } from '@/contexts/AuthContext';
import { useUserFullProfile } from '@/hooks/useUserFullProfile';
import { useAppDispatch, useAppSelector } from '@/store';
import { deleteGroup, fetchGroupById, leaveGroup } from '@/store/slices/groupsSlice';
import { selectCurrentGroup, selectApiMode, selectCurrentGroupLoading, selectUser, selectActivePlan } from '@/store/selectors';
import { useUserPlans } from '@/hooks/useUserPlans';
import SubscriptionPlansModal from '@/components/modals/SubscriptionPlansModal';
import { mockGroups } from '@/lib/mock-data';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import GeneralSettings from '../components/group-settings/GeneralSettings';
import ParticipantsSettings from '../components/group-settings/ParticipantsSettings';
import PrivacySettings from '../components/group-settings/PrivacySettings';
import FoldersSettings from '../components/group-settings/FoldersSettings';
import DesignSettings from '../components/group-settings/DesignSettings';
import ViewDownloadSettings from '../components/group-settings/ViewDownloadSettings';
import DownloadHistorySettings from '../components/group-settings/DownloadHistorySettings';
import FlipbookSettings from '../components/group-settings/FlipbookSettings';
import BrandingSettings from '../components/group-settings/BrandingSettings';
import FavoritesSettings from '../components/group-settings/FavoritesSettings';
import MonetizationSettings from '../components/group-settings/MonetizationSettings';

type TabType =
  | 'general'
  | 'participants'
  | 'privacy'
  | 'folders'
  | 'design'
  | 'viewDownload'
  | 'downloadHistory'
  | 'flipbook'
  | 'branding'
  | 'favorites'
  | 'monetization';

interface TabItem {
  key: TabType;
  label: string;
  icon: React.ReactNode;
}

export default function GroupSettings() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const reduxUser = useAppSelector(selectUser);
  // Prefer Redux user (updated on login/profile fetch); fall back to AuthContext for legacy mock mode
  const user = reduxUser || authUser;
  const dispatch = useAppDispatch();
  const reduxGroup = useAppSelector(selectCurrentGroup);
  const apiMode = useAppSelector(selectApiMode);
  const currentGroupLoading = useAppSelector(selectCurrentGroupLoading);
  // Groups list is populated immediately — use it as a fallback to detect ownership before currentGroup loads
  const groupsListEntry = useAppSelector((state) =>
    state.groups.groups.find((g) => String(g.id) === String(groupId))
  );

  useEffect(() => {
    if (groupId && apiMode === 'live') {
      dispatch(fetchGroupById(groupId));
    }
  }, [groupId, apiMode, dispatch]);

  const group = apiMode === 'live'
    ? (reduxGroup && String(reduxGroup.id) === String(groupId) ? reduxGroup : null)
    : (mockGroups.find(g => g.id === groupId) || mockGroups[0]);

  // Safe group for rendering (name, cover, etc.) — never use for permission checks
  const safeGroup = group || { name: '', coverImage: '', photoCount: 0 } as any;

  const isTeamMember = (group as any)?.team_members?.some(
    (member: any) => Boolean(user?.id) && String(member.user_id) === String(user?.id)
  );

  const isOwner = Boolean(user?.id) && (
    String((group as any)?.owner?.id) === String(user?.id) ||
    String((group as any)?.ownerId) === String(user?.id) ||
    String((group as any)?.owner_id) === String(user?.id) ||
    String((group as any)?.createdBy) === String(user?.id) ||
    String((group as any)?.created_by) === String(user?.id) ||
    // Fallback: check groups list entry (available immediately before currentGroup loads)
    String((groupsListEntry as any)?.ownerId) === String(user?.id) ||
    String((groupsListEntry as any)?.owner_id) === String(user?.id) ||
    String((groupsListEntry as any)?.createdBy) === String(user?.id) ||
    String((groupsListEntry as any)?.created_by) === String(user?.id) ||
    String((groupsListEntry as any)?.owner?.id) === String(user?.id)
  );

  const isGroupAdmin = (group as any)?.participants?.some(
    (p: any) => Boolean(user?.id) && String(p.id) === String(user?.id) && p.role?.toLowerCase() === 'admin'
  );

  // Only owners, team members, and group admins can manage all settings tabs.
  // Joined members (non-owner) always see only General + Participants regardless of allowMemberEdit.
  // While group is still loading, use groupsListEntry as fallback to avoid flickering for owners.
  const isOwnerByListEntry = Boolean(user?.id) && (
    String((groupsListEntry as any)?.ownerId) === String(user?.id) ||
    String((groupsListEntry as any)?.owner_id) === String(user?.id) ||
    String((groupsListEntry as any)?.createdBy) === String(user?.id) ||
    String((groupsListEntry as any)?.created_by) === String(user?.id) ||
    String((groupsListEntry as any)?.owner?.id) === String(user?.id)
  );
  const canManage = isOwner || isTeamMember || isGroupAdmin || (currentGroupLoading && isOwnerByListEntry);

  const getImageUrl = (url: string | undefined | null): string => {
    if (!url) return 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1200&q=80';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
      return url;
    }
    const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
    return `http://localhost:8000/storage/${cleanUrl}`;
  };

  // Fetch full profile with business info
  useUserFullProfile();

  // Fetch plan capability controls
  const { userPlansData } = useUserPlans();
  const [showPlansModal, setShowPlansModal] = useState(false);

  const activePlan = useAppSelector(selectActivePlan);
  const userPlan = userPlansData?.data?.plans?.[0];
  const isPlanActive = !!(
    userPlansData?.data?.user?.is_plan_purchased === true ||
    userPlan?.is_purchased === true ||
    userPlan?.is_active === true
  );

  const apiPlan = isPlanActive ? (userPlan || activePlan) : null;
  const userPlanInfo = userPlansData?.data?.user;
  const hasSwitchDownloads = (apiPlan ? !!apiPlan.has_switch_downloads : false) || (userPlanInfo ? !!userPlanInfo.has_switch_downloads : false);
  const hasDigitalAlbum = (apiPlan ? !!apiPlan.has_digital_album : false) || (userPlanInfo ? !!userPlanInfo.has_digital_album : false);
  const hasBusinessBranding = (apiPlan ? !!apiPlan.has_business_branding : false) || (userPlanInfo ? !!userPlanInfo.has_business_branding : false);
  const hasViewClientFavorites = (apiPlan ? !!apiPlan.has_view_client_favorites : false) || (userPlanInfo ? !!userPlanInfo.has_view_client_favorites : false);

  const isBlockedTab = (tabKey: TabType): boolean => {
    if (user?.role !== 'photographer') return false;

    // If they have no active plan at all, all premium settings are locked
    if (!isPlanActive) {
      return ['flipbook', 'branding', 'favorites'].includes(tabKey);
    }

    // Otherwise, check individual capability flags from backend
    if (tabKey === 'flipbook') return !hasDigitalAlbum;
    if (tabKey === 'branding') return !hasBusinessBranding;
    if (tabKey === 'favorites') return !hasViewClientFavorites;

    return false;
  };

  const [activeTab, setActiveTab] = useState<TabType>('general');
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  // Dialog States
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);

  const initialTabs: TabItem[] = [
    { key: 'general', label: 'General Settings', icon: <Settings className="w-5 h-5" /> },
    { key: 'participants', label: 'Participants', icon: <Users className="w-5 h-5" /> },
    { key: 'privacy', label: 'Privacy Settings', icon: <Shield className="w-5 h-5" /> },
    { key: 'folders', label: 'Folders', icon: <FolderOpen className="w-5 h-5" /> },
    { key: 'viewDownload', label: 'View & Download', icon: <Eye className="w-5 h-5" /> },
    { key: 'downloadHistory', label: 'Download History', icon: <DownloadCloud className="w-5 h-5" /> },
    { key: 'flipbook', label: 'Digital Flipbook', icon: <BookOpen className="w-5 h-5" /> },
    { key: 'branding', label: 'Branding & Sponsors', icon: <Sparkles className="w-5 h-5" /> },
    { key: 'favorites', label: 'Client Favorite', icon: <Heart className="w-5 h-5" /> },
    // { key: 'monetization', label: 'Monetization', icon: <DollarSign className="w-5 h-5" /> },
  ];

  // Premium tabs only for photographer/admin role accounts
  const premiumTabKeys = ['flipbook', 'branding', 'favorites'];
  const isAdvancedUser = user?.role === 'photographer' || user?.role === 'admin';

  const tabs = !canManage
    ? initialTabs.filter(tab => tab.key === 'general' || tab.key === 'participants')
    : isAdvancedUser
      ? initialTabs
      : initialTabs.filter(tab => !premiumTabKeys.includes(tab.key));

  const handleDeleteGroup = () => {
    setShowDeleteDialog(true);
  };

  const confirmDeleteGroup = async () => {
    if (!groupId) return;

    try {
      await dispatch(deleteGroup(groupId)).unwrap();
      setShowDeleteDialog(false);
      toast({
        title: 'Group Deleted',
        description: 'The group has been deleted successfully.',
        variant: 'destructive'
      });
      navigate('/');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: typeof error === 'string' ? error : (error?.message || 'Failed to delete group. Please try again.'),
        variant: 'destructive'
      });
    }
  };

  const handleLeaveGroup = () => {
    setShowLeaveDialog(true);
  };

  const confirmLeaveGroup = async () => {
    if (!groupId) return;

    try {
      await dispatch(leaveGroup(groupId)).unwrap();

      setShowLeaveDialog(false);
      toast({
        title: 'Left Group',
        description: 'You have left the group successfully.'
      });
      navigate('/');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: typeof error === 'string' ? error : (error?.message || 'Failed to leave group. Please try again.'),
        variant: 'destructive'
      });
    }
  };

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsContainerRef.current) {
      const scrollAmount = 300;
      const newScrollLeft = direction === 'left'
        ? tabsContainerRef.current.scrollLeft - scrollAmount
        : tabsContainerRef.current.scrollLeft + scrollAmount;

      tabsContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralSettings />;
      case 'participants':
        return (
          <ParticipantsSettings
            groupId={groupId}
            groupName={safeGroup.name}
            onDeleteGroup={handleDeleteGroup}
            onLeaveGroup={handleLeaveGroup}
          />
        );
      case 'privacy':
        return <PrivacySettings />;
      case 'folders':
        return <FoldersSettings />;
      case 'design':
        return <DesignSettings />;
      case 'viewDownload':
        return <ViewDownloadSettings />;
      case 'downloadHistory':
        return <DownloadHistorySettings />;
      case 'flipbook':
        return <FlipbookSettings />;
      case 'branding':
        return <BrandingSettings />;
      case 'favorites':
        return <FavoritesSettings />;
      // case 'monetization':
      //   return <MonetizationSettings groupId={groupId} />;
      default:
        return <div className="p-6"><h2 className="text-2xl font-heading font-semibold mb-4">Settings Page</h2><p className="text-muted-foreground">Select a tab to view settings.</p></div>;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />

      {/* Enhanced Hero Banner */}
      <div className="relative h-56 md:h-64 overflow-hidden shrink-0">
        {currentGroupLoading ? (
          <Skeleton className="w-full h-full rounded-none" />
        ) : (
          <img
            src={getImageUrl(safeGroup.coverImage)}
            alt={safeGroup.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1200&q=80';
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/60 to-transparent" />

        <div className="absolute bottom-0 left-0 w-full p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="z-10 relative">
              <button
                onClick={() => navigate(`/gallery/${groupId}`)}
                className="mb-3 md:mb-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs md:text-sm font-medium bg-foreground/10 hover:bg-foreground/20 text-foreground rounded-xl backdrop-blur-md border border-foreground/10 transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5 md:w-4 md:h-4" /> Back to Gallery
              </button>
              {currentGroupLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-72 md:w-96" />
                  <Skeleton className="h-4 w-48 md:w-64" />
                </div>
              ) : (
                <>
                  <h1 className="text-2xl md:text-5xl font-heading font-bold text-foreground drop-shadow-md">{safeGroup.name} Settings</h1>
                  <p className="text-muted-foreground mt-1.5 md:mt-2 text-xs md:text-base flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-[hsl(var(--fab-amber))]" /> Manage configurations, design, and access
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-3 md:py-8 -mt-2 md:mt-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8">

          {/* Navigation Sidebar / Mobile Pills */}
          <div className="lg:col-span-3 min-w-0">
            <div className="md:sticky md:top-24">

              {/* Mobile View: Horizontal Tabs (Pills) */}
              <div className="lg:hidden relative mb-3 md:mb-6 w-full">
                <div className="flex overflow-x-auto pb-4 gap-2 w-full" style={{ WebkitOverflowScrolling: 'touch' }}>
                  {tabs.map((tab) => {
                    const isBlocked = isBlockedTab(tab.key);
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap shrink-0 border ${activeTab === tab.key
                          ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20'
                          : 'bg-card text-muted-foreground border-border hover:bg-muted'
                          }`}
                      >
                        <span className={activeTab === tab.key ? 'text-primary-foreground/90' : 'text-muted-foreground'}>{tab.icon}</span>
                        <span>{tab.label}</span>
                        {isBlocked && (
                          <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${activeTab === tab.key
                              ? 'bg-white/20 text-white'
                              : isPlanActive
                                ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                                : 'bg-primary/10 text-primary border border-primary/20'
                            }`}>
                            {isPlanActive ? 'Upgrade' : 'Locked'}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Desktop View: Vertical Sidebar */}
              <div className="hidden lg:flex flex-col gap-1.5 p-3 rounded-xl bg-card border border-border shadow-sm">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 py-2 mb-1">Configuration</h3>
                {tabs.map((tab) => {
                  const isBlocked = isBlockedTab(tab.key);
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`relative flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all group ${activeTab === tab.key
                        ? 'text-primary bg-primary/10'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                    >
                      {activeTab === tab.key && (
                        <motion.div
                          layoutId="active-tab"
                          className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-md"
                        />
                      )}
                      <div className="flex items-center gap-3">
                        <span className={`transition-colors ${activeTab === tab.key ? 'text-primary scale-110 duration-300' : 'text-muted-foreground group-hover:text-primary/70'}`}>
                          {tab.icon}
                        </span>
                        <span>{tab.label}</span>
                      </div>
                      {isBlocked && (
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${activeTab === tab.key
                            ? 'bg-primary/20 text-primary-foreground'
                            : isPlanActive
                              ? 'bg-amber-500/10 text-amber-600 border border-amber-500/10'
                              : 'bg-primary/10 text-primary border border-primary/10'
                          }`}>
                          {isPlanActive ? 'Upgrade' : 'Locked'}
                        </span>
                      )}
                    </button>
                  );
                })}

                <div className="my-2 h-px bg-border mx-4" />

                {/* Global danger zone actions relocated to bottom of sidebar */}
                <button
                  onClick={handleLeaveGroup}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-orange-600 hover:bg-orange-500/10 transition-colors"
                >
                  <LogOut className="w-5 h-5" /> Leave Group
                </button>
                {(user?.role !== 'user' || isTeamMember || isOwner) && (
                  <button
                    onClick={handleDeleteGroup}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <AlertTriangle className="w-5 h-5" /> Delete Group
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Configuration Content Area */}
          <div className="lg:col-span-9">
            <div className="bg-card rounded-xl border border-border/80 shadow-sm overflow-hidden w-full relative group">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 0.98 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="h-full"
                >
                  {isBlockedTab(activeTab) ? (
                    <div className="p-8 text-center flex flex-col items-center justify-center min-h-[400px] bg-gradient-to-b from-white to-amber-50/10 rounded-xl relative overflow-hidden">
                      {/* Decorative background grid and gradients */}
                      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
                      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-200/10 rounded-full blur-3xl -z-10" />
                      <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-200/10 rounded-full blur-3xl -z-10" />

                      <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6 shadow-md relative mx-auto">
                        <Sparkles className="w-10 h-10 text-amber-500 animate-pulse" />
                        <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-purple-500 rounded-full animate-ping opacity-75" />
                      </div>

                      <h2 className="text-2xl font-extrabold text-slate-800 mb-3 tracking-tight">
                        {isPlanActive ? 'Upgrade Your Plan' : 'Plan Required'}
                      </h2>
                      <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed mb-8">
                        {isPlanActive
                          ? 'Upgrade your plan. Current plan does not support this feature.'
                          : 'This premium feature is not included in your current subscription. Upgrade to unlock this and other professional-grade photography tools.'}
                      </p>

                      <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
                        <button
                          onClick={() => setShowPlansModal(true)}
                          className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-slate-900 text-white font-extrabold text-sm hover:bg-slate-800 transition-all shadow-lg hover:shadow-slate-900/10 active:scale-95"
                        >
                          Upgrade Plans
                        </button>
                        <button
                          onClick={() => setActiveTab('general')}
                          className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-extrabold text-sm hover:bg-slate-50 transition-all active:scale-95"
                        >
                          Back to General
                        </button>
                      </div>
                    </div>
                  ) : (
                    renderContent()
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>

      {/* Delete Group Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-14 h-14 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-7 h-7 text-destructive" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">Delete Group?</DialogTitle>
                <DialogDescription className="mt-1 text-sm">
                  This action cannot be undone. All photos and data will be permanently deleted.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-2">
            <button
              onClick={() => setShowDeleteDialog(false)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmDeleteGroup}
              className="flex-1 px-4 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 transition-colors"
            >
              Delete Group
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Leave Group Confirmation Dialog */}
      <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-14 h-14 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                <LogOut className="w-7 h-7 text-orange-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">Leave Group?</DialogTitle>
                <DialogDescription className="mt-1 text-sm">
                  Are you sure you want to leave this group? You will lose access to all photos.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-2">
            <button
              onClick={() => setShowLeaveDialog(false)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmLeaveGroup}
              className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Leave Group
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SubscriptionPlansModal
        open={showPlansModal}
        onOpenChange={setShowPlansModal}
      />
    </div>
  );
}
