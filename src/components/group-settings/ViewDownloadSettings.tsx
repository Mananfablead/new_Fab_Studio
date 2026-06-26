import { useState, useEffect } from 'react';
import {
  Eye,
  Download,
  Shield,
  Image as ImageIcon,
  Save,
  Copy,
  Smartphone,
  Monitor,
  Layers,
  RefreshCw
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store';
import { updateViewDownloadSettings } from '@/store/slices/groupsSlice';
import { useUserPlans } from '@/hooks/useUserPlans';
import SubscriptionPlansModal from '@/components/modals/SubscriptionPlansModal';

type ViewingPlatform = 'web' | 'app' | 'both';

export default function ViewDownloadSettings() {
  const { groupId } = useParams<{ groupId: string }>();
  const dispatch = useAppDispatch();
  const currentGroup = useAppSelector(state => state.groups.currentGroup);
  const isSaving = useAppSelector(state => state.groups.loading);

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

  const hasBulkDownload = (apiPlan ? !!apiPlan.has_bulk_download : false) || (userPlanInfo ? !!userPlanInfo.has_bulk_download : false);
  const hasSwitchDownloads = (apiPlan ? !!apiPlan.has_switch_downloads : false) || (userPlanInfo ? !!userPlanInfo.has_switch_downloads : false);

  const [allowDownloading, setAllowDownloading] = useState(currentGroup?.viewDownload?.allowDownloading ?? true);
  const [enableSharing, setEnableSharing] = useState(currentGroup?.viewDownload?.enableSharing ?? true);
  const [enableScreenshots, setEnableScreenshots] = useState(currentGroup?.viewDownload?.enableScreenshots ?? true);
  const [downloadQuality, setDownloadQuality] = useState<'original' | 'high' | 'medium' | 'low'>(currentGroup?.viewDownload?.downloadQuality ?? 'original');
  const [enableBulkDownloads, setEnableBulkDownloads] = useState(currentGroup?.viewDownload?.bulkDownloads ?? false);
  const [albumDownloadPin, setAlbumDownloadPin] = useState(currentGroup?.albumDownloadPin ?? '');
  const [viewingPlatform, setViewingPlatform] = useState<ViewingPlatform>(currentGroup?.viewDownload?.viewingPlatform ?? 'both');

  // Sync with currentGroup if it changes
  useEffect(() => {
    if (currentGroup) {
      if (currentGroup.viewDownload) {
        const v = currentGroup.viewDownload;
        setAllowDownloading(v.allowDownloading);
        setEnableSharing(v.enableSharing);
        setEnableScreenshots(v.enableScreenshots);
        setDownloadQuality(v.downloadQuality);
        setEnableBulkDownloads(v.bulkDownloads);
        setViewingPlatform(v.viewingPlatform);
      }
      if (currentGroup.albumDownloadPin) {
        setAlbumDownloadPin(currentGroup.albumDownloadPin);
      }
    }
  }, [currentGroup]);

  const handleCopyPin = () => {
    if (!albumDownloadPin) return;
    navigator.clipboard.writeText(albumDownloadPin);
    toast.success('Album download PIN copied!');
  };

  const handleSaveSettings = async () => {
    if (!groupId) return;

    try {
      await dispatch(updateViewDownloadSettings({
        groupId,
        payload: {
          allowDownloading,
          enableSharing,
          enableScreenshots,
          downloadQuality,
          bulkDownloads: enableBulkDownloads,
          viewingPlatform,
        }
      })).unwrap();
      toast.success('View & Download settings updated successfully.');
    } catch (err: any) {
      toast.error(err || 'Failed to update settings');
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-heading font-bold mb-2">View & Download Settings</h2>
          <p className="text-muted-foreground">Configure viewing and download options for your group</p>
        </div>

        {/* Download Settings */}
        <div className="mb-8">
          <h3 className="text-lg font-heading font-semibold mb-4 flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            Download Settings
          </h3>
          <div className="space-y-4">
            {/* Allow Downloading */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
              <div className="flex-1">
                <h4 className="font-semibold mb-1">Allow Downloading</h4>
                <p className="text-sm text-muted-foreground">Users can download photos from this group</p>
              </div>
              {hasSwitchDownloads ? (
                <Switch
                  checked={allowDownloading}
                  onCheckedChange={setAllowDownloading}
                />
              ) : (
                <div className="flex items-center gap-3 shrink-0">
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

            {/* Enable Sharing */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
              <div className="flex-1">
                <h4 className="font-semibold mb-1">Enable Sharing</h4>
                <p className="text-sm text-muted-foreground">Users can share photos via social media</p>
              </div>
              <Switch
                checked={enableSharing}
                onCheckedChange={setEnableSharing}
              />
            </div>

            {/* Enable Screenshots */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
              <div className="flex-1">
                <h4 className="font-semibold mb-1">Enable Screenshots</h4>
                <p className="text-sm text-muted-foreground">Allow users to take screenshots of photos</p>
              </div>
              <Switch
                checked={enableScreenshots}
                onCheckedChange={setEnableScreenshots}
              />
            </div>

            {/* Download Quality */}
            {allowDownloading && (
              <div className="p-4 rounded-xl border border-border bg-card">
                <h4 className="font-semibold mb-4">Download Quality</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {[
                    { value: 'original', label: 'Original', desc: 'Full resolution' },
                    { value: 'high', label: 'High', desc: 'High quality' },
                    { value: 'medium', label: 'Medium', desc: 'Medium quality' },
                    { value: 'low', label: 'Low', desc: 'Low quality' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setDownloadQuality(option.value as any)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${downloadQuality === option.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                        }`}
                    >
                      <div className="font-medium text-sm mb-1">{option.label}</div>
                      <div className="text-xs text-muted-foreground">{option.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Bulk Downloads */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
              <div className="flex-1">
                <h4 className="font-semibold mb-1">Bulk Downloads</h4>
                <p className="text-sm text-muted-foreground">Allow users to download all photos at once</p>
              </div>
              {hasBulkDownload ? (
                <Switch
                  checked={enableBulkDownloads}
                  onCheckedChange={setEnableBulkDownloads}
                />
              ) : (
                <div className="flex items-center gap-3 shrink-0">
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

            {/* Bulk Download PIN */}
            
          </div>
        </div>

        {/* Viewing Settings */}
        <div className="mb-8">
          <h3 className="text-lg font-heading font-semibold mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            Viewing Settings
          </h3>
          <div className="space-y-4">
            {/* Viewing Platforms */}
            <div className="p-4 rounded-xl border border-border bg-card">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                Viewing Platforms
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  onClick={() => setViewingPlatform('web')}
                  className={`relative overflow-hidden rounded-xl border-2 p-5 text-left transition-all ${viewingPlatform === 'web'
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                    : 'border-border bg-card hover:border-primary/50'
                    }`}
                >
                  <div className={`w-12 h-12 rounded-xl mb-3 flex items-center justify-center ${viewingPlatform === 'web' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    }`}>
                    <Monitor className="w-6 h-6" />
                  </div>
                  <h5 className="font-semibold text-base mb-1">Web Only</h5>
                  <p className="text-xs text-muted-foreground">Accessible via web browser</p>
                  {viewingPlatform === 'web' && (
                    <div className="absolute top-3 right-3">
                      <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setViewingPlatform('app')}
                  className={`relative overflow-hidden rounded-xl border-2 p-5 text-left transition-all ${viewingPlatform === 'app'
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                    : 'border-border bg-card hover:border-primary/50'
                    }`}
                >
                  <div className={`w-12 h-12 rounded-xl mb-3 flex items-center justify-center ${viewingPlatform === 'app' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    }`}>
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <h5 className="font-semibold text-base mb-1">App Only</h5>
                  <p className="text-xs text-muted-foreground">Accessible via mobile app</p>
                  {viewingPlatform === 'app' && (
                    <div className="absolute top-3 right-3">
                      <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setViewingPlatform('both')}
                  className={`relative overflow-hidden rounded-xl border-2 p-5 text-left transition-all ${viewingPlatform === 'both'
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                    : 'border-border bg-card hover:border-primary/50'
                    }`}
                >
                  <div className={`w-12 h-12 rounded-xl mb-3 flex items-center justify-center ${viewingPlatform === 'both' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    }`}>
                    <Layers className="w-6 h-6" />
                  </div>
                  <h5 className="font-semibold text-base mb-1">Both Web & App</h5>
                  <p className="text-xs text-muted-foreground">Accessible on all platforms</p>
                  {viewingPlatform === 'both' && (
                    <div className="absolute top-3 right-3">
                      <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 pt-6 border-t border-border">
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Settings
          </button>
        </div>
      </div>

      <SubscriptionPlansModal
        open={showPlansModal}
        onOpenChange={setShowPlansModal}
      />
    </div>
  );
}
