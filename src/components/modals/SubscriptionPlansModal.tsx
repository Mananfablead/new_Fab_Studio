import { useEffect, useState } from 'react';
import {
  Check,
  X,
  Sparkles,
  Zap,
  Crown,
  Loader2,
  AlertCircle,
  Image,
  Video,
  HardDrive,
  CalendarDays,
  Droplets,
  ScanFace,
  Globe,
  Users,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchPlans } from '@/store/slices/plansSlice';
import {
  selectPlans,
  selectPlansRole,
  selectActivePlan,
  selectPlansLoading,
  selectPlansError,
  selectSelectingPlanId,
} from '@/store/selectors';
import type { Plan } from '@/store/slices/plansSlice';
import AddFeaturesModal from '@/components/modals/AddFeaturesModal';
import { useUserPlans } from '@/hooks/useUserPlans';

interface SubscriptionPlansModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInquiryClose?: () => void;
}

const ICON_MAP: Record<number, 'sparkles' | 'zap' | 'crown'> = {
  0: 'sparkles',
  1: 'zap',
  2: 'crown',
};

const GRADIENT_MAP: Record<number, string> = {
  0: 'from-blue-500 to-cyan-500',
  1: 'from-purple-500 to-pink-500',
  2: 'from-amber-500 to-orange-500',
};

const IconComponent = ({ icon, className }: { icon: string; className?: string }) => {
  switch (icon) {
    case 'zap': return <Zap className={className} />;
    case 'crown': return <Crown className={className} />;
    default: return <Sparkles className={className} />;
  }
};

/** Format bytes → human-readable string */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

/** Format price */
function formatPrice(price: string | number, currency = '₹'): string {
  if (price === 0 || price === '0') return 'Free';
  if (typeof price === 'number') return `${currency}${price.toLocaleString('en-IN')}`;
  return String(price);
}

interface CapabilityRow {
  icon: React.ReactNode;
  label: string;
  value: string | boolean;
}

/** Build the capability rows from the API plan object */
function buildCapabilities(plan: Plan): CapabilityRow[] {
  const rows: CapabilityRow[] = [];

  rows.push({
    icon: <Image className="w-3.5 h-3.5" />,
    label: 'Photos',
    value: plan.max_photos === undefined || plan.max_photos === null ? false : plan.max_photos === 0 ? 'Unlimited' : plan.max_photos.toLocaleString('en-IN'),
  });

  rows.push({
    icon: <Video className="w-3.5 h-3.5" />,
    label: 'Videos',
    value: plan.max_videos === undefined || plan.max_videos === null || plan.max_videos === 0 ? false : plan.max_videos.toLocaleString('en-IN'),
  });

  rows.push({
    icon: <HardDrive className="w-3.5 h-3.5" />,
    label: 'Storage',
    value: plan.max_storage_bytes === undefined || plan.max_storage_bytes === null ? false : plan.max_storage_bytes === 0 ? 'Unlimited' : formatBytes(plan.max_storage_bytes),
  });

  rows.push({
    icon: <CalendarDays className="w-3.5 h-3.5" />,
    label: 'Events',
    value: plan.max_events === undefined || plan.max_events === null ? false : plan.max_events === 0 ? 'Unlimited' : plan.max_events.toLocaleString('en-IN'),
  });

  rows.push({
    icon: <Droplets className="w-3.5 h-3.5" />,
    label: 'Custom Watermark',
    value: !!plan.has_custom_watermark,
  });

  rows.push({
    icon: <ScanFace className="w-3.5 h-3.5" />,
    label: 'Face Recognition',
    value: !!plan.has_face_recognition,
  });

  rows.push({
    icon: <Check className="w-3.5 h-3.5" />,
    label: 'Bulk Download',
    value: !!plan.has_bulk_download,
  });

  rows.push({
    icon: <Check className="w-3.5 h-3.5" />,
    label: 'Business Branding',
    value: !!plan.has_business_branding,
  });

  rows.push({
    icon: <Image className="w-3.5 h-3.5" />,
    label: 'Digital Flipbook',
    value: !!plan.has_digital_album,
  });

  rows.push({
    icon: <Globe className="w-3.5 h-3.5" />,
    label: 'Portfolio Website',
    value: !!plan.has_portfolio_website,
  });

  rows.push({
    icon: <Zap className="w-3.5 h-3.5" />,
    label: 'Switch Downloads',
    value: !!plan.has_switch_downloads,
  });

  rows.push({
    icon: <Users className="w-3.5 h-3.5" />,
    label: 'Team Login',
    value: !!plan.has_team_login,
  });

  rows.push({
    icon: <Check className="w-3.5 h-3.5" />,
    label: 'View Client Favorites',
    value: !!plan.has_view_client_favorites,
  });

  // Fallback: generic features array / object
  // If no manually extracted features were valid but the plan.features exist
  if (rows.length === 13 && plan.features) {
    const featureList = Array.isArray(plan.features)
      ? plan.features.map(String)
      : Object.entries(plan.features).map(([k, v]) => {
        const label = k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        return v === true || v === 1 ? label : `${label}: ${v}`;
      });
    featureList.forEach((f) => rows.push({ icon: null, label: f, value: true }));
  }

  return rows;
}

export default function SubscriptionPlansModal({ open, onOpenChange, onInquiryClose }: SubscriptionPlansModalProps) {
  const dispatch = useAppDispatch();
  const plans = useAppSelector(selectPlans);
  const plansRole = useAppSelector(selectPlansRole);
  const activePlan = useAppSelector(selectActivePlan);
  const loading = useAppSelector(selectPlansLoading);
  const error = useAppSelector(selectPlansError);
  const selectingPlanId = useAppSelector(selectSelectingPlanId);
  const user = useAppSelector((state) => state.auth.user);

  const resolvedRole = user?.role === 'admin' ? 'photographer' : user?.role;
  const hasResolvedRole = resolvedRole === 'user' || resolvedRole === 'photographer';

  // Use userPlans API to verify plan is actually purchased
  const { userPlansData } = useUserPlans();
  const userPlanFromApi = userPlansData?.data?.plans?.[0];
  const isPlanPurchased = !!(
    userPlansData?.data?.user?.is_plan_purchased === true ||
    userPlanFromApi?.is_purchased === true ||
    userPlanFromApi?.is_active === true
  );
  const purchasedPlanId = isPlanPurchased ? (userPlanFromApi?.id ?? activePlan?.id) : null;

  const [addFeaturesOpen, setAddFeaturesOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [selectedPlanIsActive, setSelectedPlanIsActive] = useState(false);
  const hasPlansForRole = hasResolvedRole && plansRole === resolvedRole;
  const visiblePlans = hasPlansForRole ? plans : [];
  const isLoadingPlansForRole = loading || (open && !hasResolvedRole) || (open && !hasPlansForRole);

  useEffect(() => {
    if (open && hasResolvedRole && !hasPlansForRole) {
      dispatch(fetchPlans(resolvedRole));
    }
  }, [open, dispatch, hasPlansForRole, hasResolvedRole, resolvedRole]);

  const handleSelectPlan = (plan: Plan, isActive: boolean) => {
    setSelectedPlan(plan);
    setSelectedPlanIsActive(isActive);
    setAddFeaturesOpen(true);
  };

  const handleAddFeaturesOpenChange = (nextOpen: boolean) => {
    setAddFeaturesOpen(nextOpen);
    if (!nextOpen) onInquiryClose?.();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl overflow-y-auto p-0 gap-0 border-0 bg-transparent shadow-none [&>button]:text-primary-foreground [&>button]:bg-primary [&>button]:hover:opacity-90 [&>button]:rounded-full [&>button]:p-2 [&>button]:transition-all [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] max-h-[95dvh] sm:max-h-[90vh]">
          <div className="bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl overflow-hidden m-4 sm:m-0">
            {/* Header */}
            <div className="relative px-8 pt-8 pb-6 bg-gradient-to-br from-[hsl(var(--fab-navy))] to-[hsl(var(--fab-navy))]/90">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[hsl(var(--fab-amber))]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <DialogHeader className="relative">
                <DialogTitle className="text-2xl font-heading font-bold text-white mb-2">
                  Choose Your Plan
                </DialogTitle>
                <DialogDescription className="text-white/70 text-base">
                  Upgrade your experience with premium features
                </DialogDescription>
              </DialogHeader>
            </div>

            {/* Body */}
            <div className="p-8">
              {/* Loading */}
              {isLoadingPlansForRole && (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Loading plans…</p>
                </div>
              )}

              {/* Error */}
              {!isLoadingPlansForRole && error && (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                  <p className="text-sm text-red-500">{error}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => hasResolvedRole && dispatch(fetchPlans(resolvedRole))}
                    disabled={!hasResolvedRole}
                  >
                    Retry
                  </Button>
                </div>
              )}

              {/* Plans Grid */}
              {!isLoadingPlansForRole && !error && visiblePlans.length > 0 && (
                <>
                  <Carousel
                    opts={{ align: "start" }}
                    className="w-full relative px-2 sm:px-6"
                  >
                    <CarouselContent className="-ml-4 sm:-ml-6 py-4">
                      {visiblePlans.map((plan, idx) => {
                        const isActive = isPlanPurchased && String(plan.id) === String(purchasedPlanId ?? activePlan?.id);
                        const isSelecting = String(selectingPlanId) === String(plan.id);
                        const icon = plan.icon || ICON_MAP[idx] || 'sparkles';
                        const gradient = plan.color || GRADIENT_MAP[idx] || 'from-blue-500 to-cyan-500';
                        const period = plan.period || plan.billing_cycle || 'month';
                        const capabilities = buildCapabilities(plan);

                        return (
                          <CarouselItem key={plan.id} className="pl-4 sm:pl-6 basis-full md:basis-1/2 lg:basis-1/3 flex">
                            <div
                              className={`relative rounded-xl border-2 transition-all duration-300 overflow-hidden flex flex-col w-full bg-white ${isActive
                                ? 'border-[hsl(var(--fab-amber))] shadow-xl shadow-[hsl(var(--fab-amber))]/10'
                                : 'border-border hover:border-[hsl(var(--fab-amber))]/50 hover:shadow-lg'
                                }`}
                            >
                              {/* Active badge */}
                              {isActive && (
                                <div className="bg-[hsl(var(--fab-amber))] text-[hsl(var(--fab-navy))] text-center py-1.5 text-xs font-bold uppercase tracking-wider">
                                  Current Plan
                                </div>
                              )}

                              <div className="p-6 flex flex-col flex-1">
                                {/* Icon & Name */}
                                <div className="flex items-center gap-3 mb-3">
                                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg shrink-0`}>
                                    <IconComponent icon={icon} className="w-6 h-6 text-white" />
                                  </div>
                                  <div>
                                    <h4 className="font-heading font-bold text-lg leading-tight">{plan.name}</h4>
                                    <p className="text-xs text-muted-foreground">{period}ly billing</p>
                                  </div>
                                </div>

                                {/* Description */}
                                {plan.description && (
                                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                                    {plan.description}
                                  </p>
                                )}

                                {/* Price */}
                                <div className="mb-5">
                                  <span className="text-4xl font-bold">
                                    {formatPrice(plan.price, plan.currency)}
                                  </span>
                                  {plan.price !== 0 && plan.price !== '0' && (
                                    <span className="text-muted-foreground text-sm">/{period}</span>
                                  )}
                                </div>

                                {/* Capabilities */}
                                <ul className="space-y-2.5 mb-6 flex-1">
                                  {capabilities
                                    .filter(cap => {
                                      const isBool = typeof cap.value === 'boolean';
                                      return !isBool || cap.value === true;
                                    })
                                    .map((cap, i) => {
                                      const isBool = typeof cap.value === 'boolean';
                                      const isProvided = isBool ? cap.value : true;

                                      return (
                                        <li key={i} className="flex items-center gap-2.5 text-sm">
                                          {/* tick / cross */}
                                          <div
                                            className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${isProvided ? 'bg-green-100' : 'bg-red-100'
                                              }`}
                                          >
                                            {isProvided ? (
                                              <Check className="w-3 h-3 text-green-600" />
                                            ) : (
                                              <X className="w-3 h-3 text-red-400" />
                                            )}
                                          </div>

                                          {/* icon */}
                                          {cap.icon && (
                                            <span className="text-muted-foreground">{cap.icon}</span>
                                          )}

                                          {/* label + value */}
                                          <span className={`${isProvided ? 'text-foreground' : 'text-muted-foreground line-through'}`}>
                                            {cap.label}
                                            {!isBool && (
                                              <span className="ml-1 font-semibold text-foreground no-underline" style={{ textDecoration: 'none' }}>
                                                — {cap.value as string}
                                              </span>
                                            )}
                                          </span>
                                        </li>
                                      );
                                    })}
                                </ul>

                                {/* CTA */}
                                <Button
                                  className={`w-full py-5 rounded-xl font-semibold transition-all ${isActive
                                    ? 'bg-gradient-to-r from-[hsl(var(--fab-amber))] to-orange-500 text-white hover:shadow-lg hover:shadow-orange-500/25 hover:-translate-y-0.5'
                                    : 'bg-gradient-to-r from-[hsl(var(--fab-amber))] to-orange-500 text-white hover:shadow-lg hover:shadow-orange-500/25 hover:-translate-y-0.5'
                                    }`}
                                  disabled={!!selectingPlanId}
                                  onClick={() => handleSelectPlan(plan, isActive)}
                                >
                                  {isSelecting ? (
                                    <span className="flex items-center gap-2">
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                      Processing…
                                    </span>
                                  ) : isActive ? (
                                    'Add More Features'
                                  ) : (
                                    'Choose Plan'
                                  )}
                                </Button>
                              </div>
                            </div>
                          </CarouselItem>
                        );
                      })}
                    </CarouselContent>
                    <CarouselPrevious className="hidden sm:flex -left-4 bg-white/80 backdrop-blur-sm shadow-md border-slate-200 text-slate-700 hover:bg-white hover:text-[hsl(var(--fab-amber))]" />
                    <CarouselNext className="hidden sm:flex -right-4 bg-white/80 backdrop-blur-sm shadow-md border-slate-200 text-slate-700 hover:bg-white hover:text-[hsl(var(--fab-amber))]" />
                  </Carousel>

                  {/* <p className="text-center text-sm text-muted-foreground mt-6">
                  All plans include a 14-day free trial. No credit card required.
                </p> */}
                </>
              )}

              {/* Empty state */}
              {!isLoadingPlansForRole && !error && visiblePlans.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                  <p className="text-sm text-muted-foreground">No plans available at the moment.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => hasResolvedRole && dispatch(fetchPlans(resolvedRole))}
                    disabled={!hasResolvedRole}
                  >
                    Refresh
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AddFeaturesModal
        open={addFeaturesOpen}
        onOpenChange={handleAddFeaturesOpenChange}
        plan={selectedPlan}
        isActivePlan={selectedPlanIsActive}
        onPaymentSuccess={() => onOpenChange(false)}
      />
    </>
  );
}
