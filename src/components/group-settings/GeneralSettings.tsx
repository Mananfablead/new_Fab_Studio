import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Save,
  Image as ImageIcon,
  CheckCircle2,
  Droplets,
  Lock,
  Globe,
  Tag,
  FolderOpen,
  Users,
  Calendar,
  Type,
  Camera,
  Upload,
  SortAsc
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useAppDispatch, useAppSelector } from '@/store';
import { updateGroup } from '@/store/slices/groupsSlice';
import { selectCurrentGroup, selectApiMode } from '@/store/selectors';
import { mockGroups, EventType } from '@/lib/mock-data';
import { useUserPlans } from '@/hooks/useUserPlans';
import SubscriptionPlansModal from '@/components/modals/SubscriptionPlansModal';

interface GeneralSettingsProps {
  groupName?: string;
  setGroupName?: (value: string) => void;
  coverImage?: string;
  setCoverImage?: (value: string) => void;
  sortOrder?: string;
  setSortOrder?: (value: string) => void;
  eventDate?: string;
  setEventDate?: (value: string) => void;
  description?: string;
  setDescription?: (value: string) => void;
  watermarkEnabled?: boolean;
  setWatermarkEnabled?: (value: boolean) => void;
}

export default function GeneralSettings({
  groupName: propGroupName,
  setGroupName: propSetGroupName,
  coverImage: propCoverImage,
  setCoverImage: propSetCoverImage,
  sortOrder: propSortOrder,
  setSortOrder: propSetSortOrder,
  eventDate: propEventDate,
  setEventDate: propSetEventDate,
  description: propDescription,
  setDescription: propSetDescription,
  watermarkEnabled: propWatermarkEnabled,
  setWatermarkEnabled: propSetWatermarkEnabled
}: GeneralSettingsProps = {}) {
  const { groupId } = useParams();
  const { user } = useAuth();
  const reduxGroup = useAppSelector(selectCurrentGroup);
  const group = (reduxGroup && String(reduxGroup.id) === String(groupId)) ? reduxGroup : (mockGroups.find(g => g.id === groupId) || mockGroups[0]);

  const isTeamMember = (group as any)?.team_members?.some(
    (member: any) => String(member.user_id) === String(user?.id)
  );

  const isOwner = String((group as any)?.owner?.id) === String(user?.id);
  const canManage = user?.role !== 'user' || isTeamMember || isOwner;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dispatch = useAppDispatch();
  const apiMode = useAppSelector(selectApiMode);

  const { userPlansData } = useUserPlans();
  const [showPlansModal, setShowPlansModal] = useState(false);
  const userPlan = userPlansData?.data?.plans?.[0];
  const userPlanInfo = userPlansData?.data?.user;

  const isPlanActive = !!(
    userPlansData?.data?.user?.is_plan_purchased === true ||
    userPlan?.is_purchased === true ||
    userPlan?.is_active === true
  );

  const apiPlan = isPlanActive ? userPlan : null;

  const hasCustomWatermark = (apiPlan ? !!apiPlan.has_custom_watermark : false) || (userPlanInfo ? !!userPlanInfo.has_custom_watermark : false);

  const [groupName, setGroupName] = useState(propGroupName || group.name);
  const [coverImage, setCoverImage] = useState(propCoverImage || group.coverImage);
  const [groupType, setGroupType] = useState<"private" | "public">(group.type || "public");
  const [eventType, setEventType] = useState<EventType | string>(group.eventType || "wedding");
  const [sortOrder, setSortOrder] = useState(propSortOrder || (group as any).sortBy || 'newest');
  const [eventDate, setEventDate] = useState(propEventDate || group.eventDate || '');
  const [description, setDescription] = useState(propDescription || group.description || '');
  const [watermarkEnabled, setWatermarkEnabled] = useState(propWatermarkEnabled ?? (group as any).enableWatermark ?? false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync state with group data when it changes
  useEffect(() => {
    setGroupName(propGroupName || group.name);
    setCoverImage(propCoverImage || group.coverImage);
    setGroupType(group.type || "public");
    setEventType(group.eventType || "wedding");
    setSortOrder(propSortOrder || (group as any).sortBy || 'newest');
    setEventDate(propEventDate || group.eventDate || '');
    setDescription(propDescription || group.description || '');
    setWatermarkEnabled(propWatermarkEnabled ?? (group as any).enableWatermark ?? false);
  }, [group.id, group.name, (group as any).sortBy, (group as any).enableWatermark, group.eventDate, group.description, group.coverImage, group.type, group.eventType]);

  const handleSaveGeneralSettings = async () => {
    if (apiMode === 'mock') {
      toast({
        title: 'Settings Saved',
        description: 'General settings have been updated successfully (Mock Mode).'
      });
      return;
    }

    if (!groupId) return;

    setIsSaving(true);
    try {
      await dispatch(updateGroup({
        groupId,
        payload: {
          name: groupName,
          type: groupType,
          eventType: eventType as EventType,
          eventDate,
          description,
          sortBy: sortOrder,
          enableWatermark: watermarkEnabled,
          coverImage
        }
      })).unwrap();

      toast({
        title: 'Success',
        description: 'Group settings updated successfully.'
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err || 'Failed to update group settings.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCoverImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid File',
          description: 'Please select an image file (JPG, PNG, etc.).',
          variant: 'destructive'
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File Too Large',
          description: 'Image size should be less than 5MB.',
          variant: 'destructive'
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImage(reader.result as string);
        toast({
          title: 'Image Uploaded',
          description: 'Cover image has been updated successfully.'
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h2 className="text-lg sm:text-xl font-heading font-bold">General Settings</h2>
          <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">Manage your group's basic information</p>
        </div>
        <button
          onClick={handleSaveGeneralSettings}
          disabled={isSaving}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Stats Cards */}
      {canManage && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="rounded-2xl border border-border bg-gradient-to-br from-orange-50 to-amber-50 p-4 sm:p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 sm:w-10 sm:h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                <FolderOpen className="w-6 h-6 sm:w-5 sm:h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-2xl sm:text-xl font-bold text-foreground">{group.photoCount}</p>
                <p className="text-sm sm:text-xs text-muted-foreground">Total Photos</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 sm:w-10 sm:h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-2xl sm:text-xl font-bold text-foreground">{(group as any).memberCount || group.participantCount || 0}</p>
                <p className="text-sm sm:text-xs text-muted-foreground">Participants</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-gradient-to-br from-green-50 to-emerald-50 p-4 sm:p-4 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 sm:w-10 sm:h-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                <Calendar className="w-6 h-6 sm:w-5 sm:h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-xl sm:text-lg font-bold text-foreground">
                  {new Date(group.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    {new Date(group.createdAt).toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit'
                    })}
                  </span>
                </p>
                <p className="text-sm sm:text-xs text-muted-foreground">Created Date</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cover Image Section */}
      <div className="mb-6 sm:mb-7">
        <label className="block text-xs sm:text-sm font-semibold mb-2 sm:mb-3 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-primary" />
          Cover Image
        </label>
        <div className="relative group rounded-xl overflow-hidden border-2 border-border bg-muted h-40 sm:h-52">
          {coverImage ? (
            <img
              src={coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (!target.src.includes('unsplash')) {
                  target.src = 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1200&q=80';
                }
              }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
              <ImageIcon className="w-10 h-10 mb-2 opacity-30" />
              <span className="text-sm font-medium opacity-70">No cover image</span>
            </div>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center">
            <button
              type="button"
              onClick={handleCoverImageUpload}
              className="opacity-0 group-hover:opacity-100 transition-opacity px-4 sm:px-5 py-2 sm:py-2.5 bg-white text-foreground rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-lg hover:bg-white/90"
            >
              <Upload className="w-4 h-4" />
              Change Cover
            </button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Recommended: 1920x600px · Max 5MB · Click to change</p>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      </div>

      {/* Form Fields */}
      <div className="space-y-4 sm:space-y-5">
        {/* Group Name */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold mb-2 flex items-center gap-2">
            <Type className="w-4 h-4 text-primary" />
            Group Name
          </label>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-xs sm:text-sm"
            placeholder="Enter group name"
          />
        </div>

        {canManage && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Group Visibility */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" />
                Group Visibility
              </label>
              <div className="flex p-1 bg-muted rounded-xl gap-1">
                {[
                  { value: 'public', label: 'Public', icon: <Globe className="w-3.5 h-3.5" /> },
                  { value: 'private', label: 'Private', icon: <Lock className="w-3.5 h-3.5" /> }
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setGroupType(opt.value as any)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all ${
                      groupType === opt.value
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {opt.icon}
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Event Type */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4 text-primary" />
                Event Type
              </label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-xs sm:text-sm appearance-none"
              >
                <option value="wedding">Wedding</option>
                <option value="birthday">Birthday</option>
                <option value="corporate">Corporate</option>
                <option value="travel">Travel</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        )}

        {canManage && (
          <>
            {/* Event Date */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                Event Date
              </label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-xs sm:text-sm"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold mb-2 flex items-center gap-2">
                <Camera className="w-4 h-4 text-primary" />
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all resize-none text-xs sm:text-sm"
                placeholder="Add a description for this group..."
              />
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold mb-2 sm:mb-3 flex items-center gap-2">
                <SortAsc className="w-4 h-4 text-primary" />
                Photo Sort Order
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                {[
                  { value: 'newest', label: 'Newest First', desc: 'Show newest photos first' },
                  { value: 'oldest', label: 'Oldest First', desc: 'Show oldest photos first' },
                  { value: 'name', label: 'By Name', desc: 'Sort alphabetically' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSortOrder(option.value)}
                    className={`relative p-3 sm:p-4 rounded-xl border-2 transition-all text-left ${sortOrder === option.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/40 hover:bg-muted/50'
                      }`}
                  >
                    {sortOrder === option.value && (
                      <CheckCircle2 className="absolute top-2 sm:top-3 right-2 sm:right-3 w-4 h-4 text-primary" />
                    )}
                    <div className="font-semibold text-xs sm:text-sm mb-0.5">{option.label}</div>
                    <div className="text-xs text-muted-foreground">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>
            {/* Watermark Toggle */}
            <div className="pt-4 border-t border-border">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-4 rounded-2xl bg-muted/30 border border-border/50 gap-4 lg:gap-0">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[hsl(var(--fab-amber))]/10 flex items-center justify-center">
                    <Droplets className="w-5 h-5 text-[hsl(var(--fab-amber))]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Show Watermark</p>
                    <p className="text-xs text-muted-foreground">Apply your business branding to all photos in this group</p>
                  </div>
                </div>
                {hasCustomWatermark ? (
                  <button
                    onClick={() => setWatermarkEnabled(!watermarkEnabled)}
                    className={`w-12 h-6 rounded-full relative transition-all lg:self-auto self-start border-2 ${
                      watermarkEnabled 
                        ? 'bg-[hsl(var(--fab-amber))] border-[hsl(var(--fab-amber))]' 
                        : 'bg-gray-500 border-gray-300'
                    }`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${watermarkEnabled ? 'left-6' : 'left-0.5'}`} />
                  </button>
                ) : (
                  <div className="flex items-center gap-3 shrink-0 lg:self-auto self-start">
                    <span className="text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                      Premium Feature
                    </span>
                    <button
                      onClick={() => setShowPlansModal(true)}
                      className="text-xs font-bold px-3 py-1.5 rounded-xl bg-[hsl(var(--fab-amber))] text-white hover:opacity-90 transition-all uppercase tracking-wider whitespace-nowrap"
                    >
                      Upgrade Plan
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <SubscriptionPlansModal
        open={showPlansModal}
        onOpenChange={setShowPlansModal}
      />
    </div>
  );
}
