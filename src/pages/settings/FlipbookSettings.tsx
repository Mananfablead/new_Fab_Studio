import { useRef, useEffect } from 'react';
import { Save, Image as ImageIcon, Sparkles, RefreshCw, X, Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  fetchFlipbookSettings,
  updateFlipbookSettings,
  uploadFlipbookLogoFile,
  setFlipbookState,
} from '@/store/slices/flipbookSlice';

export default function FlipbookSettings() {
  const dispatch = useAppDispatch();
  const { businessName, applyToPortfolio, logo, loading, logoLoading } =
    useAppSelector((state) => state.flipbook);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    dispatch(fetchFlipbookSettings());
  }, [dispatch]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so the same file can be re-selected if needed
    e.target.value = '';

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File too large. Please upload an image under 2MB.');
      return;
    }

    try {
      await dispatch(uploadFlipbookLogoFile(file)).unwrap();
      toast.success('Logo uploaded successfully!');
    } catch (err: any) {
      toast.error(typeof err === 'string' ? err : err?.message || 'Failed to upload logo');
    }
  };

  const handleSave = async () => {
    try {
      await dispatch(
        updateFlipbookSettings({
          name: businessName,
          flipbook_portfolio_enabled: applyToPortfolio,
        })
      ).unwrap();
      toast.success('Flipbook settings saved successfully!');
    } catch (err: any) {
      toast.error(typeof err === 'string' ? err : err?.message || 'Failed to save settings');
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[hsl(var(--fab-amber))]/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[hsl(var(--fab-amber))]" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-heading font-bold">Flipbook Settings</h1>
            <p className="text-sm text-muted-foreground">
              Configure global branding for your digital albums
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold shadow-lg hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Business Info */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                Business Name
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) =>
                  dispatch(setFlipbookState({ businessName: e.target.value }))
                }
                placeholder="Enter your Business Name"
                className="w-full px-4 py-3.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-border/50">
                <div>
                  <h4 className="text-sm font-bold">Apply same settings for Portfolio</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Properties set for Digital Flipbook will also be applied to Portfolio
                  </p>
                </div>
                <Switch
                  checked={applyToPortfolio}
                  onCheckedChange={(val) =>
                    dispatch(setFlipbookState({ applyToPortfolio: val }))
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Logo Upload */}
        <div className="lg:col-span-5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
            Logo
          </label>
          <div className="bg-white rounded-2xl border border-border/60 fab-shadow overflow-hidden group">
            <div className="p-8 flex flex-col items-center justify-center text-center min-h-[240px] relative">
              {/* Upload overlay spinner */}
              {logoLoading && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-2xl z-10">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              )}

              {logo ? (
                <div className="relative group/logo">
                  <img
                    src={logo}
                    alt="Business Logo"
                    className="max-w-[200px] max-h-[120px] object-contain mb-4"
                  />
                  <button
                    onClick={() => dispatch(setFlipbookState({ logo: null }))}
                    className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-lg opacity-0 group-hover/logo:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {/* Re-upload button when logo exists */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={logoLoading}
                    className="mt-2 px-4 py-1.5 rounded-lg border border-primary text-primary text-xs font-bold hover:bg-primary hover:text-white transition-all uppercase tracking-widest disabled:opacity-50"
                  >
                    Change Logo
                  </button>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                    <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <h4 className="text-sm font-bold mb-1">Upload Logo for Digital Flipbook</h4>
                  <p className="text-[11px] text-muted-foreground mb-6">
                    We recommend using PNG format
                    <br />
                    Maximum size allowed is 2 MB
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={logoLoading}
                    className="px-6 py-2 rounded-lg border border-primary text-primary text-xs font-bold hover:bg-primary hover:text-white transition-all uppercase tracking-widest disabled:opacity-50"
                  >
                    Browse
                  </button>
                </>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
