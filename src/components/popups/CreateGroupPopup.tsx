import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Camera, Briefcase, Cake, Heart, PartyPopper, Users, Baby, Music, MoreHorizontal, Loader2, ImagePlus, X } from 'lucide-react';

interface CreateGroupPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newGroupName: string;
  onGroupNameChange: (name: string) => void;
  groupType: 'private' | 'public';
  onGroupTypeChange: (type: 'private' | 'public') => void;
  eventType?: string;
  onEventTypeChange?: (type: string) => void;
  enableMonetization?: boolean;
  onMonetizationChange?: (enabled: boolean) => void;
  coverImage?: string | null;
  onCoverImageChange?: (dataUrl: string | null) => void;
  onCreate?: () => void;
  isLoading?: boolean;
}

const eventTypes = [
  { value: 'wedding', label: 'Wedding', icon: Heart, color: 'text-pink-500' },
  { value: 'corporate', label: 'Corporate', icon: Briefcase, color: 'text-blue-500' },
  { value: 'birthday', label: 'Birthday', icon: Cake, color: 'text-purple-500' },
  { value: 'engagement', label: 'Engagement', icon: Heart, color: 'text-rose-500' },
  { value: 'festival', label: 'Festival', icon: PartyPopper, color: 'text-orange-500' },
  { value: 'reunion', label: 'Reunion', icon: Users, color: 'text-green-500' },
  { value: 'babyshower', label: 'Baby Shower', icon: Baby, color: 'text-pink-400' },
  { value: 'concert', label: 'Concert', icon: Music, color: 'text-red-500' },
  { value: 'other', label: 'Other', icon: MoreHorizontal, color: 'text-gray-500' },
];

export default function CreateGroupPopup({ 
  open, 
  onOpenChange, 
  newGroupName, 
  onGroupNameChange, 
  groupType, 
  onGroupTypeChange,
  eventType = 'wedding',
  onEventTypeChange,
  enableMonetization = false,
  onMonetizationChange,
  coverImage,
  onCoverImageChange,
  onCreate,
  isLoading
}: CreateGroupPopupProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onCoverImageChange?.(reader.result as string);
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <DialogHeader>
          <DialogTitle>Create a New Group</DialogTitle>
          <DialogDescription>Set up your group with name, type, and event details</DialogDescription>
        </DialogHeader>
        <div className="space-y-5 pt-2">

          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <div className="flex-1 w-full">
              <label className="text-sm font-medium mb-1.5 block">Group Name</label>
              <input
                value={newGroupName}
                onChange={e => onGroupNameChange(e.target.value)}
                placeholder="e.g., Wedding Reception"
                className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring h-12"
              />
            </div>

            {/* Cover Image */}
            <div className="w-full sm:w-auto shrink-0">
              <label className="text-sm font-medium mb-1.5 block">Cover Image <span className="text-muted-foreground font-normal">(optional)</span></label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`relative w-full sm:w-48 h-12 rounded-xl border-2 border-dashed cursor-pointer overflow-hidden transition-all flex items-center justify-center
                  ${coverImage ? 'border-primary' : 'border-border hover:border-primary/60 bg-muted/30 hover:bg-muted/50'}`}
              >
                {coverImage ? (
                  <>
                    <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <p className="text-white text-[10px] font-medium flex items-center gap-1">
                        <ImagePlus className="w-3.5 h-3.5" /> Change
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onCoverImageChange?.(null); }}
                      className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full gap-2 text-muted-foreground px-3">
                    <ImagePlus className="w-4 h-4 shrink-0" />
                    <div className="text-left">
                      <p className="text-[11px] font-bold leading-tight">Upload Cover</p>
                      <p className="text-[9px] text-muted-foreground/80 leading-tight">Max 10MB</p>
                    </div>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1.5 block">Group Type</label>
            <div className="flex gap-2">
              <button 
                onClick={() => onGroupTypeChange('private')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  groupType === 'private' 
                    ? 'fab-gradient text-primary-foreground' 
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                Private
              </button>
              <button 
                onClick={() => onGroupTypeChange('public')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  groupType === 'public' 
                    ? 'fab-gradient text-primary-foreground' 
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                Public
              </button>
            </div>
          </div>

          {onEventTypeChange && (
            <div>
              <label className="text-sm font-medium mb-1.5 block">Event Type</label>
              <div className="grid grid-cols-3 gap-2">
                {eventTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.value}
                      onClick={() => onEventTypeChange(type.value)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                        eventType === type.value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-background text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${type.color}`} />
                      <span>{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Monetization section commented out
          {onMonetizationChange && (
            <div>
              <label className="text-sm font-medium mb-1.5 block">Monetization</label>
              <div className="bg-muted/50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Enable Photo Sales</h4>
                    <p className="text-xs text-muted-foreground mt-1">Allow clients to purchase photos and albums</p>
                  </div>
                  <button
                    onClick={() => onMonetizationChange(!enableMonetization)}
                    className={`relative w-12 h-6 rounded-full transition-colors border-2 ${
                      enableMonetization
                        ? 'bg-primary border-primary'
                        : 'bg-background border-border'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-4 h-4 rounded-full transition-transform shadow-sm ${
                        enableMonetization ? 'left-6 bg-white' : 'left-0.5 bg-muted-foreground/50'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}
          */}


          <button 
            onClick={onCreate}
            disabled={isLoading}
            className="w-full py-3 rounded-xl fab-gradient text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating Group...
              </>
            ) : (
              'Create Group'
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}