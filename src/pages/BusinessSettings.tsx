import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  User, Settings, Briefcase, Users, BookImage, Droplets, Globe, Wallet, Receipt,
  ChevronRight, Sparkles, Shield, Bell, Palette, CreditCard, FolderOpen,
  ArrowLeft, Eye, Loader2, Crop, AlertTriangle, CheckCircle2,
  XCircle,
  Copy, Image, Video, CalendarDays
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import AppHeader from '@/components/AppHeader';
import { useAuth } from '@/contexts/AuthContext';
import { useUserFullProfile } from '@/hooks/useUserFullProfile';
import { useAppSelector, useAppDispatch } from '@/store';
import { fetchPlans } from '@/store/slices/plansSlice';
import { fetchTeamMembers } from '@/store/slices/teamSlice';
import { fetchGroups } from '@/store/slices/groupsSlice';
import { selectActivePlan, selectPlansLoading } from '@/store/selectors';
import { useUserPlans } from '@/hooks/useUserPlans';
import SubscriptionPlansModal from '@/components/modals/SubscriptionPlansModal';
import AddFeaturesModal from '@/components/modals/AddFeaturesModal';
import api from '@/services/api';
import { toast } from 'sonner';
import { fetchTransactions } from '@/services/paymentService';
import type { Transaction } from '@/services/paymentService';

// Custom Button Component with hover animation
function AnimatedButton({ children, onClick, className = '' }: { children: React.ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button
      onClick={onClick}
      className={`
        relative overflow-hidden px-6 py-3 rounded-md font-semibold uppercase tracking-widest text-sm
        border-2 border-[hsl(var(--fab-amber))] text-[hsl(var(--fab-amber))] bg-transparent
        transition-all duration-500 ease-out
        hover:text-white hover:scale-105 hover:shadow-[4px_5px_17px_-4px_hsl(var(--fab-amber))]
        before:content-[''] before:absolute before:left-[-50px] before:top-0
        before:w-0 before:h-full before:bg-[hsl(var(--fab-amber))]
        before:skew-x-12 before:-z-10 before:transition-all before:duration-500
        hover:before:w-[250%]
        ${className}
      `}
    >
      {children}
    </button>
  );
}

const settingsCategories = [
  {
    id: 'account',
    title: 'Account Settings',
    description: 'Manage your profile and preferences',
    items: [
      { label: 'Profile', icon: User, path: '/settings/profile', desc: 'Personal info & security', color: 'bg-blue-500/10 text-blue-500' },
      // { label: 'Preferences', icon: Settings, path: '/settings/preferences', desc: 'App settings & notifications', color: 'bg-purple-500/10 text-purple-500' },
      { label: 'Team', icon: Users, path: '/settings/team', desc: 'Manage team members & roles', color: 'bg-green-500/10 text-green-500' },
      { label: 'Transactions', icon: Receipt, path: '/settings/transactions', desc: 'Invoice history & payments', color: 'bg-orange-500/10 text-orange-500' },
    ]
  },
  {
    id: 'business',
    title: 'Business Settings',
    description: 'Customize your business presence',
    items: [
      { label: 'Branding', icon: Briefcase, path: '/settings/branding', desc: 'Logo, colors & business info', color: 'bg-amber-500/10 text-amber-500' },
      // { label: 'Team', icon: Users, path: '/settings/team', desc: 'Manage team members & roles', color: 'bg-green-500/10 text-green-500' },
      { label: 'Portfolio', icon: Globe, path: '/settings/portfolio', desc: 'Showcase your work', color: 'bg-pink-500/10 text-pink-500' },
    ]
  },
  {
    id: 'content',
    title: 'Content Settings',
    description: 'Control how your content appears',
    items: [
      { label: 'Flipbook', icon: BookImage, path: '/settings/flipbook', desc: 'Album display settings', color: 'bg-indigo-500/10 text-indigo-500' },
      { label: 'Watermark', icon: Droplets, path: '/settings/watermark', desc: 'Protect your photos', color: 'bg-cyan-500/10 text-cyan-500' },
      {
        label: 'Upload in Higher Resolution',
        icon: Crop,
        desc: (
          <span className="flex items-center gap-1 text-[#b54c4c] mt-0.5">
            <AlertTriangle className="w-3.5 h-3.5" /> 1 High resolution Upload = 2.5 Photos
          </span>
        ),
        color: 'bg-teal-500/10 text-teal-500',
        isToggle: true
      },
    ]
  },

];

/** Format bytes to human readable string (KB, MB, GB, TB) */
function formatBytes(bytes: number, decimals: number = 2): string {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export default function BusinessSettings() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);
  const resolvedRole = user?.role === 'admin' ? 'photographer' : user?.role;
  const dispatch = useAppDispatch();

  // Fetch full profile with business info
  useUserFullProfile();

  // Fetch user plans details
  const { userPlansData, loading: userPlansLoading, error: userPlansError } = useUserPlans();

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [showAddFeaturesModal, setShowAddFeaturesModal] = useState(false);
  const [showPlanDetailsModal, setShowPlanDetailsModal] = useState(false);
  const [isResizeEnabled, setIsResizeEnabled] = useState(true);
  const [canManagePhotoResize, setCanManagePhotoResize] = useState(true);
  const [storageData, setStorageData] = useState<{
    usedBytes: number;
    limitBytes: number;
    formatted: string | null;
    percentage: number | null;
  } | null>(null);
  const [storageLoading, setStorageLoading] = useState(true);

  const handleToggleResize = async (checked: boolean) => {
    if (!canManagePhotoResize) {
      toast.error('Photo resize settings are managed by admin for your account.');
      return;
    }
    setIsResizeEnabled(checked);
    try {
      const response: any = await api.put('/users/settings', {
        settings: {
          resize_photo_images: checked,
          resize_photo_max_size_mb: 2.5
        }
      });

      if (response && response.success === false) {
        toast.error(response.message || 'Failed to update settings');
        setIsResizeEnabled(!checked);
      }
    } catch (error: any) {
      console.error('Failed to update resize setting:', error);
      toast.error(error?.response?.data?.message || error.message || 'Failed to update settings');
      setIsResizeEnabled(!checked);
    }
  };



  // Fetch plans on mount
  const activePlan = useAppSelector(selectActivePlan);
  const plansLoading = useAppSelector(selectPlansLoading);

  // Team members from Redux
  const teamMembers = useAppSelector((state) => state.team.members);

  // Groups joined (for regular users) — use total from Redux (populated by fetchGroups)
  const groupsJoined = useAppSelector((state) => state.groups.total);

  useEffect(() => {
    if (resolvedRole === 'user' || resolvedRole === 'photographer') {
      dispatch(fetchPlans(resolvedRole));
    }
  }, [dispatch, resolvedRole]);

  // Fetch team members once on mount (photographers/admins only)
  useEffect(() => {
    const isSpecial = user?.role === 'admin' || user?.role === 'photographer';
    if (isSpecial) {
      dispatch(fetchTeamMembers());
    } else {
      // For regular users, fetch groups to get the total count
      dispatch(fetchGroups({ limit: 1 }));
    }
  }, [dispatch, user?.role]);

  const [dashboardStats, setDashboardStats] = useState<any>(null);

  // Fetch storage usage from dashboard stats API
  useEffect(() => {
    let cancelled = false;
    setStorageLoading(true);

    (async () => {
      try {
        const res = await api.get('/dashboard/stats');
        if (cancelled) return;

        const body = res.data;

        // Helper to find the storage object anywhere in the response
        const findStorageObject = (obj: any): any => {
          if (!obj || typeof obj !== 'object') return null;
          // Check if this object looks like the storage object
          if (obj.usedBytes !== undefined || obj.used_bytes !== undefined || obj.usedFormatted !== undefined || obj.used_formatted !== undefined) {
            return obj;
          }
          // Recursively search in sub-objects
          for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
              const found = findStorageObject(obj[key]);
              if (found) return found;
            }
          }
          return null;
        };

        const storage = findStorageObject(body);
        
        setDashboardStats(body?.stats || body?.data?.stats || body);

        if (storage) {
          setStorageData({
            usedBytes: Number(storage.usedBytes ?? storage.used_bytes ?? 0),
            limitBytes: Number(storage.limitBytes ?? storage.limit_bytes ?? 0),
            formatted: storage.usedFormatted || storage.used_formatted || null,
            percentage: storage.percentage != null ? Number(storage.percentage) : (storage.used_percentage != null ? Number(storage.used_percentage) : null)
          });
        }

        if (body?.stats?.settings?.resize_photo_images !== undefined) {
          setIsResizeEnabled(Boolean(body.stats.settings.resize_photo_images));
          if (body.stats.settings.can_manage_photo_resize !== undefined) {
            setCanManagePhotoResize(Boolean(body.stats.settings.can_manage_photo_resize));
          }
        } else if (body?.data?.stats?.settings?.resize_photo_images !== undefined) {
          setIsResizeEnabled(Boolean(body.data.stats.settings.resize_photo_images));
          if (body.data.stats.settings.can_manage_photo_resize !== undefined) {
            setCanManagePhotoResize(Boolean(body.data.stats.settings.can_manage_photo_resize));
          }
        }
      } catch (err) {
        console.error('[BusinessSettings] dashboard/stats failed:', err);
      } finally {
        if (!cancelled) setStorageLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  // ─── Dynamic stat calculations ──────────────────────────────────────────────

  // Get plan data from userPlans API — only use if actually purchased
  const userPlan = userPlansData?.data?.plans?.[0];
  // A plan is active if any of these are true
  const isPlanActive = !!(
    userPlansData?.data?.user?.is_plan_purchased === true ||
    (userPlan as any)?.is_purchased === true ||
    (userPlan as any)?.is_active === true
  );
  const apiPlan = isPlanActive ? (userPlan || activePlan) : null;

  // Storage: total from dashboard stats or active plan, used from dashboard stats API
  const maxStorageBytes = storageData?.limitBytes ?? apiPlan?.max_storage_bytes ?? 0;
  const usedStorageBytes = storageData?.usedBytes ?? (user as any)?.storage_used_bytes ?? 0;

  // Use formatted string from API if available, otherwise compute from bytes
  const storageValue = storageData?.formatted ?? formatBytes(usedStorageBytes);
  const storageTotal = maxStorageBytes > 0 ? formatBytes(maxStorageBytes) : null;

  // Team members: current count / plan limit
  const teamCount = teamMembers.length;
  const maxTeamMembers = apiPlan?.max_team_members ?? null;

  // Active plan name - prioritize API data
  const activePlanName = apiPlan?.name ?? null;

  const currentPath = location.pathname;

  // Specific capability checks (checks both plan details and user profile fallback)
  const userPlanInfo = userPlansData?.data?.user;
  const hasTeam = (apiPlan ? !!(apiPlan as any).has_team_login : false) || (userPlanInfo ? !!(userPlanInfo as any).has_team_login : false);
  const hasBranding = (apiPlan ? !!(apiPlan as any).has_business_branding : false) || (userPlanInfo ? !!(userPlanInfo as any).has_business_branding : false);
  const hasPortfolio = (apiPlan ? !!(apiPlan as any).has_portfolio_website : false) || (userPlanInfo ? !!(userPlanInfo as any).has_portfolio_website : false);
  const hasFlipbook = (apiPlan ? !!(apiPlan as any).has_digital_album : false) || (userPlanInfo ? !!(userPlanInfo as any).has_digital_album : false);
  const hasWatermark = (apiPlan ? !!(apiPlan as any).has_custom_watermark : false) || (userPlanInfo ? !!(userPlanInfo as any).has_custom_watermark : false);

  const isBlockedItem = (label: string): boolean => {
    if (user?.role !== 'photographer') return false;
    if (label === 'Profile') return false; // Profile is always open for all users
    if (!isPlanActive) return true;
    if (label === 'Team') return !hasTeam;
    if (label === 'Branding') return !hasBranding;
    if (label === 'Portfolio') return !hasPortfolio;
    if (label === 'Flipbook') return !hasFlipbook;
    if (label === 'Watermark') return !hasWatermark;
    return false;
  };

  const isSubRouteBlocked = (() => {
    if (user?.role !== 'photographer') return false;
    if (currentPath.includes('/settings/team')) return isBlockedItem('Team');
    if (currentPath.includes('/settings/branding')) return isBlockedItem('Branding');
    if (currentPath.includes('/settings/portfolio')) return isBlockedItem('Portfolio');
    if (currentPath.includes('/settings/flipbook')) return isBlockedItem('Flipbook');
    if (currentPath.includes('/settings/watermark')) return isBlockedItem('Watermark');
    return false;
  })();

  const isSpecialRole = user?.role === 'admin' || user?.role === 'photographer';

  const filteredCategories = settingsCategories
    .filter(category => {
      // Only show business and content settings for admin and photographer roles
      if (category.id === 'business' || category.id === 'content') {
        return isSpecialRole;
      }
      return true;
    })
    .map(category => {
      // Remove Team item for regular users
      if (category.id === 'account' && !isSpecialRole) {
        return {
          ...category,
          items: category.items.filter(item => item.path !== '/settings/team'),
        };
      }
      return category;
    });

  const isRootSettings = location.pathname === '/settings' || location.pathname === '/settings/';

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold">Settings</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your account, business, and preferences</p>
          </div>
          {isRootSettings && (
            <AnimatedButton onClick={() => navigate('/')} className="shrink-0">
              <ArrowLeft className="w-4 h-4 inline mr-1" /> Home
            </AnimatedButton>
          )}
          {!isRootSettings && (
            <AnimatedButton onClick={() => navigate('/settings')} className="shrink-0">
              <ArrowLeft className="w-4 h-4 inline mr-1" /> Back
            </AnimatedButton>
          )}
        </div>

        {isRootSettings ? (
          <>
            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4 mb-6 md:mb-8">
              {/* Storage Used */}
              <div
                className={`bg-card rounded-xl border border-border fab-shadow p-4 flex items-center gap-4 ${user?.role === 'photographer' ? 'cursor-pointer hover:border-amber-400 hover:shadow-md transition-all' : ''
                  }`}
                onClick={() => {
                  if (user?.role === 'photographer') {
                    navigate('/analytics');
                  }
                }}
              >
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <FolderOpen className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Storage Used</p>
                  {storageLoading ? (
                    <div className="flex items-center gap-2 mt-1">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span className="text-xs text-muted-foreground">Calculating...</span>
                    </div>
                  ) : (
                    <div className="mt-1">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold tracking-tight text-foreground">{storageValue}</span>
                        {storageTotal && (
                          <span className="text-sm text-muted-foreground font-normal">of {storageTotal}</span>
                        )}
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-2 w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all duration-1000 ease-out"
                          style={{
                            width: `${Math.min(100,
                              storageData?.percentage ??
                              ((usedStorageBytes && maxStorageBytes) ? (usedStorageBytes / maxStorageBytes) * 100 : 0)
                            )}%`
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Photos Used */}
              <div
                className={`bg-card rounded-xl border border-border fab-shadow p-4 flex items-center gap-4 ${user?.role === 'photographer' ? 'cursor-pointer hover:border-blue-400 hover:shadow-md transition-all' : ''
                  }`}
                onClick={() => {
                  if (user?.role === 'photographer') {
                    navigate('/analytics');
                  }
                }}
              >
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Image className="w-6 h-6 text-blue-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground font-medium">Photos Used</p>
                  {storageLoading ? (
                    <div className="flex items-center gap-2 mt-1">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span className="text-xs text-muted-foreground">Calculating...</span>
                    </div>
                  ) : (
                    <div className="mt-1">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold tracking-tight text-foreground">{dashboardStats?.subscription?.photoUsage?.used ?? 0}</span>
                        <span className="text-sm text-muted-foreground font-normal">of {dashboardStats?.subscription?.photoUsage?.limit ?? ((apiPlan as any)?.max_photos || '∞')}</span>
                      </div>
                      <div className="mt-2 w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out"
                          style={{
                            width: `${Math.min(100, dashboardStats?.subscription?.photoUsage?.percentage ?? 0)}%`
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Videos Used */}
              <div
                className={`bg-card rounded-xl border border-border fab-shadow p-4 flex items-center gap-4 ${user?.role === 'photographer' ? 'cursor-pointer hover:border-purple-400 hover:shadow-md transition-all' : ''
                  }`}
                onClick={() => {
                  if (user?.role === 'photographer') {
                    navigate('/analytics');
                  }
                }}
              >
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Video className="w-6 h-6 text-purple-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground font-medium">Videos Used</p>
                  {storageLoading ? (
                    <div className="flex items-center gap-2 mt-1">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span className="text-xs text-muted-foreground">Calculating...</span>
                    </div>
                  ) : (
                    <div className="mt-1">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold tracking-tight text-foreground">{dashboardStats?.subscription?.videoUsage?.used ?? 0}</span>
                        <span className="text-sm text-muted-foreground font-normal">of {dashboardStats?.subscription?.videoUsage?.limit ?? ((apiPlan as any)?.max_videos || '∞')}</span>
                      </div>
                      <div className="mt-2 w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500 rounded-full transition-all duration-1000 ease-out"
                          style={{
                            width: `${Math.min(100, dashboardStats?.subscription?.videoUsage?.percentage ?? 0)}%`
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Events Used */}
              <div
                className={`bg-card rounded-xl border border-border fab-shadow p-4 flex items-center gap-4 ${user?.role === 'photographer' ? 'cursor-pointer hover:border-emerald-400 hover:shadow-md transition-all' : ''
                  }`}
                onClick={() => {
                  if (user?.role === 'photographer') {
                    navigate('/analytics');
                  }
                }}
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <CalendarDays className="w-6 h-6 text-emerald-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground font-medium">Events Used</p>
                  {storageLoading ? (
                    <div className="flex items-center gap-2 mt-1">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span className="text-xs text-muted-foreground">Calculating...</span>
                    </div>
                  ) : (
                    <div className="mt-1">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold tracking-tight text-foreground">{dashboardStats?.subscription?.eventUsage?.used ?? 0}</span>
                        <span className="text-sm text-muted-foreground font-normal">of {dashboardStats?.subscription?.eventUsage?.limit ?? ((apiPlan as any)?.max_events || '∞')}</span>
                      </div>
                      <div className="mt-2 w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
                          style={{
                            width: `${Math.min(100, dashboardStats?.subscription?.eventUsage?.percentage ?? 0)}%`
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Team Members (photographers/admins) or Groups Joined (users) */}
              {isSpecialRole ? (
                <div
                  className="bg-card rounded-xl border border-border fab-shadow p-4 flex items-center gap-4 cursor-pointer hover:border-green-400 hover:shadow-md transition-all"
                  onClick={() => navigate('/settings/team')}
                >
                  <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Team Members</p>
                    <p className="text-xl font-bold">
                      {teamCount}
                      {maxTeamMembers != null && (
                        <span className="text-sm text-muted-foreground font-normal"> / {maxTeamMembers}</span>
                      )}
                    </p>
                  </div>
                </div>
              ) : (
                <div
                  className="bg-card rounded-xl border border-border fab-shadow p-4 flex items-center gap-4 cursor-pointer hover:border-blue-400 hover:shadow-md transition-all"
                  onClick={() => navigate('/')}
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <FolderOpen className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Albums Joined</p>
                    <p className="text-xl font-bold">{groupsJoined}</p>
                  </div>
                </div>
              )}

              {/* Active Plan */}
              <div
                className="bg-card rounded-xl border border-border fab-shadow p-4 flex items-center gap-4 cursor-pointer hover:border-purple-400 hover:shadow-md transition-all"
                onClick={() => {
                  if (apiPlan && isPlanActive) {
                    setShowPlanDetailsModal(true);
                  } else {
                    setShowPlansModal(true);
                  }
                }}
              >
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-purple-500" />
                </div>
                <div className="flex-1">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Active Plan</p>
                    {(userPlansLoading || (plansLoading && !activePlan)) ? (
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground mt-1" />
                    ) : (
                      <p className="text-xl font-bold">
                        {activePlanName && isPlanActive ? activePlanName : 'No Active Plan'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Settings Categories Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {filteredCategories.map((category) => (
                <div key={category.id} className="bg-card rounded-xl border border-border fab-shadow overflow-hidden">
                  <div className="p-4 md:p-5 border-b border-border bg-muted/30">
                    <h2 className="font-heading font-semibold text-lg">{category.title}</h2>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>
                  <div className="p-2">
                    {category.items.map((item) => {
                      const isBlocked = isBlockedItem(item.label);

                      return (
                        <button
                          key={item.label}
                          onClick={() => {
                            if (item.isToggle) {
                              handleToggleResize(!isResizeEnabled);
                              return;
                            }
                            if (isBlocked) {
                              setShowPlansModal(true);
                            } else if (item.path) {
                              navigate(item.path);
                            }
                          }}
                          className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-muted transition-colors group"
                        >
                          <div className={`w-10 h-10 rounded-xl ${item.color.replace('text-', 'bg-')} flex items-center justify-center shrink-0`}>
                            <item.icon className={`w-5 h-5 ${item.color.split(' ')[0]}`} />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-medium text-sm">{item.label}</p>
                            <p className="text-xs text-muted-foreground">{item.desc}</p>
                          </div>
                          {item.isToggle ? (
                            <Switch
                              checked={isResizeEnabled}
                              onCheckedChange={handleToggleResize}
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : isBlocked ? (
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${isPlanActive
                              ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                              : 'bg-primary/10 text-primary border border-primary/20'
                              }`}>
                              {isPlanActive ? 'Upgrade Required' : 'Plan Required'}
                            </span>
                          ) : (
                            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Billing & Payments - Plans Section */}
              <div className="bg-card rounded-xl border border-border fab-shadow overflow-hidden">
                <div className="p-4 md:p-5 border-b border-border bg-muted/30">
                  <h2 className="font-heading font-semibold text-lg">Billing & Payments</h2>
                  <p className="text-sm text-muted-foreground">Manage subscriptions and payments</p>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-heading font-semibold">Subscription</h3>
                    </div>
                    <button
                      onClick={() => setShowPlansModal(true)}
                      className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> View All
                    </button>
                  </div>
                  <div className="space-y-3">
                    {/* Active plan card */}
                    {(userPlansLoading || (plansLoading && !activePlan)) ? (
                      <div className="p-4 rounded-xl bg-gradient-to-r from-[hsl(var(--fab-navy))] to-[hsl(var(--fab-navy-light))] text-white flex items-center gap-3">
                        <Loader2 className="w-4 h-4 animate-spin text-white/70" />
                        <span className="text-sm text-white/70">Loading plan…</span>
                      </div>
                    ) : apiPlan && isPlanActive ? (
                      <div className="p-4 rounded-xl bg-gradient-to-r from-[hsl(var(--fab-navy))] to-[hsl(var(--fab-navy-light))] text-white">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-lg font-heading font-bold">{apiPlan.name}</span>
                          <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-[hsl(var(--fab-amber))] text-[hsl(var(--fab-navy))]">
                            Active
                          </span>
                        </div>
                        <p className="text-white/70 text-sm">
                          {typeof apiPlan.price === 'number'
                            ? `${apiPlan.currency}${apiPlan.price.toLocaleString('en-IN')}`
                            : apiPlan.price}
                          /year
                        </p>
                        {userPlansData?.data?.user?.plan_expires_at && (
                          <p className="text-white/50 text-xs mt-1">
                            Expires: {new Date(userPlansData.data.user.plan_expires_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl border border-dashed border-border text-center">
                        <p className="text-sm font-medium text-foreground">No active plan</p>
                        <p className="text-xs text-muted-foreground mt-1">Get started with a plan that fits your needs</p>
                        <button
                          onClick={() => setShowPlansModal(true)}
                          className="mt-3 px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity"
                        >
                          Explore All Plans
                        </button>
                      </div>
                    )}

                    <div className="flex items-center gap-3 w-full">
                      <button
                        onClick={() => setShowPlansModal(true)}
                        className="flex-1 py-2.5 rounded-xl border border-primary text-primary text-sm font-medium hover:bg-primary/5 transition-colors"
                      >
                        {isPlanActive ? 'Change Plan' : 'Explore All Plans'}
                      </button>
                      <button
                        onClick={() => setShowAddFeaturesModal(true)}
                        className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[hsl(var(--fab-amber))] to-orange-500 text-white text-sm font-medium hover:shadow-lg hover:shadow-orange-500/25 transition-all"
                      >
                        Add More Features
                      </button>
                    </div>


                  </div>
                </div>
              </div>
            </div>

            {/* Help Banner */}
            <div className="mt-6 md:mt-8 bg-gradient-to-r from-black to-gray-800 rounded-xl p-4 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-white">Need help with settings?</h3>
                  <p className="text-sm text-white/70">Check our documentation or contact support</p>
                </div>
              </div>
              <AnimatedButton onClick={() => navigate('/help')}>
                Get Support
              </AnimatedButton>
            </div>
          </>
        ) : (
          <>
            {/* Content Area */}
            <div className="bg-card rounded-xl border border-border fab-shadow min-h-[400px] overflow-hidden">
              {isSubRouteBlocked ? (
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
                      Explore Premium Plans
                    </button>
                    <button
                      onClick={() => navigate('/settings')}
                      className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-extrabold text-sm hover:bg-slate-50 transition-all active:scale-95"
                    >
                      Back to Settings
                    </button>
                  </div>
                </div>
              ) : (
                <Outlet />
              )}
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <SubscriptionPlansModal
        open={showPlansModal}
        onOpenChange={setShowPlansModal}
      />
      <AddFeaturesModal
        open={showAddFeaturesModal}
        onOpenChange={setShowAddFeaturesModal}
        plan={apiPlan as any}
        isActivePlan={isPlanActive}
      />

      {/* Active Plan Details Modal */}
      {showPlanDetailsModal && apiPlan && isPlanActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowPlanDetailsModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-4 overflow-hidden animate-in fade-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="relative px-6 py-6 bg-gradient-to-br from-[#121212] to-[#242424] text-white">
              <div className="absolute top-0 right-0 w-40 h-40 bg-[hsl(var(--fab-amber))]/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4 pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-[hsl(var(--fab-amber))]/20 flex items-center justify-center border border-[hsl(var(--fab-amber))]/30">
                      <Sparkles className="w-5 h-5 text-[hsl(var(--fab-amber))]" />
                    </div>
                    <div>
                      <p className="text-white/60 text-xs font-medium uppercase tracking-widest">Active Plan</p>
                      <h3 className="text-xl font-heading font-bold text-white">{apiPlan.name}</h3>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-lg text-xs font-bold bg-[hsl(var(--fab-amber))] text-[hsl(var(--fab-navy))] uppercase tracking-wide">
                    Active
                  </span>
                </div>
                <div className="flex items-baseline gap-1 mt-3">
                  <span className="text-2xl font-black text-white">
                    {typeof apiPlan.price === 'number' ? `${apiPlan.currency}${apiPlan.price.toLocaleString('en-IN')}` : apiPlan.price}
                  </span>
                  <span className="text-white/50 text-sm font-medium">/year</span>
                </div>
                {userPlansData?.data?.user?.plan_expires_at && (
                  <p className="text-white/40 text-xs mt-1">Expires: {new Date(userPlansData.data.user.plan_expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                )}
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              {/* Plan Limits & Usage */}
              <div>
                <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">Plan Limits & Usage</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* Photos */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Photos</p>
                        <span className="text-[9px] font-bold text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded uppercase">
                          {dashboardStats?.subscription?.photoUsage?.used ?? 0} Used
                        </span>
                      </div>
                      <p className="text-lg font-black text-slate-800 flex flex-wrap items-center gap-1">
                        <span>{(apiPlan as any).max_photos === 0 ? 'Unlimited' : (apiPlan as any).max_photos ? (apiPlan as any).max_photos.toLocaleString('en-IN') : 'N/A'}</span>
                        {(() => {
                          const basePhotos = (apiPlan as any).max_photos || 0;
                          const totalPhotos = dashboardStats?.subscription?.photoUsage?.limit ?? basePhotos;
                          const addonPhotos = totalPhotos > basePhotos && basePhotos !== 0 ? totalPhotos - basePhotos : 0;
                          return addonPhotos > 0 ? <span className="text-xs font-bold text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded-md leading-none">+{addonPhotos.toLocaleString('en-IN')}</span> : null;
                        })()}
                      </p>
                    </div>
                    {((apiPlan as any).max_photos !== 0) && (
                      <div className="mt-3 w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${dashboardStats?.subscription?.photoUsage?.percentage ?? 0}%` }} />
                      </div>
                    )}
                  </div>
                  {/* Videos */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Videos</p>
                        <span className="text-[9px] font-bold text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded uppercase">
                          {dashboardStats?.subscription?.videoUsage?.used ?? 0} Used
                        </span>
                      </div>
                      <p className="text-lg font-black text-slate-800 flex flex-wrap items-center gap-1">
                        <span>{(apiPlan as any).max_videos === 0 ? 'Unlimited' : (apiPlan as any).max_videos ? (apiPlan as any).max_videos.toLocaleString('en-IN') : 'N/A'}</span>
                        {(() => {
                          const baseVideos = (apiPlan as any).max_videos || 0;
                          const totalVideos = dashboardStats?.subscription?.videoUsage?.limit ?? baseVideos;
                          const addonVideos = totalVideos > baseVideos && baseVideos !== 0 ? totalVideos - baseVideos : 0;
                          return addonVideos > 0 ? <span className="text-xs font-bold text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded-md leading-none">+{addonVideos.toLocaleString('en-IN')}</span> : null;
                        })()}
                      </p>
                    </div>
                    {((apiPlan as any).max_videos !== 0) && (
                      <div className="mt-3 w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${dashboardStats?.subscription?.videoUsage?.percentage ?? 0}%` }} />
                      </div>
                    )}
                  </div>
                  {/* Storage */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Storage</p>
                        <span className="text-[9px] font-bold text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded uppercase">
                          {dashboardStats?.storage?.usedFormatted ?? '0 B'}
                        </span>
                      </div>
                      <p className="text-lg font-black text-slate-800 flex flex-wrap items-center gap-1">
                        <span>{(apiPlan as any).max_storage_bytes === 0 ? 'Unlimited' : (apiPlan as any).max_storage_bytes ? formatBytes((apiPlan as any).max_storage_bytes) : 'N/A'}</span>
                        {(() => {
                          const baseStorage = (apiPlan as any).max_storage_bytes || 0;
                          const totalStorage = dashboardStats?.storage?.limitBytes ?? baseStorage;
                          const addonStorage = totalStorage > baseStorage && baseStorage !== 0 ? totalStorage - baseStorage : 0;
                          return addonStorage > 0 ? <span className="text-xs font-bold text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded-md leading-none">+{formatBytes(addonStorage).replace(' ', '')}</span> : null;
                        })()}
                      </p>
                    </div>
                    {((apiPlan as any).max_storage_bytes !== 0) && (
                      <div className="mt-3 w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${dashboardStats?.storage?.percentage ?? 0}%` }} />
                      </div>
                    )}
                  </div>
                  {/* Events */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Events</p>
                        <span className="text-[9px] font-bold text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded uppercase">
                          {dashboardStats?.subscription?.eventUsage?.used ?? 0} Used
                        </span>
                      </div>
                      <p className="text-lg font-black text-slate-800 flex flex-wrap items-center gap-1">
                        <span>{(apiPlan as any).max_events === 0 ? 'Unlimited' : (apiPlan as any).max_events ? (apiPlan as any).max_events.toLocaleString('en-IN') : 'N/A'}</span>
                        {(() => {
                          const baseEvents = (apiPlan as any).max_events || 0;
                          const totalEvents = dashboardStats?.subscription?.eventUsage?.limit ?? baseEvents;
                          const addonEvents = totalEvents > baseEvents && baseEvents !== 0 ? totalEvents - baseEvents : 0;
                          return addonEvents > 0 ? <span className="text-xs font-bold text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded-md leading-none">+{addonEvents.toLocaleString('en-IN')}</span> : null;
                        })()}
                      </p>
                    </div>
                    {((apiPlan as any).max_events !== 0) && (
                      <div className="mt-3 w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${dashboardStats?.subscription?.eventUsage?.percentage ?? 0}%` }} />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Features Overview */}
              <div>
                <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">Features Overview</h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'has_custom_watermark', label: 'Custom Watermark' },
                    { key: 'has_face_recognition', label: 'Face Recognition' },
                    { key: 'has_bulk_download', label: 'Bulk Download' },
                    { key: 'has_business_branding', label: 'Business Branding' },
                    { key: 'has_switch_downloads', label: 'Switch Downloads' },
                    { key: 'has_portfolio_website', label: 'Portfolio Website' },
                    { key: 'has_team_login', label: 'Team Login' },
                    { key: 'has_view_client_favorites', label: 'Client Favorites' },
                    { key: 'has_digital_album', label: 'Digital Flipbook' },
                  ].map((feat) => {
                    const isEnabled = !!(apiPlan as any)[feat.key];
                    return isEnabled ? (
                      <span key={feat.key} className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-100">
                        <CheckCircle2 className="w-3 h-3 text-purple-600" /> {feat.label}
                      </span>
                    ) : (
                      <span key={feat.key} className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-50 text-slate-400 border border-slate-100 line-through decoration-slate-300">
                        <XCircle className="w-3 h-3 text-slate-300" /> {feat.label}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => { setShowPlanDetailsModal(false); setShowPlansModal(true); }}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-bold hover:bg-slate-50 transition-colors"
              >
                Change Plan
              </button>
              <button
                onClick={() => { setShowPlanDetailsModal(false); setShowAddFeaturesModal(true); }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[hsl(var(--fab-amber))] to-orange-500 text-white text-sm font-bold hover:shadow-lg hover:shadow-orange-500/25 transition-all"
              >
                Add More Features
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
