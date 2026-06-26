import { useState } from 'react';
import { Sparkles, Check, Package, Database, Brain, Globe, Eye, Zap, Image as ImageIcon, Video, CalendarDays } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Feature {
  id: string;
  name: string;
  price: number;
  description: string;
  icon: string;
  color: string;
}

interface AddFeaturesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const addonOptions = {
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

const toggleFeatures: Feature[] = [
  { 
    id: 'ai-credits', 
    name: 'AI Recognition Credits', 
    price: 499, 
    description: 'Additional 10,000 AI face recognitions',
    icon: 'brain',
    color: 'from-pink-500 to-rose-500',
  },
  { 
    id: 'custom-domain', 
    name: 'Custom Domain', 
    price: 299, 
    description: 'Use your own domain for galleries',
    icon: 'globe',
    color: 'from-green-500 to-emerald-500',
  },
  { 
    id: 'remove-branding', 
    name: 'Remove Branding', 
    price: 199, 
    description: 'Remove fab-photo branding from galleries',
    icon: 'eye',
    color: 'from-amber-500 to-orange-500',
  },
  { 
    id: 'priority-delivery', 
    name: 'Priority Delivery', 
    price: 399, 
    description: 'Faster photo delivery with CDN boost',
    icon: 'zap',
    color: 'from-violet-500 to-purple-500',
  },
];

const IconComponent = ({ icon, className }: { icon: string; className?: string }) => {
  switch (icon) {
    case 'database': return <Database className={className} />;
    case 'brain': return <Brain className={className} />;
    case 'globe': return <Globe className={className} />;
    case 'eye': return <Eye className={className} />;
    case 'zap': return <Zap className={className} />;
    default: return <Package className={className} />;
  }
};

export default function AddFeaturesModal({ open, onOpenChange }: AddFeaturesModalProps) {
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
    const option = addonOptions[key as keyof typeof addonOptions].find(o => o.value === val);
    return acc + (option ? option.price : 0);
  }, 0);

  const totalToggles = toggleFeatures.reduce((acc, feat) => {
    return acc + (toggles[feat.id] ? feat.price : 0);
  }, 0);

  const totalPrice = totalDropdowns + totalToggles;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0 gap-0 border-0 bg-transparent shadow-none scrollbar-hide [&>button]:text-white [&>button]:hover:text-[hsl(var(--fab-amber))] [&>button]:bg-white/10 [&>button]:hover:bg-white/20 [&>button]:rounded-full [&>button]:p-2 [&>button]:transition-colors [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {/* Glass Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className="relative px-6 pt-6 pb-4 bg-gradient-to-br from-[hsl(var(--fab-navy))] to-[hsl(var(--fab-navy))]/90 shrink-0">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[hsl(var(--fab-amber))]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            <DialogHeader className="relative">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(var(--fab-amber))] to-orange-500 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-heading font-bold text-white">
                    Add Features
                  </DialogTitle>
                  <DialogDescription className="text-white/80 text-sm mt-0.5">
                    Select additional resources and enhance your subscription
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="p-10 space-y-10 overflow-y-auto max-h-[65vh]">
            {/* Dropdown Options */}
            <div>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6">Resource Limits</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Photos Dropdown */}
                <div className="flex flex-col gap-4 p-5 rounded-2xl border border-slate-100 bg-slate-50/80 hover:bg-slate-50 transition-colors shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-sm">
                      <ImageIcon className="w-6 h-6 text-white" />
                    </div>
                    <p className="font-semibold text-base text-slate-900">Photos</p>
                  </div>
                  <Select value={dropdowns.photos} onValueChange={(v) => setDropdowns(prev => ({...prev, photos: v}))}>
                    <SelectTrigger className="w-full bg-white border-slate-200 shadow-sm rounded-xl h-12 text-sm">
                      <SelectValue placeholder="Select limit" />
                    </SelectTrigger>
                    <SelectContent>
                      {addonOptions.photos.map(opt => (
                        <SelectItem key={opt.value} value={opt.value} className="rounded-lg">
                          {opt.label} {opt.price ? `(₹${opt.price})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Videos Dropdown */}
                <div className="flex flex-col gap-4 p-5 rounded-2xl border border-slate-100 bg-slate-50/80 hover:bg-slate-50 transition-colors shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-sm">
                      <Video className="w-6 h-6 text-white" />
                    </div>
                    <p className="font-semibold text-base text-slate-900">Videos</p>
                  </div>
                  <Select value={dropdowns.videos} onValueChange={(v) => setDropdowns(prev => ({...prev, videos: v}))}>
                    <SelectTrigger className="w-full bg-white border-slate-200 shadow-sm rounded-xl h-12 text-sm">
                      <SelectValue placeholder="Select limit" />
                    </SelectTrigger>
                    <SelectContent>
                      {addonOptions.videos.map(opt => (
                        <SelectItem key={opt.value} value={opt.value} className="rounded-lg">
                          {opt.label} {opt.price ? `(₹${opt.price})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Storage Dropdown */}
                <div className="flex flex-col gap-4 p-5 rounded-2xl border border-slate-100 bg-slate-50/80 hover:bg-slate-50 transition-colors shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-sm">
                      <Database className="w-6 h-6 text-white" />
                    </div>
                    <p className="font-semibold text-base text-slate-900">Storage</p>
                  </div>
                  <Select value={dropdowns.storage} onValueChange={(v) => setDropdowns(prev => ({...prev, storage: v}))}>
                    <SelectTrigger className="w-full bg-white border-slate-200 shadow-sm rounded-xl h-12 text-sm">
                      <SelectValue placeholder="Select limit" />
                    </SelectTrigger>
                    <SelectContent>
                      {addonOptions.storage.map(opt => (
                        <SelectItem key={opt.value} value={opt.value} className="rounded-lg">
                          {opt.label} {opt.price ? `(₹${opt.price})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Events Dropdown */}
                <div className="flex flex-col gap-4 p-5 rounded-2xl border border-slate-100 bg-slate-50/80 hover:bg-slate-50 transition-colors shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-sm">
                      <CalendarDays className="w-6 h-6 text-white" />
                    </div>
                    <p className="font-semibold text-base text-slate-900">Events</p>
                  </div>
                  <Select value={dropdowns.events} onValueChange={(v) => setDropdowns(prev => ({...prev, events: v}))}>
                    <SelectTrigger className="w-full bg-white border-slate-200 shadow-sm rounded-xl h-12 text-sm">
                      <SelectValue placeholder="Select limit" />
                    </SelectTrigger>
                    <SelectContent>
                      {addonOptions.events.map(opt => (
                        <SelectItem key={opt.value} value={opt.value} className="rounded-lg">
                          {opt.label} {opt.price ? `(₹${opt.price})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Other Features */}
            <div>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6">Other Add-ons</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {toggleFeatures.map((feature) => (
                  <button
                    key={feature.id}
                    onClick={() => setToggles(prev => ({ ...prev, [feature.id]: !prev[feature.id] }))}
                    className={`flex flex-col gap-4 p-5 rounded-2xl border-2 text-left transition-all duration-300 relative overflow-hidden ${
                      toggles[feature.id]
                        ? 'border-[hsl(var(--fab-amber))] bg-[hsl(var(--fab-amber))]/5 shadow-md shadow-[hsl(var(--fab-amber))]/10'
                        : 'border-slate-100 bg-white hover:border-[hsl(var(--fab-amber))]/30 hover:bg-slate-50 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-sm`}>
                        <IconComponent icon={feature.icon} className="w-6 h-6 text-white" />
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        toggles[feature.id]
                          ? 'border-[hsl(var(--fab-amber))] bg-[hsl(var(--fab-amber))]'
                          : 'border-slate-200 bg-white'
                      }`}>
                        {toggles[feature.id] && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                    </div>

                    <div className="mt-2 flex flex-col h-full">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <p className="font-semibold text-base text-slate-900 leading-tight">{feature.name}</p>
                        <span className="text-sm font-bold text-[hsl(var(--fab-amber))] shrink-0 mt-0.5">₹{feature.price}</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed mt-auto">{feature.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="px-6 pb-6 shrink-0 pt-4 border-t border-slate-100 bg-white">
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1 py-5 rounded-xl font-medium border-2"
                onClick={() => onOpenChange(false)}
              >
                Skip
              </Button>
              <Button 
                className="flex-1 py-5 rounded-xl font-semibold bg-gradient-to-r from-[hsl(var(--fab-amber))] to-orange-500 text-white hover:shadow-lg hover:shadow-orange-500/25"
                onClick={handleAddFeatures}
              >
                {totalPrice > 0 ? `Pay ₹${totalPrice.toLocaleString('en-IN')}` : 'Continue'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
