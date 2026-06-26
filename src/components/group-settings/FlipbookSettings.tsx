import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  BookOpen,
  Settings,
  Music,
  Palette,
  Save,
  CheckCircle2,
  PlayCircle,
  Hash,
  Plus,
  Trash2,
  Upload,
  Eye,
  Sparkles,
  Loader2,
  Image as ImageIcon
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FlipbookViewer from './FlipbookViewer';
import FlipbookPhotoSelector from './FlipbookPhotoSelector';
import api from '@/services/api';
import { useAppDispatch, useAppSelector } from '@/store';
import { selectCurrentGroup, selectApiMode } from '@/store/selectors';
import { fetchGroupById } from '@/store/slices/groupsSlice';
import { useReduxPhotos } from '@/hooks/useReduxPhotos';

export default function FlipbookSettings() {
  const { groupId } = useParams();
  const dispatch = useAppDispatch();
  const group = useAppSelector(selectCurrentGroup);
  const apiMode = useAppSelector(selectApiMode);
  const { photos } = useReduxPhotos(groupId || '');

  const [loading, setLoading] = useState(false);
  const [fetchingBusiness, setFetchingBusiness] = useState(false);
  const [businessSettings, setBusinessSettings] = useState<any>(null);

  const [flipbook, setFlipbook] = useState({
    enabled: false,
    autoPlay: false,
    showPageNumbers: true,
    animation: "realistic",
    backgroundColor: "#FFFFFF",
    backgroundMusic: null as string | null
  });

  const [flipbookPhotos, setFlipbookPhotos] = useState<{ id: string, url: string }[]>([]);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [showPhotoSelector, setShowPhotoSelector] = useState(false);

  // Initialize from group data
  useEffect(() => {
    if (group?.flipbook) {
      setFlipbook({
        enabled: group.flipbook.enabled ?? false,
        autoPlay: group.flipbook.autoPlay ?? false,
        showPageNumbers: group.flipbook.showPageNumbers ?? true,
        animation: group.flipbook.animation ?? "realistic",
        backgroundColor: group.flipbook.backgroundColor ?? "#FFFFFF",
        backgroundMusic: group.flipbook.backgroundMusic ?? null
      });

      // If the API provides flipbook photos with IDs
      if (group.flipbook_photos_data) {
        setFlipbookPhotos(group.flipbook_photos_data);
      } else if ((group as any).flipbook_photos) {
        // Fallback for URLs only
        setFlipbookPhotos((group as any).flipbook_photos.map((url: string) => ({ id: url, url })));
      }
    }
  }, [group]);

  // Sync from photos list (is_in_flipbook flag)
  useEffect(() => {
    if (photos && photos.length > 0 && flipbookPhotos.length === 0) {
      const photosInFlipbook = photos
        .filter(p => p.is_in_flipbook)
        .map(p => ({ id: p.id, url: p.url }));

      if (photosInFlipbook.length > 0) {
        setFlipbookPhotos(photosInFlipbook);
      }
    }
  }, [photos, flipbookPhotos.length]);

  // Fetch business settings
  useEffect(() => {
    const fetchBusinessSettings = async () => {
      if (apiMode === 'live') {
        setFetchingBusiness(true);
        try {
          const response = await api.get('/business/settings');
          setBusinessSettings(response.data.settings);
        } catch (error) {
          console.error('Failed to fetch business settings:', error);
        } finally {
          setFetchingBusiness(false);
        }
      }
    };
    fetchBusinessSettings();
  }, [apiMode]);

  const handleSaveSettings = async () => {
    if (!groupId) return;

    setLoading(true);
    try {
      if (apiMode === 'live') {
        await api.put(`/groups/${groupId}`, {
          flipbook: flipbook,
          flipbook_photos: flipbookPhotos.map(p => p.url)
        });
        // Refresh group data
        dispatch(fetchGroupById(groupId));
      }

      toast({
        title: 'Settings Saved',
        description: 'Flipbook settings have been updated successfully.'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to save settings',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShowDemo = () => {
    setShowDemoModal(true);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // For now, we'll handle this like before, but in a real app, 
      // you'd upload these and get back IDs.
      const newPhotos = Array.from(files).map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        url: URL.createObjectURL(file)
      }));
      setFlipbookPhotos(prev => [...prev, ...newPhotos]);
      toast({ title: 'Photos Added', description: `${files.length} photos added to your flipbook.` });
    }
  };

  const handleGallerySelect = async (selected: { id: string, url: string }[]) => {
    setLoading(true);
    try {
      if (apiMode === 'live') {
        await api.put('/photos/bulk', {
          photoIds: selected.map(p => p.id),
          isInFlipbook: true
        });
        // Optionally refresh group to get updated photos
        dispatch(fetchGroupById(groupId!));
      }
      setFlipbookPhotos(prev => [...prev, ...selected]);
      toast({ title: 'Photos Added', description: `${selected.length} photos added from gallery.` });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to add photos to flipbook', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const removePhoto = async (index: number) => {
    const photoToRemove = flipbookPhotos[index];
    setLoading(true);
    try {
      if (apiMode === 'live' && photoToRemove.id) {
        await api.put(`/photos/${photoToRemove.id}`, {
          isInFlipbook: false
        });
      }
      setFlipbookPhotos(prev => prev.filter((_, i) => i !== index));
      toast({ title: 'Photo Removed', description: 'Photo removed from flipbook.' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to remove photo', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (key: keyof typeof flipbook, value: any) => {
    setFlipbook(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-7">
        <div className="text-left sm:text-left">
          <h2 className="text-lg sm:text-xl font-heading font-bold">Digital Flipbook</h2>
          <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">Configure your interactive flipbook</p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3 w-full sm:w-auto">
          <button
            onClick={handleShowDemo}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-xs sm:text-sm font-medium hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2 shadow-sm min-h-[48px] sm:min-h-[40px]"
          >
            <Eye className="w-4 h-4" />
            Demo Flipbook
          </button>
          <button
            onClick={handleSaveSettings}
            disabled={loading}
            className="px-5 py-3 sm:py-2.5 rounded-xl bg-primary text-primary-foreground text-xs sm:text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-sm min-h-[48px] sm:min-h-[40px] disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save
          </button>
        </div>
      </div>

      {/* Enable Flipbook */}
      <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card mb-7">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold text-sm">Enable Digital Flipbook</h4>
            <p className="text-xs text-muted-foreground mt-0.5">Create an interactive flipbook from your photos</p>
          </div>
        </div>
        <Switch
          checked={flipbook.enabled}
          onCheckedChange={(checked) => updateSetting('enabled', checked)}
        />
      </div>

      {flipbook.enabled && (
        <>
          {/* Display Settings */}
          <div className="mb-7">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Display Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <PlayCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Auto Play</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Automatically flip through pages</p>
                  </div>
                </div>
                <Switch
                  checked={flipbook.autoPlay}
                  onCheckedChange={(checked) => updateSetting('autoPlay', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                    <Hash className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Show Page Numbers</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Display page numbers at the bottom</p>
                  </div>
                </div>
                <Switch
                  checked={flipbook.showPageNumbers}
                  onCheckedChange={(checked) => updateSetting('showPageNumbers', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Animation</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Page turning effect style</p>
                  </div>
                </div>
                <Select
                  value={flipbook.animation}
                  onValueChange={(val) => updateSetting('animation', val)}
                >
                  <SelectTrigger className="w-32 h-9 rounded-xl">
                    <SelectValue placeholder="Style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realistic">Realistic</SelectItem>
                    <SelectItem value="slide">Slide</SelectItem>
                    <SelectItem value="fade">Fade</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                    <Music className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Background Music</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Ambient sound while viewing</p>
                  </div>
                </div>
                <Select
                  value={flipbook.backgroundMusic || "none"}
                  onValueChange={(val) => updateSetting('backgroundMusic', val === 'none' ? null : val)}
                >
                  <SelectTrigger className="w-32 h-9 rounded-xl">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="piano">Soft Piano</SelectItem>
                    <SelectItem value="ambient">Nature Ambient</SelectItem>
                    <SelectItem value="upbeat">Upbeat Event</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Photo Selection Section */}
          <div className="mb-7">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Flipbook Photos
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Gallery Selection */}
              <button
                onClick={() => setShowPhotoSelector(true)}
                className="p-4 rounded-xl border border-border bg-card flex items-center gap-4 hover:border-primary/50 transition-colors group text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ImageIcon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Select from Gallery</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Pick existing group photos</p>
                </div>
                <Plus className="w-5 h-5 text-muted-foreground ml-auto" />
              </button>

              {/* Upload New */}
              {/* <label className="p-4 rounded-xl border border-border bg-card flex items-center gap-4 hover:border-primary/50 transition-colors group cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Upload New Photos</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Add photos from your device</p>
                </div>
                <Plus className="w-5 h-5 text-muted-foreground ml-auto" />
                <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label> */}
            </div>

            {/* Photos Preview Grid */}
            {flipbookPhotos.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 mt-4">
                {flipbookPhotos.map((photo, index) => (
                  <div key={index} className="relative aspect-[3/4] rounded-lg overflow-hidden border border-border group/photo">
                    <img src={photo.url} alt={`Flipbook page ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 p-1 rounded-md bg-black/50 text-white opacity-0 group-hover/photo:opacity-100 transition-opacity hover:bg-destructive"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-[10px] text-white py-0.5 text-center font-medium">
                      Page {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-10 rounded-xl border-2 border-dashed border-border bg-card/50 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                  <ImageIcon className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">No photos added yet</p>
                <p className="text-xs text-muted-foreground mt-1">Select from gallery or upload photos to start your flipbook</p>
              </div>
            )}
          </div>

          {/* Background */}
          <div className="mb-7">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Background
            </h3>
            <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
              <input
                type="color"
                value={flipbook.backgroundColor}
                onChange={(e) => updateSetting('backgroundColor', e.target.value)}
                className="w-12 h-12 rounded-xl border-2 border-border cursor-pointer"
              />
              <div className="flex-1">
                <input
                  type="text"
                  value={flipbook.backgroundColor}
                  onChange={(e) => updateSetting('backgroundColor', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm font-mono"
                  placeholder="#ffffff"
                />
              </div>
              <div className="w-20 h-12 rounded-xl border border-border shadow-sm" style={{ backgroundColor: flipbook.backgroundColor }} />
            </div>
          </div>

          {/* Note Section */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-900">Custom Flipbook</p>
              <p className="text-xs text-amber-700 leading-relaxed">
                You can manually select and arrange photos to create a curated flipbook experience for your guests. If no photos are uploaded, the flipbook will automatically use the top-rated photos from the gallery.
              </p>
            </div>
          </div>
        </>
      )}

      <Dialog open={showDemoModal} onOpenChange={setShowDemoModal}>
        <DialogContent className="max-w-[95vw] w-full max-h-[95vh] h-[95vh] p-0 scrollbar-hide border-0">
          <FlipbookViewer
            onClose={() => setShowDemoModal(false)}
            images={flipbookPhotos.length > 0 ? flipbookPhotos.map(p => p.url) : [
              'https://images.unsplash.com/photo-1519741497674-611481863552',
              'https://images.unsplash.com/photo-1606216794079-73f85bbd57d5',
              'https://images.unsplash.com/photo-1529634597503-139d3726fed5',
              'https://images.unsplash.com/photo-1511285560929-80b456fea0bc',
              'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6',
              'https://images.unsplash.com/photo-1591604466107-ec97de577aff',
              'https://images.unsplash.com/photo-1583939003579-730e3918a45a',
              'https://images.unsplash.com/photo-1460978812857-470ed1c77af0',
              'https://images.unsplash.com/photo-1522673607200-164d1b6ce486',
              'https://images.unsplash.com/photo-1504196606672-aef5c9cefc92',
              'https://images.unsplash.com/photo-1519225421980-715cb0215aed',
              'https://images.unsplash.com/photo-1537633552985-df8429e8048b',
            ]}
            title={businessSettings?.business_name ? `${businessSettings.business_name} Flipbook Demo` : `${group?.name || 'Photo'} Flipbook Demo`}
            businessName={businessSettings?.business_name}
            logoUrl={businessSettings?.flipbook_logo_url}
          />
        </DialogContent>
      </Dialog>

      {/* Photo Selector Modal */}
      <FlipbookPhotoSelector
        open={showPhotoSelector}
        onOpenChange={setShowPhotoSelector}
        onSelect={handleGallerySelect}
        currentPhotos={flipbookPhotos}
      />
    </div>
  );
}
