import { useState } from 'react';
import { 
  Sparkles, Check, Package, Database, Brain, Globe, Eye, Zap, Image as ImageIcon, Video, CalendarDays,
  Heart, EyeOff, BarChart, Download, Layout, Users, Droplets, HardDrive, ScanFace
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import type { Plan } from '@/store/slices/plansSlice';

interface AddFeaturesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan?: Plan | null;
}

const resourceOptions = {
  photos: [
    { value: 'none', label: 'No Extra Photos', price: 0 },
    { value: '1000', label: '+1,000 Photos', price: 99 },
    { value: '5000', label: '+5,000 Photos', price: 399 },
    { value: '10000', label: '+10,000 Photos', price: 699 },
  ],
  videos: [
    { value: 'none', label: 'No Extra Videos', price: 0 },
    { value: '10', label: '+10 Videos', price: 199 },
    { value: '50', label: '+50 Videos', price: 799 },
    { value: '100', label: '+100 Videos', price: 1299 },
  ],
  storage: [
    { value: 'none', label: 'No Extra Storage', price: 0 },
    { value: '10', label: '+10GB Storage', price: 199 },
    { value: '50', label: '+50GB Storage', price: 799 },
    { value: '100', label: '+100GB Storage', price: 1299 },
  ],
  events: [
    { value: 'none', label: 'No Extra Events', price: 0 },
    { value: '5', label: '+5 Events', price: 299 },
    { value: '15', label: '+15 Events', price: 699 },
    { value: '30', label: '+30 Events', price: 1199 },
  ],
};

const ALL_OTHER_FEATURES = [
  { id: 'custom-watermark', name: 'Custom Watermark', price: 999, icon: 'droplets', planKey: 'has_custom_watermark' },
  { id: 'face-recognition', name: 'Face Recognition', price: 499, icon: 'scan-face', planKey: 'has_face_recognition' },
  { id: 'bulk-download', name: 'Bulk Download', price: 399, icon: 'check', planKey: 'has_bulk_download' },
  { id: 'business-branding', name: 'Business Branding', price: 199, icon: 'check', planKey: 'has_business_branding' },
  { id: 'digital-flipbook', name: 'Digital Flipbook', price: 2500, icon: 'image', planKey: 'has_digital_album' },
  { id: 'portfolio-website', name: 'Portfolio Website', price: 299, icon: 'globe', planKey: 'has_portfolio_website' },
  { id: 'switch-downloads', name: 'Switch Downloads', price: 2500, icon: 'zap', planKey: 'has_switch_downloads' },
  { id: 'team-login', name: 'Team Login', price: 3000, icon: 'users', planKey: 'has_team_login' },
  { id: 'view-client-favorites', name: 'View Client Favorites', price: 3000, icon: 'check', planKey: 'has_view_client_favorites' },
];

const IconComponent = ({ icon, className }: { icon: string; className?: string }) => {
  switch (icon) {
    case 'database': return <HardDrive className={className} />;
    case 'scan-face': return <ScanFace className={className} />;
    case 'globe': return <Globe className={className} />;
    case 'eye': return <Eye className={className} />;
    case 'zap': return <Zap className={className} />;
    case 'heart': return <Heart className={className} />;
    case 'eye-off': return <EyeOff className={className} />;
    case 'bar-chart': return <BarChart className={className} />;
    case 'download': return <Download className={className} />;
    case 'layout': return <Layout className={className} />;
    case 'users': return <Users className={className} />;
    case 'droplets': return <Droplets className={className} />;
    case 'image': return <ImageIcon className={className} />;
    case 'check': return <Check className={className} />;
    default: return <Package className={className} />;
  }
};

export default function AddFeaturesModal({ open, onOpenChange, plan }: AddFeaturesModalProps) {
  const [dropdowns, setDropdowns] = useState({
    photos: 'none',
    videos: 'none',
    storage: 'none',
    events: 'none'
  });
  
  const [toggles, setToggles] = useState<Record<string, boolean>>({});

  const handleAddFeatures = () => {
    console.log('Adding features:', { dropdowns, toggles });
    onOpenChange(false);
    setDropdowns({ photos: 'none', videos: 'none', storage: 'none', events: 'none' });
    setToggles({});
  };

  const totalDropdowns = Object.entries(dropdowns).reduce((acc, [key, val]) => {
    const option = resourceOptions[key as keyof typeof resourceOptions].find(o => o.value === val);
    return acc + (option ? option.price : 0);
  }, 0);

  const visibleOtherFeatures = ALL_OTHER_FEATURES.filter(feature => {
    if (!plan) return true;
    const hasFeature = (plan as any)[feature.planKey];
    return !hasFeature;
  });

  const totalToggles = visibleOtherFeatures.reduce((acc, feat) => {
    return acc + (toggles[feat.id] ? feat.price : 0);
  }, 0);

  const totalPrice = totalDropdowns + totalToggles;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl overflow-y-auto p-0 gap-0 border-0 bg-transparent shadow-none [&>button]:text-white [&>button]:hover:text-[hsl(var(--fab-amber))] [&>button]:bg-white/10 [&>button]:hover:bg-white/20 [&>button]:rounded-full [&>button]:p-2 [&>button]:transition-colors [&>button]:z-50 [&>button]:right-6 [&>button]:top-6 sm:[&>button]:right-6 sm:[&>button]:top-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] max-h-[95dvh] sm:max-h-[90vh]">
        <div className="bg-white rounded-2xl shadow-2xl m-4 sm:m-0">
          {/* Header */}
          <div className="relative px-8 pt-8 pb-6 text-center bg-gradient-to-br from-[hsl(var(--fab-navy))] to-[hsl(var(--fab-navy))]/90 rounded-t-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[hsl(var(--fab-amber))]/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <div className="relative z-10">
              <DialogTitle className="text-2xl font-bold font-heading text-white mb-1.5">
                Checkout
              </DialogTitle>
              <DialogDescription className="text-white/70 text-sm font-medium">
                Review your plan and select add-ons
              </DialogDescription>
            </div>
          </div>

          {/* List Body */}
          <div className="p-8">
            <div className="flex flex-col">
            
            {/* Selected Plan Summary */}
            {plan && (
              <div className="mb-10 bg-slate-50 border border-slate-200 rounded-xl p-6 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[hsl(var(--fab-amber))]/10 flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-[hsl(var(--fab-amber))]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Selected Plan: {plan.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Base subscription</p>
                  </div>
                </div>
                <div className="font-bold text-slate-800 text-lg">
                  ₹{Number(plan.price || 0).toLocaleString('en-IN')}
                </div>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-xl font-bold font-heading text-slate-800">Available Add-ons</h3>
              <p className="text-sm text-slate-500 mt-0.5">Customize your subscription with extra limits and features</p>
            </div>

            {/* Table Header */}
            <div className="flex items-center justify-between py-3 border-b-2 border-slate-100 mb-2 px-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex-1">Feature</span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest w-[240px]">Price</span>
            </div>

            {/* Resource Limits with Dropdowns */}
            {[
              { id: 'photos', name: 'Photos', icon: <ImageIcon className="w-3.5 h-3.5 text-slate-500" />, options: resourceOptions.photos },
              { id: 'videos', name: 'Videos', icon: <Video className="w-3.5 h-3.5 text-slate-500" />, options: resourceOptions.videos },
              { id: 'storage', name: 'Storage', icon: <HardDrive className="w-3.5 h-3.5 text-slate-500" />, options: resourceOptions.storage },
              { id: 'events', name: 'Events', icon: <CalendarDays className="w-3.5 h-3.5 text-slate-500" />, options: resourceOptions.events },
            ].map((resource) => {
              const isSelected = dropdowns[resource.id as keyof typeof dropdowns] !== 'none';
              
              return (
                <div key={resource.id} className="flex items-center justify-between py-3 px-2 border-b border-slate-50 hover:bg-slate-50/50 transition-colors rounded-lg">
                  <div className="flex items-center gap-4 flex-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setDropdowns(prev => ({ ...prev, [resource.id]: 'none' }));
                        } else {
                          const firstValid = resource.options.find(o => o.value !== 'none');
                          if (firstValid) {
                            setDropdowns(prev => ({ ...prev, [resource.id]: firstValid.value }));
                          }
                        }
                      }}
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                        isSelected 
                          ? 'bg-green-100 border-transparent' 
                          : 'border-slate-300 hover:border-slate-400 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-green-600" />}
                    </button>
                    <div className="flex items-center gap-2.5">
                      {resource.icon}
                      <span className="font-medium text-slate-800 text-sm">{resource.name}</span>
                    </div>
                  </div>
                  
                  <div className="w-[240px]">
                    <Select 
                      value={dropdowns[resource.id as keyof typeof dropdowns]} 
                      onValueChange={(v) => setDropdowns(prev => ({ ...prev, [resource.id]: v }))}
                    >
                      <SelectTrigger className="h-10 bg-slate-50/80 border-slate-200 text-sm font-medium focus:ring-[hsl(var(--fab-amber))] hover:border-slate-300 transition-colors w-full px-4">
                        <SelectValue placeholder="Select limit" />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="flex items-center justify-between px-2 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 mb-1 pl-8 pr-4 bg-slate-50/50">
                          <span>Extra {resource.name}</span>
                          <span>Price</span>
                        </div>
                        {resource.options.map(opt => (
                          <SelectItem key={opt.value} value={opt.value} className="text-sm cursor-pointer py-2">
                            <div className="flex items-center justify-between w-full pr-2 gap-4">
                              <span>{opt.label.split(' (')[0]}</span>
                              {opt.price > 0 ? (
                                <span className="text-slate-500 text-xs font-medium">₹{opt.price}</span>
                              ) : (
                                <span className="text-transparent text-xs font-medium">-</span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              );
            })}

            {/* Other Add-ons */}
            {visibleOtherFeatures.map((feature) => {
              const isSelected = toggles[feature.id] || false;
              
              return (
                <label 
                  key={feature.id} 
                  className="flex items-center justify-between py-4 px-2 border-b border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer group rounded-lg"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                        isSelected 
                          ? 'bg-green-100 border-transparent' 
                          : 'border-slate-300 group-hover:border-slate-400 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-green-600" />}
                    </div>
                    
                    {/* Hidden actual checkbox to keep accessibility and toggling via label click */}
                    <input 
                      type="checkbox"
                      className="hidden"
                      checked={isSelected}
                      onChange={(e) => setToggles(prev => ({ ...prev, [feature.id]: e.target.checked }))}
                    />
                    
                    <div className="flex items-center gap-2.5">
                      <IconComponent icon={feature.icon} className="w-3.5 h-3.5 text-slate-500 transition-colors" />
                      <span className="font-medium text-slate-800 text-sm transition-colors">{feature.name}</span>
                    </div>
                  </div>
                  <div className="w-[240px] font-semibold text-slate-800 text-[15px] pl-3">
                    ₹ {feature.price}
                  </div>
                </label>
              );
            })}

          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 px-8 py-6 bg-white border-t border-slate-100 flex flex-col gap-5 shrink-0 rounded-b-2xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] z-50">
          
          {/* Price Breakdown */}
          {plan && (
            <div className="flex items-center justify-between px-2 text-sm">
              <span className="text-slate-500 font-medium">
                Plan (₹{Number(plan.price || 0).toLocaleString('en-IN')}) {totalPrice > 0 ? `+ Add-ons (₹${totalPrice.toLocaleString('en-IN')})` : ''}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium uppercase text-xs tracking-wider">Total</span>
                <span className="font-bold text-slate-800 text-xl">
                  ₹{(Number(plan.price || 0) + totalPrice).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <Button 
              variant="outline" 
              className="flex-1 py-6 rounded-xl font-semibold text-slate-500 border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-700 transition-all text-[15px]"
              onClick={() => onOpenChange(false)}
            >
              Skip 
            </Button>
            <Button 
              className="flex-[2] py-6 rounded-xl font-semibold text-[15px] bg-gradient-to-r from-[hsl(var(--fab-amber))] to-orange-500 text-white hover:shadow-lg hover:shadow-orange-500/25 transition-all"
              onClick={handleAddFeatures}
            >
              Proceed to Checkout
            </Button>
          </div>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
