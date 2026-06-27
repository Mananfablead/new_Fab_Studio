import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Check, Package, Globe, Eye, Zap, Image as ImageIcon, Video, CalendarDays,
  Heart, EyeOff, BarChart, Download, Layout, Users, Droplets, HardDrive, ScanFace,
  Loader2,
} from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useAppSelector } from '@/store';
import { selectUser } from '@/store/selectors';
import { createOrder, verifySignature, openRazorpayCheckout } from '@/services/paymentService';
import api from '@/services/api';
import type { Plan } from '@/store/slices/plansSlice';

// ─── API types ────────────────────────────────────────────────────────────────

interface FeatureAddon {
  id: number;
  subscription_feature_id: number;
  feature_value: string | null;
  addon_price: number;
}

interface UncheckedFeature {
  id: number;
  feature_name: string;
  value: string | null;
  icon: string;
  addons: FeatureAddon[];
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface AddFeaturesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan?: Plan | null;
  isActivePlan?: boolean; // true = user already owns this plan, charge addons only
}

// ─── Helpers & Resolvers ──────────────────────────────────────────────────────

const getPayloadKey = (featureName: string): 'photos' | 'videos' | 'storage' | 'events' | null => {
  const name = featureName.toLowerCase();
  if (name.includes('photo')) return 'photos';
  if (name.includes('video')) return 'videos';
  if (name.includes('storage')) return 'storage';
  if (name.includes('event')) return 'events';
  return null;
};

const getAddonLabel = (featureName: string, value: string | null) => {
  if (!value) return '';
  const num = parseFloat(value);
  const formattedNum = isNaN(num) ? value : num.toLocaleString('en-IN');
  
  const lowerName = featureName.toLowerCase();
  if (lowerName.includes('photo')) {
    return `+${formattedNum} Photos`;
  }
  if (lowerName.includes('video')) {
    return `+${formattedNum} Videos`;
  }
  if (lowerName.includes('storage')) {
    return `+${formattedNum}GB Storage`;
  }
  if (lowerName.includes('event')) {
    return `+${formattedNum} Events`;
  }
  return `+${formattedNum} ${featureName}`;
};

// ─── Icon resolver (matches backend icon strings) ─────────────────────────────

const IconComponent = ({ icon, className }: { icon: string; className?: string }) => {
  switch (icon?.toLowerCase()) {
    case 'droplets':          return <Droplets className={className} />;
    case 'scanface':
    case 'scan-face':
    case 'scan_face':         return <ScanFace className={className} />;
    case 'globe':             return <Globe className={className} />;
    case 'eye':               return <Eye className={className} />;
    case 'zap':               return <Zap className={className} />;
    case 'heart':             return <Heart className={className} />;
    case 'eye-off':
    case 'eyeoff':            return <EyeOff className={className} />;
    case 'barchart':
    case 'bar-chart':
    case 'bar_chart':         return <BarChart className={className} />;
    case 'download':          return <Download className={className} />;
    case 'layout':            return <Layout className={className} />;
    case 'users':             return <Users className={className} />;
    case 'hardrive':
    case 'hard-drive':
    case 'harddrive':         return <HardDrive className={className} />;
    case 'image':             return <ImageIcon className={className} />;
    case 'check':             return <Check className={className} />;
    case 'calendardays':
    case 'calendar-days':
    case 'calendar_days':     return <CalendarDays className={className} />;
    default:                  return <Package className={className} />;
  }
};

const initDropdowns = () => ({ photos: 'none', videos: 'none', storage: 'none', events: 'none' });

// ─── Component ────────────────────────────────────────────────────────────────

export default function AddFeaturesModal({ open, onOpenChange, plan, isActivePlan = false }: AddFeaturesModalProps) {
  const user = useAppSelector(selectUser);

  const [dropdowns, setDropdowns] = useState(initDropdowns());
  const [toggles, setToggles] = useState<Record<number, boolean>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [features, setFeatures] = useState<UncheckedFeature[]>([]);
  const [featuresLoading, setFeaturesLoading] = useState(false);

  // Synchronous guard against double-click race condition
  const processingRef = useRef(false);

  // ── Categorize features dynamically from the API response ───────────────────
  const dropdownFeatures = features.filter(
    (f) => f.addons.length > 0 && f.addons.some((a) => a.feature_value !== null)
  );

  const toggleFeatures = features.filter(
    (f) => f.addons.length === 1 && f.addons[0].feature_value === null
  );

  // ── Fetch unchecked features when modal opens ─────────────────────────────

  useEffect(() => {
    if (!open || !plan?.id) return;

    setFeaturesLoading(true);
    setFeatures([]);

    api.get(`/plans/${plan.id}/unchecked-features`)
      .then((res) => {
        const data = res.data;
        // Handle both { data: [...] } and { success, data: [...] } shapes
        const list: UncheckedFeature[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : [];
        setFeatures(list);
      })
      .catch((err) => {
        console.error('Failed to load features:', err);
        toast.error('Could not load available add-ons.');
      })
      .finally(() => setFeaturesLoading(false));
  }, [open, plan?.id]);

  // ── Price calculation ─────────────────────────────────────────────────────

  const totalDropdowns = dropdownFeatures.reduce((acc, feat) => {
    const key = getPayloadKey(feat.feature_name);
    if (!key) return acc;
    const selectedValue = dropdowns[key];
    if (selectedValue === 'none') return acc;
    const opt = feat.addons.find(a => a.feature_value === selectedValue);
    return acc + (opt?.addon_price ?? 0);
  }, 0);

  const totalToggles = toggleFeatures.reduce((acc, feat) => {
    if (!toggles[feat.id]) return acc;
    const addon = feat.addons?.[0];
    return acc + (addon?.addon_price ?? 0);
  }, 0);

  const addonsTotal = totalDropdowns + totalToggles;
  // Active plan: charge addons only. New plan: plan price + addons.
  const grandTotal = isActivePlan ? addonsTotal : Number(plan?.price ?? 0) + addonsTotal;

  // ── Close / reset ─────────────────────────────────────────────────────────

  const handleClose = () => {
    if (processingRef.current) return;
    onOpenChange(false);
    setDropdowns(initDropdowns());
    setToggles({});
    setFeatures([]);
  };

  // ── Payment flow ──────────────────────────────────────────────────────────

  const handleProceedToCheckout = useCallback(async () => {
    if (processingRef.current) return;

    if (grandTotal <= 0) {
      toast.info('Please select at least one add-on to proceed.');
      return;
    }

    processingRef.current = true;
    setIsProcessing(true);

    try {
      // Build feature_id and addons_id arrays
      const feature_id: number[] = [];
      const addons_id: number[] = [];

      dropdownFeatures.forEach(feat => {
        const key = getPayloadKey(feat.feature_name);
        if (key && dropdowns[key] !== 'none') {
          const opt = feat.addons.find(a => a.feature_value === dropdowns[key]);
          if (opt) {
            feature_id.push(feat.id);
            addons_id.push(opt.id);
          }
        }
      });

      toggleFeatures.forEach(feat => {
        if (toggles[feat.id] && feat.addons?.[0]) {
          feature_id.push(feat.id);
          addons_id.push(feat.addons[0].id);
        }
      });

      // Create order — backend handles price calculation from plan_id + addons_id
      const order = await createOrder({
        amount: grandTotal,
        ...(plan?.id && { plan_id: plan.id }),
        ...(feature_id.length > 0 && { feature_id }),
        ...(addons_id.length > 0 && { addons_id }),
      });

      // Open Razorpay modal — use order.amount from backend (already in paise)
      openRazorpayCheckout({
        orderId: order.id,
        amount: order.amount, // paise — from backend order, reflects true total
        currency: order.currency ?? 'INR',
        name: 'Fablead Studio',
        description: plan ? `${plan.name} Plan + Add-ons` : 'Add-ons',
        prefill: {
          name: user ? `${user.firstName} ${user.lastName}`.trim() : undefined,
          email: user?.email,
          contact: user?.phone
            ? user.phone.replace(/^\+?91/, '').replace(/\D/g, '').slice(-10)
            : undefined,
        },
        onSuccess: async ({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
          try {
            await verifySignature({ razorpay_order_id, razorpay_payment_id, razorpay_signature });
            toast.success('Payment successful! Your plan has been updated.');
            processingRef.current = false;
            handleClose();
          } catch (err) {
            console.error('Signature verification failed:', err);
            toast.error('Payment received but verification failed. Please contact support.');
          } finally {
            processingRef.current = false;
            setIsProcessing(false);
          }
        },
        onDismiss: () => {
          toast.info('Payment cancelled.');
          processingRef.current = false;
          setIsProcessing(false);
        },
      });
    } catch (err: any) {
      console.error('Checkout error:', err);
      const message = err?.response?.data?.message ?? err?.message ?? 'Failed to initiate payment. Please try again.';
      toast.error(message);
      processingRef.current = false;
      setIsProcessing(false);
    }
  }, [grandTotal, dropdowns, toggles, plan, user, toggleFeatures]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl p-0 gap-0 border-0 bg-transparent shadow-none [&>button]:text-white [&>button]:hover:text-[hsl(var(--fab-amber))] [&>button]:bg-white/10 [&>button]:hover:bg-white/20 [&>button]:rounded-full [&>button]:p-2 [&>button]:transition-colors [&>button]:z-50 [&>button]:right-4 [&>button]:top-4 sm:[&>button]:right-4 sm:[&>button]:top-4">
        <div className="bg-white rounded-2xl shadow-2xl m-4 sm:m-0 flex flex-col overflow-hidden max-h-[95dvh] sm:max-h-[90vh]">

          {/* Header */}
          <div className="relative px-6 py-5 shrink-0 text-center bg-gradient-to-br from-[hsl(var(--fab-navy))] to-[hsl(var(--fab-navy))]/90">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[hsl(var(--fab-amber))]/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <div className="relative z-10">
              <DialogTitle className="text-xl font-bold font-heading text-white mb-0.5">
                {isActivePlan
                  ? `Add Features - ${plan?.name ?? ''} Plan`
                  : plan ? `Checkout - ${plan.name} Plan` : 'Checkout'}
              </DialogTitle>
              <DialogDescription className="text-white/70 text-xs font-medium flex items-center justify-center gap-2 mt-1">
                {!isActivePlan && plan && (
                  <>
                    <span>Base Price: ₹{Number(plan.price || 0).toLocaleString('en-IN')}</span>
                    <span className="w-1 h-1 rounded-full bg-white/30" />
                  </>
                )}
                <span>{isActivePlan ? 'Select add-ons to enhance your current plan' : 'Review and select add-ons'}</span>
              </DialogDescription>
            </div>
          </div>

          {/* Body */}
          <div className="p-8 overflow-y-auto flex-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="flex flex-col">

              <div className="mb-6">
                <h3 className="text-xl font-bold font-heading text-slate-800">Available Add-ons</h3>
                <p className="text-sm text-slate-500 mt-0.5">Customize your subscription with extra limits and features</p>
              </div>

              {/* Table Header */}
              <div className="flex items-center justify-between py-3 border-b-2 border-slate-100 mb-2 px-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex-1">Feature</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest w-[240px]">Price</span>
              </div>

              {/* Resource dropdowns */}
              {dropdownFeatures.map((feature) => {
                const payloadKey = getPayloadKey(feature.feature_name);
                if (!payloadKey) return null;
                const isSelected = dropdowns[payloadKey] !== 'none';
                
                // Sort addons in ascending order of feature_value (numerical)
                const sortedAddons = [...feature.addons].sort((a, b) => {
                  const valA = parseFloat(a.feature_value || '0');
                  const valB = parseFloat(b.feature_value || '0');
                  return valA - valB;
                });

                return (
                  <div key={feature.id} className="flex items-center justify-between py-3 px-2 border-b border-slate-50 hover:bg-slate-50/50 transition-colors rounded-lg">
                    <div className="flex items-center gap-4 flex-1">
                      <button
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setDropdowns(prev => ({ ...prev, [payloadKey]: 'none' }));
                          } else {
                            const first = sortedAddons[0];
                            if (first && first.feature_value) {
                              setDropdowns(prev => ({ ...prev, [payloadKey]: first.feature_value }));
                            }
                          }
                        }}
                        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                          isSelected ? 'bg-green-100 border-transparent' : 'border-slate-300 hover:border-slate-400 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-green-600" />}
                      </button>
                      <div className="flex items-center gap-2.5">
                        <IconComponent icon={feature.icon} className="w-3.5 h-3.5 text-slate-500" />
                        <span className="font-medium text-slate-800 text-sm">{feature.feature_name}</span>
                      </div>
                    </div>
                    <div className="w-[240px]">
                      <Select
                        value={dropdowns[payloadKey]}
                        onValueChange={(v) => setDropdowns(prev => ({ ...prev, [payloadKey]: v }))}
                      >
                        <SelectTrigger className="h-10 bg-slate-50/80 border-slate-200 text-sm font-medium focus:ring-[hsl(var(--fab-amber))] hover:border-slate-300 transition-colors w-full px-4">
                          <SelectValue placeholder="Select limit" />
                        </SelectTrigger>
                        <SelectContent>
                          <div className="flex items-center justify-between px-2 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 mb-1 pl-8 pr-4 bg-slate-50/50">
                            <span>Extra {feature.feature_name}</span>
                            <span>Price</span>
                          </div>
                          <SelectItem value="none" className="text-sm cursor-pointer py-2">
                            <div className="flex items-center justify-between w-full pr-2 gap-4">
                              <span>No Extra {feature.feature_name}</span>
                              <span className="text-transparent text-xs font-medium">-</span>
                            </div>
                          </SelectItem>
                          {sortedAddons.map(opt => (
                            <SelectItem key={opt.id} value={opt.feature_value || ''} className="text-sm cursor-pointer py-2">
                              <div className="flex items-center justify-between w-full pr-2 gap-4">
                                <span>{getAddonLabel(feature.feature_name, opt.feature_value)}</span>
                                <span className="text-slate-500 text-xs font-medium">₹{opt.addon_price.toLocaleString('en-IN')}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                );
              })}

              {/* Feature toggles — loaded from API */}
              {featuresLoading ? (
                <div className="flex items-center justify-center py-10 text-slate-400 gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Loading add-ons…</span>
                </div>
              ) : toggleFeatures.length === 0 ? null : (
                toggleFeatures.map((feature) => {
                  const isSelected = toggles[feature.id] ?? false;
                  const addon = feature.addons?.[0];
                  const price = addon?.addon_price ?? 0;

                  return (
                    <label
                      key={feature.id}
                      className="flex items-center justify-between py-4 px-2 border-b border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer group rounded-lg"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                          isSelected ? 'bg-green-100 border-transparent' : 'border-slate-300 group-hover:border-slate-400 bg-white'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 text-green-600" />}
                        </div>
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={isSelected}
                          onChange={(e) => setToggles(prev => ({ ...prev, [feature.id]: e.target.checked }))}
                        />
                        <div className="flex items-center gap-2.5">
                          <IconComponent icon={feature.icon} className="w-3.5 h-3.5 text-slate-500" />
                          <span className="font-medium text-slate-800 text-sm">{feature.feature_name}</span>
                        </div>
                      </div>
                      <div className="w-[240px] font-semibold text-slate-800 text-[15px] pl-3">
                        ₹ {price.toLocaleString('en-IN')}
                      </div>
                    </label>
                  );
                })
              )}

            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-5 bg-white border-t border-slate-100 flex gap-4 shrink-0 z-50">
            <Button
              variant="outline"
              disabled={isProcessing}
              className="flex-1 py-6 rounded-xl font-semibold text-slate-500 border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-700 transition-all text-[15px]"
              onClick={handleClose}
            >
              Skip
            </Button>
            <Button
              disabled={isProcessing || featuresLoading || grandTotal <= 0}
              className="flex-[2] py-6 rounded-xl font-semibold text-[15px] bg-gradient-to-r from-[hsl(var(--fab-amber))] to-orange-500 text-white hover:shadow-lg hover:shadow-orange-500/25 transition-all disabled:opacity-70"
              onClick={handleProceedToCheckout}
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing…
                </span>
              ) : (
                <>Proceed to Checkout{plan ? ` – ₹${grandTotal.toLocaleString('en-IN')}` : ''}</>
              )}
            </Button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
