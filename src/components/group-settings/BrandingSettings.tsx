import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Sparkles,
  Image,
  Link,
  Trash2,
  Save,
  Upload,
  ExternalLink,
  Plus,
  Eye
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store';
import { updateGroup } from '@/store/slices/groupsSlice';
import { selectCurrentGroup } from '@/store/selectors';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { useUserPlans } from '@/hooks/useUserPlans';
import SubscriptionPlansModal from '@/components/modals/SubscriptionPlansModal';

interface Sponsor {
  id: string;
  name: string;
  logo: string;
  website: string;
}

export default function BrandingSettings() {
  const { groupId } = useParams();
  const dispatch = useAppDispatch();
  const group = useAppSelector(selectCurrentGroup);
  const [isSaving, setIsSaving] = useState(false);

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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logo, setLogo] = useState('');
  const [brandName, setBrandName] = useState('');
  const [showBranding, setShowBranding] = useState(true);
  const [brandingOnLogin, setBrandingOnLogin] = useState(true);
  const [showMyBranding, setShowMyBranding] = useState(true);
  const [enableWatermark, setEnableWatermark] = useState(false);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [newSponsorName, setNewSponsorName] = useState('');
  const [newSponsorWebsite, setNewSponsorWebsite] = useState('');

  // Initialize from group data
  useEffect(() => {
    if (group?.branding) {
      setBrandingOnLogin(group.branding.onLoginPage ?? true);
      setShowMyBranding(group.branding.show ?? true);
      setBrandName(group.branding.name || '');
      setLogo(group.branding.logo || '');
    }
    if (group) {
      setEnableWatermark(group.enableWatermark ?? false);
    }
    if (group?.sponsors) {
      setSponsors(group.sponsors);
    }
  }, [group]);

  const handleLogoUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({ 
          title: 'Invalid File', 
          description: 'Please select an image file.',
          variant: 'destructive'
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
        toast({ 
          title: 'Logo Uploaded', 
          description: 'Brand logo has been updated successfully.' 
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSponsor = () => {
    if (newSponsorName.trim()) {
      const newSponsor: Sponsor = {
        id: String(sponsors.length + 1),
        name: newSponsorName,
        logo: 'https://via.placeholder.com/150',
        website: newSponsorWebsite
      };
      setSponsors([...sponsors, newSponsor]);
      setNewSponsorName('');
      setNewSponsorWebsite('');
      toast({ title: 'Sponsor Added', description: `${newSponsorName} has been added as a sponsor.` });
    }
  };

  const handleRemoveSponsor = (id: string) => {
    setSponsors(sponsors.filter(s => s.id !== id));
    toast({ title: 'Sponsor Removed', description: 'Sponsor has been removed successfully.' });
  };

  const handleSaveSettings = async () => {
    if (!groupId) return;
    setIsSaving(true);
    try {
      await dispatch(updateGroup({
        groupId,
        payload: {
          enableWatermark,
          branding: {
            ...group?.branding,
            onLoginPage: brandingOnLogin,
            show: showMyBranding,
            name: brandName || null,
            logo: logo || null,
          }
        }
      })).unwrap();

      toast({ 
        title: 'Settings Saved', 
        description: 'Branding settings have been updated successfully.' 
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error || 'Failed to update branding settings.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-7">
        <div>
          <h2 className="text-lg sm:text-xl font-heading font-bold">Branding & Sponsors</h2>
          <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">Manage branding and sponsor information</p>
        </div>
        <button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="w-full sm:w-auto px-5 py-3 sm:py-2.5 rounded-xl bg-primary text-primary-foreground text-xs sm:text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-sm min-h-[48px] sm:min-h-[40px] disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>

      {/* Branding & Sponsors Content */}
      <div className="space-y-6">
        <div className="p-4 sm:p-6 rounded-xl border border-border bg-card">
          {/* Toggles Section */}
          <div className="space-y-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-sm sm:text-base">Branding on Login Page</p>
                  <span className="px-2 py-0.5 rounded-full bg-muted text-[10px] font-medium text-muted-foreground border border-border">Demo</span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">Turn off if your cover image already has branding</p>
              </div>
              <Switch checked={brandingOnLogin} onCheckedChange={setBrandingOnLogin} />
            </div>

            <div className="h-px bg-border/50" />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm sm:text-base mb-1">Show My Branding</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Turn off to show a Sponsor's branding first</p>
              </div>
              <Switch checked={showMyBranding} onCheckedChange={setShowMyBranding} />
            </div>

            <div className="h-px bg-border/50" />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm sm:text-base mb-1">Enable Watermark</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Apply your business branding to all photos in this group</p>
              </div>
              {hasCustomWatermark ? (
                <Switch checked={enableWatermark} onCheckedChange={setEnableWatermark} />
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
          </div>

          {/* Brand Logo & Name (Conditional or always visible?) */}
         
        </div>
      </div>

      {/* Sponsors */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Sponsors
          </h3>
          {sponsors.length > 0 && (
            <button
              onClick={() => setNewSponsorName(' ')} // Open form
              className="text-primary text-sm font-medium hover:underline flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add Sponsor
            </button>
          )}
        </div>
        
        {/* Empty State or Sponsors List */}
        {sponsors.length === 0 ? (
          <div className="p-12 rounded-xl border-2 border-dashed border-border bg-muted/20 flex flex-col items-center justify-center text-center">
            <Sparkles className="w-8 h-8 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium text-muted-foreground mb-4">No sponsor added</p>
            <button
              onClick={() => setNewSponsorName(' ')} // Mock opening form
              className="px-6 py-2 rounded-full bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Add
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sponsors.map((sponsor) => (
              <div
                key={sponsor.id}
                className="flex items-center justify-between px-4 py-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-all shadow-sm"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center overflow-hidden shrink-0 border border-border/50">
                    <img src={sponsor.logo} alt={sponsor.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-sm">{sponsor.name}</h4>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Link className="w-3 h-3" />
                      <a href={sponsor.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary truncate flex items-center gap-1">
                        {sponsor.website}
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveSponsor(sponsor.id)}
                  className="p-2 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add Sponsor Form (visible when newSponsorName is not empty string, simple mock logic) */}
        {newSponsorName !== '' && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             <div className="bg-card w-full max-w-md rounded-2xl border border-border p-6 shadow-2xl">
                <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-primary" />
                  Add New Sponsor
                </h4>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">Sponsor Name</label>
                    <input
                      type="text"
                      value={newSponsorName.trim()}
                      onChange={(e) => setNewSponsorName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm"
                      placeholder="e.g. Acme Corp"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">Website URL</label>
                    <input
                      type="text"
                      value={newSponsorWebsite}
                      onChange={(e) => setNewSponsorWebsite(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm"
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {setNewSponsorName(''); setNewSponsorWebsite('');}}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddSponsor}
                    disabled={!newSponsorName.trim()}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    Add Sponsor
                  </button>
                </div>
             </div>
          </div>
        )}
      </div>

      <SubscriptionPlansModal
        open={showPlansModal}
        onOpenChange={setShowPlansModal}
      />
    </div>
  );
}
